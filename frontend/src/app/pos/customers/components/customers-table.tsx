import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import type { CustomerRow, CustomersTabType } from "../types";

function debtBadge(v: number, money: (amountUzs: number) => string) {
  return (
    <Badge
      className={cn(
        "rounded-full",
        v > 0
          ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15"
          : "bg-muted text-muted-foreground",
      )}
    >
      {money(v)}
    </Badge>
  );
}

function creditBadge(v: number, money: (amountUzs: number) => string) {
  return (
    <Badge
      className={cn(
        "rounded-full",
        v > 0
          ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15"
          : "bg-muted text-muted-foreground",
      )}
    >
      {money(v)}
    </Badge>
  );
}

function customerTypeBadge(row: CustomerRow, t: (key: string) => string) {
  const hasBought = Boolean(row.purchasedPhones && row.purchasedPhones !== "—");
  const hasSold = Boolean(row.soldPhones && row.soldPhones !== "—");

  if (hasBought && hasSold) {
    return (
      <Badge className="rounded-full bg-sky-500/15 text-sky-700 hover:bg-sky-500/15">
        {t("customers.table.badge.boughtAndSold")}
      </Badge>
    );
  }

  if (hasBought) {
    return (
      <Badge className="rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
        {t("customers.table.badge.bought")}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
      {t("customers.table.badge.sold")}
    </Badge>
  );
}

function balanceStatusBadge(row: CustomerRow, t: (key: string) => string) {
  const hasDebt = row.debt > 0;
  const hasCredit = row.credit > 0;

  if (hasDebt && hasCredit) {
    return (
      <Badge className="rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
        {t("customers.table.badge.mixed")}
      </Badge>
    );
  }

  if (hasDebt) {
    return (
      <Badge className="rounded-full bg-rose-500/15 text-rose-700 hover:bg-rose-500/15">
        {t("customers.table.badge.debt")}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
      {t("customers.table.badge.credit")}
    </Badge>
  );
}

export function CustomersTable({
  type,
  rows,
  loading,
  error,
  page,
  totalPages,
  total,
  canManage,
  canDeleteTransactions,
  onPageChange,
  onRowClick,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  type: CustomersTabType;
  rows: CustomerRow[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  canManage: boolean;
  canDeleteTransactions: boolean;
  onPageChange: (nextPage: number) => void;
  onRowClick?: (row: CustomerRow) => void;
  onViewDetails?: (row: CustomerRow) => void;
  onEdit?: (row: CustomerRow) => void;
  onDelete?: (row: CustomerRow) => void;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const columnCount = type === "debt" || type === "credit" ? 7 : 9;
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {type === "debt" ? (
                  <>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.date")}
                    </TableHead>
                    <TableHead className="py-2">
                      {t("customers.table.customerFullname")}
                    </TableHead>
                    <TableHead className="min-w-[220px] py-2">
                      {t("customers.table.phoneModel")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.phonePrice")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.paid")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.monthsLeft")}
                    </TableHead>
                  </>
                ) : type === "credit" ? (
                  <>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.date")}
                    </TableHead>
                    <TableHead className="min-w-[220px] py-2">
                      {t("customers.table.phoneModel")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.phonePrice")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.paid")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.remaining")}
                    </TableHead>
                    <TableHead className="py-2">
                      {t("customers.table.customerFullname")}
                    </TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.type")}
                    </TableHead>
                    <TableHead className="py-2">
                      {t("customers.table.customer")}
                    </TableHead>
                    <TableHead className="min-w-[220px] py-2">
                      {t("customers.table.phones")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.shopDebt")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.customerDebt")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.status")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.totalPrice")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap py-2">
                      {t("customers.table.lastPayment")}
                    </TableHead>
                  </>
                )}
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r, index) => (
                <TableRow
                  key={`${r.customer.id}-${r.lastActivityAt ?? index}`}
                  className="cursor-pointer border-b border-muted/40 last:border-b-0"
                  onClick={() => onRowClick?.(r)}
                >
                  {type === "debt" ? (
                    <>
                      <TableCell className="whitespace-nowrap py-2 text-sm">
                        {r.debtSaleDate
                          ? new Date(r.debtSaleDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="min-w-[260px] py-2">
                        <div className="text-sm font-semibold">
                          {r.customer.fullName || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px] py-2 text-sm text-foreground">
                        {r.debtPhoneModel || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.debtPhonePrice ?? 0)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.debtPaidAmount ?? 0)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {r.debtMonthsLeft ?? 0}
                      </TableCell>
                    </>
                  ) : type === "credit" ? (
                    <>
                      <TableCell className="whitespace-nowrap py-2 text-sm">
                        {r.creditPurchaseDate
                          ? new Date(r.creditPurchaseDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="min-w-[220px] py-2 text-sm text-foreground">
                        {r.creditPhoneModel || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.creditPhonePrice ?? 0)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.creditPaidAmount ?? 0)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.creditRemainingAmount ?? r.credit ?? 0)}
                      </TableCell>
                      <TableCell className="min-w-[260px] py-2">
                        <div className="text-sm font-semibold">
                          {r.customer.fullName || "—"}
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="whitespace-nowrap py-2">
                        {customerTypeBadge(r, t)}
                      </TableCell>
                      <TableCell className="min-w-[260px] py-2">
                        <div className="text-sm font-semibold">
                          {r.customer.fullName || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="min-w-[220px] py-2 text-xs text-muted-foreground">
                        <div className="text-sm text-foreground">
                          {r.soldPhones && r.purchasedPhones
                            ? `${r.soldPhones}, ${r.purchasedPhones}`
                            : r.soldPhones || r.purchasedPhones || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">{debtBadge(r.debt, money)}</TableCell>
                      <TableCell className="py-2">
                        {creditBadge(r.credit, money)}
                      </TableCell>
                      <TableCell className="py-2">
                        {balanceStatusBadge(r, t)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {money(r.totalDue ?? r.debt + r.credit)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                        {r.lastPaymentAmount !== undefined
                          ? `${money(r.lastPaymentAmount)}${
                              r.lastPaymentAt
                                ? ` • ${new Date(r.lastPaymentAt).toLocaleDateString()}`
                                : ""
                            }`
                          : "—"}
                      </TableCell>
                    </>
                  )}

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => onViewDetails?.(r)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("customers.table.action.viewDetails")}
                        </DropdownMenuItem>
                        {canManage && onEdit ? (
                          <DropdownMenuItem onClick={() => onEdit?.(r)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("customers.table.action.editCustomer")}
                          </DropdownMenuItem>
                        ) : null}
                        {(type === "debt" || type === "credit") &&
                        canDeleteTransactions ? (
                          <DropdownMenuItem
                            onClick={() => onDelete?.(r)}
                            className="text-rose-700 focus:text-rose-700"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {t("customers.table.action.delete")}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {error ??
                      t("customers.table.noCustomers")}
                  </TableCell>
                </TableRow>
              ) : null}

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {t("customers.table.loading")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {t("customers.table.total")}{" "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            {t("customers.table.records")}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {t("customers.table.prev")}
            </Button>

            <div className="min-w-[80px] text-center text-xs text-muted-foreground">
              {t("customers.table.page")}{" "}
              <span className="font-medium text-foreground">{page}</span> /{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              {t("customers.table.next")}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
