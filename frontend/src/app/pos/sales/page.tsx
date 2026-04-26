import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SalesPageHeader } from "./components/sales-header";
import { SalesFilters } from "./components/sales-filters";
import { SalesTable, type SaleRow } from "./components/sales-table";
import { AddPaymentModal } from "./modals/add-payment-modal";
import {
  addSalePayment,
  ApiRequestError,
  deleteSale,
  getSale,
  listSales,
  SALE_DELETE_SUPPORTED,
  type SaleDetail,
  type SaleListItem,
  type SalePaymentType,
} from "@/lib/api/sales";
import { canManageSales, canViewSales } from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";
import { formatMoneyByCurrentSettings } from "@/lib/currency/provider";

const PAGE_LIMIT = 10;

function formatDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toSaleRow(item: SaleListItem): SaleRow {
  const soldPrice = Number(item.totalPrice ?? 0);
  const profit = Number(item.profit ?? 0);
  const phonePrice = soldPrice - profit;
  const paidNow = Number(item.paidNow ?? 0);
  const remaining = Number(item.remaining ?? 0);

  return {
    id: String(item.id),
    soldDate: formatDateOnly(item.soldAt),
    phoneLabel: item.phoneLabel ?? undefined,
    phonePrice,
    soldPrice,
    profit,
    paidNow,
    remaining,
    paymentType: item.paymentType,
    paymentMethod: item.paymentMethod,
    status: remaining <= 0 ? "PAID" : paidNow > 0 ? "PARTIAL" : "UNPAID",
    notes: item.notes ?? undefined,
  };
}

