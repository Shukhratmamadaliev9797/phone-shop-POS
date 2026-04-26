import { Separator } from "@/components/ui/separator";
import { WalletCards } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function SalesPageHeader() {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("sales.header.title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("sales.header.subtitle")}
          </p>
        </div>
      </div>
      <Separator />
    </div>
  );
}
