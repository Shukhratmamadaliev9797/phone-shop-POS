export type CurrencyCode = "UZS" | "USD";

export function toBaseUzs(amount: number, currency: CurrencyCode, usdRate: number): number {
  if (!Number.isFinite(amount)) return 0;
  if (currency === "USD") return Math.round(amount * usdRate);
  return Math.round(amount);
}

export function fromBaseUzs(amountUzs: number, currency: CurrencyCode, usdRate: number): number {
  if (!Number.isFinite(amountUzs)) return 0;
  if (currency === "USD") {
    if (!Number.isFinite(usdRate) || usdRate <= 0) return 0;
    return amountUzs / usdRate;
  }
  return amountUzs;
}

export function formatDisplayMoney(
  amountUzs: number,
  options: { currency: CurrencyCode; usdRate: number; locale?: string; compact?: boolean },
): string {
  const { currency, usdRate, locale = "en-US", compact = false } = options;
  const displayValue = fromBaseUzs(amountUzs, currency, usdRate);

  if (currency === "USD") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(displayValue);
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(displayValue))} so'm`;
}

export function parseCurrencyInputToNumber(raw: string, currency: CurrencyCode): number {
  if (!raw) return 0;

  if (currency === "USD") {
    const cleaned = raw.replace(/\s/g, "").replace(/[^0-9.,]/g, "");
    if (!cleaned) return 0;

    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    const lastSeparatorIndex = Math.max(lastDot, lastComma);
    const endsWithSeparator = /[.,]$/.test(cleaned);

    let intDigits = cleaned.replace(/[^\d]/g, "");
    let decimalDigits = "";

    if (lastSeparatorIndex >= 0) {
      const afterSeparator = cleaned
        .slice(lastSeparatorIndex + 1)
        .replace(/[^\d]/g, "");
      const treatAsDecimal =
        endsWithSeparator || (afterSeparator.length > 0 && afterSeparator.length <= 2);

      if (treatAsDecimal) {
        intDigits = cleaned.slice(0, lastSeparatorIndex).replace(/[^\d]/g, "");
        decimalDigits = afterSeparator.slice(0, 2);
      }
    }

    const normalizedInt = intDigits.replace(/^0+(?=\d)/, "") || "0";
    const numeric = Number(
      decimalDigits.length > 0 ? `${normalizedInt}.${decimalDigits}` : normalizedInt,
    );
    return Number.isFinite(numeric) ? numeric : 0;
  }

  const digits = raw.replace(/\D/g, "");
  return Number(digits || 0);
}

export function formatCurrencyInput(raw: string, currency: CurrencyCode): string {
  if (!raw) return "";

  if (currency === "USD") {
    const cleaned = raw.replace(/\s/g, "").replace(/[^0-9.,]/g, "");
    if (!cleaned) return "";

    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    const lastSeparatorIndex = Math.max(lastDot, lastComma);
    const endsWithSeparator = /[.,]$/.test(cleaned);

    let intDigits = cleaned.replace(/[^\d]/g, "");
    let decimalDigits = "";
    let includeDecimalSeparator = false;

    if (lastSeparatorIndex >= 0) {
      const afterSeparator = cleaned
        .slice(lastSeparatorIndex + 1)
        .replace(/[^\d]/g, "");
      const treatAsDecimal =
        endsWithSeparator || (afterSeparator.length > 0 && afterSeparator.length <= 2);

      if (treatAsDecimal) {
        intDigits = cleaned.slice(0, lastSeparatorIndex).replace(/[^\d]/g, "");
        decimalDigits = afterSeparator.slice(0, 2);
        includeDecimalSeparator = true;
      }
    }

    const normalizedInt = intDigits.replace(/^0+(?=\d)/, "") || "0";
    const grouped = normalizedInt.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!includeDecimalSeparator) return grouped;
    if (decimalDigits.length === 0) return `${grouped}.`;
    return `${grouped}.${decimalDigits}`;
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatBaseValueAsInput(amountUzs: number, currency: CurrencyCode, usdRate: number): string {
  const value = fromBaseUzs(amountUzs, currency, usdRate);
  if (!Number.isFinite(value) || value <= 0) return "";
  if (currency === "USD") {
    const rounded = Math.round(value * 100) / 100;
    return formatCurrencyInput(String(rounded), currency);
  }
  return formatCurrencyInput(String(Math.round(value)), currency);
}

