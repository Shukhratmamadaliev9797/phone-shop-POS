import { useEffect, type ReactNode } from "react";
import { I18nProvider } from "@/context/i18n-context";
import { refreshUsdRateIfNeeded } from "@/context/currency-context";

export function AppContextProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void refreshUsdRateIfNeeded();
  }, []);

  return <I18nProvider>{children}</I18nProvider>;
}
