import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Props, RangeDraft } from "../types";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, value: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + value, 1),
  );
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return toInputDate(a) === toInputDate(b);
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const val = day.getTime();
  return val > start.getTime() && val < end.getTime();
}

function buildMonthDays(cursor: Date): Array<Date | null> {
  const year = cursor.getUTCFullYear();
  const month = cursor.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const slots: Array<Date | null> = [];
  for (let i = 0; i < startOffset; i += 1) slots.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    slots.push(new Date(Date.UTC(year, month, d)));
  }
  while (slots.length < 42) slots.push(null);
  return slots;
}

function MonthGrid({
  monthCursor,
  draft,
  onPick,
  maxDate,
}: {
  monthCursor: Date;
  draft: RangeDraft;
  onPick: (date: Date) => void;
  maxDate: Date;
}) {
  const days = buildMonthDays(monthCursor);
  const title = monthCursor.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="w-full">
      <div className="mb-2 text-center text-sm font-medium">{title}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }
          const isStart = isSameDay(day, draft.start);
          const isEnd = isSameDay(day, draft.end);
          const between = isInRange(day, draft.start, draft.end);
          const isFuture = day.getTime() > maxDate.getTime();
          return (
            <button
              key={toInputDate(day)}
              type="button"
              onClick={() => !isFuture && onPick(day)}
              disabled={isFuture}
              className={cn(
                "h-8 rounded-md text-sm transition-colors",
                between && "bg-muted",
                (isStart || isEnd) && "bg-primary text-primary-foreground",
                !(between || isStart || isEnd || isFuture) && "hover:bg-muted",
                isFuture && "cursor-not-allowed opacity-40",
              )}
            >
              {day.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function KpiPeriodFilter({
  value,
  customFrom,
  customTo,
  onPresetChange,
  onCustomApply,
}: Props) {
  const { t } = useI18n();
  const today = React.useMemo(() => getTodayUtc(), []);
  const todayInput = toInputDate(today);
  const presets = [
    { value: "daily", label: t("dashboard.period.daily") },
    { value: "weekly", label: t("dashboard.period.weekly") },
    { value: "monthly", label: t("dashboard.period.monthly") },
  ] as const;

  const initialStart = parseDateInput(customFrom) ?? new Date();
  const [open, setOpen] = React.useState(false);
  const [monthCursor, setMonthCursor] = React.useState<Date>(
    startOfMonth(initialStart),
  );
  const [draft, setDraft] = React.useState<RangeDraft>({
    start: parseDateInput(customFrom),
    end: parseDateInput(customTo),
  });

  React.useEffect(() => {
    if (open) {
      const start = parseDateInput(customFrom);
      const end = parseDateInput(customTo);
      setDraft({ start, end });
      if (start) setMonthCursor(startOfMonth(start));
    }
  }, [open, customFrom, customTo]);

  const onPick = (date: Date) => {
    if (date.getTime() > today.getTime()) return;
    setDraft((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: date, end: null };
      }
      if (date.getTime() < prev.start.getTime()) {
        return { start: date, end: prev.start };
      }
      return { start: prev.start, end: date };
    });
  };

  const apply = () => {
    if (!draft.start || !draft.end) return;
    const safeStart =
      draft.start.getTime() > today.getTime() ? today : draft.start;
    const safeEnd = draft.end.getTime() > today.getTime() ? today : draft.end;
    onCustomApply(toInputDate(safeStart), toInputDate(safeEnd));
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPresetChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted/40 text-muted-foreground hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
              value === "custom"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted",
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {t("dashboard.period.customDates")}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[680px] max-w-[95vw] rounded-2xl p-4"
          align="end"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setMonthCursor((prev) => addMonths(prev, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t("dashboard.period.startMonth")}
                </span>
                <div className="h-7 w-7" />
              </div>
              <MonthGrid
                monthCursor={monthCursor}
                draft={draft}
                onPick={onPick}
                maxDate={today}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="h-7 w-7" />
                <span className="text-xs text-muted-foreground">
                  {t("dashboard.period.endMonth")}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setMonthCursor((prev) => addMonths(prev, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <MonthGrid
                monthCursor={addMonths(monthCursor, 1)}
                draft={draft}
                onPick={onPick}
                maxDate={today}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 border-t pt-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">
                {t("dashboard.period.startDate")}
              </div>
              <input
                type="date"
                value={draft.start ? toInputDate(draft.start) : ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    start: (() => {
                      const next = parseDateInput(e.target.value);
                      if (!next) return null;
                      return next.getTime() > today.getTime() ? today : next;
                    })(),
                  }))
                }
                max={todayInput}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">
                {t("dashboard.period.endDate")}
              </div>
              <input
                type="date"
                value={draft.end ? toInputDate(draft.end) : ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    end: (() => {
                      const next = parseDateInput(e.target.value);
                      if (!next) return null;
                      return next.getTime() > today.getTime() ? today : next;
                    })(),
                  }))
                }
                max={todayInput}
                className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-xl px-3"
                onClick={() => setDraft({ start: null, end: null })}
              >
                {t("dashboard.period.clear")}
              </Button>
              <Button
                type="button"
                className="h-9 rounded-xl px-4"
                onClick={apply}
                disabled={!draft.start || !draft.end}
              >
                {t("dashboard.period.apply")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
