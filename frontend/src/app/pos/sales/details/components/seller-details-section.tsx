import { useI18n } from "@/lib/i18n/provider";

type Props = {
  sellerName: string;
};

export function SellerDetailsSection({ sellerName }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.details.sellerDetails")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
        <div className="text-xs text-muted-foreground">{t("sales.details.whoSold")}</div>
        <div className="text-sm font-medium">{sellerName || "—"}</div>
      </div>
    </div>
  );
}
