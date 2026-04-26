import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

export function UserDetailsGrid({
  name,
  roleLabel,
  email,
  phone,
  workerSalaryType,
  monthlySalary,
  monthPaid,
  monthRemaining,
}: {
  name: string;
  roleLabel: string;
  email: string;
  phone: string;
  workerSalaryType?: "MONTHLY" | "PERCENT" | null;
  monthlySalary: number;
  monthPaid: number;
  monthRemaining: number;
}) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("user.fullName")}</div>
        <div className="mt-1 font-medium">{name}</div>
      </div>

      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("user.role")}</div>
        <div className="mt-1 font-medium">{roleLabel}</div>
      </div>

      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("user.email")}</div>
        <div className="mt-1 font-medium">{email}</div>
      </div>

      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("user.phone")}</div>
        <div className="mt-1 font-medium">{phone}</div>
      </div>

      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:col-span-2">
        <div className="text-xs text-muted-foreground">{t("user.salaryInfo")}</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-[11px] text-muted-foreground">{t("user.salaryType")}</div>
            <div className="mt-1 text-sm font-medium">
              {workerSalaryType
                ? workerSalaryType === "MONTHLY"
                  ? t("user.salaryTypeMonthly")
                  : t("user.salaryTypePercent")
                : t("user.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{t("user.monthlySalary")}</div>
            <div className="mt-1 text-sm font-medium">
              {workerSalaryType === "MONTHLY" ? money(monthlySalary) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{t("user.paid")}</div>
            <div className="mt-1 text-sm font-medium">
              {workerSalaryType === "MONTHLY" ? money(monthPaid) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{t("user.remaining")}</div>
            <div className="mt-1 text-sm font-medium">
              {workerSalaryType === "MONTHLY" ? money(monthRemaining) : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:col-span-2">
        <div className="text-xs text-muted-foreground">{t("user.accessNoteTitle")}</div>
        <div className="mt-1 text-sm text-muted-foreground">{t("user.accessNoteBody")}</div>
      </div>
    </div>
  );
}
