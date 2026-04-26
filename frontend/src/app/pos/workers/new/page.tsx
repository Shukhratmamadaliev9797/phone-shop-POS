import * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { canManageWorkers } from "@/lib/auth/permissions";
import {
  createWorker,
  type CreateWorkerPayload,
  type WorkerLoginRole,
  type WorkerRole,
} from "@/lib/api/workers";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import { useUzPhone } from "@/hooks/use-uz-phone";
import { NewWorkerHeader } from "./components/new-worker-header";
import { NewWorkerFormCard } from "./components/new-worker-form";
import {
  type NewWorkerForm,
  type NewWorkerJobCategory,
  type NewWorkerLoginRoleOption,
  type WorkerSalaryTypeOption,
  initialNewWorkerForm,
} from "@/shared/workers/forms";

// Formadagi kasb qiymatini backend roli bilan moslaymiz.
function mapJobCategoryToWorkerRole(
  jobCategory: NewWorkerJobCategory,
): WorkerRole {
  if (jobCategory === "CASHIER") return "CASHIER";
  if (jobCategory === "TECHNICIAN") return "TECHNICIAN";
  return "OTHER";
}

function mapLoginRoleToUserRole(
  loginRole: NewWorkerLoginRoleOption,
): WorkerLoginRole {
  if (loginRole === "CASHIER") return "CASHIER";
  return "TECHNICIAN";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function NewWorkerPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { inputToBase, formatInput } = useCurrencyInput();
  const { formatInput: formatUzPhoneInput, normalizeForSave } = useUzPhone();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageWorkers(role);

  const [value, setValue] = React.useState<NewWorkerForm>(initialNewWorkerForm);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!canManage) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  const isCashier = value.jobCategory === "CASHIER";
  const effectiveSalaryType: WorkerSalaryTypeOption = isCashier
    ? (value.salaryType || "MONTHLY")
    : "MONTHLY";
  const isMonthlySalary = effectiveSalaryType === "MONTHLY";
  const salaryValue = isMonthlySalary
    ? inputToBase(value.salaryValue)
    : Number(value.salaryValue || 0);
  const baseValid =
    value.fullName.trim().length > 0 &&
    value.jobCategory.length > 0 &&
    (!isCashier || value.salaryType.length > 0) &&
    Number.isFinite(salaryValue) &&
    salaryValue > 0;

  const loginValid =
    !value.hasDashboardAccess ||
    (isEmail(value.loginEmail.trim()) &&
      value.loginPassword.length >= 8 &&
      value.loginRole.length > 0);

  const canCreate = canManage && !saving && baseValid && loginValid;

  async function handleCreate() {
    if (!baseValid) {
      setError(
        t("workers.new.error.requiredFields"),
      );
      return;
    }

    if (value.hasDashboardAccess) {
      if (!isEmail(value.loginEmail.trim())) {
        setError(
          t("workers.new.error.invalidEmail"),
        );
        return;
      }
      if (value.loginPassword.length < 8) {
        setError(
          t("workers.new.error.passwordMin"),
        );
        return;
      }
      if (!value.loginRole) {
        setError(
          t("workers.new.error.loginRoleRequired"),
        );
        return;
      }
    }

    const normalizedWorkerPhone = normalizeForSave(value.phoneNumber);
    const payload: CreateWorkerPayload = {
      fullName: value.fullName.trim(),
      address: value.address.trim() || undefined,
      salaryType: isMonthlySalary ? "MONTHLY" : "PERCENT",
      monthlySalary: isMonthlySalary ? inputToBase(value.salaryValue) : undefined,
      salaryPercent: isMonthlySalary ? undefined : Number(value.salaryValue || 0),
      workerRole: mapJobCategoryToWorkerRole(
        value.jobCategory as NewWorkerJobCategory,
      ),
      hasDashboardAccess: value.hasDashboardAccess,
      login: value.hasDashboardAccess
        ? {
            email: value.loginEmail.trim(),
            password: value.loginPassword,
            role: mapLoginRoleToUserRole(
              value.loginRole as NewWorkerLoginRoleOption,
            ),
          }
        : undefined,
      notes: value.notes.trim() || undefined,
    };
    if (normalizedWorkerPhone) {
      payload.phoneNumber = normalizedWorkerPhone;
    }

    try {
      setSaving(true);
      setError(null);
      await createWorker(payload);
      navigate("/workers");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("workers.new.error.createFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <NewWorkerHeader
        onBack={() => navigate("/workers")}
      />
      <NewWorkerFormCard
        value={value}
        setValue={setValue}
        isCashier={isCashier}
        effectiveSalaryType={effectiveSalaryType}
        error={error}
        saving={saving}
        canCreate={canCreate}
        onCancel={() => navigate("/workers")}
        onSubmit={() => void handleCreate()}
        formatUzPhoneInput={formatUzPhoneInput}
        formatMoneyInput={formatInput}
      />
    </div>
  );
}
