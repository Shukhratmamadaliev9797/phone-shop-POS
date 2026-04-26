import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import type { WorkerDetailsView } from "@/lib/api/workers";
import { useI18n } from "@/lib/i18n/provider";

export function PaymentsTab({
  paymentsLoading,
  workerDetails,
  monthlySalary,
  monthPaid,
  monthRemaining,
  toMoney,
}: {
  paymentsLoading: boolean;
  workerDetails: WorkerDetailsView | null;
  monthlySalary: number;
  monthPaid: number;
  monthRemaining: number;
  toMoney: (value: number) => string;
}) {
  const { t } = useI18n();

  return (
    <TabsContent value="payments" className="pt-4 space-y-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.payments.overviewTitle")}</CardTitle>
          <CardDescription>{t("settings.payments.overviewSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <p className="text-sm text-muted-foreground">{t("settings.payments.loading")}</p>
          ) : !workerDetails ? (
            <p className="text-sm text-muted-foreground">{t("settings.payments.notLinked")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{t("settings.payments.salaryType")}</p>
                <p className="text-sm font-semibold">{workerDetails.salaryType}</p>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{t("settings.payments.monthlySalary")}</p>
                <p className="text-sm font-semibold">{toMoney(monthlySalary)} UZS</p>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{t("settings.payments.paidThisMonth")}</p>
                <p className="text-sm font-semibold">{toMoney(monthPaid)} UZS</p>
              </div>
              <div className="rounded-xl border bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">{t("settings.payments.remaining")}</p>
                <p className="text-sm font-semibold">{toMoney(monthRemaining)} UZS</p>
              </div>
              {workerDetails.salaryType === "PERCENT" ? (
                <div className="rounded-xl border bg-background/60 p-3 sm:col-span-2 lg:col-span-4">
                  <p className="text-xs text-muted-foreground">{t("settings.payments.percentAccrued")}</p>
                  <p className="text-sm font-semibold">
                    {toMoney(Number(workerDetails.percentSalaryAccrued ?? 0))} UZS
                    {workerDetails.salaryPercent
                      ? ` (${Number(workerDetails.salaryPercent)}%)`
                      : ""}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.payments.historyTitle")}</CardTitle>
          <CardDescription>{t("settings.payments.historySubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {!workerDetails || workerDetails.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("settings.payments.historyEmpty")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">{t("settings.payments.historyMonth")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("settings.payments.historyAmount")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("settings.payments.historyPaidAt")}</th>
                    <th className="px-3 py-2 text-left font-medium">{t("settings.payments.historyNotes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {workerDetails.payments.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="px-3 py-2">{payment.month}</td>
                      <td className="px-3 py-2 font-medium">{toMoney(Number(payment.amountPaid ?? 0))} UZS</td>
                      <td className="px-3 py-2">{new Date(payment.paidAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-muted-foreground">{payment.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
