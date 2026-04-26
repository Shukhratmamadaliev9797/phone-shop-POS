import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { formatDateTime } from "./formatters";

type Props = {
  soldAt: string;
  canManage: boolean;
  onBack: () => void;
  onEdit: () => void;
  onPrint: () => void;
};

export function SaleDetailsHeader({
  soldAt,
  canManage,
  onBack,
  onEdit,
  onPrint,
}: Props) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {t("sales.details.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateTime(soldAt)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="rounded-2xl" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Button>
        {canManage ? (
          <Button variant="outline" className="rounded-2xl" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("sales.table.action.edit")}
          </Button>
        ) : null}
        <Button variant="outline" className="rounded-2xl" onClick={onPrint}>
          <Printer className="mr-2 h-4 w-4" />
          {t("sales.table.action.receipt")}
        </Button>
      </div>
    </div>
  );
}
