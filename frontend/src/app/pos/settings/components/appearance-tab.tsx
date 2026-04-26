import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import type { ThemeMode } from "@/lib/theme";
import type { PosSettings } from "@/lib/currency/provider";
import { useI18n } from "@/lib/i18n/provider";

const THEME_OPTIONS: Array<{ value: ThemeMode; labelKey: string }> = [
  { value: "light", labelKey: "settings.appearance.themeLight" },
  { value: "dark", labelKey: "settings.appearance.themeDark" },
  { value: "system", labelKey: "settings.appearance.themeSystem" },
];

function ThemePreviewCard({
  mode,
  selected,
  onClick,
  label,
}: {
  mode: ThemeMode;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border bg-card text-left transition sm:w-[220px] ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-200"
          : "border-muted/60 hover:border-indigo-200"
      }`}
    >
      <div className="p-3">
        <div
          className={`h-[128px] rounded-xl border p-2 ${
            mode === "dark"
              ? "border-slate-700 bg-slate-900"
              : "border-muted/60 bg-slate-50"
          }`}
        >
          <div className="mb-2 flex gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mode === "dark" ? "bg-slate-500" : "bg-rose-300"
              }`}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mode === "dark" ? "bg-slate-500" : "bg-amber-300"
              }`}
            />
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mode === "dark" ? "bg-slate-500" : "bg-emerald-300"
              }`}
            />
          </div>

          {mode === "system" ? (
            <div className="grid h-[100px] grid-cols-2 overflow-hidden rounded-lg border border-muted/50">
              <div className="bg-slate-50 p-1.5">
                <div className="h-full rounded border border-slate-200 bg-white/90" />
              </div>
              <div className="bg-slate-900 p-1.5">
                <div className="h-full rounded border border-slate-700 bg-slate-800/90" />
              </div>
            </div>
          ) : (
            <div className="grid h-[100px] grid-cols-[34%_1fr] gap-2">
              <div
                className={`rounded-md ${
                  mode === "dark" ? "bg-slate-800" : "bg-white"
                }`}
              />
              <div
                className={`space-y-1.5 rounded-md p-2 ${
                  mode === "dark" ? "bg-slate-800" : "bg-white"
                }`}
              >
                <div
                  className={`h-2 w-2/3 rounded ${
                    mode === "dark" ? "bg-slate-600" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`h-2 w-5/6 rounded ${
                    mode === "dark" ? "bg-slate-600" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`h-2 w-3/4 rounded ${
                    mode === "dark" ? "bg-slate-600" : "bg-slate-200"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t px-3 py-3">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
            selected
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-muted-foreground/40"
          }`}
        >
          {selected ? <Check className="h-3 w-3" /> : null}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </button>
  );
}

export function AppearanceTab({
  theme,
  onApplyTheme,
  language,
  setLanguage,
  settings,
  onCurrencyChange,
}: {
  theme: ThemeMode;
  onApplyTheme: (next: ThemeMode) => void;
  language: "en" | "uz";
  setLanguage: (next: "en" | "uz") => void;
  settings: PosSettings;
  onCurrencyChange: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <TabsContent value="appearance" className="pt-4 space-y-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.appearance.themeTitle")}</CardTitle>
          <CardDescription>{t("settings.appearance.themeSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <ThemePreviewCard
                key={option.value}
                mode={option.value}
                selected={active}
                label={t(option.labelKey)}
                onClick={() => onApplyTheme(option.value)}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardHeader>
          <CardTitle>{t("settings.appearance.languageCurrencyTitle")}</CardTitle>
          <CardDescription>{t("settings.appearance.languageCurrencySubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language-select">{t("settings.appearance.language")}</Label>
              <select
                id="language-select"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={language}
                onChange={(event) => setLanguage(event.target.value === "uz" ? "uz" : "en")}
              >
                <option value="en">{t("lang.english")}</option>
                <option value="uz">{t("lang.uzbek")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-select">{t("settings.appearance.currency")}</Label>
              <select
                id="currency-select"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                value={settings.currency}
                onChange={(event) => onCurrencyChange(event.target.value)}
              >
                <option value="UZS">{t("settings.appearance.currencyUzs")}</option>
                <option value="USD">{t("settings.appearance.currencyUsd")}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
