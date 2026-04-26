import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PurchaseDetail } from "@/lib/api/purchases";
import { useI18n } from "@/lib/i18n/provider";
import {
  formatCurrencyInput,
  parseCurrencyInputToNumber,
  toBaseUzs,
  useCurrencyFormatter,
} from "@/lib/currency/provider";

export function AddPurchasePaymentModal({
  open,
  onOpenChange,
  purchase,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  purchase: PurchaseDetail | null;
  onSubmit: (purchaseId: number, amount: number) => Promise<void>;
  title?: string;
}) {
  const { language } = useI18n();
  const { currency, usdRate, money } = useCurrencyFormatter();
  const remaining = Number(purchase?.remaining ?? 0);
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setAmount("");
    setError(null);
  }, [open]);

  const numericAmount = toBaseUzs(
    parseCurrencyInputToNumber(amount, currency),
    currency,
    usdRate,
  );
  const nextRemaining = remaining - numericAmount;

  async function handleSubmit(): Promise<void> {
    if (!purchase) return;

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(
        language === "uz"
          ? "To'lov summasi 0 dan katta bo'lishi kerak."
          : "Payment amount must be greater than 0.",
      );
      return;
    }

    if (numericAmount > remaining) {
      setError(
        language === "uz"
          ? "To'lov summasi remaining'dan katta bo'lishi mumkin emas."
          : "Payment amount cannot be greater than remaining.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(purchase.id, numericAmount);
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : language === "uz"
            ? "To'lov qo'shib bo'lmadi."
            : "Failed to add payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {title ||
              (language === "uz"
                ? `Xarid #${purchase.id} uchun to'lov qo'shish`
                : `Add payment for Purchase #${purchase.id}`)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Input
              type="text"
              inputMode={currency === "USD" ? "decimal" : "numeric"}
              value={amount}
              onChange={(event) =>
                setAmount(formatCurrencyInput(event.target.value, currency))
              }
              className="h-10 rounded-2xl"
              placeholder={
                language === "uz"
                  ? `To'lov miqdori (${currency})`
                  : `Payment amount (${currency})`
              }
            />
          </div>

          <div className="rounded-2xl border bg-muted/10 p-3 text-sm">
            {language === "uz" ? "Qolgan summa" : "Remaining"}:{" "}
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
              {language === "uz" ? "Bekor qilish" : "Cancel"}
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => void handleSubmit()}
              disabled={saving}
            >
              {saving
                ? language === "uz"
                  ? "Saqlanmoqda..."
                  : "Saving..."
                : language === "uz"
                  ? "To'lovni saqlash"
                  : "Save payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
