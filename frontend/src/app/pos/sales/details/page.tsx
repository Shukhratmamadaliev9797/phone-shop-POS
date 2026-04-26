import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddPaymentModal } from "@/app/pos/sales/modals/add-payment-modal";
import { addSalePayment, getSale, type SaleDetail } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";
import { canManageSales } from "@/lib/auth/permissions";
import { PaymentActivitiesSection } from "./components/payment-activities-section";
import { PhoneDetailsSection } from "./components/phone-details-section";
import { PhonePriceSection } from "./components/phone-price-section";
import { PaymentDetailsSection } from "./components/payment-details-section";
import { CustomerDetailsSection } from "./components/customer-details-section";
import { SellerDetailsSection } from "./components/seller-details-section";
import { SaleDetailsHeader } from "./components/sale-details-header";
import { formatDateTime } from "./components/formatters";
import { formatMoneyByCurrentSettings } from "@/lib/currency/provider";

export default function SaleDetailsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const saleId = Number(params.id);
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);

  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const loadSale = useCallback(async () => {
    if (!Number.isFinite(saleId) || saleId <= 0) {
      setError(t("sales.details.error.invalidId"));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const detail = await getSale(saleId);
      setSale(detail);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("sales.details.error.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [saleId, t]);

  useEffect(() => {
    void loadSale();
  }, [loadSale]);

  const firstItem = sale?.items?.[0]?.item;
  const soldPrice = Number(sale?.totalPrice ?? 0);
  const profit = Number(sale?.profit ?? 0);
  const phonePrice = soldPrice - profit;
  const paid = Number(sale?.paidNow ?? 0);
  const remaining = Number(sale?.remaining ?? 0);
  const roundedRemaining = Math.max(0, Math.round(remaining));

  const activityBasedRemaining = useMemo(() => {
    const list = sale?.activities ?? [];
    if (!list.length) return Number.isFinite(remaining) ? remaining : 0;
    const paidFromActivities = list.reduce(
      (sum, activity) => sum + Number(activity.amount ?? 0),
      0,
    );
    return soldPrice - paidFromActivities;
  }, [remaining, sale?.activities, soldPrice]);

  const effectiveRemaining = Math.max(
    0,
    Math.min(
      Number.isFinite(remaining) ? remaining : 0,
      Number.isFinite(activityBasedRemaining) ? activityBasedRemaining : 0,
    ),
  );

  const latestActivity = useMemo(() => {
    const list = sale?.activities ?? [];
    if (!list.length) return null;
    return [...list].sort(
      (a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime(),
    )[list.length - 1];
  }, [sale?.activities]);

  const latestIsFullPaid = /full payment/i.test(String(latestActivity?.notes ?? ""));
  const remainingCents = Math.round((Number.isFinite(remaining) ? remaining : 0) * 100);
  const effectiveRemainingRounded = Math.round(effectiveRemaining);

  const canAddPayment =
    canManage &&
    !latestIsFullPaid &&
    remainingCents > 0 &&
    effectiveRemainingRounded > 0;

  const monthlyAmount = Number(sale?.monthlyInstallmentAmount ?? 0);
  const installmentMonths = Number(sale?.installmentMonths ?? 0);

  const sellerName = useMemo(() => {
    const note = sale?.notes ?? "";
    const marker = "Sold by:";
    if (!note.includes(marker)) return "";
    return note.slice(note.indexOf(marker) + marker.length).trim();
  }, [sale?.notes]);

  async function handleAddPayment(
    id: number,
    amount: number,
    notes?: string,
  ): Promise<void> {
    const updated = await addSalePayment(id, { amount, notes });
    setSale(updated);
  }

  function printReceipt(): void {
    if (!sale) return;
    const receiptWindow = window.open("", "_blank", "width=720,height=900");
    if (!receiptWindow) return;
    const rows = sale.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.item.brand} ${item.item.model}</td>
            <td>${item.item.imei}</td>
            <td>${formatMoneyByCurrentSettings(Math.round(Number(item.salePrice)))}</td>
          </tr>
        `,
      )
      .join("");

    receiptWindow.document.write(`
      <html>
        <head><title>${t("sales.receipt.title")} #${sale.id}</title></head>
        <body style="font-family:Arial;padding:24px;">
          <h2>${t("sales.receipt.title")} #${sale.id}</h2>
          <p>${t("sales.receipt.date")}: ${formatDateTime(sale.soldAt)}</p>
          <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:12px;">
            <thead>
              <tr>
                <th>#</th><th>${t("sales.receipt.phoneCol")}</th><th>${t("inventory.details.phone.imei")}</th><th>${t("sales.receipt.priceCol")}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">{t("common.loading")}</div>;
  }

  if (error || !sale) {
    return (
      <div className="space-y-4">
        <Button variant="outline" className="rounded-2xl" onClick={() => navigate("/sales")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700">
          {error ?? t("sales.details.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SaleDetailsHeader
        soldAt={sale.soldAt}
        canManage={canManage}
        onBack={() => navigate("/sales")}
        onEdit={() => navigate(`/sales/${sale.id}/edit`)}
        onPrint={printReceipt}
      />

      <Separator />

      <PhoneDetailsSection item={firstItem} />

      <PhonePriceSection
        phonePrice={phonePrice}
        soldPrice={soldPrice}
        profit={profit}
      />

      <PaymentDetailsSection
        paymentType={sale.paymentType}
        paymentMethod={sale.paymentMethod}
        monthlyAmount={monthlyAmount}
        installmentMonths={installmentMonths}
        paid={paid}
        remaining={remaining}
        roundedRemaining={roundedRemaining}
      />

      <CustomerDetailsSection customer={sale.customer ?? null} />

      <SellerDetailsSection sellerName={sellerName} />

      <PaymentActivitiesSection
        sale={sale}
        soldPrice={soldPrice}
        monthlyAmount={monthlyAmount}
        installmentMonths={installmentMonths}
        canAddPayment={canAddPayment}
        onAddPayment={() => setPaymentOpen(true)}
      />

      <AddPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        sale={sale}
        onSubmit={handleAddPayment}
      />
    </div>
  );
}
