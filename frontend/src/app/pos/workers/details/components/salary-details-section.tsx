import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

type Props = {
  salaryType: "MONTHLY" | "PERCENT";
  monthlySalary: number;
  salaryPercent: number;
  soldPhonesCount: number;
  totalProfitAmount: number;
  percentSalaryAccrued: number;
};

export function SalaryDetailsSection({
  salaryType,
  monthlySalary,
  salaryPercent,
  soldPhonesCount,
  totalProfitAmount,
  percentSalaryAccrued,
}: Props) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();

  return (
    <div className="rounded-3xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.paymentType")}
          </p>
          <p className="text-sm font-medium">
            {salaryType === "MONTHLY"
              ? t("workers.salaryType.monthly")
              : t("workers.salaryType.percent")}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.soldPhonesCount")}
          </p>
          <p className="text-sm font-medium">{soldPhonesCount}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.totalProfit")}
          </p>
          <p className="text-sm font-medium">{money(totalProfitAmount)}</p>
        </div>

        {salaryType === "MONTHLY" ? (
          <div>
            <p className="text-xs text-muted-foreground">
              {t("workers.details.monthlySalary")}
            </p>
            <p className="text-sm font-medium">{money(monthlySalary)}</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("workers.details.configuredPercent")}
              </p>
              <p className="text-sm font-medium">
                {Math.max(0, Math.round(salaryPercent))}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("workers.details.salaryFromPercent")}
              </p>
              <p className="text-sm font-medium">{money(percentSalaryAccrued)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
