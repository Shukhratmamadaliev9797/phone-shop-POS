import { useI18n } from "@/lib/i18n/provider";

type Props = {
  customer: {
    fullName?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
  } | null;
};

export function CustomerDetailsSection({ customer }: Props) {
  const { t } = useI18n();
  if (!customer) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{t("sales.new.customerDetails")}</div>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 grid gap-3 md:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">{t("sales.new.fullName")}</p><p className="text-sm font-medium">{customer.fullName || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">{t("sales.new.phoneNumber")}</p><p className="text-sm font-medium">{customer.phoneNumber || "—"}</p></div>
        <div className="md:col-span-2"><p className="text-xs text-muted-foreground">{t("sales.new.address")}</p><p className="text-sm font-medium">{customer.address || "—"}</p></div>
      </div>
    </div>
  );
}
