import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/provider";

type DetailsForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

export function MyDetailsTab({
  details,
  isEditingDetails,
  isSavingDetails,
  detailsError,
  detailsStatus,
  onFieldChange,
  onClickUpdateDetails,
  onSaveDetails,
  onCancelEdit,
}: {
  details: DetailsForm;
  isEditingDetails: boolean;
  isSavingDetails: boolean;
  detailsError: string | null;
  detailsStatus: string | null;
  onFieldChange: (key: keyof DetailsForm, value: string) => void;
  onClickUpdateDetails: () => void;
  onSaveDetails: () => void;
  onCancelEdit: () => void;
}) {
  const { t } = useI18n();

  return (
    <TabsContent value="my-details" className="pt-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.details.title")}</CardTitle>
          <CardDescription>{t("settings.details.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="details-name">{t("settings.details.name")}</Label>
              <Input
                id="details-name"
                value={details.fullName}
                onChange={(event) => onFieldChange("fullName", event.target.value)}
                disabled={!isEditingDetails}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details-email">{t("settings.details.email")}</Label>
              <Input
                id="details-email"
                type="email"
                value={details.email}
                onChange={(event) => onFieldChange("email", event.target.value)}
                disabled={!isEditingDetails}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details-phone">{t("settings.details.phone")}</Label>
              <Input
                id="details-phone"
                value={details.phoneNumber}
                onChange={(event) => onFieldChange("phoneNumber", event.target.value)}
                disabled={!isEditingDetails}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details-address">{t("settings.details.address")}</Label>
              <Input
                id="details-address"
                value={details.address}
                onChange={(event) => onFieldChange("address", event.target.value)}
                disabled={!isEditingDetails}
              />
            </div>
          </div>

          {detailsError ? <p className="text-sm text-rose-600">{detailsError}</p> : null}
          {detailsStatus ? <p className="text-sm text-emerald-600">{detailsStatus}</p> : null}

          <div className="flex flex-wrap gap-2">
            {!isEditingDetails ? (
              <Button onClick={onClickUpdateDetails}>{t("settings.details.update")}</Button>
            ) : (
              <>
                <Button onClick={onSaveDetails} disabled={isSavingDetails}>
                  {isSavingDetails ? t("common.saving") : t("common.save")}
                </Button>
                <Button variant="outline" onClick={onCancelEdit} disabled={isSavingDetails}>
                  {t("common.cancel")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
