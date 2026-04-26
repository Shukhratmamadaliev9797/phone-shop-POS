import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { canManageWorkers } from "@/lib/auth/permissions";
import {
  getWorker,
  updateWorker,
  type UpdateWorkerPayload,
  type WorkerDetailsView,
  type WorkerLoginRole,
  type WorkerRole,
} from "@/lib/api/workers";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import { useUzPhone } from "@/hooks/use-uz-phone";
import { EditWorkerHeader } from "./components/edit-worker-header";
import { EditWorkerFormCard } from "./components/edit-worker-form";
import {
  type EditWorkerForm,
  type EditWorkerJobCategory,
  type EditWorkerLoginRoleOption,
  initialEditWorkerForm,
} from "@/shared/workers/forms";

// Worker roli va forma toifasi orasidagi moslik.
function mapWorkerRoleToCategory(role: WorkerRole): EditWorkerJobCategory {
  if (role === "MANAGER") return "ADMIN";
  if (role === "CASHIER") return "CASHIER";
  if (role === "TECHNICIAN") return "TECHNICIAN";
  return "CLEANER";
}

function mapJobCategoryToWorkerRole(
  jobCategory: EditWorkerJobCategory,
): WorkerRole {
  if (jobCategory === "ADMIN") return "MANAGER";
  if (jobCategory === "CASHIER") return "CASHIER";
  if (jobCategory === "TECHNICIAN") return "TECHNICIAN";
  return "OTHER";
}

function mapLoginRoleToUserRole(
  loginRole: EditWorkerLoginRoleOption,
): WorkerLoginRole {
  if (loginRole === "ADMIN") return "OWNER_ADMIN";
  if (loginRole === "CASHIER") return "CASHIER";
  return "TECHNICIAN";
}

function mapUserRoleToLoginRole(
  workerRole: WorkerRole,
): EditWorkerLoginRoleOption {
  if (workerRole === "CASHIER") return "CASHIER";
  if (workerRole === "TECHNICIAN") return "TECHNICIAN";
  return "ADMIN";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parsePercentFromNotes(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/Salary type:\s*Percent\s*\(([\d.]+)%\)/i);
  return match?.[1] ?? null;
}

function stripPercentMetaFromNotes(notes?: string | null): string {
  if (!notes) return "";
  return notes
    .split("\n")
    .filter((line) => !/Salary type:\s*Percent\s*\([\d.]+%\)/i.test(line))
    .join("\n")
    .trim();
}

function buildInitial(
  worker: WorkerDetailsView,
  baseToInput: (amountUzs: number) => string,
  formatUzPhoneInput: (raw: string) => string,
): EditWorkerForm {
  const parsedPercent = worker.salaryPercent ?? parsePercentFromNotes(worker.notes);
  const monthlyNumeric = Number(worker.monthlySalary ?? 0);
  const isPercent =
    worker.salaryType === "PERCENT" ||
    (monthlyNumeric <= 0 && parsedPercent !== null);

  return {
    fullName: worker.fullName,
    jobCategory: mapWorkerRoleToCategory(worker.workerRole),
    salaryType: isPercent ? "PERCENT" : "MONTHLY",
    salaryValue: isPercent
      ? String(Number(parsedPercent ?? 0))
      : baseToInput(monthlyNumeric),
    phoneNumber: formatUzPhoneInput(worker.phoneNumber || "+998"),
    address: worker.address ?? "",
    notes: stripPercentMetaFromNotes(worker.notes),
    hasDashboardAccess: worker.hasDashboardAccess,
    loginEmail: worker.loginEmail ?? "",
    loginPassword: "",
    loginRole: mapUserRoleToLoginRole(worker.workerRole),
  };
}

