import type { DashboardKpiPeriod } from "@/lib/api/dashboard";

export type DashboardHeadingProps = {
  title?: string;
  subtitle?: string;
};

export type Props = {
  value: DashboardKpiPeriod;
  customFrom: string;
  customTo: string;
  onPresetChange: (period: Exclude<DashboardKpiPeriod, "custom">) => void;
  onCustomApply: (from: string, to: string) => void;
};

export type RangeDraft = {
  start: Date | null;
  end: Date | null;
};

export type KPI = {
  title: string;
  value: string;
  deltaPercent: number;
  deltaLabel?: string;
  icon?: React.ElementType;
};
