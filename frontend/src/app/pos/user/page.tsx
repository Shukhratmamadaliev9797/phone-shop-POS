import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";
import { getWorker, listWorkers, type WorkerDetailsView } from "@/lib/api/workers";
import { UserPageHeader } from "./components/user-page-header";
import { UserSummarySection } from "./components/user-summary-section";
import { UserDetailsGrid } from "./components/user-details-grid";

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

export default function UserProfilePage() {
  const { t } = useI18n();
  const authUser = useAppSelector((state) => state.auth.user);
  const [workerDetails, setWorkerDetails] = React.useState<WorkerDetailsView | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadWorkerSalary() {
      const currentUserId = Number(authUser?.id);
      if (!Number.isFinite(currentUserId) || currentUserId <= 0) {
        setWorkerDetails(null);
        return;
      }

      try {
        const workers = await listWorkers({ page: 1, limit: 200, hasDashboardAccess: true });
        const linked = workers.data.find((worker) => Number(worker.userId) === currentUserId);
        if (!linked) {
          if (!cancelled) setWorkerDetails(null);
          return;
        }
        const details = await getWorker(linked.id);
        if (!cancelled) setWorkerDetails(details);
      } catch {
        if (!cancelled) setWorkerDetails(null);
      }
    }

    void loadWorkerSalary();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const user = {
    name: authUser?.name ?? t("user.unknownUser"),
    email: authUser?.email ?? t("user.notProvided"),
    phone: authUser?.phone ?? t("user.notProvided"),
    role: authUser?.role ?? t("user.unknownRole"),
  };

  const isAdmin = user.role === "ADMIN" || user.role === "OWNER_ADMIN";
  const roleLabel = (() => {
    if (user.role === "OWNER_ADMIN" || user.role === "ADMIN") return t("signin.admin");
    if (user.role === "CASHIER") return t("signin.cashier");
    if (user.role === "TECHNICIAN") return t("signin.technician");
    return user.role;
  })();

  const salaryCycleMonth = resolveSalaryCycleMonth(workerDetails?.createdAt ?? null);
  const monthlySalary = Number(workerDetails?.monthlySalary ?? 0);
  const monthPaid = (workerDetails?.payments ?? [])
    .filter((payment) => payment.month === salaryCycleMonth)
    .reduce((sum, payment) => sum + Number(payment.amountPaid ?? 0), 0);
  const monthRemaining = Math.max(0, monthlySalary - monthPaid);

  return (
    <div className="space-y-6">
      <UserPageHeader />

      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardContent className="p-6 space-y-6">
          <UserSummarySection
            name={user.name}
            email={user.email}
            roleLabel={roleLabel}
            isAdmin={isAdmin}
          />

          <Separator />

          <UserDetailsGrid
            name={user.name}
            roleLabel={roleLabel}
            email={user.email}
            phone={user.phone}
            workerSalaryType={workerDetails?.salaryType}
            monthlySalary={monthlySalary}
            monthPaid={monthPaid}
            monthRemaining={monthRemaining}
          />
        </CardContent>
      </Card>
    </div>
  );
}
