import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

type Props = {
  price: number;
  repairCost: number;
  total: number;
  paid?: number;
  remaining?: number;
};

export function PriceOverviewSection({
  price,
  repairCost,
  total,
  paid,
  remaining,
}: Props) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
      <div className="text-sm font-semibold mb-3">
        {t("inventory.details.priceOverview.title")}
      </div>
      <div className="rounded-2xl border bg-background/40 p-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">
            {t("inventory.details.priceOverview.price")}
          </span>
          <span className="font-medium">{money(price)}</span>
        </div>
        {repairCost > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {t("inventory.details.priceOverview.repaired")}
            </span>
            <span className="font-medium">{money(repairCost)}</span>
          </div>
        ) : null}
        {repairCost > 0 ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {t("inventory.details.priceOverview.total")}
            </span>
            <span className="font-semibold">{money(total)}</span>
          </div>
        ) : null}
        {typeof paid === "number" ? (
          <div className="h-px w-full bg-border" />
        ) : null}
        {typeof paid === "number" ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {t("inventory.details.priceOverview.paid")}
            </span>
            <span className="font-medium">{money(paid)}</span>
          </div>
        ) : null}
        {typeof remaining === "number" ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">
              {t("inventory.details.priceOverview.remaining")}
            </span>
            <span className="font-semibold">{money(remaining)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
