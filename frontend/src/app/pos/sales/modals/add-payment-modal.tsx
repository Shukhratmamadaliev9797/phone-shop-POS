import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SaleDetail } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";
import {
  formatCurrencyInput,
  parseCurrencyInputToNumber,
  toBaseUzs,
  useCurrencyFormatter,
} from "@/lib/currency/provider";

export function AddPaymentModal({
  open,
  onOpenChange,
  sale,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  sale: SaleDetail | null;
  onSubmit: (saleId: number, amount: number, notes?: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const { currency, usdRate, money } = useCurrencyFormatter();
  const remaining = Number(sale?.remaining ?? 0);
  const monthlyInstallment = Number(sale?.monthlyInstallmentAmount ?? 0);
  const [amount, setAmount] = React.useState("");
  const [paymentMode, setPaymentMode] = React.useState<"NEXT_MONTH" | "FULL_PAYMENT">("NEXT_MONTH");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const paidMonthsCount = React.useMemo(() => {
    if (!sale?.activities?.length) return 0;
    return sale.activities.reduce((acc, activity) => {
      const paid = Number(activity.amount ?? 0);
      return paid > 0 ? acc + 1 : acc;
    }, 0);
  }, [sale?.activities]);
  const nextMonthNumber = paidMonthsCount + 1;

  const suggestedAmount = React.useMemo(() => {
    if (paymentMode === "FULL_PAYMENT") return remaining;
    if (monthlyInstallment > 0) return Math.min(monthlyInstallment, remaining);
    return remaining;
  }, [monthlyInstallment, paymentMode, remaining]);

  React.useEffect(() => {
    if (!open) return;
    setPaymentMode("NEXT_MONTH");
    setAmount("");
    setError(null);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const display =
      currency === "USD"
        ? formatCurrencyInput((Math.max(0, suggestedAmount) / usdRate).toFixed(2), "USD")
        : formatCurrencyInput(String(Math.max(0, Math.round(suggestedAmount))), "UZS");
    setAmount(display);
  }, [currency, open, suggestedAmount, usdRate]);

  const numericAmount = toBaseUzs(
    parseCurrencyInputToNumber(amount, currency),
    currency,
    usdRate,
  );
  const nextRemaining = remaining - numericAmount;

  async function handleSubmit(): Promise<void> {
    if (!sale) return;

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(
        t("sales.details.error.paymentGreaterThanZero"),
      );
      return;
    }

    if (numericAmount > remaining) {
      setError(
        t("sales.details.error.paymentGreaterThanRemaining"),
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const notes =
        paymentMode === "FULL_PAYMENT"
          ? t("sales.details.fullPaymentAction")
          : `${t("sales.details.payForMonth")} ${nextMonthNumber}`;
      await onSubmit(sale.id, numericAmount, notes);
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("sales.details.error.addPaymentFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  if (!sale) return null;
  const firstItem = sale.items?.[0]?.item;
  const phoneTitle = firstItem
    ? `${firstItem.brand} ${firstItem.model}`
    : `${t("sales.details.title")} #${sale.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {`${t("sales.details.addPaymentFor")} ${phoneTitle}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Select
              value={paymentMode}
              onValueChange={(value) =>
                setPaymentMode(value as "NEXT_MONTH" | "FULL_PAYMENT")
              }
            >
              <SelectTrigger className="h-10 rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEXT_MONTH">
                  {t("sales.details.payForMonthWithNumber").replace(
                    "{month}",
                    String(nextMonthNumber),
                  )}
                </SelectItem>
                <SelectItem value="FULL_PAYMENT">
                  {t("sales.details.fullPaymentAction")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Input
              type="text"
              inputMode={currency === "USD" ? "decimal" : "numeric"}
              value={amount}
              onChange={(event) =>
                setAmount(formatCurrencyInput(event.target.value, currency))
              }
              className="h-10 rounded-2xl"
              placeholder={`${t("sales.details.paymentAmount")} (${currency})`}
            />
          </div>

          <div className="rounded-2xl border bg-muted/10 p-3 text-sm">
            {t("sales.details.remaining")}:{" "}
            <span
              className={`font-semibold ${nextRemaining < 0 ? "text-rose-600 dark:text-rose-400" : ""}`}
            >
              {money(nextRemaining)}
            </span>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <Button className="rounded-2xl" onClick={() => void handleSubmit()} disabled={saving}>
              {saving
                ? t("common.saving")
                : t("sales.details.savePayment")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
