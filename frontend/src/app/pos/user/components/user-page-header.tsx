import { useI18n } from "@/lib/i18n/provider";

export function UserPageHeader() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t("user.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("user.description")}</p>
    </div>
  );
}

