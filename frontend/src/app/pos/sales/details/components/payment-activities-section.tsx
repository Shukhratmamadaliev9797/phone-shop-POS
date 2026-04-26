import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SaleDetail } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";
import { formatActivityNote, formatDateTime, money } from "./formatters";

type Props = {
  sale: SaleDetail;
  soldPrice: number;
  monthlyAmount: number;
  installmentMonths: number;
  canAddPayment: boolean;
  onAddPayment: () => void;
};

export function PaymentActivitiesSection({
  sale,
  soldPrice,
  monthlyAmount,
  installmentMonths,
  canAddPayment,
  onAddPayment,
}: Props) {
  const { t } = useI18n();
  const activities = sale.activities ?? [];

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.details.paymentActivities")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 space-y-2">
        {activities.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("sales.details.noActivities")}</div>
        ) : (
          (() => {
            const sortedActivities = [...activities].sort(
              (a, b) =>
                new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime(),
            );
            let paidSoFar = 0;
            return sortedActivities.map((activity, index) => {
              const amount = Number(activity.amount ?? 0);
              paidSoFar += amount;
              const calculatedRemaining = Math.max(soldPrice - paidSoFar, 0);
              const remainingMonths =
                sale.paymentType === "PAY_LATER" && monthlyAmount > 0
                  ? Math.max(Math.ceil(calculatedRemaining / monthlyAmount), 0)
                  : 0;
              const isFullPaidActivity = /full payment/i.test(
                String(activity.notes ?? ""),
              );

              return (
                <div key={activity.id} className="rounded-2xl border bg-background/40 p-3">
                  {isFullPaidActivity ? (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            {t("sales.details.fullPaid")}: {money(amount)}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            {t("sales.details.remaining")}: {money(0)}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground text-right whitespace-nowrap">
                        {formatDateTime(activity.paidAt)}
                      </p>
                    </div>
                  ) : sale.paymentType === "PAY_LATER" ? (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            {index + 1} {t("sales.details.month")}: {money(amount)}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            {t("sales.details.remaining")}: {money(calculatedRemaining)}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            {installmentMonths > 0 ? remainingMonths : 0} {t("sales.details.monthLeft")}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground text-right whitespace-nowrap">
                        {formatDateTime(activity.paidAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          {t("sales.details.payment")}:{" "}
                          <span className="font-medium text-foreground">{money(amount)}</span>
                        </p>
                        <p>
                          {t("sales.details.remaining")}:{" "}
                          <span className="font-medium text-foreground">{money(calculatedRemaining)}</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground text-right whitespace-nowrap">
                        {formatDateTime(activity.paidAt)}
                      </p>
                    </div>
                  )}

                  {activity.notes &&
                  sale.paymentType !== "PAY_LATER" &&
                  !isFullPaidActivity ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatActivityNote(activity.notes, t)}
                    </p>
                  ) : null}
                </div>
              );
            });
          })()
        )}
      </div>
      {canAddPayment ? (
        <div className="pt-2">
          <Button className="rounded-2xl" onClick={onAddPayment}>
            <HandCoins className="mr-2 h-4 w-4" />
            {t("sales.table.action.addPayment")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
