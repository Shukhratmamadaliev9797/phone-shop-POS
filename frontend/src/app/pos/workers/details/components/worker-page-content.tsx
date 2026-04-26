import { Pencil, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkerDetailsView, SalaryPaymentView } from "@/lib/api/workers";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import { WorkerDetailsSection } from "./worker-details-section";
import { SalaryDetailsSection } from "./salary-details-section";

export function WorkerPageContent({
  details,
  payments,
  shouldShowPayButton,
  paidValue,
  remainingValue,
  monthlySalary,
  onEdit,
  onOpenPay,
  roleLabel,
}: {
  details: WorkerDetailsView;
  payments: SalaryPaymentView[];
  shouldShowPayButton: boolean;
  paidValue: number;
  remainingValue: number;
  monthlySalary: number;
  onEdit: () => void;
  onOpenPay: () => void;
  roleLabel: string;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" className="rounded-2xl" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("workers.details.edit")}
        </Button>
        {shouldShowPayButton ? (
          <Button className="rounded-2xl" onClick={onOpenPay}>
            <Wallet className="mr-2 h-4 w-4" />
            {t("workers.details.paySalary")}
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">
          {t("workers.details.section.workerDetails")}
        </div>
        <WorkerDetailsSection
          fullName={details.fullName}
          phoneNumber={details.phoneNumber}
          address={details.address}
          roleLabel={roleLabel}
        />
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">
          {t("workers.details.section.salaryDetails")}
        </div>
        <SalaryDetailsSection
          salaryType={details.salaryType === "PERCENT" ? "PERCENT" : "MONTHLY"}
          monthlySalary={monthlySalary}
          salaryPercent={Number(details.salaryPercent ?? 0)}
          soldPhonesCount={Number(details.soldPhonesCount ?? 0)}
          totalProfitAmount={Number(details.totalProfitAmount ?? 0)}
          percentSalaryAccrued={Number(details.percentSalaryAccrued ?? 0)}
        />
      </div>

      <div className="rounded-3xl border bg-muted/30 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-2xl border bg-background/40 px-4 py-3 ${
              paidValue > 0 ? "border-emerald-500/70" : "border-rose-500/70"
            }`}
          >
            <p className="text-xs text-muted-foreground">
              {t("workers.details.paid")}
            </p>
            <p className="text-xl font-semibold">{money(paidValue)}</p>
          </div>
          <div
            className={`rounded-2xl border bg-background/40 px-4 py-3 ${
              remainingValue > 0 ? "border-rose-500/70" : "border-muted/40"
            }`}
          >
            <p className="text-xs text-muted-foreground">
              {t("workers.details.remaining")}
            </p>
            <p className="text-xl font-semibold">{money(remainingValue)}</p>
          </div>
        </div>
      </div>

      {details.hasDashboardAccess ? (
        <div className="rounded-3xl border p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold">
              {t("workers.details.section.dashboardLogin")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("workers.details.passwordHelp")}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("workers.details.emailOrUsername")}
              </p>
              <p className="text-sm font-medium break-all">{details.loginEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("workers.details.password")}
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("workers.details.passwordEncrypted")}</p>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={onEdit}>
                  {t("workers.details.edit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border bg-muted/30 overflow-hidden">
        <div className="border-b p-4">
          <div className="text-sm font-semibold">
            {t("workers.details.section.paymentHistory")}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("workers.details.paymentHistorySubtitle")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("workers.details.month")}</TableHead>
                <TableHead className="text-right">{t("workers.details.amount")}</TableHead>
                <TableHead className="text-right">{t("workers.details.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap">{payment.month}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{money(Number(payment.amountPaid))}</TableCell>
                  <TableCell className="whitespace-nowrap text-right text-muted-foreground">
                    {new Date(payment.paidAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    {t("workers.details.noPaymentHistory")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
