import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";

export function WorkerPageHeader({
  workerName,
  salaryCycleMonth,
  onBack,
}: {
  workerName?: string | null;
  salaryCycleMonth: string;
  onBack: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("workers.details.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {workerName ?? "—"} • {t("workers.details.monthLabel")} {salaryCycleMonth}
          </p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
      <Separator />
    </div>
  );
}
