import * as React from "react";
import {
  formatBaseValueAsInput,
  formatCurrencyInput,
  formatDisplayMoney,
  fromBaseUzs,
  parseCurrencyInputToNumber,
  toBaseUzs,
  type CurrencyCode,
} from "@/utils/currency";

export type { CurrencyCode };

export type PosSettings = {
  shopName: string;
  address: string;
  autoLogoutMinutes: number;
  currency: CurrencyCode;
  usdRate: number;
};

export const SETTINGS_KEY = "pos_settings_v1";

const DEFAULT_SETTINGS: PosSettings = {
  shopName: "Phone Shop POS",
  address: "",
  autoLogoutMinutes: 120,
  currency: "UZS",
  usdRate: 12600,
};

export const SETTINGS_UPDATED_EVENT = "pos-settings-updated";

type ExchangeApiResponse = {
  rates?: {
    UZS?: number;
  };
};

export function readPosSettings(): PosSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PosSettings>;
    const autoLogoutMinutes = Number(parsed.autoLogoutMinutes ?? DEFAULT_SETTINGS.autoLogoutMinutes);
    const usdRate = Number(parsed.usdRate ?? DEFAULT_SETTINGS.usdRate);
    const currency: CurrencyCode = parsed.currency === "USD" ? "USD" : "UZS";
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      autoLogoutMinutes: Number.isFinite(autoLogoutMinutes) && autoLogoutMinutes > 0
        ? autoLogoutMinutes
        : DEFAULT_SETTINGS.autoLogoutMinutes,
      usdRate: Number.isFinite(usdRate) && usdRate > 0 ? usdRate : DEFAULT_SETTINGS.usdRate,
      currency,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function savePosSettings(next: PosSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SETTINGS_UPDATED_EVENT));
}

async function fetchUsdToUzsRate(): Promise<number> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Rate request failed with ${response.status}`);
    }

    const payload = (await response.json()) as ExchangeApiResponse;
    const rate = Number(payload?.rates?.UZS ?? 0);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid rate response");
    }

    return Math.round(rate);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function refreshUsdRateIfNeeded(): Promise<void> {
  const settings = readPosSettings();
  if (settings.currency !== "USD") {
    return;
  }

  try {
    const nextRate = await fetchUsdToUzsRate();
    savePosSettings({
      ...settings,
      usdRate: nextRate,
    });
  } catch {
    // Ignore errors to avoid blocking app startup.
  }
}

export {
  toBaseUzs,
  fromBaseUzs,
  formatDisplayMoney,
  parseCurrencyInputToNumber,
  formatCurrencyInput,
  formatBaseValueAsInput,
};

export function useCurrency() {
  const [settings, setSettings] = React.useState<PosSettings>(() => readPosSettings());

  React.useEffect(() => {
    const refresh = () => setSettings(readPosSettings());
    const onStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SETTINGS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, refresh);
    };
  }, []);

  return {
    currency: settings.currency,
    usdRate: settings.usdRate,
    settings,
  };
}

export function useCurrencyFormatter() {
  const { currency, usdRate } = useCurrency();

  const money = React.useCallback(
    (amountUzs: number) => formatDisplayMoney(amountUzs, { currency, usdRate }),
    [currency, usdRate],
  );

  const parseInputToBase = React.useCallback(
    (raw: string) => {
      const value = parseCurrencyInputToNumber(raw, currency);
      return toBaseUzs(value, currency, usdRate);
    },
    [currency, usdRate],
  );

  const formatInput = React.useCallback(
    (raw: string) => formatCurrencyInput(raw, currency),
    [currency],
  );

  const baseToInput = React.useCallback(
    (amountUzs: number) => formatBaseValueAsInput(amountUzs, currency, usdRate),
    [currency, usdRate],
  );

  return {
    currency,
    usdRate,
    money,
    parseInputToBase,
    formatInput,
    baseToInput,
    toBaseUzs: (amount: number) => toBaseUzs(amount, currency, usdRate),
    fromBaseUzs: (amount: number) => fromBaseUzs(amount, currency, usdRate),
  };
}

export function formatMoneyByCurrentSettings(amountUzs: number): string {
  const settings = readPosSettings();
  return formatDisplayMoney(amountUzs, {
    currency: settings.currency,
    usdRate: settings.usdRate,
  });
}
