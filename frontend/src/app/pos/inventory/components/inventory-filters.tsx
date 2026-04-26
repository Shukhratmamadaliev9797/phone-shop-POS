import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { InventoryCondition } from "@/lib/api/inventory";
import { useI18n } from "@/lib/i18n/provider";

export type InventoryFiltersValue = {
  q: string;
  storage: string;
  condition: "ALL" | InventoryCondition;
  brand: string;
};

export function InventoryFilters({
  value,
  brands,
  storages,
  onChange,
  onReset,
}: {
  value: InventoryFiltersValue;
  brands: string[];
  storages: string[];
  onChange: (next: InventoryFiltersValue) => void;
  onReset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* 🔍 Search (elastic) */}
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <Label htmlFor="search">{t("inventory.filters.search")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t("inventory.filters.searchPlaceholder")}
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* 🎛 Filters group */}
        <div className="flex flex-wrap items-end gap-2">
          {/* Storage */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <Label>{t("inventory.filters.storage")}</Label>
            <Select
              value={value.storage}
              onValueChange={(v) =>
                onChange({ ...value, storage: v })
              }
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder={t("inventory.filters.allStorages")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("inventory.filters.all")}</SelectItem>
                {storages.map((storage) => (
                  <SelectItem key={storage} value={storage}>
                    {storage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <Label>{t("inventory.filters.condition")}</Label>
            <Select
              value={value.condition}
              onValueChange={(v) =>
                onChange({
                  ...value,
                  condition: v as InventoryFiltersValue["condition"],
                })
              }
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder={t("inventory.filters.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("inventory.filters.all")}</SelectItem>
                <SelectItem value="GOOD">{t("inventory.condition.good")}</SelectItem>
                <SelectItem value="USED">{t("inventory.condition.used")}</SelectItem>
                <SelectItem value="BROKEN">{t("inventory.condition.broken")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <Label>{t("inventory.filters.brand")}</Label>
            <Select
              value={value.brand}
              onValueChange={(v) => onChange({ ...value, brand: v })}
            >
              <SelectTrigger className="w-auto min-w-[140px]">
                <SelectValue placeholder={t("inventory.filters.allBrands")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("inventory.filters.all")}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            className="h-10 px-3"
            title={t("inventory.filters.reset")}
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
