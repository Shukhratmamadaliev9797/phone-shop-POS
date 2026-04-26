import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n/provider";
import type {
  EditWorkerForm,
  EditWorkerJobCategory,
  EditWorkerLoginRoleOption,
  WorkerSalaryTypeOption,
} from "@/shared/workers/forms";

export function EditWorkerFormCard({
  loading,
  workerHasUser,
  value,
  setValue,
  error,
  saving,
  canSave,
  onCancel,
  onSubmit,
  formatUzPhoneInput,
  formatMoneyInput,
}: {
  loading: boolean;
  workerHasUser: boolean;
  value: EditWorkerForm;
  setValue: React.Dispatch<React.SetStateAction<EditWorkerForm>>;
  error: string | null;
  saving: boolean;
  canSave: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  formatUzPhoneInput: (input: string) => string;
  formatMoneyInput: (input: string) => string;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-6 space-y-4">
      {loading ? (
        <div className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
          {t("workers.edit.loadingDetails")}
        </div>
      ) : null}

      {!loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              {t("workers.new.fullName")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-10 w-full rounded-xl"
              value={value.fullName}
              onChange={(e) =>
                setValue((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("workers.new.phoneNumber")}</Label>
            <Input
              className="h-10 w-full rounded-xl"
              value={value.phoneNumber}
              onChange={(e) =>
                setValue((p) => ({
                  ...p,
                  phoneNumber: formatUzPhoneInput(e.target.value),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t("workers.new.address")}</Label>
            <Input
              className="h-10 w-full rounded-xl"
              value={value.address}
              onChange={(e) =>
                setValue((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t("workers.new.jobCategory")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={value.jobCategory || undefined}
              onValueChange={(v) =>
                setValue((p) => ({
                  ...p,
                  jobCategory: v as EditWorkerJobCategory,
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">{t("workers.role.admin")}</SelectItem>
                <SelectItem value="CASHIER">{t("workers.role.cashier")}</SelectItem>
                <SelectItem value="TECHNICIAN">{t("workers.role.technician")}</SelectItem>
                <SelectItem value="CLEANER">{t("workers.role.cleaner")}</SelectItem>
                <SelectItem value="ACCOUNTANT">{t("workers.role.accountant")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {t("workers.new.salaryType")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={value.salaryType || undefined}
              onValueChange={(v) =>
                setValue((p) => ({
                  ...p,
                  salaryType: v as WorkerSalaryTypeOption,
                  salaryValue: "",
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">{t("workers.salaryType.percent")}</SelectItem>
                <SelectItem value="MONTHLY">{t("workers.salaryType.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {value.salaryType ? (
            <div className="space-y-2">
              <Label>
                {value.salaryType === "PERCENT"
                  ? t("workers.new.howManyPercent")
                  : t("workers.new.howMuchMonthly")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                className="h-10 w-full rounded-xl"
                inputMode="numeric"
                value={value.salaryValue}
                onChange={(e) =>
                  setValue((p) => ({
                    ...p,
                    salaryValue:
                      p.salaryType === "MONTHLY"
                        ? formatMoneyInput(e.target.value)
                        : e.target.value.replace(/\D/g, "").slice(0, 3),
                  }))
                }
              />
            </div>
          ) : (
            <div />
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label>{t("workers.new.notes")}</Label>
            <Textarea
              className="rounded-xl"
              value={value.notes}
              onChange={(e) =>
                setValue((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {t("workers.new.dashboardLoginTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("workers.new.dashboardLoginSubtitle")}
            </p>
          </div>
          <Switch
            checked={value.hasDashboardAccess}
            onCheckedChange={(checked) =>
              setValue((p) => ({ ...p, hasDashboardAccess: checked }))
            }
          />
        </div>

        {value.hasDashboardAccess ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("workers.new.emailOrUsername")}</Label>
              <Input
                className="h-10 w-full rounded-xl"
                value={value.loginEmail}
                onChange={(e) =>
                  setValue((p) => ({ ...p, loginEmail: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                {workerHasUser
                  ? t("workers.edit.passwordOptional")
                  : t("workers.new.password")}
              </Label>
              <Input
                type="password"
                className="h-10 w-full rounded-xl"
                value={value.loginPassword}
                onChange={(e) =>
                  setValue((p) => ({ ...p, loginPassword: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("workers.new.loginRole")}</Label>
              <Select
                value={value.loginRole || undefined}
                onValueChange={(v) =>
                  setValue((p) => ({
                    ...p,
                    loginRole: v as EditWorkerLoginRoleOption,
                  }))
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("workers.role.admin")}</SelectItem>
                  <SelectItem value="CASHIER">{t("workers.role.cashier")}</SelectItem>
                  <SelectItem value="TECHNICIAN">{t("workers.role.technician")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onCancel}
          disabled={saving}
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          className="rounded-xl"
          onClick={onSubmit}
          disabled={!canSave}
        >
          {saving ? t("common.saving") : t("workers.edit.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
