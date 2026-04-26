import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, RotateCcw, CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SalePaymentType } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

function formatDateLabel(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function SalesFilters({
  search,
  onSearchChange,
  paymentType,
  onPaymentTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  paymentType: "all" | SalePaymentType;
  onPaymentTypeChange: (value: "all" | SalePaymentType) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}) {
  const { t } = useI18n();
  const tr = {
    search: t("sales.filters.search"),
    searchPlaceholder: t("sales.filters.searchPlaceholder"),
    from: t("sales.filters.from"),
    to: t("sales.filters.to"),
    paymentType: t("sales.filters.paymentType"),
    allTypes: t("sales.filters.allTypes"),
    paidNow: t("sales.filters.fullPayment"),
    payLater: t("sales.filters.monthlyInstallment"),
    reset: t("sales.filters.reset"),
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="salesSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="salesSearch"
              placeholder={tr.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[170px] flex-col gap-1">
            <Label>{tr.from}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 w-[170px] justify-start rounded-xl text-left font-normal",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateFrom ? formatDateLabel(dateFrom) : tr.from}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-2xl p-3" align="start">
                <Input
                  type="date"
                  className="h-10 w-[220px] rounded-xl"
                  value={dateFrom}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex min-w-[170px] flex-col gap-1">
            <Label>{tr.to}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 w-[170px] justify-start rounded-xl text-left font-normal",
                    !dateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateTo ? formatDateLabel(dateTo) : tr.to}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-2xl p-3" align="start">
                <Input
                  type="date"
                  className="h-10 w-[220px] rounded-xl"
                  value={dateTo}
                  onChange={(event) => onDateToChange(event.target.value)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <Label>{tr.paymentType}</Label>
            <Select value={paymentType} onValueChange={(value) => onPaymentTypeChange(value as "all" | SalePaymentType)}>
              <SelectTrigger className="h-10 w-auto min-w-[160px]">
                <SelectValue placeholder={tr.paymentType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.allTypes}</SelectItem>
                <SelectItem value="PAID_NOW">{tr.paidNow}</SelectItem>
                <SelectItem value="PAY_LATER">{tr.payLater}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="h-10 px-3" title={tr.reset} type="button" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
