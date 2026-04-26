import * as React from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import { WorkersTable, type WorkerRow } from './components/workers-table'
import { WorkersPageHeader } from './components/workers-header'
import { WorkersFilters, type WorkersFiltersValue } from './components/workers-filters'
import { PaySalaryModal } from './modals/pay-salary-modal'
import { useAppSelector } from '@/store/hooks'
import {
  addSalaryPayment,
  ApiRequestError,
  deleteWorker,
  listSalaryPayments,
  listWorkers,
  type WorkerView,
} from '@/lib/api/workers'
import { canManageWorkers } from '@/lib/auth/permissions'
import { useI18n } from '@/lib/i18n/provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const PAGE_LIMIT = 10

function toUiRole(role: WorkerView['workerRole']): WorkerRow['role'] {
  if (role === 'CASHIER') return 'CASHIER'
  if (role === 'TECHNICIAN') return 'TECHNICIAN'
  if (role === 'OTHER') return 'OTHER'
  return 'ADMIN'
}

function normalizeMonth(input: string): string {
  const trimmed = input.trim()
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(trimmed)) {
    return trimmed
  }

  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function rowStatus(monthlySalary: number, paid: number): WorkerRow['status'] {
  if (paid <= 0) return 'UNPAID'
  if (paid >= monthlySalary) return 'PAID'
  return 'PARTIAL'
}

