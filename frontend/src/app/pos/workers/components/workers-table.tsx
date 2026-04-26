import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

export type WorkerRoleUi = "ADMIN" | "CASHIER" | "TECHNICIAN";
export type WorkerRoleDisplay =
  | WorkerRoleUi
  | "CLEANER"
  | "ACCOUNTANT"
  | "OTHER";
export type WorkerPayStatus = "PAID" | "PARTIAL" | "UNPAID";
export type WorkerSalaryTypeUi = "MONTHLY" | "PERCENT";

export type WorkerRow = {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: WorkerRoleDisplay;
  salaryType: WorkerSalaryTypeUi;
  salaryPercent: number | null;
  soldPhonesCount?: number;
  totalProfitAmount?: number;
  monthlySalary: number;
  monthPaid: number;
  monthRemaining: number;
  status: WorkerPayStatus;
  hasDashboardAccess: boolean;
  userId?: number | null;
  lastPaymentDate: string;
};

function statusPill(s: WorkerPayStatus) {
  if (s === "PAID")
    return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15";
  if (s === "PARTIAL")
    return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
  return "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15";
}

function salaryTypeLabel(type: WorkerSalaryTypeUi, t: (key: string) => string) {
  if (type === "PERCENT") {
    return t("workers.salaryType.percent");
  }
  return t("workers.salaryType.monthly");
}

function roleLabel(r: WorkerRoleDisplay, t: (key: string) => string) {
  if (r === "ADMIN") return t("workers.role.admin");
  if (r === "CASHIER") return t("workers.role.cashier");
  if (r === "TECHNICIAN") return t("workers.role.technician");
  if (r === "CLEANER") return t("workers.role.cleaner");
  if (r === "ACCOUNTANT") return t("workers.role.accountant");
  return t("workers.role.other");
}

export function WorkersTable({
  rows,
  loading,
  error,
  canManage,
  onRowClick,
  onView,
  onPay,
  onDelete,
}: {
  rows: WorkerRow[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  onRowClick?: (row: WorkerRow) => void;
  onView?: (row: WorkerRow) => void;
  onPay?: (row: WorkerRow) => void;
  onDelete?: (row: WorkerRow) => void;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-3">
      <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("workers.table.fullName")}</TableHead>
                <TableHead>{t("workers.table.role")}</TableHead>
                <TableHead>{t("workers.table.salaryType")}</TableHead>
                <TableHead>{t("workers.table.salary")}</TableHead>
                <TableHead>{t("workers.table.monthlyPaid")}</TableHead>
                <TableHead className="w-[80px] text-right">
                  {t("workers.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell>
                    <div className="font-medium">{row.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.phoneNumber}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {roleLabel(row.role, t)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {salaryTypeLabel(row.salaryType, t)}
                    </Badge>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {row.salaryType === "PERCENT"
                      ? `${Math.max(0, Math.round(row.salaryPercent ?? 0))}%`
                      : money(row.monthlySalary)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn("rounded-full", statusPill(row.status))}
                    >
                      {row.status === "PAID"
                        ? t("workers.status.paid")
                        : row.status === "PARTIAL"
                          ? t("workers.status.partial")
                          : t("workers.status.unpaid")}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(row)}>
                          {t("workers.table.viewDetails")}
                        </DropdownMenuItem>
                        {canManage ? (
                          <DropdownMenuItem onClick={() => onPay?.(row)}>
                            {t("workers.table.paySalary")}
                          </DropdownMenuItem>
                        ) : null}
                        {canManage ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete?.(row)}
                          >
                            {t("workers.table.delete")}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {loading ? (
                <TableRow>
                  <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                    {t("workers.table.loading")}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                    {error ?? t("workers.table.empty")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
