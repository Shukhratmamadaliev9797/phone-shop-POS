import { AlertCircle, Eye, EyeOff } from "lucide-react";
import type { FormEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {
  identifier: string;
  password: string;
  showPassword: boolean;
  error: string | null;
  loading: boolean;
  t: (key: string) => string;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SignInFormCard({
  identifier,
  password,
  showPassword,
  error,
  loading,
  t,
  onIdentifierChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">{t("signin.title")}</CardTitle>
        <CardDescription>{t("signin.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="identifier">{t("signin.identifier")}</Label>
            <Input
              id="identifier"
              placeholder={t("signin.identifierPlaceholder")}
              value={identifier}
              onChange={(event) => onIdentifierChange(event.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("signin.forgotPassword")}
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                disabled={loading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Login failed</p>
                  <p className="text-sm leading-5">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t("signin.signingIn") : t("signin.signIn")}
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            {t("signin.or")}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2">
        <p className="text-xs text-muted-foreground">{t("signin.policy")}</p>
        <p className="text-xs text-muted-foreground">
          {t("signin.needAccount")}{" "}
          <span className="underline underline-offset-4">
            {t("signin.contactAdmin")}
          </span>
        </p>
      </CardFooter>
    </Card>
  );
}
