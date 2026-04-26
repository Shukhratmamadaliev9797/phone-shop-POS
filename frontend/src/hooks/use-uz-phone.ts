import * as React from "react";
import {
  formatUzPhoneInput,
  getUzPhonePrefix,
  normalizeUzPhoneForSave,
} from "@/utils/phone";

export function useUzPhone() {
  const formatInput = React.useCallback((raw: string): string => formatUzPhoneInput(raw), []);
  const normalizeForSave = React.useCallback((raw: string): string => normalizeUzPhoneForSave(raw), []);

  return {
    prefix: getUzPhonePrefix(),
    formatInput,
    normalizeForSave,
  };
}
