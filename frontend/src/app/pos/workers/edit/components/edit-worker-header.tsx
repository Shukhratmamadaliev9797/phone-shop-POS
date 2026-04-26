import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";

export function EditWorkerHeader({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("workers.edit.title")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("workers.edit.subtitle")}
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-xl" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
      </div>
      <Separator />
    </div>
  );
}