export default function WorkersPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const role = useAppSelector((state) => state.auth.user?.role)
  const canManage = canManageWorkers(role)

  const [filters, setFilters] = React.useState<WorkersFiltersValue>({
    q: '',
    month: normalizeMonth(''),
    role: 'ALL',
    status: 'ALL',
  })

  const [rows, setRows] = React.useState<WorkerRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)

  const [payOpen, setPayOpen] = React.useState(false)

  const [selectedRow, setSelectedRow] = React.useState<WorkerRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<WorkerRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const [toast, setToast] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [toastVisible, setToastVisible] = React.useState(false)

  React.useEffect(() => {
    if (!toast) return

    setToastVisible(false)
    const enterTimer = window.setTimeout(() => setToastVisible(true), 20)
    const leaveTimer = window.setTimeout(() => setToastVisible(false), 2400)
    const removeTimer = window.setTimeout(() => setToast(null), 2750)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [toast])

  const pushToast = React.useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
  }, [])

  const loadWorkers = React.useCallback(async () => {
    if (!canManage) {
      setRows([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const roleFilter =
        filters.role === 'ALL'
          ? undefined
          : filters.role === 'ADMIN'
            ? 'MANAGER'
            : filters.role === 'CLEANER' || filters.role === 'ACCOUNTANT'
              ? 'OTHER'
              : filters.role

      const listResponse = await listWorkers({
        page,
        limit: PAGE_LIMIT,
        search: filters.q.trim() || undefined,
        workerRole: roleFilter,
      })

      const month = normalizeMonth(filters.month)

      const enriched = await Promise.all(
        listResponse.data.map(async (worker) => {
          const salaryResponse = await listSalaryPayments(worker.id, {
            page: 1,
            limit: 100,
            fromMonth: month,
            toMonth: month,
          })

          const monthPaid = salaryResponse.data.reduce(
            (sum, payment) => sum + Number(payment.amountPaid ?? 0),
            0,
          )
          const monthlySalary = Number(worker.monthlySalary ?? 0)
          const percentRemaining = Number(worker.percentSalaryAccrued ?? 0)
          const isPercent = worker.salaryType === 'PERCENT'
          const monthRemaining = isPercent
            ? Math.max(0, percentRemaining)
            : Math.max(0, monthlySalary - monthPaid)
          const lastPayment = salaryResponse.data[0]

          return {
            id: worker.id,
            fullName: worker.fullName,
            phoneNumber: worker.phoneNumber ?? '—',
            role: toUiRole(worker.workerRole),
            salaryType: worker.salaryType === 'PERCENT' ? 'PERCENT' : 'MONTHLY',
            salaryPercent:
              worker.salaryType === 'PERCENT'
                ? Number(worker.salaryPercent ?? 0)
                : null,
            soldPhonesCount: Number(worker.soldPhonesCount ?? 0),
            totalProfitAmount: Number(worker.totalProfitAmount ?? 0),
            monthlySalary,
            monthPaid: isPercent ? 0 : monthPaid,
            monthRemaining,
            status: isPercent
              ? monthRemaining > 0
                ? 'UNPAID'
                : 'PAID'
              : rowStatus(monthlySalary, monthPaid),
            hasDashboardAccess: worker.hasDashboardAccess,
            userId: worker.userId,
            lastPaymentDate: lastPayment
              ? new Date(lastPayment.paidAt).toLocaleDateString()
              : '—',
          } as WorkerRow
        }),
      )

      setRows(enriched)
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError(t("workers.page.error.sessionExpired"))
      } else if (
        requestError instanceof ApiRequestError &&
        requestError.status === 403
      ) {
        setError(t("workers.page.error.forbidden"))
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("workers.page.error.loadFailed"),
        )
      }
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [canManage, filters.month, filters.q, filters.role, page, t])

  React.useEffect(() => {
    void loadWorkers()
  }, [loadWorkers])

  const filtered = React.useMemo(() => {
    return rows.filter((row) => {
      const statusOk = filters.status === 'ALL' || row.status === filters.status
      return statusOk
    })
  }, [rows, filters.status])

  if (!canManage) {
    return <Navigate to="/errors/forbidden" replace />
  }

  async function handlePaySalary(workerId: number, payload: { month: string; amountPaid: number; paidAt?: string; notes?: string }) {
    await addSalaryPayment(workerId, payload)
    pushToast(
      'success',
      t("workers.page.toast.salaryAdded"),
    )

    await loadWorkers()

  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    try {
      setDeleting(true)
      await deleteWorker(deleteTarget.id)
      pushToast('success', t("workers.page.toast.deleted"))
      setDeleteTarget(null)

      if (selectedRow?.id === deleteTarget.id) {
        setSelectedRow(null)
        setPayOpen(false)
      }

      await loadWorkers()
    } catch (requestError) {
      pushToast(
        'error',
        requestError instanceof Error
          ? requestError.message
          : t("workers.page.toast.deleteFailed"),
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <WorkersPageHeader
        canManage={canManage}
        onNewWorker={() => navigate('/workers/new')}
      />

      <WorkersFilters
        value={filters}
        onChange={(next) => {
          setPage(1)
          setFilters(next)
        }}
      />

      <WorkersTable
        rows={filtered}
        loading={loading}
        error={error}
        canManage={canManage}
        onRowClick={(row) => {
          navigate(`/workers/${row.id}`)
        }}
        onPay={(row) => {
          setSelectedRow(row)
          setPayOpen(true)
        }}
        onView={(row) => {
          navigate(`/workers/${row.id}`)
        }}
        onDelete={(row) => {
          setDeleteTarget(row)
        }}
      />

      <PaySalaryModal
        open={payOpen}
        onOpenChange={setPayOpen}
        worker={selectedRow}
        month={normalizeMonth(filters.month)}
        canManage={canManage}
        onSubmit={handlePaySalary}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next && !deleting) {
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("workers.delete.title")}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? t("workers.delete.descriptionNamed").replace("{name}", deleteTarget.fullName)
                : t("workers.delete.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {t("workers.delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting
                ? t("workers.delete.deleting")
                : t("workers.delete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast
        ? createPortal(
            <div
              className={`fixed bottom-5 right-5 z-[9999] transition-all duration-300 ease-out ${
                toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
              }`}
            >
              <div className="rounded-xl border border-emerald-500 bg-white px-4 py-3 text-sm text-emerald-700 shadow-lg dark:bg-background">
                {toast.message}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
