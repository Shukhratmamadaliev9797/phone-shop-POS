import * as React from "react";
import { DashboardHeading } from "./components/dashboard-heading";
import { DashboardKpiRow, DashboardSecondaryKpiRow } from "./components/kpi-row";
import { KpiPeriodFilter } from "./components/kpi-period-filter";
import { SalesRevenueChart } from "./components/sales-revenue-chart";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type DashboardKpiPeriod,
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import { useCurrencyFormatter } from "@/lib/currency/provider";

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateCustomRangeDays(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, days);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const EMPTY_OVERVIEW: DashboardOverview = {
  kpis: {
    profit: { current: 0, previous: 0, deltaPercent: 0 },
    purchaseSpending: { current: 0, previous: 0, deltaPercent: 0 },
    repairSpending: { current: 0, previous: 0, deltaPercent: 0 },
    soldPhones: { current: 0, previous: 0, deltaPercent: 0 },
  },
  paidVsUnpaid: {
    debt: 0,
    credit: 0,
  },
  salarySummary: {
    paid: 0,
    remaining: 0,
  },
  phoneSummary: {
    sold: 0,
    purchased: 0,
  },
  inventorySummary: {
    count: 0,
    totalPrice: 0,
  },
  workerSummary: {
    count: 0,
  },
  salesRevenue: {
    daily: [],
    weekly: [],
    monthly: [],
    threeMonths: [],
    sixMonths: [],
    custom: [],
  },
  topDebtCustomers: [],
  topCreditCustomers: [],
  recentSales: [],
  recentPurchases: [],
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const [kpiPeriod, setKpiPeriod] =
    React.useState<DashboardKpiPeriod>("monthly");
  const [customFrom, setCustomFrom] = React.useState<string>(todayInputValue);
  const [customTo, setCustomTo] = React.useState<string>(todayInputValue);
  const [overview, setOverview] = React.useState<DashboardOverview>(EMPTY_OVERVIEW);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasLoadedRef = React.useRef(false);
  const customRangeDays = React.useMemo(
    () => calculateCustomRangeDays(customFrom, customTo),
    [customFrom, customTo],
  );

  const selectedSeries = React.useMemo(() => {
    if (kpiPeriod === "daily") return overview.salesRevenue.daily;
    if (kpiPeriod === "weekly") return overview.salesRevenue.weekly;
    if (kpiPeriod === "custom") return overview.salesRevenue.custom;
    return overview.salesRevenue.monthly;
  }, [kpiPeriod, overview.salesRevenue]);

  const rangeLabel = React.useMemo(() => {
    if (kpiPeriod === "daily") return t("dashboard.period.daily");
    if (kpiPeriod === "weekly") return t("dashboard.period.weekly");
    if (kpiPeriod === "monthly") return t("dashboard.period.monthly");
    return `${customFrom} - ${customTo}`;
  }, [customFrom, customTo, kpiPeriod, t]);

  const exportPdf = React.useCallback(() => {
    const generatedAt = new Date().toLocaleString();
    const title = `${t("dashboard.heading.title")} - ${t("dashboard.export.reportTitle")}`;

    const revenueRows = selectedSeries
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.name)}</td><td style="text-align:right">${escapeHtml(
            money(row.revenue),
          )}</td></tr>`,
      )
      .join("");

    const debtRows = overview.topDebtCustomers
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(
            row.phone,
          )}</td><td style="text-align:right">${escapeHtml(money(row.amount))}</td></tr>`,
      )
      .join("");

    const creditRows = overview.topCreditCustomers
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(
            row.phone,
          )}</td><td style="text-align:right">${escapeHtml(money(row.amount))}</td></tr>`,
      )
      .join("");

    const recentSalesRows = overview.recentSales
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.phone)}</td><td style="text-align:right">${escapeHtml(
            money(row.amount),
          )}</td><td>${escapeHtml(row.status)}</td></tr>`,
      )
      .join("");

    const recentPurchaseRows = overview.recentPurchases
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.phone)}</td><td style="text-align:right">${escapeHtml(
            money(row.amount),
          )}</td><td>${escapeHtml(row.status)}</td></tr>`,
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
          h1,h2 { margin: 0 0 8px; }
          .meta { margin-bottom: 16px; color: #4b5563; font-size: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 12px 0 20px; }
          .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; }
          .label { font-size: 12px; color: #6b7280; }
          .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin: 8px 0 18px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
          th { text-align: left; background: #f9fafb; }
          .section { margin-top: 18px; }
        </style>
        <script>
          window.onload = function () {
            setTimeout(function () {
              try { window.focus(); window.print(); } catch (e) {}
            }, 250);
          };
        </script>
      </head>
      <body>
        <h1>${escapeHtml(t("dashboard.export.reportTitle"))}</h1>
        <div class="meta">
          <div>${escapeHtml(t("dashboard.export.period"))}: ${escapeHtml(rangeLabel)}</div>
          <div>${escapeHtml(t("dashboard.export.generatedAt"))}: ${escapeHtml(generatedAt)}</div>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.export.kpis"))}</h2>
          <div class="grid">
            <div class="card"><div class="label">${escapeHtml(t("dashboard.kpi.profit"))}</div><div class="value">${escapeHtml(money(overview.kpis.profit.current))}</div></div>
            <div class="card"><div class="label">${escapeHtml(t("dashboard.kpi.purchaseSpending"))}</div><div class="value">${escapeHtml(money(overview.kpis.purchaseSpending.current))}</div></div>
            <div class="card"><div class="label">${escapeHtml(t("dashboard.kpi.repairSpending"))}</div><div class="value">${escapeHtml(money(overview.kpis.repairSpending.current))}</div></div>
            <div class="card"><div class="label">${escapeHtml(t("dashboard.kpi.saleProfit"))}</div><div class="value">${escapeHtml(money(overview.kpis.soldPhones.current))}</div></div>
          </div>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.salesRevenue.title"))}</h2>
          <table>
            <thead><tr><th>${escapeHtml(t("dashboard.export.tableDate"))}</th><th>${escapeHtml(t("dashboard.salesRevenue.revenue"))}</th></tr></thead>
            <tbody>${revenueRows || `<tr><td colspan="2">-</td></tr>`}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.kpi.customerDebts"))}</h2>
          <table>
            <thead><tr><th>${escapeHtml(t("dashboard.export.tableName"))}</th><th>${escapeHtml(t("dashboard.export.tablePhone"))}</th><th>${escapeHtml(t("dashboard.export.tableAmount"))}</th></tr></thead>
            <tbody>${debtRows || `<tr><td colspan="3">-</td></tr>`}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.kpi.shopDebt"))}</h2>
          <table>
            <thead><tr><th>${escapeHtml(t("dashboard.export.tableName"))}</th><th>${escapeHtml(t("dashboard.export.tablePhone"))}</th><th>${escapeHtml(t("dashboard.export.tableAmount"))}</th></tr></thead>
            <tbody>${creditRows || `<tr><td colspan="3">-</td></tr>`}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.export.recentSales"))}</h2>
          <table>
            <thead><tr><th>${escapeHtml(t("sales.table.phoneModel"))}</th><th>${escapeHtml(t("dashboard.export.tableAmount"))}</th><th>${escapeHtml(t("customers.table.status"))}</th></tr></thead>
            <tbody>${recentSalesRows || `<tr><td colspan="3">-</td></tr>`}</tbody>
          </table>
        </div>

        <div class="section">
          <h2>${escapeHtml(t("dashboard.export.recentPurchases"))}</h2>
          <table>
            <thead><tr><th>${escapeHtml(t("sales.table.phoneModel"))}</th><th>${escapeHtml(t("dashboard.export.tableAmount"))}</th><th>${escapeHtml(t("customers.table.status"))}</th></tr></thead>
            <tbody>${recentPurchaseRows || `<tr><td colspan="3">-</td></tr>`}</tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    // Print through hidden iframe to avoid opening a blank tab/page.
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const cleanup = () => {
      window.setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1500);
    };

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        return;
      } finally {
        cleanup();
      }
    };
    iframe.srcdoc = html;
  }, [money, overview, rangeLabel, selectedSeries, t]);

  const loadOverview = React.useCallback(async () => {
    if (kpiPeriod === "custom" && (!customFrom || !customTo)) {
      setError(
        t("dashboard.error.customRangeRequired"),
      );
      return;
    }

    try {
      if (hasLoadedRef.current) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);
      const response = await getDashboardOverview(
        kpiPeriod,
        kpiPeriod === "custom" ? customFrom : undefined,
        kpiPeriod === "custom" ? customTo : undefined,
      );
      setOverview({
        ...response,
        salarySummary: response.salarySummary ?? { paid: 0, remaining: 0 },
        phoneSummary: response.phoneSummary ?? { sold: 0, purchased: 0 },
        inventorySummary: response.inventorySummary ?? { count: 0, totalPrice: 0 },
        workerSummary: response.workerSummary ?? { count: 0 },
        salesRevenue: response.salesRevenue ?? EMPTY_OVERVIEW.salesRevenue,
      });
      hasLoadedRef.current = true;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("dashboard.error.loadFailed"),
      );
      if (!hasLoadedRef.current) {
        setOverview(EMPTY_OVERVIEW);
      }
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [kpiPeriod, customFrom, customTo, t]);

  React.useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <DashboardHeading />
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <KpiPeriodFilter
            value={kpiPeriod}
            customFrom={customFrom}
            customTo={customTo}
            onPresetChange={(period) => setKpiPeriod(period)}
            onCustomApply={(from, to) => {
              setCustomFrom(from);
              setCustomTo(to);
              setKpiPeriod("custom");
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 rounded-xl">
                <Download className="mr-2 h-4 w-4" />
                {t("dashboard.export.button")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportPdf}>
                <FileText className="mr-2 h-4 w-4" />
                {t("dashboard.export.pdf")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {initialLoading ? (
        <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          {t("dashboard.loading")}
        </div>
      ) : null}

      <div className={cn("transition-opacity", refreshing ? "opacity-80" : "opacity-100")}>
        <DashboardKpiRow
          kpis={overview.kpis}
          period={kpiPeriod}
          customRangeDays={customRangeDays}
        />
      </div>

      <div className="grid gap-4">
        <div className="col-span-full">
          <SalesRevenueChart series={overview.salesRevenue} kpiPeriod={kpiPeriod} />
        </div>
      </div>

      <div className={cn("transition-opacity", refreshing ? "opacity-80" : "opacity-100")}>
        <DashboardSecondaryKpiRow
          salarySummary={overview.salarySummary}
          phoneSummary={overview.phoneSummary}
          inventorySummary={overview.inventorySummary}
          workerSummary={overview.workerSummary}
          paidVsUnpaid={overview.paidVsUnpaid}
        />
      </div>
    </div>
  );
}
