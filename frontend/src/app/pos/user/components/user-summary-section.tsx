import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n/provider";

export function UserSummarySection({
  name,
  email,
  roleLabel,
  isAdmin,
}: {
  name: string;
  email: string;
  roleLabel: string;
  isAdmin: boolean;
}) {
  const { t } = useI18n();

  const avatarInitials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback>{avatarInitials || "U"}</AvatarFallback>
        </Avatar>

        <div>
          <div className="text-base font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{email}</div>

          <div className="mt-2 flex gap-2">
            <Badge className="rounded-full">{roleLabel}</Badge>
            {!isAdmin ? (
              <Badge className="rounded-full bg-rose-500/15 text-rose-700">
                {t("user.readOnly")}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-sm rounded-3xl border border-muted/40 bg-muted/30 p-4 text-sm text-muted-foreground">
        {isAdmin ? t("user.adminNote") : t("user.readOnlyNote")}
      </div>
    </div>
  );
}

