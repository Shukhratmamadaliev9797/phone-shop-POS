import { money } from "./formatters";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  phonePrice: number;
  soldPrice: number;
  profit: number;
};

export function PhonePriceSection({ phonePrice, soldPrice, profit }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.details.phonePrice")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="rounded-2xl border bg-background/40 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{t("sales.details.phonePrice")}</span>
            <span className="font-semibold">{money(phonePrice)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{t("sales.details.soldPrice")}</span>
            <span className="font-semibold">{money(soldPrice)}</span>
          </div>
          <div className="h-px w-full bg-border" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{t("sales.details.profit")}</span>
            <span className={`font-semibold ${profit < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {profit < 0 ? "-" : ""}
              {money(Math.abs(profit))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
