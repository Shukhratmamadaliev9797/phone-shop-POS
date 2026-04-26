import { useI18n } from "@/lib/i18n/provider";

type Props = {
  fullName: string;
  phoneNumber?: string | null;
  address?: string | null;
  roleLabel: string;
};

export function WorkerDetailsSection({
  fullName,
  phoneNumber,
  address,
  roleLabel,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="rounded-3xl border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.fullName")}
          </p>
          <p className="text-sm font-medium">{fullName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.phoneNumber")}
          </p>
          <p className="text-sm font-medium">{phoneNumber || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.address")}
          </p>
          <p className="text-sm font-medium">
            {address ?? t("workers.details.noAddress")}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {t("workers.details.role")}
          </p>
          <p className="text-sm font-medium">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}
