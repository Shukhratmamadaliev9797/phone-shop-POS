import * as React from "react";
import {
  formatBaseValueAsInput,
  formatCurrencyInput,
  parseCurrencyInputToNumber,
  toBaseUzs,
  useCurrencyFormatter,
} from "@/lib/currency/provider";

export function useCurrencyInput() {
  const { currency, usdRate } = useCurrencyFormatter();

  const formatInput = React.useCallback(
    (raw: string) => formatCurrencyInput(raw, currency),
    [currency],
  );

  const parseInputToNumber = React.useCallback(
    (raw: string) => parseCurrencyInputToNumber(raw, currency),
    [currency],
  );

  const inputToBase = React.useCallback(
    (raw: string) => toBaseUzs(parseCurrencyInputToNumber(raw, currency), currency, usdRate),
    [currency, usdRate],
  );

  const baseToInput = React.useCallback(
    (amountUzs: number) => formatBaseValueAsInput(amountUzs, currency, usdRate),
    [currency, usdRate],
  );

  return {
    currency,
    usdRate,
    formatInput,
    parseInputToNumber,
    inputToBase,
    baseToInput,
  };
}

