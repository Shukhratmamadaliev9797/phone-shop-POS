import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n/provider";
import { canManageWorkers } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import {
  addSalaryPayment,
  getWorker,
  listSalaryPayments,
  type SalaryPaymentView,
  type WorkerDetailsView,
} from "@/lib/api/workers";
import { PaySalaryModal } from "../modals/pay-salary-modal";
import type { WorkerRow } from "../components/workers-table";
import { WorkerPageHeader } from "./components/worker-page-header";
import { WorkerPageContent } from "./components/worker-page-content";

function normalizeMonth(input: string): string {
  const trimmed = input.trim();
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(trimmed)) {
    return trimmed;
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function resolveSalaryCycleMonth(createdAt?: string | null): string {
  const now = new Date();
  if (!createdAt) {
    return toMonthKey(now);
  }

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return toMonthKey(now);
  }

  const cycleDay = created.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const anchorDayCurrent = Math.min(cycleDay, daysInCurrentMonth);
  const anchorCurrent = new Date(year, month, anchorDayCurrent, 0, 0, 0, 0);

  if (now >= anchorCurrent) {
    return toMonthKey(anchorCurrent);
  }

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const anchorDayPrev = Math.min(cycleDay, daysInPrevMonth);
  const anchorPrev = new Date(prevYear, prevMonth, anchorDayPrev, 0, 0, 0, 0);
  return toMonthKey(anchorPrev);
}

function roleLabel(role: WorkerDetailsView["workerRole"], t: (key: string) => string) {
  if (role === "MANAGER") return t("workers.role.admin");
  if (role === "CASHIER") return t("workers.role.cashier");
  if (role === "TECHNICIAN") return t("workers.role.technician");
  return t("workers.role.other");
}

export default function WorkerDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageWorkers(role);

  const workerId = Number(id);

  const [details, setDetails] = React.useState<WorkerDetailsView | null>(null);
  const [payments, setPayments] = React.useState<SalaryPaymentView[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [payOpen, setPayOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!Number.isFinite(workerId) || workerId <= 0) return;
    try {
      setLoading(true);
      setError(null);
      const [worker, salaryHistory] = await Promise.all([
        getWorker(workerId),
        listSalaryPayments(workerId, { page: 1, limit: 100 }),
      ]);
      setDetails(worker);
      setPayments(salaryHistory.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("workers.edit.error.loadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [t, workerId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!canManage) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  if (!Number.isFinite(workerId) || workerId <= 0) {
    return <Navigate to="/errors/not-found" replace />;
  }

  const salaryCycleMonth = resolveSalaryCycleMonth(details?.createdAt ?? null);

  const monthPaid = payments
    .filter((payment) => payment.month === salaryCycleMonth)
    .reduce((sum, payment) => sum + Number(payment.amountPaid ?? 0), 0);
  const monthlySalary = Number(details?.monthlySalary ?? 0);
  const monthRemaining = Math.max(0, monthlySalary - monthPaid);
  const percentRemaining = Number(details?.percentSalaryAccrued ?? 0);
  const percentCalculated = Math.max(
    0,
    Math.round(
      (Number(details?.totalProfitAmount ?? 0) *
        Number(details?.salaryPercent ?? 0)) /
        100,
    ),
  );
  const percentPaid = Math.max(0, percentCalculated - percentRemaining);
  const paidValue =
    details?.salaryType === "PERCENT" ? percentPaid : monthPaid;
  const remainingValue =
    details?.salaryType === "PERCENT" ? percentRemaining : monthRemaining;
  const shouldShowPayButton =
    details?.salaryType === "PERCENT" ? percentRemaining > 0 : monthRemaining > 0;
  const payMonth =
    details?.salaryType === "PERCENT"
      ? normalizeMonth("")
      : normalizeMonth(salaryCycleMonth);
  const status: WorkerRow["status"] =
    details?.salaryType === "PERCENT"
      ? percentRemaining > 0
        ? "UNPAID"
        : "PAID"
      : monthPaid <= 0
        ? "UNPAID"
        : monthPaid >= monthlySalary
          ? "PAID"
          : "PARTIAL";

  const workerRow: WorkerRow | null = details
    ? {
        id: details.id,
        fullName: details.fullName,
        phoneNumber: details.phoneNumber ?? "—",
        role:
          details.workerRole === "MANAGER"
            ? "ADMIN"
            : details.workerRole === "CASHIER"
              ? "CASHIER"
              : details.workerRole === "TECHNICIAN"
                ? "TECHNICIAN"
                : "OTHER",
        salaryType: details.salaryType === "PERCENT" ? "PERCENT" : "MONTHLY",
        salaryPercent:
          details.salaryType === "PERCENT"
            ? Number(details.salaryPercent ?? 0)
            : null,
        soldPhonesCount: Number(details.soldPhonesCount ?? 0),
        totalProfitAmount: Number(details.totalProfitAmount ?? 0),
        monthlySalary,
        monthPaid: details.salaryType === "PERCENT" ? 0 : monthPaid,
        monthRemaining:
          details.salaryType === "PERCENT"
            ? Math.max(0, percentRemaining)
            : monthRemaining,
        status,
        hasDashboardAccess: details.hasDashboardAccess,
        userId: details.userId,
        lastPaymentDate: payments[0]
          ? new Date(payments[0].paidAt).toLocaleDateString()
          : "—",
      }
    : null;

  async function handlePaySalary(payload: {
    month: string;
    amountPaid: number;
    paidAt?: string;
    notes?: string;
  }) {
    await addSalaryPayment(workerId, payload);
    await load();
  }

  return (
    <div className="space-y-6">
      <WorkerPageHeader
        workerName={details?.fullName}
        salaryCycleMonth={salaryCycleMonth}
        onBack={() => navigate("/workers")}
      />

      {loading ? (
        <div className="rounded-3xl border p-4 text-sm text-muted-foreground">
          {t("workers.details.loading")}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && details ? (
        <WorkerPageContent
          details={details}
          payments={payments}
          shouldShowPayButton={shouldShowPayButton}
          paidValue={paidValue}
          remainingValue={remainingValue}
          monthlySalary={monthlySalary}
          onEdit={() => navigate(`/workers/${workerId}/edit`)}
          onOpenPay={() => setPayOpen(true)}
          roleLabel={roleLabel(details.workerRole, t)}
        />
      ) : null}

      <PaySalaryModal
        open={payOpen}
        onOpenChange={setPayOpen}
        worker={workerRow}
        month={payMonth}
        canManage={canManage}
        onSubmit={async (_, payload) => {
          await handlePaySalary(payload);
        }}
      />
    </div>
  );
}
