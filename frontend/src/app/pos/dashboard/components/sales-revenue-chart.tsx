import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type {
  DashboardKpiPeriod,
  DashboardOverview,
} from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

function CustomTooltip({
  active,
  payload,
  label,
  t,
  money,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  t: (key: string) => string;
  money: (amountUzs: number) => string;
}) {
  if (!active || !payload?.length) return null;

  const revenue = payload[0]?.value ?? 0;

  return (
    <div className="rounded-2xl border bg-background px-3 py-2 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{money(revenue)}</div>
      <div className="text-[11px] text-muted-foreground">
        {t("dashboard.salesRevenue.revenue")}
      </div>
    </div>
  );
}

export function SalesRevenueChart({
  series,
  kpiPeriod,
}: {
  series: DashboardOverview["salesRevenue"];
  kpiPeriod: DashboardKpiPeriod;
}) {
  const { t } = useI18n();
  const { money, fromBaseUzs, currency } = useCurrencyFormatter();
  const safeSeries = React.useMemo(
    () => ({
      daily: series?.daily ?? [],
      weekly: series?.weekly ?? [],
      monthly: series?.monthly ?? [],
      threeMonths: series?.threeMonths ?? [],
      sixMonths: series?.sixMonths ?? [],
      custom: series?.custom ?? [],
    }),
    [series],
  );

  const data = React.useMemo(() => {
    if (kpiPeriod === "daily") return safeSeries.daily;
    if (kpiPeriod === "weekly") return safeSeries.weekly;
    if (kpiPeriod === "custom") return safeSeries.custom;
    return safeSeries.monthly;
  }, [
    kpiPeriod,
    safeSeries.daily,
    safeSeries.weekly,
    safeSeries.monthly,
    safeSeries.threeMonths,
    safeSeries.sixMonths,
    safeSeries.custom,
  ]);

  // small helper: show total for selected range (UI nice)
  const total = React.useMemo(
    () => data.reduce((sum, p) => sum + p.revenue, 0),
    [data],
  );

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">
            {t("dashboard.salesRevenue.title")}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
              {t("dashboard.salesRevenue.total")}:{" "}
            <span className="font-medium text-foreground">
              {money(total)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={10}
                tickFormatter={(v) => {
                  const display = fromBaseUzs(Number(v));
                  if (currency === "USD") return `${Math.round(display / 1000)}k`;
                  return `${Math.round(display / 1000000)}m`;
                }}
              />
              <Tooltip
                cursor={{ strokeWidth: 0, fill: "rgba(0,0,0,0.04)" }}
                content={<CustomTooltip t={t} money={money} />}
              />

              {/* Single line */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1D4ED8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