export default function Sales() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(currentRole);
  const canView = canViewSales(currentRole);
  const canDelete =
    (currentRole === "OWNER_ADMIN" || currentRole === "ADMIN") &&
    SALE_DELETE_SUPPORTED;

  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentType, setPaymentType] = useState<"all" | SalePaymentType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SaleDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const pushToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;

    setToastVisible(false);
    const enterTimer = window.setTimeout(() => setToastVisible(true), 20);
    const leaveTimer = window.setTimeout(() => setToastVisible(false), 2400);
    const removeTimer = window.setTimeout(() => setToast(null), 2750);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast]);

  const loadSales = useCallback(async () => {
    if (!canView) {
      setRows([]);
      setError(t("sales.page.error.notAllowed"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await listSales({
        page,
        limit: PAGE_LIMIT,
        paymentType: paymentType === "all" ? undefined : paymentType,
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
      });

      setRows((response.data ?? []).map(toSaleRow));
      setTotal(response.meta?.total ?? response.data.length);
      setTotalPages(response.meta?.totalPages ?? 1);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError(t("sales.page.error.sessionExpired"));
      } else {
        setError(
          requestError instanceof Error ? requestError.message : t("sales.page.error.loadFailed"),
        );
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canView, dateFrom, dateTo, page, paymentType, t]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter((row) => {
      const text = [
        row.id,
        row.phoneLabel ?? "",
        row.soldDate ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [rows, search]);

  function guardManageAction(): boolean {
    if (canManage) return false;
    pushToast("error", t("sales.page.error.notAllowed"));
    return true;
  }

  function printReceipt(detail: SaleDetail): void {
    const receiptWindow = window.open("", "_blank", "width=720,height=900");
    if (!receiptWindow) return;

    const total = Number(detail.totalPrice ?? 0);
    const paidNow = Number(detail.paidNow ?? 0);
    const remaining = Number(detail.remaining ?? 0);
    const paymentMethodLabel =
      detail.paymentMethod === "CASH"
        ? t("sales.paymentMethod.cash")
        : detail.paymentMethod === "CARD"
          ? t("sales.paymentMethod.card")
          : t("sales.paymentMethod.other");

    const rowsHtml = detail.items
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
        <head>
          <title>${t("sales.receipt.title")} #${detail.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 8px 0; }
            p { margin: 4px 0; font-size: 13px; }
            .meta { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .totals { margin-top: 16px; }
            .totals p { font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${t("sales.receipt.title")} #${detail.id}</h1>
          <div class="meta">
            <p>${t("sales.receipt.date")}: ${detail.soldAt}</p>
            <p>${t("sales.receipt.customer")}: ${detail.customer?.fullName ?? "-"}</p>
            <p>${t("sales.receipt.phone")}: ${detail.customer?.phoneNumber ?? "-"}</p>
            <p>${t("sales.receipt.paymentMethod")}: ${paymentMethodLabel}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t("sales.receipt.phoneCol")}</th>
                <th>IMEI</th>
                <th>${t("sales.receipt.priceCol")}</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totals">
            <p><strong>${t("sales.receipt.total")}:</strong> ${formatMoneyByCurrentSettings(Math.max(0, Math.round(total)))}</p>
            <p><strong>${t("sales.receipt.paid")}:</strong> ${formatMoneyByCurrentSettings(Math.max(0, Math.round(paidNow)))}</p>
            <p><strong>${t("sales.receipt.remaining")}:</strong> ${formatMoneyByCurrentSettings(Math.max(0, Math.round(remaining)))}</p>
          </div>
          <script>
            window.onload = function () { window.print(); }
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  }

  async function handleDelete(row: SaleRow): Promise<void> {
    if (guardManageAction()) return;
    if (!canDelete) return;
    setDeleteTarget(row);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteSale(Number(deleteTarget.id));
      pushToast("success", t("sales.page.toast.saleDeleted"));
      setDeleteTarget(null);
      await loadSales();
    } catch (requestError) {
      pushToast(
        "error",
        requestError instanceof Error ? requestError.message : t("sales.page.toast.deleteFailed"),
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddPayment(id: number, amount: number): Promise<void> {
    if (guardManageAction()) return;
    const updated = await addSalePayment(id, { amount });
    setSelectedDetail(updated);
    pushToast("success", t("sales.page.toast.paymentAdded"));
    await loadSales();
  }

  return (
    <div className="space-y-6">
      <SalesPageHeader />

      <SalesFilters
        search={search}
        onSearchChange={setSearch}
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={() => {
          setSearch("");
          setPaymentType("all");
          setDateFrom("");
          setDateTo("");
          setPage(1);
        }}
      />

      <SalesTable
        rows={filteredRows}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        canManage={canManage}
        canDelete={canDelete}
        onPageChange={setPage}
        onRowClick={(row) => {
          navigate(`/sales/${row.id}`);
        }}
        onViewDetails={(row) => {
          navigate(`/sales/${row.id}`);
        }}
        onAddPayment={(row) => {
          if (guardManageAction()) return;
          void (async () => {
            try {
              const detail = await getSale(Number(row.id));
              setSelectedDetail(detail);
              setPaymentOpen(true);
            } catch (requestError) {
              pushToast(
                "error",
                requestError instanceof Error
                  ? requestError.message
                  : t("sales.page.error.loadForPayment"),
              );
            }
          })();
        }}
        onDelete={(row) => {
          void handleDelete(row);
        }}
        onEdit={(row) => {
          if (guardManageAction()) return;
          navigate(`/sales/${row.id}/edit`);
        }}
        onReceipt={(row) => {
          void (async () => {
            try {
              const detail = await getSale(Number(row.id));
              printReceipt(detail);
            } catch (requestError) {
              pushToast(
                "error",
                requestError instanceof Error
                  ? requestError.message
                  : t("sales.page.error.generateReceipt"),
              );
            }
          })();
        }}
      />

      <AddPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        sale={selectedDetail}
        onSubmit={handleAddPayment}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("sales.delete.title")}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? t("sales.delete.descriptionWithId").replace(
                    "{item}",
                    deleteTarget.phoneLabel?.trim() || `#${deleteTarget.id}`,
                  )
                : t("sales.delete.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("sales.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting
                ? t("sales.delete.deleting")
                : t("sales.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast
        ? createPortal(
            <div
              className={`fixed bottom-5 right-5 z-[9999] transition-all duration-300 ease-out ${
                toastVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
              }`}
            >
              <div className="rounded-xl border border-emerald-500 bg-white px-4 py-3 text-sm text-emerald-700 shadow-lg dark:bg-background">
                {toast.message}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
