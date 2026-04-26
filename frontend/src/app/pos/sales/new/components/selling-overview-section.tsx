import type { SalePaymentType } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

type Props = {
  phonePrice: number;
  salePrice: number;
  paymentType: SalePaymentType;
  installmentMonths: number;
  firstPaymentNow: boolean;
};

export function SellingOverviewSection({
  phonePrice,
  salePrice,
  paymentType,
  installmentMonths,
  firstPaymentNow,
}: Props) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const safePhonePrice = Math.max(0, Number(phonePrice) || 0);
  const safeSalePrice = Math.max(0, Number(salePrice) || 0);
  const profit = safeSalePrice - safePhonePrice;
  const isProfitNegative = profit < 0;
  const months = Math.max(1, installmentMonths || 1);
  const perMonth =
    paymentType === "PAY_LATER" ? safeSalePrice / months : safeSalePrice;
  const payingNow =
    paymentType === "PAY_LATER"
      ? firstPaymentNow
        ? perMonth
        : 0
      : safeSalePrice;
  const remaining =
    paymentType === "PAY_LATER" ? Math.max(0, safeSalePrice - payingNow) : 0;
  const moneySigned = (n: number) => `${n < 0 ? "-" : ""}${money(Math.abs(n))}`;

  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
      <div className="rounded-2xl border bg-background/40 p-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">
            {t("sales.new.overview.totalSalePrice")}
          </span>
          <span className="font-medium">{money(safeSalePrice)}</span>
        </div>
        {safeSalePrice > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {t("sales.new.overview.profit")}
            </span>
            <span
              className={isProfitNegative ? "font-medium text-rose-600" : "font-medium text-emerald-600"}
            >
              {moneySigned(profit)}
            </span>
          </div>
        ) : null}

        {paymentType === "PAY_LATER" ? (
          <>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {t("sales.new.overview.installmentMonths")}
              </span>
              <span className="font-medium">{months}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {t("sales.new.overview.perMonth")}
              </span>
              <span className="font-medium">{money(perMonth)}</span>
            </div>
          </>
        ) : null}

        {paymentType === "PAY_LATER" ? (
          <>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {t("sales.new.overview.payingNow")}
              </span>
              <span className="font-medium">{money(payingNow)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {t("sales.new.overview.remaining")}
              </span>
              <span className="font-semibold">{money(remaining)}</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
