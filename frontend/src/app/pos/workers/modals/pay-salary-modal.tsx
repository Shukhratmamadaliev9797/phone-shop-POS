import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AddSalaryPaymentPayload } from '@/lib/api/workers'
import type { WorkerRow } from '../components/workers-table'
import { useI18n } from '@/lib/i18n/provider'
import {
  formatCurrencyInput,
  parseCurrencyInputToNumber,
  toBaseUzs,
  useCurrencyFormatter,
} from '@/lib/currency/provider'


export function PaySalaryModal({
  open,
  onOpenChange,
  worker,
  month,
  canManage,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  worker: WorkerRow | null
  month: string
  canManage: boolean
  onSubmit: (workerId: number, payload: AddSalaryPaymentPayload) => Promise<void>
}) {
  const { t } = useI18n()
  const { currency, usdRate, money } = useCurrencyFormatter()
  const [amount, setAmount] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const soldPhonesCount = Number(worker?.soldPhonesCount ?? 0)
  const totalProfitAmount = Number(worker?.totalProfitAmount ?? 0)
  const salaryPercent = Number(worker?.salaryPercent ?? 0)
  const calculatedPercentSalary =
    worker?.salaryType === 'PERCENT'
      ? Math.max(0, Math.round((totalProfitAmount * salaryPercent) / 100))
      : 0
  const remainingPercentSalary =
    worker?.salaryType === 'PERCENT'
      ? Math.max(0, Math.round(Number(worker.monthRemaining ?? 0)))
      : 0
  const paidPercentSalary = Math.max(0, calculatedPercentSalary - remainingPercentSalary)

  React.useEffect(() => {
    if (open) {
      if (worker?.salaryType === 'PERCENT') {
        const display =
          currency === 'USD'
            ? formatCurrencyInput((remainingPercentSalary / usdRate).toFixed(2), 'USD')
            : formatCurrencyInput(String(remainingPercentSalary), 'UZS')
        setAmount(display)
      } else {
        setAmount('')
      }
      setError(null)
      setSaving(false)
    }
  }, [currency, open, remainingPercentSalary, usdRate, worker?.salaryType])

  async function handleSave() {
    if (!canManage) {
      setError(t("workers.payModal.error.notAllowed"))
      return
    }

    if (!worker) {
      setError(t("workers.payModal.error.noWorker"))
      return
    }

    const amountPaid = toBaseUzs(
      parseCurrencyInputToNumber(amount, currency),
      currency,
      usdRate,
    )
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      setError(t("workers.payModal.error.amountRequired"))
      return
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      setError(t("workers.payModal.error.monthFormat"))
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSubmit(worker.id, {
        month,
        amountPaid,
      })
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("workers.payModal.error.saveFailed"),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[min(94vw,32rem)] p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {t("workers.payModal.title")}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {worker ? (
              <div className="rounded-3xl border p-4 text-sm">
                <div className="font-medium">{worker.fullName}</div>
                <div className="text-muted-foreground">{worker.role}</div>
                {worker.salaryType === 'PERCENT' ? (
                  <div className="mt-2 text-muted-foreground">
                    {t("workers.payModal.salaryFromPercent")}
                    : {money(remainingPercentSalary)}
                  </div>
                ) : (
                  <div className="mt-2 text-muted-foreground">
                    {t("workers.payModal.salary")}: {money(worker.monthlySalary)} •{" "}
                    {t("workers.payModal.remaining")}: {money(worker.monthRemaining)}
                  </div>
                )}
                {worker.salaryType === 'PERCENT' ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.soldPhones")}
                      </div>
                      <div className="font-medium">{soldPhonesCount}</div>
                    </div>
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.totalProfit")}
                      </div>
                      <div className="font-medium">{money(totalProfitAmount)}</div>
                    </div>
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.percent")}
                      </div>
                      <div className="font-medium">{Math.max(0, Math.round(salaryPercent))}%</div>
                    </div>
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.salaryFromPercent")}
                      </div>
                      <div className="font-medium">{money(calculatedPercentSalary)}</div>
                    </div>
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.paid")}
                      </div>
                      <div className="font-medium">{money(paidPercentSalary)}</div>
                    </div>
                    <div className="rounded-2xl border px-3 py-2">
                      <div className="text-xs text-muted-foreground">
                        {t("workers.payModal.remaining")}
                      </div>
                      <div className="font-medium">{money(remainingPercentSalary)}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Input
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currency))}
                placeholder={t("workers.payModal.amountPlaceholder")}
                className="h-10 rounded-2xl"
                inputMode={currency === 'USD' ? 'decimal' : 'numeric'}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="rounded-2xl" onClick={handleSave} disabled={saving || !canManage}>
                {saving
                  ? t("common.saving")
                  : t("workers.payModal.save")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
