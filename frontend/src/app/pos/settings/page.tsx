import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuth } from "@/store/slices/authSlice";
import { updateUserById } from "@/lib/api/users";
import { getStoredTheme, setTheme, type ThemeMode } from "@/lib/theme";
import { useI18n } from "@/lib/i18n/provider";
import {
  readPosSettings,
  savePosSettings,
  type CurrencyCode,
  type PosSettings,
} from "@/lib/currency/provider";
import { getWorker, listWorkers, type WorkerDetailsView } from "@/lib/api/workers";
import { MyDetailsTab } from "./components/my-details-tab";
import { PasswordTab } from "./components/password-tab";
import { PaymentsTab } from "./components/payments-tab";
import { AppearanceTab } from "./components/appearance-tab";

function toMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.max(0, Math.round(value)));
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

type DetailsForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { language, setLanguage, t } = useI18n();
  const authUser = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const [theme, setThemeState] = React.useState<ThemeMode>(() => getStoredTheme());
  const [settings, setSettings] = React.useState<PosSettings>(() => readPosSettings());

  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [isSavingDetails, setIsSavingDetails] = React.useState(false);
  const [detailsStatus, setDetailsStatus] = React.useState<string | null>(null);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [passwordForm, setPasswordForm] = React.useState<PasswordForm>({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = React.useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  const [details, setDetails] = React.useState<DetailsForm>({
    fullName: authUser?.name ?? "",
    email: authUser?.email ?? "",
    phoneNumber: authUser?.phone ?? "",
    address: "",
  });

  const [workerDetails, setWorkerDetails] = React.useState<WorkerDetailsView | null>(null);
  const [paymentsLoading, setPaymentsLoading] = React.useState(false);

  React.useEffect(() => {
    setDetails((prev) => ({
      ...prev,
      fullName: authUser?.name ?? "",
      email: authUser?.email ?? "",
      phoneNumber: authUser?.phone ?? "",
    }));
  }, [authUser?.name, authUser?.email, authUser?.phone]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadWorker() {
      const userId = Number(authUser?.id);
      if (!Number.isFinite(userId) || userId <= 0) {
        setWorkerDetails(null);
        return;
      }

      try {
        setPaymentsLoading(true);
        const workers = await listWorkers({ page: 1, limit: 300, hasDashboardAccess: true });
        const linked = workers.data.find((worker) => Number(worker.userId) === userId);

        if (!linked) {
          if (!cancelled) setWorkerDetails(null);
          return;
        }

        const detail = await getWorker(linked.id);
        if (!cancelled) {
          setWorkerDetails(detail);
          setDetails((prev) => ({
            ...prev,
            fullName: prev.fullName || detail.fullName || "",
            phoneNumber: prev.phoneNumber || detail.phoneNumber || "",
            address: detail.address ?? prev.address,
          }));
        }
      } catch {
        if (!cancelled) {
          setWorkerDetails(null);
        }
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    }

    void loadWorker();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const currentMonth = toMonthKey(new Date());
  const monthPaid = React.useMemo(() => {
    const list = workerDetails?.payments ?? [];
    return list
      .filter((payment) => payment.month === currentMonth)
      .reduce((sum, payment) => sum + Number(payment.amountPaid ?? 0), 0);
  }, [workerDetails?.payments, currentMonth]);

  const monthlySalary = Number(workerDetails?.monthlySalary ?? 0);
  const monthRemaining = Math.max(0, monthlySalary - monthPaid);

  const onFieldChange = (key: keyof DetailsForm, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const onClickUpdateDetails = () => {
    setIsEditingDetails(true);
    setDetailsStatus(null);
    setDetailsError(null);
  };

  const onCancelEdit = () => {
    setIsEditingDetails(false);
    setDetailsStatus(null);
    setDetailsError(null);
    setDetails((prev) => ({
      ...prev,
      fullName: authUser?.name ?? "",
      email: authUser?.email ?? "",
      phoneNumber: authUser?.phone ?? "",
    }));
  };

  async function onSaveDetails() {
    const userId = Number(authUser?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      setDetailsError(t("settings.errors.currentUserNotFound"));
      return;
    }

    if (!details.email.trim()) {
      setDetailsError(t("settings.errors.emailRequired"));
      return;
    }

    try {
      setIsSavingDetails(true);
      setDetailsError(null);
      setDetailsStatus(null);

      const updated = await updateUserById(userId, {
        fullName: details.fullName.trim() || undefined,
        email: details.email.trim(),
        phoneNumber: details.phoneNumber.trim() || undefined,
        address: details.address.trim() || undefined,
      });

      const nextUser = {
        id: updated.id,
        name: updated.fullName || details.fullName || "User",
        role: updated.role,
        email: updated.email ?? undefined,
        phone: updated.phoneNumber ?? undefined,
      };

      localStorage.setItem("user", JSON.stringify(nextUser));

      if (accessToken) {
        dispatch(
          setAuth({
            user: nextUser,
            accessToken,
            refreshToken: refreshToken ?? undefined,
          }),
        );
      }

      setDetailsStatus(t("settings.details.success"));
      setIsEditingDetails(false);
    } catch (error) {
      setDetailsError(error instanceof Error ? error.message : t("settings.errors.saveDetailsFailed"));
    } finally {
      setIsSavingDetails(false);
    }
  }

  const onApplyTheme = (next: ThemeMode) => {
    setTheme(next);
    setThemeState(next);
  };

  const onCurrencyChange = (value: string) => {
    const nextCurrency = (value === "USD" ? "USD" : "UZS") as CurrencyCode;
    const nextSettings = {
      ...settings,
      currency: nextCurrency,
    };
    setSettings(nextSettings);
    savePosSettings(nextSettings);
  };

  const onPasswordFieldChange = (key: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  async function onSavePassword() {
    const userId = Number(authUser?.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      setPasswordError(t("settings.errors.currentUserNotFound"));
      return;
    }

    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (newPassword.length < 8) {
      setPasswordError(t("settings.password.error.minLength"));
      setPasswordStatus(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.password.error.mismatch"));
      setPasswordStatus(null);
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordError(null);
      setPasswordStatus(null);

      await updateUserById(userId, {
        password: newPassword,
      });

      setPasswordStatus(t("settings.password.success"));
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : t("settings.password.error.updateFailed"));
      setPasswordStatus(null);
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings.page.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("settings.page.subtitle")}</p>
      </div>

      <Tabs defaultValue="my-details" className="w-full">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start overflow-x-auto md:w-1/2"
        >
          <TabsTrigger value="my-details" className="!flex-none px-4 py-2">
            {t("settings.tabs.myDetails")}
          </TabsTrigger>
          <TabsTrigger value="password" className="!flex-none px-4 py-2">
            {t("settings.tabs.password")}
          </TabsTrigger>
          <TabsTrigger value="payments" className="!flex-none px-4 py-2">
            {t("settings.tabs.payments")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="!flex-none px-4 py-2">
            {t("settings.tabs.appearance")}
          </TabsTrigger>
        </TabsList>

        <MyDetailsTab
          details={details}
          isEditingDetails={isEditingDetails}
          isSavingDetails={isSavingDetails}
          detailsError={detailsError}
          detailsStatus={detailsStatus}
          onFieldChange={onFieldChange}
          onClickUpdateDetails={onClickUpdateDetails}
          onSaveDetails={() => void onSaveDetails()}
          onCancelEdit={onCancelEdit}
        />

        <PasswordTab
          passwordForm={passwordForm}
          isSavingPassword={isSavingPassword}
          passwordError={passwordError}
          passwordStatus={passwordStatus}
          onPasswordFieldChange={onPasswordFieldChange}
          onSavePassword={() => void onSavePassword()}
        />

        <PaymentsTab
          paymentsLoading={paymentsLoading}
          workerDetails={workerDetails}
          monthlySalary={monthlySalary}
          monthPaid={monthPaid}
          monthRemaining={monthRemaining}
          toMoney={toMoney}
        />

        <AppearanceTab
          theme={theme}
          onApplyTheme={onApplyTheme}
          language={language}
          setLanguage={setLanguage}
          settings={settings}
          onCurrencyChange={onCurrencyChange}
        />
      </Tabs>
    </div>
  );
}
