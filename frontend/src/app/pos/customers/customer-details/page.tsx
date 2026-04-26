import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import {
  ApiRequestError,
  getCustomerDetail,
  type CustomerDetail,
} from "@/lib/api/customers";
import { canViewCustomers } from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";
import { useCurrencyFormatter } from "@/lib/currency/provider";

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canView = canViewCustomers(role);

  const [detail, setDetail] = React.useState<CustomerDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setError(t("customers.page.error.loadFailed"));
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerDetail(numericId);
        setDetail(data);
      } catch (requestError) {
        if (
          requestError instanceof ApiRequestError &&
          requestError.status === 401
        ) {
          setError(t("customers.page.error.sessionExpired"));
        } else if (
          requestError instanceof ApiRequestError &&
          requestError.status === 403
        ) {
          setError(t("customers.page.error.forbidden"));
        } else {
          setError(
            requestError instanceof Error
              ? requestError.message
              : t("customers.page.error.loadFailed"),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [id, t]);

  if (!canView) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("customers.modal.title")}
        </h1>
        <Button variant="outline" className="rounded-2xl" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("customers.modal.close")}
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          {t("customers.table.loading")}
        </div>
      ) : null}

      {!loading && detail ? (
        <>
          <Card className="rounded-3xl border-muted/40 bg-muted/30">
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t("customers.modal.fullName")}</p>
                  <p className="text-sm font-medium">{detail.customer.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("customers.modal.phone")}</p>
                  <p className="text-sm font-medium">{detail.customer.phoneNumber || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">{t("customers.modal.address")}</p>
                  <p className="text-sm font-medium">{detail.customer.address || "—"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("customers.table.shopDebt")}</p>
                  <p className="text-sm font-semibold">{money(detail.debt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("customers.table.customerDebt")}</p>
                  <p className="text-sm font-semibold">{money(detail.credit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("customers.modal.totalDue")}</p>
                  <p className="text-sm font-semibold">{money(detail.totalDue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
