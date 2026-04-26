// src/components/pos/help/help-search.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type HelpSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HelpSearch({ value, onChange }: HelpSearchProps) {
  const { t } = useI18n();

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-2xl pl-9"
              placeholder={t("help.search.placeholder")}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {t("help.search.tipPrefix")}
          <span className="font-medium">“pay later”</span>,{" "}
          <span className="font-medium">“IMEI”</span>,{" "}
          {t("help.search.tipOr")}{" "}
          <span className="font-medium">“void”</span>.
        </div>
      </CardContent>
    </Card>
  );
}
