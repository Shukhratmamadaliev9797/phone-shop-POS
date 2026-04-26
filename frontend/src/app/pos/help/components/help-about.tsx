// src/components/pos/help/help-about.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";

export function HelpAbout() {
  const { t } = useI18n();
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">{t("help.about.title")}</div>
          <div className="text-sm text-muted-foreground">{t("help.about.subtitle")}</div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">{t("help.about.version")}</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-sm font-semibold">v0.1.0</div>
              <Badge className="rounded-full">{t("help.about.demoBadge")}</Badge>
            </div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">{t("help.about.environment")}</div>
            <div className="mt-1 text-sm font-semibold">{t("help.about.environmentValue")}</div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">{t("help.about.build")}</div>
            <div className="mt-1 text-sm font-semibold">2026-02-08</div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">{t("help.about.notes")}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t("help.about.notesValue")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
