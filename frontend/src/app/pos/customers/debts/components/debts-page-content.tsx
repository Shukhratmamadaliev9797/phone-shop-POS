import * as React from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CustomersPageHeader } from "@/app/pos/customers/components/customers-header";
import { CustomersFilters } from "@/app/pos/customers/components/customers-filters";
import { CustomersTable } from "@/app/pos/customers/components/customers-table";
import type { CustomerRow } from "@/app/pos/customers/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api/customers";
import {
  deletePurchase,
  listPurchases,
  PURCHASE_DELETE_SUPPORTED,
  type PurchaseListItem,
} from "@/lib/api/purchases";
import { SALE_DELETE_SUPPORTED } from "@/lib/api/sales";
import { canManageCustomers, canViewCustomers } from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import {
  isMonthlyInstallmentPaymentType,
  parseMoneyLikeValue,
} from "@/shared/customers/financial";
import { useAppSelector } from "@/store/hooks";

const PAGE_LIMIT = 10;

function mapPurchaseToCustomerRow(purchase: PurchaseListItem): CustomerRow {
  // Xarid ma'lumotini jadvalga bir xil formatda tayyorlaymiz.
  const remaining = parseMoneyLikeValue(purchase.remaining);
  const paid = parseMoneyLikeValue(purchase.paidNow);
  const totalPrice = parseMoneyLikeValue(purchase.totalPrice);
  const customerId = purchase.customer?.id ?? purchase.customerId ?? 0;

  return {
    customer: {
      id: customerId,
      fullName: purchase.customer?.fullName ?? "—",
      phoneNumber: purchase.customer?.phoneNumber ?? "—",
      address: purchase.customer?.address ?? null,
      passportId: null,
      notes: null,
    },
    debt: 0,
    credit: remaining,
    totalDue: remaining,
    soldPhones: null,
    purchasedPhones: purchase.phoneLabel ?? "—",
    lastActivityAt: purchase.purchasedAt,
    lastPaymentAt: purchase.purchasedAt,
    lastPaymentAmount: paid > 0 ? paid : undefined,
    creditPurchaseId: purchase.id,
    creditPurchaseDate: purchase.purchasedAt,
    creditPhoneModel: purchase.phoneLabel ?? "—",
    creditPhonePrice: totalPrice,
    creditPaidAmount: paid,
    creditRemainingAmount: remaining,
  };
}

export function DebtsPageContent() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canView = canViewCustomers(role);
  const canManage = canManageCustomers(role);
  const canDeleteTransactions =
    (role === "OWNER_ADMIN" || role === "ADMIN") &&
    SALE_DELETE_SUPPORTED &&
    PURCHASE_DELETE_SUPPORTED;

  const [rows, setRows] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const initialPageParam = Number(searchParams.get("page") ?? "1");
  const initialPage = Number.isFinite(initialPageParam) && initialPageParam > 0 ? initialPageParam : 1;
  const [page, setPage] = React.useState(initialPage);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState(searchParams.get("search") ?? "");
  const [searchDebounced, setSearchDebounced] = React.useState("");

  const [deleteTarget, setDeleteTarget] = React.useState<CustomerRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    const next = new URLSearchParams();
    if (page > 1) next.set("page", String(page));
    if (search.trim()) next.set("search", search.trim());
    setSearchParams(next, { replace: true });
  }, [page, search, setSearchParams]);

  const load = React.useCallback(async () => {
    if (!canView) return;

    try {
      setLoading(true);
      setError(null);

      const response = await listPurchases({
        page,
        limit: PAGE_LIMIT,
      });

      const q = searchDebounced.trim().toLowerCase();
      const filtered = response.data
        .filter((purchase) => isMonthlyInstallmentPaymentType(purchase.paymentType))
        .filter((purchase) => parseMoneyLikeValue(purchase.remaining) > 0)
        .filter((purchase) => {
          if (!q) return true;
          const customerName = purchase.customer?.fullName?.toLowerCase() ?? "";
          const customerPhone = purchase.customer?.phoneNumber?.toLowerCase() ?? "";
          const phoneLabel = purchase.phoneLabel?.toLowerCase() ?? "";
          return (
            customerName.includes(q) ||
            customerPhone.includes(q) ||
            phoneLabel.includes(q)
          );
        });

      setRows(filtered.map(mapPurchaseToCustomerRow));
      setTotal(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT)));
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError(t("customers.page.error.sessionExpired"));
      } else if (requestError instanceof ApiRequestError && requestError.status === 403) {
        setError(t("customers.page.error.forbidden"));
      } else {
        setError(requestError instanceof Error ? requestError.message : t("customers.page.error.loadFailed"));
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canView, page, searchDebounced, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!canView) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  function openCreditPhoneDetails(purchaseId: number, customerId?: number) {
    if (purchaseId > 0) {
      navigate(`/debts/${purchaseId}`);
      return;
    }
    if (customerId) {
      navigate(`/customers/customer-details/${customerId}`);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget?.creditPurchaseId) return;
    try {
      setDeleting(true);
      await deletePurchase(deleteTarget.creditPurchaseId);
      setDeleteTarget(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <CustomersPageHeader
        title={t("nav.debts")}
        subtitle={t("customers.page.tab.shopDebt")}
      />

      <CustomersFilters
        search={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onReset={() => {
          setPage(1);
          setSearch("");
        }}
      />

      <CustomersTable
        type="credit"
        rows={rows}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        canManage={canManage}
        canDeleteTransactions={canDeleteTransactions}
        onPageChange={setPage}
        onRowClick={(row) => {
          if (row.creditPurchaseId) {
            openCreditPhoneDetails(row.creditPurchaseId, row.customer?.id);
            return;
          }
          if (row.customer?.id) {
            navigate(`/customers/customer-details/${row.customer.id}`);
          }
        }}
        onViewDetails={(row) => {
          if (row.creditPurchaseId) {
            openCreditPhoneDetails(row.creditPurchaseId, row.customer?.id);
            return;
          }
          if (row.customer?.id) {
            navigate(`/customers/customer-details/${row.customer.id}`);
          }
        }}
        onDelete={(row) => {
          setDeleteTarget(row);
        }}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("customers.page.delete.title")}</DialogTitle>
            <DialogDescription>{t("customers.page.delete.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("customers.page.delete.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting
                ? t("customers.page.delete.deleting")
                : t("customers.page.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
