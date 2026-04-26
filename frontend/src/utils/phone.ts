const UZ_PHONE_PREFIX = "+998";
const UZ_MAX_LOCAL_DIGITS = 9;

export function extractUzLocalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  return digits.slice(0, UZ_MAX_LOCAL_DIGITS);
}

export function formatUzPhoneInput(raw: string): string {
  const local = extractUzLocalDigits(raw);
  if (!local) return UZ_PHONE_PREFIX;

  const part1 = local.slice(0, 2);
  const part2 = local.slice(2, 5);
  const part3 = local.slice(5, 7);
  const part4 = local.slice(7, 9);

  return [UZ_PHONE_PREFIX, part1, part2, part3, part4].filter(Boolean).join(" ");
}

export function normalizeUzPhoneForSave(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits === "998") return "";
  if (digits.startsWith("998")) return `+${digits}`;
  return "";
}

export function getUzPhonePrefix(): string {
  return UZ_PHONE_PREFIX;
}

