import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

type Props = {
  itemName: string;
  imei: string;
  serialNumber?: string | null;
  storage?: string | null;
  color?: string | null;
  conditionLabel: string;
  copied: boolean;
  onCopy: () => void;
};

export function PhoneDetailsSection({
  itemName,
  imei,
  serialNumber,
  storage,
  color,
  conditionLabel,
  copied,
  onCopy,
}: Props) {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
      <div className="space-y-4">
        <div className="text-lg font-semibold">{itemName || "—"}</div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">
              {t("inventory.details.phone.storage")}
            </div>
            <div className="mt-1 text-sm font-medium">
              {storage?.trim() || "—"}
            </div>
          </div>
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">{t("inventory.details.phone.color")}</div>
            <div className="mt-1 text-sm font-medium">
              {color?.trim() || "—"}
            </div>
          </div>
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">
              {t("inventory.details.phone.condition")}
            </div>
            <div className="mt-1 text-sm font-medium">{conditionLabel}</div>
          </div>
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{t("inventory.details.phone.imei")}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground break-all">
                  {imei || "—"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-xl px-2 text-xs"
                onClick={onCopy}
                disabled={!imei}
              >
                <Copy className="mr-1 h-3 w-3" />
                {copied
                  ? t("common.copied")
                  : t("common.copy")}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-background/40 p-4">
            <div className="text-xs text-muted-foreground">
              {t("inventory.details.phone.serialNumber")}
            </div>
            <div className="mt-1 text-sm font-medium break-all">
              {serialNumber?.trim() || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
