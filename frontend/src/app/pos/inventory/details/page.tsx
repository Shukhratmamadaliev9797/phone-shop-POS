import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";
import {
  getInventoryItem,
  type InventoryActivity,
  type InventoryDetailItem,
} from "@/lib/api/inventory";
import type { InventoryRow } from "../components/inventory-table";
import {
  addPurchasePayment,
  getPurchase,
  type PurchaseDetail,
} from "@/lib/api/purchases";
import { PhoneDetailsSection } from "./components/phone-details-section";
import { RepairDetailsSection } from "./components/repair-details-section";
import { CustomerDetailsSection } from "./components/customer-details-section";
import { PriceOverviewSection } from "./components/price-overview-section";
import { AddPurchasePaymentModal } from "@/app/pos/inventory/details/modals/add-purchase-payment-modal";
import { useCurrencyFormatter } from "@/lib/currency/provider";

function conditionToLabel(t: (key: string) => string, condition?: string | null) {
  if (condition === "GOOD") return t("inventory.condition.good");
  if (condition === "USED") return t("inventory.condition.used");
  if (condition === "BROKEN") return t("inventory.condition.broken");
  return condition ?? "—";
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function InventoryDetailsPage() {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateItem =
    (location.state as { item?: InventoryRow } | null)?.item ?? null;

  const [detail, setDetail] = React.useState<InventoryDetailItem | null>(null);
  const [purchaseDetail, setPurchaseDetail] =
    React.useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getInventoryItem(Number(id));
        if (!active) return;
        setDetail(response);
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

  React.useEffect(() => {
    if (!detail?.purchaseId) {
      setPurchaseDetail(null);
      return;
    }
    let active = true;
    const run = async () => {
      try {
        const purchase = await getPurchase(detail.purchaseId as number);
        if (active) setPurchaseDetail(purchase);
      } catch {
        if (active) setPurchaseDetail(null);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [detail?.purchaseId]);

  const itemName =
    stateItem?.itemName ??
    `${detail?.brand ?? ""} ${detail?.model ?? ""}`.trim() ??
    "—";
  const imei = detail?.imei ?? stateItem?.imei ?? "";
  const serialNumber = stateItem?.serialNumber ?? null;
  const storage = detail?.storage ?? stateItem?.storage ?? null;
  const color = detail?.color ?? stateItem?.color ?? null;
  const condition = detail?.condition ?? stateItem?.condition ?? null;
  const purchasePrice = Number(
    purchaseDetail?.totalPrice ??
      stateItem?.purchaseCost ??
      detail?.expectedSalePrice ??
      0,
  );
  const repairPrice = Number(stateItem?.repairCost ?? 0);
  const totalPrice = purchasePrice + repairPrice;
  const remainingAmount = Number(purchaseDetail?.remaining ?? 0);
  const showCustomer = Boolean(purchaseDetail?.customer);
  const showRepair =
    Boolean((detail?.knownIssues ?? "").trim()) || repairPrice > 0;
  const paymentActivities = React.useMemo(() => {
    type PaymentRow = {
      id: string | number;
      paidAt: string;
      paidAmount: number;
      remainingAmount: number;
    };

    const fromPurchase = (() => {
      if (!purchaseDetail?.activities?.length) return [];
      const sorted = [...purchaseDetail.activities].sort(
        (a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime(),
      );
      const total = Number(purchaseDetail.totalPrice ?? 0);
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
    })();

    if (fromPurchase.length > 0) {
      return fromPurchase;
    }

    const fromInventoryRaw: Array<PaymentRow | null> = (detail?.activities ?? [])
      .filter((activity: InventoryActivity) => activity.type === "PURCHASED")
      .map((activity: InventoryActivity) => {
        const match = activity.notes?.match(
          /Initial payment:\s*([^,]+),\s*Remaining:\s*(.+)$/i,
        );
        if (!match) return null;
        return {
          id: `inv-${activity.id}`,
          paidAt: activity.happenedAt,
          paidAmount: Number(match[1].trim() || 0),
          remainingAmount: Number(match[2].trim() || 0),
        };
      });

    const fromInventory: PaymentRow[] = fromInventoryRaw.filter(
      (value): value is PaymentRow => value !== null,
    );

    if (fromInventory.length > 0) {
      return fromInventory.sort(
        (a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime(),
      );
    }

    if (purchaseDetail && Number(purchaseDetail.paidNow ?? 0) > 0) {
      return [
        {
          id: `fallback-initial-${purchaseDetail.id}`,
          paidAt: purchaseDetail.purchasedAt,
          paidAmount: Number(purchaseDetail.paidNow ?? 0),
          remainingAmount: Number(purchaseDetail.remaining ?? 0),
        },
      ];
    }

    return [];
  }, [detail?.activities, purchaseDetail]);
  const latestPaymentActivity = React.useMemo(
    () =>
      paymentActivities.length > 0
        ? paymentActivities[paymentActivities.length - 1]
        : null,
    [paymentActivities],
  );
  const isPayLater = purchaseDetail?.paymentType === "PAY_LATER";
  const currentRemainingAmount = latestPaymentActivity
    ? latestPaymentActivity.remainingAmount
    : remainingAmount;

  const copyIMEI = async () => {
    if (!imei) return;
    try {
      await navigator.clipboard.writeText(imei);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      return;
    }
  };

  async function handleAddPayment(
    purchaseId: number,
    amount: number,
  ): Promise<void> {
    const updated = await addPurchasePayment(purchaseId, { amount });
    setPurchaseDetail(updated);
    setAddPaymentOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("inventory.details.title")}
            </h1>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => navigate("/inventory")}
          >
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

      {!loading && !error ? (
        <div className="space-y-6">
          <PhoneDetailsSection
            itemName={itemName}
            imei={imei}
            serialNumber={serialNumber}
            storage={storage}
            color={color}
            conditionLabel={conditionToLabel(t, condition)}
            copied={copied}
            onCopy={copyIMEI}
          />

          {showRepair ? (
            <RepairDetailsSection
              knownIssues={detail?.knownIssues}
              repairCost={repairPrice}
            />
          ) : null}

          {showCustomer ? (
            <CustomerDetailsSection
              customer={
                purchaseDetail?.customer
                  ? {
                      fullName: purchaseDetail.customer.fullName,
                      phoneNumber: purchaseDetail.customer.phoneNumber,
                      address: purchaseDetail.customer.address ?? null,
                    }
                  : null
              }
            />
          ) : null}

          <PriceOverviewSection
            price={purchasePrice}
            repairCost={repairPrice}
            total={totalPrice}
            paid={
              purchaseDetail && isPayLater
                ? Math.max(
                    0,
                    totalPrice - currentRemainingAmount,
                  )
                : undefined
            }
            remaining={
              purchaseDetail && isPayLater
                ? currentRemainingAmount
                : undefined
            }
          />

          {purchaseDetail ? (
            <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {t("inventory.details.payments.title")}
                </div>
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
                      <div
                        key={activity.id}
                        className="rounded-2xl border bg-background/40 p-3 text-sm"
                      >
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
          ) : null}
        </div>
      ) : null}

      <AddPurchasePaymentModal
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        purchase={purchaseDetail}
        onSubmit={handleAddPayment}
        title={
          t("inventory.details.payments.addPaymentFor").replace("{name}", itemName)
        }
      />
    </div>
  );
}
