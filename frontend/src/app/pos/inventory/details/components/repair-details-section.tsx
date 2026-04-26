import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";

type Props = {
  knownIssues?: string | null;
  repairCost: number;
};

export function RepairDetailsSection({ knownIssues, repairCost }: Props) {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  if (!knownIssues && repairCost <= 0) return null;

  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
      <div className="text-sm font-semibold mb-3">
        {t("inventory.details.repair.title")}
      </div>
      <div className="space-y-3">
        {knownIssues ? (
          <div className="rounded-2xl border bg-background/40 p-4 text-sm break-words">
            {knownIssues}
          </div>
        ) : null}
        {repairCost > 0 ? (
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">
              {t("inventory.details.repair.cost")}
            </div>
            <div className="mt-1 text-sm font-semibold">{money(repairCost)}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
