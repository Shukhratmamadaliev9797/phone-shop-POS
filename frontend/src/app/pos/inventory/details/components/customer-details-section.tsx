import * as React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

type CustomerInfo = {
  fullName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
};

type Props = {
  customer: CustomerInfo | null;
};

export function CustomerDetailsSection({ customer }: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  if (!customer) return null;

  const phone = customer.phoneNumber?.trim() || "";

  const onCopyPhone = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      return;
    }
  };

  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
      <div className="text-sm font-semibold mb-3">
        {t("inventory.details.customer.title")}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-background/40 p-4">
          <div className="text-xs text-muted-foreground">
            {t("inventory.details.customer.fullName")}
          </div>
          <div className="mt-1 text-sm font-medium">{customer.fullName?.trim() || "—"}</div>
        </div>
        <div className="rounded-2xl border bg-background/40 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-muted-foreground">
                {t("inventory.details.customer.phone")}
              </div>
              <div className="mt-1 text-sm font-medium">{phone || "—"}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-xl px-2 text-xs"
              onClick={onCopyPhone}
              disabled={!phone}
            >
              <Copy className="mr-1 h-3 w-3" />
              {copied
                ? t("common.copied")
                : t("common.copy")}
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-background/40 p-4 sm:col-span-1">
          <div className="text-xs text-muted-foreground">
            {t("inventory.details.customer.address")}
          </div>
          <div className="mt-1 text-sm font-medium break-words">{customer.address?.trim() || "—"}</div>
        </div>
      </div>
    </div>
  );
}
