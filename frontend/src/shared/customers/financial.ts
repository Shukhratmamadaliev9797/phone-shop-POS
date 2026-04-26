// Qarz/kredit sahifalarida kelgan pul qiymatini ishonchli raqamga o'tkazadi.
export function parseMoneyLikeValue(
  value: string | number | null | undefined,
): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const normalized = String(value)
    .replace(/\s/g, "")
    .replace(/so['`]?m/gi, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,/g, ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Bo'lib to'lash tipidagi to'lovlarni yagona joyda tekshiradi.
export function isMonthlyInstallmentPaymentType(type?: string | null): boolean {
  if (!type) return false;
  const normalized = String(type).toUpperCase();
  return normalized === "PAY_LATER" || normalized === "MONTHLY_INSTALLMENT";
}
