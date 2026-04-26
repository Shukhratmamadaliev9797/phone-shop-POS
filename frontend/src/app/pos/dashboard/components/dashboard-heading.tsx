import { useI18n } from "@/lib/i18n/provider";
import type { DashboardHeadingProps } from "../types";

export function DashboardHeading({ title, subtitle }: DashboardHeadingProps) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("dashboard.heading.title");
  const resolvedSubtitle = subtitle ?? t("dashboard.heading.subtitle");

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold tracking-tight">{resolvedTitle}</h1>
      <p className="text-sm text-muted-foreground">{resolvedSubtitle}</p>
    </div>
  );
}
