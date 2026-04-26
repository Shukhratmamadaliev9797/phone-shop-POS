import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddPurchasePaymentModal } from "@/app/pos/inventory/details/modals/add-purchase-payment-modal";
import { addPurchasePayment, getPurchase, type PurchaseDetail } from "@/lib/api/purchases";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import { PhoneDetailsSection } from "@/app/pos/inventory/details/components/phone-details-section";
import { CustomerDetailsSection } from "@/app/pos/inventory/details/components/customer-details-section";
import { PriceOverviewSection } from "@/app/pos/inventory/details/components/price-overview-section";

function conditionToLabel(t: (key: string) => string, condition?: string | null) {
  if (condition === "GOOD") return t("inventory.condition.good");
  if (condition === "USED") return t("inventory.condition.used");
  if (condition === "BROKEN") return t("inventory.condition.broken");
  return condition ?? "—";
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function DebtDetailsPage() {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const navigate = useNavigate();
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const id = Number(purchaseId);

  const [purchase, setPurchase] = React.useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [addPaymentOpen, setAddPaymentOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setError(t("inventory.details.error.loadFailed"));
      return;
    }

    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getPurchase(id);
        if (active) setPurchase(detail);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("inventory.details.error.loadFailed"),
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [id, t]);

  const firstItem = purchase?.items?.[0]?.item;
  const itemName = firstItem ? `${firstItem.brand} ${firstItem.model}` : "—";
  const purchasePrice = Number(purchase?.totalPrice ?? 0);
  const remaining = Number(purchase?.remaining ?? 0);
  const storage = firstItem?.storage ?? null;
  const color = firstItem?.color ?? null;
  const condition = firstItem?.condition ?? null;
  const serialNumber = firstItem?.serialNumber ?? null;
  const isPayLater = purchase?.paymentType === "PAY_LATER";
  const paymentActivities = React.useMemo(() => {
    if (!purchase?.activities?.length) return [];
    const sorted = [...purchase.activities].sort(
      (a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime(),
    );
    const total = Number(purchase.totalPrice ?? 0);
    let paidSoFar = 0;
    return sorted.map((activity) => {
      const paidAmount = Number(activity.amount ?? 0);
      paidSoFar += paidAmount;
      return {
        id: activity.id,
        paidAt: activity.paidAt,
        paidAmount,
        remainingAmount: Math.max(total - paidSoFar, 0),
      };
    });
  }, [purchase]);
  const latestPaymentActivity = React.useMemo(
    () =>
      paymentActivities.length > 0
        ? paymentActivities[paymentActivities.length - 1]
        : null,
    [paymentActivities],
  );
  const currentRemainingAmount = latestPaymentActivity
    ? latestPaymentActivity.remainingAmount
    : remaining;

  const copyIMEI = async () => {
    const imei = firstItem?.imei ?? "";
    if (!imei) return;
    try {
      await navigator.clipboard.writeText(imei);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      return;
    }
  };

  async function handleAddPayment(purchaseIdValue: number, amount: number): Promise<void> {
    const updated = await addPurchasePayment(purchaseIdValue, { amount });
    setPurchase(updated);
    setAddPaymentOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("nav.debts")}</h1>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/debts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
        <Separator />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4 text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {purchase ? (
        <div className="space-y-6">
          <PhoneDetailsSection
            itemName={itemName}
            imei={firstItem?.imei ?? ""}
            serialNumber={serialNumber}
            storage={storage}
            color={color}
            conditionLabel={conditionToLabel(t, condition)}
            copied={copied}
            onCopy={copyIMEI}
          />

          <CustomerDetailsSection
            customer={
              purchase.customer
                ? {
                    fullName: purchase.customer.fullName,
                    phoneNumber: purchase.customer.phoneNumber,
                    address: purchase.customer.address ?? null,
                  }
                : null
            }
          />

          <PriceOverviewSection
            price={purchasePrice}
            repairCost={0}
            total={purchasePrice}
            paid={
              purchase && isPayLater
                ? Math.max(0, purchasePrice - currentRemainingAmount)
                : undefined
            }
            remaining={purchase && isPayLater ? currentRemainingAmount : undefined}
          />

          <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">{t("inventory.details.payments.title")}</div>
            </div>
            {paymentActivities.length > 0 ? (
              <div className="space-y-2">
                {paymentActivities.map((activity, index) => {
                  const singlePayment = paymentActivities.length === 1;
                  const label = singlePayment
                    ? t("inventory.details.payments.fullPayment")
                    : index === 0
                      ? t("inventory.details.payments.initialPayment")
                      : t("inventory.details.payments.payment");

                  return (
                    <div key={activity.id} className="rounded-2xl border bg-background/40 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="break-words">
                          {label}:{" "}
                          <span className="font-medium text-foreground">
                            {money(Number(activity.paidAmount ?? 0))}
                          </span>
                        </div>
                        <div className="text-right">{formatWhen(activity.paidAt)}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t("inventory.details.payments.remaining")}:{" "}
                        <span className="font-medium text-foreground">
                          {money(Number(activity.remainingAmount ?? 0))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border bg-background/40 p-3 text-xs text-muted-foreground">
                {t("inventory.details.payments.empty")}
              </div>
            )}
            {isPayLater && currentRemainingAmount > 0 ? (
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="h-8 rounded-xl"
                  onClick={() => setAddPaymentOpen(true)}
                >
                  {t("inventory.details.payments.addPayment")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <AddPurchasePaymentModal
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        purchase={purchase}
        onSubmit={handleAddPayment}
        title={t("inventory.details.payments.addPaymentFor").replace("{name}", itemName)}
      />
    </div>
  );
}
