import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/provider";

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export function PasswordTab({
  passwordForm,
  isSavingPassword,
  passwordError,
  passwordStatus,
  onPasswordFieldChange,
  onSavePassword,
}: {
  passwordForm: PasswordForm;
  isSavingPassword: boolean;
  passwordError: string | null;
  passwordStatus: string | null;
  onPasswordFieldChange: (key: keyof PasswordForm, value: string) => void;
  onSavePassword: () => void;
}) {
  const { t } = useI18n();

  return (
    <TabsContent value="password" className="pt-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.password.title")}</CardTitle>
          <CardDescription>{t("settings.password.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("settings.password.new")}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => onPasswordFieldChange("newPassword", event.target.value)}
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("settings.password.confirm")}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => onPasswordFieldChange("confirmPassword", event.target.value)}
                disabled={isSavingPassword}
              />
            </div>
          </div>

          {passwordError ? <p className="text-sm text-rose-600">{passwordError}</p> : null}
          {passwordStatus ? <p className="text-sm text-emerald-600">{passwordStatus}</p> : null}

          <Button onClick={onSavePassword} disabled={isSavingPassword}>
            {isSavingPassword ? t("common.saving") : t("settings.password.save")}
          </Button>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
