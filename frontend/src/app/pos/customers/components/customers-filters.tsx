import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function CustomersFilters({
  search,
  onSearchChange,
  onReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="customerSearch">{t("customers.filters.search")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerSearch"
              placeholder={t("customers.filters.searchPlaceholder")}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            className="h-10 px-3"
            title={t("customers.filters.reset")}
            type="button"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

    </div>
  );
}
