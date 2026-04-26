import { useI18n } from "@/lib/i18n/provider";

type PhoneItem = {
  brand?: string | null;
  model?: string | null;
  imei?: string | null;
  condition?: string | null;
  storage?: string | null;
  color?: string | null;
  serialNumber?: string | null;
  knownIssues?: string | null;
};

type Props = {
  item?: PhoneItem | null;
};

export function PhoneDetailsSection({ item }: Props) {
  const { t } = useI18n();
  const conditionLabel = (() => {
    const value = String(item?.condition ?? "").trim().toUpperCase();
    if (value === "GOOD") return t("inventory.condition.good");
    if (value === "USED") return t("inventory.condition.used");
    if (value === "BROKEN") return t("inventory.condition.broken");
    return item?.condition || "—";
  })();

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.details.phoneDetails")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 grid gap-3 md:grid-cols-3">
        <div><p className="text-xs text-muted-foreground">{t("sales.new.brandModel")}</p><p className="text-sm font-medium">{item?.brand} {item?.model}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("inventory.details.phone.imei")}</p><p className="text-sm font-medium">{item?.imei || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("sales.new.condition")}</p><p className="text-sm font-medium">{conditionLabel}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("sales.new.storage")}</p><p className="text-sm font-medium">{item?.storage || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("sales.new.color")}</p><p className="text-sm font-medium">{item?.color || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("sales.new.serialNumber")}</p><p className="text-sm font-medium">{item?.serialNumber || "—"}</p></div>
        {item?.knownIssues ? (
          <div className="md:col-span-3 rounded-2xl border bg-background/40 p-3">
            <p className="text-xs text-muted-foreground">{t("sales.details.knownIssues")}</p>
            <p className="text-sm font-medium whitespace-pre-wrap break-words">{item.knownIssues}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
