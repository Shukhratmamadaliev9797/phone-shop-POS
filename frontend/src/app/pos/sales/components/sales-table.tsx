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
  MoreHorizontal,
  Eye,
  HandCoins,
  Printer,
  Ban,
  Pencil,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

export type SaleRow = {
  id: string;
  soldDate: string;
  phoneLabel?: string;
  phonePrice: number;
  soldPrice: number;
  profit: number;
  paidNow: number;
  remaining: number;
  paymentType: "PAID_NOW" | "PAY_LATER";
  paymentMethod: "CASH" | "CARD" | "OTHER";
  status: "PAID" | "PARTIAL" | "UNPAID";
  notes?: string;
};

function paymentTypeBadge(
  t: SaleRow["paymentType"],
  translate: (key: string) => string,
) {
  return t === "PAID_NOW" ? (
    <Badge variant="secondary" className="rounded-full">
      {translate("sales.filters.fullPayment")}
    </Badge>
  ) : (
    <Badge variant="secondary" className="rounded-full">
      {translate("sales.filters.monthlyInstallment")}
    </Badge>
  );
}

export function SalesTable({
  rows,
  loading,
  error,
  page,
  totalPages,
  total,
  canManage,
  canDelete,
  onPageChange,
  onRowClick,
  onViewDetails,
  onAddPayment,
  onReceipt,
  onDelete,
  onEdit,
}: {
  rows: SaleRow[];
  loading?: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  canManage: boolean;
  canDelete: boolean;
  onPageChange: (nextPage: number) => void;
  onRowClick?: (row: SaleRow) => void;
  onViewDetails?: (row: SaleRow) => void;
  onAddPayment?: (row: SaleRow) => void;
  onReceipt?: (row: SaleRow) => void;
  onDelete?: (row: SaleRow) => void;
  onEdit?: (row: SaleRow) => void;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const shown = rows.length;
  const pageNumbers = Array.from(
    { length: Math.max(totalPages, 1) },
    (_, index) => index + 1,
  );
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-2">
      <div className="overflow-x-auto">
        <Table className="[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3">
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">
                {t("sales.table.date")}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t("sales.table.phoneModel")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {t("sales.table.phonePrice")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {t("sales.table.soldPrice")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {t("sales.table.profit")}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t("sales.table.paymentType")}
              </TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {t("sales.table.loading")}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-rose-600"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && !error
              ? rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick?.(r)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm font-medium">{r.soldDate}</div>
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <div className="text-sm font-medium">
                        {r.phoneLabel || ""}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {money(r.phonePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {money(r.soldPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={r.profit < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {r.profit < 0 ? "-" : ""}
                        {money(Math.abs(r.profit))}
                      </span>
                    </TableCell>

                    <TableCell>
                      {paymentTypeBadge(r.paymentType, t)}
                    </TableCell>

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
                            {t("sales.table.action.viewDetails")}
                          </DropdownMenuItem>
                          {canManage ? (
                            <DropdownMenuItem onClick={() => onEdit?.(r)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("sales.table.action.edit")}
                            </DropdownMenuItem>
                          ) : null}
                          {canManage && r.remaining > 0 ? (
                            <DropdownMenuItem onClick={() => onAddPayment?.(r)}>
                              <HandCoins className="mr-2 h-4 w-4" />
                              {t("sales.table.action.addPayment")}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => onReceipt?.(r)}>
                            <Printer className="mr-2 h-4 w-4" />
                            {t("sales.table.action.receipt")}
                          </DropdownMenuItem>
                          {canDelete ? (
                            <DropdownMenuItem
                              className="text-rose-700 focus:text-rose-700"
                              onClick={() => onDelete?.(r)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {t("sales.table.action.delete")}
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {t("sales.table.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-muted/40 bg-background/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {t("sales.table.showing")}{" "}
            <span className="font-medium text-foreground">{shown}</span> /{" "}
            <span className="font-medium text-foreground">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {t("sales.table.prev")}
            </Button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 min-w-8 rounded-xl px-2"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t("sales.table.next")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
