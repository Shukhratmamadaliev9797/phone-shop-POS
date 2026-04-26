import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { setAuth } from "@/store/slices/auth.slice";
import { login } from "@/services/auth.service";
import { getStoredTheme, setTheme } from "@/lib/theme";
import type { AxiosError } from "axios";
import { useI18n } from "@/lib/i18n/provider";
import type { LocationState } from "./types";
import { SignInTopControls } from "./components/sign-in-top-controls";
import { SignInFormCard } from "./components/sign-in-form-card";

const DEMO_IDENTIFIER = import.meta.env.VITE_DEMO_IDENTIFIER ?? "admin@shop.com";
const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME ?? "admin";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "Admin123";

function toUiErrorMessage(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const text = payload.find((item) => typeof item === "string");
    return typeof text === "string" ? text : null;
  }
  if (typeof payload === "object" && payload !== null) {
    const maybe = (payload as { message?: unknown }).message;
    return toUiErrorMessage(maybe);
  }
  return null;
}

export default function SignInPage() {
  const { language, setLanguage, t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() =>
    getStoredTheme(),
  );

  const fromPath = (location.state as LocationState | null)?.from?.pathname;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login(identifier, password);

      localStorage.setItem("access_token", response.access_token);
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token);
      } else {
        localStorage.removeItem("refresh_token");
      }
      localStorage.setItem("user", JSON.stringify(response.user));

      dispatch(
        setAuth({
          user: response.user,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        }),
      );

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("auth_redirecting");
      }

      navigate(fromPath || "/dashboard", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<unknown>;
      const serverMessage = toUiErrorMessage(axiosError.response?.data);
      const message = axiosError.response
        ? (serverMessage ?? t("signin.invalidCredentials"))
        : t("signin.connectionError");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleThemeToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(next, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setThemeState(next);
  }

  return (
    <div className="page-reveal min-h-screen w-full">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/login-bg.svg')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/85 to-muted/70 dark:from-background/95 dark:via-background/92 dark:to-background/90" />
        </div>

        <SignInTopControls
          language={language}
          theme={theme}
          t={t}
          onLanguageChange={(value) => setLanguage(value)}
          onThemeToggle={handleThemeToggle}
        />

        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
          <div className="page-stagger grid w-full items-stretch gap-8">
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="mb-4 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {t("signin.welcomeBack")}
                  </h1>
                </div>

                <div className="mb-4 rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  <p className="font-semibold">Demo Credentials</p>
                  <p className="mt-1">Identifier: {DEMO_IDENTIFIER}</p>
                  <p>Username: {DEMO_USERNAME}</p>
                  <p>Password: {DEMO_PASSWORD}</p>
                </div>

                <SignInFormCard
                  identifier={identifier}
                  password={password}
                  showPassword={showPassword}
                  error={error}
                  loading={loading}
                  t={t}
                  onIdentifierChange={setIdentifier}
                  onPasswordChange={setPassword}
                  onTogglePassword={() => setShowPassword((prev) => !prev)}
                  onSubmit={handleSubmit}
                />

                <div className="mt-6 space-y-2 lg:hidden">
                  <h1 className="text-xl font-semibold">Phone Shop POS</h1>
                  <p className="text-sm text-muted-foreground">
                    {t("signin.footerText")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
