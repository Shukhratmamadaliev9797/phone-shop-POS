import { cn } from "@/lib/utils";
import {
  CircleDollarSign,
  HandCoins,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import type { KPI } from "../types";
import type { DashboardKpiPeriod } from "@/lib/api/dashboard";

function Delta({
  value,
  label = "From Last Month",
}: {
  value: number;
  label?: string;
}) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
          up
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-rose-500/10 text-rose-700",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {up ? "+" : ""}
        {value}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function KpiCard({ item }: { item: KPI }) {
  const Icon = item.icon;

  return (
    <div className="relative min-h-[148px] overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{item.title}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {item.value}
          </div>
        </div>

        <div
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/40"
          aria-hidden="true"
        >
          {Icon ? (
            <Icon className="h-5 w-5 text-foreground" />
          ) : (
            <span className="text-sm font-semibold text-foreground">↗</span>
          )}
        </div>
      </div>

      <div>
        <Delta value={item.deltaPercent} label={item.deltaLabel} />
      </div>
    </div>
  );
}

function buildDeltaLabel(
  t: (key: string) => string,
  period: DashboardKpiPeriod,
  customRangeDays: number,
): string {
  if (period === "daily") return t("dashboard.kpi.fromLastDay");
  if (period === "weekly") return t("dashboard.kpi.fromLastWeek");
  if (period === "monthly") return t("dashboard.kpi.fromLastMonth");
  return `${t("dashboard.kpi.fromPrevious")} ${customRangeDays} ${t("dashboard.kpi.days")}`;
}

export function DashboardKpiRow({
  kpis,
  period,
  customRangeDays,
}: {
  kpis: DashboardOverview["kpis"];
  period: DashboardKpiPeriod;
  customRangeDays: number;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const deltaLabel = buildDeltaLabel(t, period, customRangeDays);
  const items: KPI[] = [
    {
      title: t("dashboard.kpi.profit"),
      value: money(kpis.profit.current),
      deltaPercent: kpis.profit.deltaPercent,
      deltaLabel,
      icon: TrendingUp,
    },
    {
      title: t("dashboard.kpi.purchaseSpending"),
      value: money(kpis.purchaseSpending.current),
      deltaPercent: kpis.purchaseSpending.deltaPercent,
      deltaLabel,
      icon: TrendingDown,
    },
    {
      title: t("dashboard.kpi.repairSpending"),
      value: money(kpis.repairSpending.current),
      deltaPercent: kpis.repairSpending.deltaPercent,
      deltaLabel,
      icon: TrendingUp,
    },
    {
      title: t("dashboard.kpi.saleProfit"),
      value: money(kpis.soldPhones.current),
      deltaPercent: kpis.soldPhones.deltaPercent,
      deltaLabel,
      icon: TrendingUp,
    },
  ];

  return (
    <section className="w-full">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

export function DashboardSecondaryKpiRow({
  salarySummary,
  workerSummary,
  phoneSummary,
  inventorySummary,
  paidVsUnpaid,
}: {
  salarySummary?: DashboardOverview["salarySummary"];
  workerSummary?: DashboardOverview["workerSummary"];
  phoneSummary?: DashboardOverview["phoneSummary"];
  inventorySummary?: DashboardOverview["inventorySummary"];
  paidVsUnpaid?: DashboardOverview["paidVsUnpaid"];
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const safeSalary = salarySummary ?? { paid: 0, remaining: 0 };
  const safeWorkers = workerSummary ?? { count: 0 };
  const safePhones = phoneSummary ?? { sold: 0, purchased: 0 };
  const safeInventory = inventorySummary ?? { count: 0, totalPrice: 0 };
  const safeBalances = paidVsUnpaid ?? { debt: 0, credit: 0 };
  const salaryIconWrapClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-muted/50 bg-muted/40";
  const salaryIconClass = "h-5 w-5 text-foreground";
  return (
    <section className="w-full">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative min-h-[148px] overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.kpi.paidSalary")}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {money(safeSalary.paid)}
              </div>
            </div>
            <div className={salaryIconWrapClass} aria-hidden="true">
              <HandCoins className={salaryIconClass} />
            </div>
          </div>

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("dashboard.kpi.workers")}</span>
              <span className={salaryIconWrapClass} aria-hidden="true">
                <CircleDollarSign className={salaryIconClass} />
              </span>
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {safeWorkers.count}
            </div>
          </div>
        </div>
        <div className="relative min-h-[148px] overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.kpi.soldPhones")}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {safePhones.sold}
              </div>
            </div>
            <div className={salaryIconWrapClass} aria-hidden="true">
              <ShoppingBag className={salaryIconClass} />
            </div>
          </div>

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("dashboard.kpi.purchased")}</span>
              <span className={salaryIconWrapClass} aria-hidden="true">
                <ShoppingBag className={salaryIconClass} />
              </span>
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {safePhones.purchased}
            </div>
          </div>
        </div>
        <div className="relative min-h-[148px] overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.kpi.customerDebts")}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {money(safeBalances.debt)}
              </div>
            </div>
            <div className={salaryIconWrapClass} aria-hidden="true">
              <CircleDollarSign className={salaryIconClass} />
            </div>
          </div>

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("dashboard.kpi.shopDebt")}</span>
              <span className={salaryIconWrapClass} aria-hidden="true">
                <CircleDollarSign className={salaryIconClass} />
              </span>
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {money(safeBalances.credit)}
            </div>
          </div>
        </div>
        <div className="relative min-h-[148px] overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">
                {t("dashboard.kpi.inventoryPhones")}
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {safeInventory.count}
              </div>
            </div>
            <div className={salaryIconWrapClass} aria-hidden="true">
              <ShoppingBag className={salaryIconClass} />
            </div>
          </div>

          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{t("dashboard.kpi.totalPrice")}</span>
              <span className={salaryIconWrapClass} aria-hidden="true">
                <CircleDollarSign className={salaryIconClass} />
              </span>
            </div>
            <div className="mt-1 text-lg font-semibold text-foreground">
              {money(safeInventory.totalPrice)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
