import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";
import { money } from "./formatters";

type Props = {
  paymentType: "PAID_NOW" | "PAY_LATER" | string;
  paymentMethod: string;
  monthlyAmount: number;
  installmentMonths: number;
  paid: number;
  remaining: number;
  roundedRemaining: number;
};

export function PaymentDetailsSection({
  paymentType,
  paymentMethod,
  monthlyAmount,
  installmentMonths,
  paid,
  remaining,
  roundedRemaining,
}: Props) {
  const { t } = useI18n();
  const paymentMethodLabel =
    paymentMethod === "CASH"
      ? t("sales.paymentMethod.cash")
      : paymentMethod === "CARD"
        ? t("sales.paymentMethod.card")
        : paymentMethod === "OTHER"
          ? t("sales.paymentMethod.other")
          : paymentMethod;
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.details.paymentDetails")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 space-y-3">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div className="rounded-2xl border bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">{t("sales.new.paymentType")}</div>
            <Badge variant="secondary" className="mt-1 rounded-full">
              {paymentType === "PAID_NOW"
                ? t("sales.filters.fullPayment")
                : t("sales.filters.monthlyInstallment")}
            </Badge>
          </div>
          <div className="rounded-2xl border bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">{t("sales.new.paymentMethod")}</div>
            <div className="text-sm font-medium">{paymentMethodLabel}</div>
          </div>
          {paymentType === "PAY_LATER" ? (
            <div className="rounded-2xl border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">{t("sales.details.installment")}</div>
              <div className="text-sm font-medium">
                {installmentMonths ?? 1} {t("sales.details.month")} x {money(monthlyAmount)}
              </div>
            </div>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/50 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">{t("sales.details.paid")}</div>
            <div className="text-sm font-semibold">{money(paid)}</div>
          </div>
          <div
            className={`rounded-2xl border bg-background/40 p-3 ${
              roundedRemaining > 0 ? "border-rose-500/60" : "border-border/50"
            }`}
          >
            <div className="text-xs text-muted-foreground">{t("sales.details.remaining")}</div>
            <div className="text-sm font-semibold">{money(remaining)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
