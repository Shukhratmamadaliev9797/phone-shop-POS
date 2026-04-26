import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ShieldAlert, RefreshCw, ScanSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const ITEMS = [
  { id: "1", icon: RefreshCw },
  { id: "2", icon: ScanSearch },
  { id: "3", icon: AlertTriangle },
  { id: "4", icon: ShieldAlert },
] as const;

export function HelpTroubleshooting() {
  const { t } = useI18n();

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">{t("help.troubleshooting.title")}</div>
          <div className="text-sm text-muted-foreground">{t("help.troubleshooting.subtitle")}</div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <div key={item.id} className="rounded-3xl border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/10 p-2">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{t(`help.troubleshooting.items.${item.id}.title`)}</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>{t(`help.troubleshooting.items.${item.id}.points.1`)}</li>
                    <li>{t(`help.troubleshooting.items.${item.id}.points.2`)}</li>
                    <li>{t(`help.troubleshooting.items.${item.id}.points.3`)}</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

