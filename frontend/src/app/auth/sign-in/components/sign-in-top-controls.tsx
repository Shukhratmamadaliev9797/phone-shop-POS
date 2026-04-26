import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  language: "en" | "uz";
  theme: "light" | "dark" | "system";
  t: (key: string) => string;
  onLanguageChange: (value: "en" | "uz") => void;
  onThemeToggle: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function SignInTopControls({
  language,
  theme,
  t,
  onLanguageChange,
  onThemeToggle,
}: Props) {
  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="h-10 w-[110px] rounded-2xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uz">{t("lang.uzbek")}</SelectItem>
          <SelectItem value="en">{t("lang.english")}</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-2xl"
        onClick={onThemeToggle}
        aria-label={t("topbar.toggleTheme")}
        title={
          theme === "dark" ? t("topbar.switchToLight") : t("topbar.switchToDark")
        }
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
