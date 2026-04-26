import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function CustomersPageHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {title ?? t("customers.header.title")}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {subtitle ?? t("customers.header.subtitle")}
        </p>
      </div>
      <Separator />
    </div>
  );
}