export default function EditWorkerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const { inputToBase, formatInput, baseToInput } = useCurrencyInput();
  const { formatInput: formatUzPhoneInput, normalizeForSave } = useUzPhone();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageWorkers(role);
  const workerId = Number(id);

  const [value, setValue] = React.useState<EditWorkerForm>(initialEditWorkerForm);
  const [worker, setWorker] = React.useState<WorkerDetailsView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!Number.isFinite(workerId) || workerId <= 0) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getWorker(workerId);
        if (!active) return;
        setWorker(detail);
        setValue(buildInitial(detail, baseToInput, formatUzPhoneInput));
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("workers.edit.error.loadFailed"),
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [baseToInput, formatUzPhoneInput, t, workerId]);

  if (!canManage) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  if (!Number.isFinite(workerId) || workerId <= 0) {
    return <Navigate to="/errors/not-found" replace />;
  }

  const isMonthlySalary = value.salaryType === "MONTHLY";
  const salaryValue = isMonthlySalary
    ? inputToBase(value.salaryValue)
    : Number(value.salaryValue || 0);
  const baseValid =
    value.fullName.trim().length > 0 &&
    value.jobCategory.length > 0 &&
    value.salaryType.length > 0 &&
    value.phoneNumber.trim().length > 0 &&
    Number.isFinite(salaryValue) &&
    salaryValue > 0;

  const requiresNewLoginCredentials =
    value.hasDashboardAccess && !worker?.userId;
  const loginValid =
    !value.hasDashboardAccess ||
    (isEmail(value.loginEmail.trim()) &&
      value.loginRole.length > 0 &&
      (requiresNewLoginCredentials
        ? value.loginPassword.length >= 8
        : value.loginPassword.length === 0 || value.loginPassword.length >= 8));

  const canSave =
    canManage && !loading && !saving && !!worker && baseValid && loginValid;

  async function handleSave() {
    if (!worker) return;
    if (!baseValid) {
      setError(
        t("workers.edit.error.requiredFields"),
      );
      return;
    }
    if (value.hasDashboardAccess && !isEmail(value.loginEmail.trim())) {
      setError(
        t("workers.edit.error.invalidEmail"),
      );
      return;
    }
    if (requiresNewLoginCredentials && value.loginPassword.length < 8) {
      setError(
        t("workers.edit.error.passwordMin"),
      );
      return;
    }

    const payload: UpdateWorkerPayload = {
      fullName: value.fullName.trim(),
      phoneNumber: normalizeForSave(value.phoneNumber) || undefined,
      address: value.address.trim() || undefined,
      salaryType: isMonthlySalary ? "MONTHLY" : "PERCENT",
      monthlySalary: isMonthlySalary ? inputToBase(value.salaryValue) : undefined,
      salaryPercent: isMonthlySalary ? undefined : Number(value.salaryValue || 0),
      workerRole: mapJobCategoryToWorkerRole(
        value.jobCategory as EditWorkerJobCategory,
      ),
      hasDashboardAccess: value.hasDashboardAccess,
      notes: value.notes.trim() || undefined,
      login: value.hasDashboardAccess
        ? {
            email: value.loginEmail.trim(),
            password: value.loginPassword.trim() || undefined,
            role: mapLoginRoleToUserRole(
              value.loginRole as EditWorkerLoginRoleOption,
            ),
          }
        : undefined,
    };

    try {
      setSaving(true);
      setError(null);
      await updateWorker(workerId, payload);
      navigate(`/workers/${workerId}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("workers.edit.error.updateFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <EditWorkerHeader
        onBack={() => navigate(`/workers/${workerId}`)}
      />
      <EditWorkerFormCard
        loading={loading}
        workerHasUser={Boolean(worker?.userId)}
        value={value}
        setValue={setValue}
        error={error}
        saving={saving}
        canSave={canSave}
        onCancel={() => navigate(`/workers/${workerId}`)}
        onSubmit={() => void handleSave()}
        formatUzPhoneInput={formatUzPhoneInput}
        formatMoneyInput={formatInput}
      />
    </div>
  );
}
