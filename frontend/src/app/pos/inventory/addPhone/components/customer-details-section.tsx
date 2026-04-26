import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/provider";
import { useUzPhone } from "@/hooks/use-uz-phone";

type Props = {
  fullName: string;
  phoneNumber: string;
  address: string;
  onFullNameChange: (next: string) => void;
  onPhoneNumberChange: (next: string) => void;
  onAddressChange: (next: string) => void;
};

export function CustomerDetailsSection({
  fullName,
  phoneNumber,
  address,
  onFullNameChange,
  onPhoneNumberChange,
  onAddressChange,
}: Props) {
  const { t } = useI18n();
  const { formatInput } = useUzPhone();
  const formattedPhone = formatInput(phoneNumber);

  return (
    <>
      <h3 className="text-sm font-semibold">{t("inventory.addPhone.customer.title")}</h3>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.customer.fullName")}</Label>
            <Input
              value={fullName}
              placeholder={t("inventory.addPhone.customer.fullNamePlaceholder")}
              onChange={(event) => onFullNameChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.customer.phoneNumber")}</Label>
            <Input
              value={formattedPhone}
              inputMode="numeric"
              placeholder="+998 94 171 14 38"
              onChange={(event) => onPhoneNumberChange(formatInput(event.target.value))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("inventory.addPhone.customer.address")}</Label>
            <Input
              value={address}
              placeholder={t("inventory.addPhone.customer.addressPlaceholder")}
              onChange={(event) => onAddressChange(event.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
