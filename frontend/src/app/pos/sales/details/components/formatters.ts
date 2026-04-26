import { formatMoneyByCurrentSettings } from "@/lib/currency/provider";

export function money(n: number) {
  return formatMoneyByCurrentSettings(Math.round(n));
}

export function parseAmount(raw: string): number {
  const sign = raw.trim().startsWith("-") ? -1 : 1;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return sign * Number(digits);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export function formatActivityNote(
  note: string,
  t: (key: string) => string,
): string {
  const monthWord = t("sales.details.month");
  let text = note;

  text = text.replace(
    /First month payment:\s*([-\d.,]+)/gi,
    (_, amount: string) =>
      `${t("sales.details.initialPayment")}: ${money(parseAmount(amount))}`,
  );

  text = text.replace(
    /Payment:\s*([-\d.,]+)/gi,
    (_, amount: string) =>
      `${t("sales.details.payment")}: ${money(parseAmount(amount))}`,
  );

  text = text.replace(
    /Remaining:\s*([-\d.,]+)/gi,
    (_, amount: string) =>
      `${t("sales.details.remaining")}: ${money(parseAmount(amount))}`,
  );

  text = text.replace(
    /Installment:\s*(\d+)\s*x\s*([-\d.,]+)/gi,
    (_, months: string, amount: string) =>
      `${t("sales.details.installment")}: ${months} ${monthWord} x ${money(parseAmount(amount))}`,
  );

  text = text.replace(
    /Installment plan:\s*(\d+)\s*x\s*([-\d.,]+)/gi,
    (_, months: string, amount: string) =>
      `${t("sales.details.installmentPlan")}: ${months} ${monthWord} x ${money(parseAmount(amount))}`,
  );

  return text;
}
