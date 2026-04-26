import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyInput } from "@/hooks/use-currency-input";

type Props = {
  repairDescription: string;
  repairCost: string;
  onRepairDescriptionChange: (next: string) => void;
  onRepairCostChange: (next: string) => void;
};

export function RepairDetailsSection({
  repairDescription,
  repairCost,
  onRepairDescriptionChange,
  onRepairCostChange,
}: Props) {
  const { t, language } = useI18n();
  const { currency, baseToInput, formatInput, inputToBase } = useCurrencyInput();

  const formattedRepairCost = baseToInput(Number(repairCost || 0));
  const costPlaceholder =
    currency === "USD"
      ? language === "uz"
        ? "Mas: 20 USD"
        : "e.g. 20 USD"
      : t("inventory.addPhone.repair.costPlaceholder");

  return (
    <>
      <h3 className="text-sm font-semibold">{t("inventory.addPhone.repair.title")}</h3>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.repair.description")}</Label>
            <Textarea
              value={repairDescription}
              placeholder={t("inventory.addPhone.repair.descriptionPlaceholder")}
              onChange={(e) => onRepairDescriptionChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.repair.cost")}</Label>
            <Input
              inputMode={currency === "USD" ? "decimal" : "numeric"}
              placeholder={costPlaceholder}
              value={formattedRepairCost}
              onChange={(e) => {
                const formatted = formatInput(e.target.value);
                const base = inputToBase(formatted);
                onRepairCostChange(String(base));
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
