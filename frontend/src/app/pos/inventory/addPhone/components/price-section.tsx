import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyInput } from "@/hooks/use-currency-input";

type Props = {
  value: string;
  priceError?: boolean;
  isPhonePurchased: boolean;
  paymentMethod: "CASH" | "CARD";
  paymentType: "FULL_PAYMENT" | "PAY_LATER";
  initialPayment: string;
  onChange: (next: string) => void;
  onPurchasedChange: (next: boolean) => void;
  onPaymentMethodChange: (next: "CASH" | "CARD") => void;
  onPaymentTypeChange: (next: "FULL_PAYMENT" | "PAY_LATER") => void;
  onInitialPaymentChange: (next: string) => void;
};

export function PriceSection({
  value,
  priceError,
  isPhonePurchased,
  paymentMethod,
  paymentType,
  initialPayment,
  onChange,
  onPurchasedChange,
  onPaymentMethodChange,
  onPaymentTypeChange,
  onInitialPaymentChange,
}: Props) {
  const { t, language } = useI18n();
  const { currency, baseToInput, formatInput, inputToBase } = useCurrencyInput();

  const formattedPrice = baseToInput(Number(value || 0));
  const formattedInitialPayment = baseToInput(Number(initialPayment || 0));

  const handleMoneyChange = (raw: string, cb: (next: string) => void) => {
    const formatted = formatInput(raw);
    const base = inputToBase(formatted);
    cb(String(base));
  };

  const pricePlaceholder =
    currency === "USD"
      ? language === "uz"
        ? "Mas: 550 USD"
        : "e.g. 550 USD"
      : t("inventory.addPhone.price.pricePlaceholder");

  const initialPaymentPlaceholder =
    currency === "USD"
      ? language === "uz"
        ? "Mas: 100 USD"
        : "e.g. 100 USD"
      : t("inventory.addPhone.price.initialPaymentPlaceholder");

  return (
    <>
      <h3 className="text-sm font-semibold">{t("inventory.addPhone.price.title")}</h3>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
        {!isPhonePurchased ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("inventory.addPhone.price.isPurchased")}</Label>
              <Select
                value={isPhonePurchased ? "yes" : "no"}
                onValueChange={(next) => onPurchasedChange(next === "yes")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">{t("common.no")}</SelectItem>
                  <SelectItem value="yes">{t("common.yes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {t("inventory.addPhone.price.price")} <span className="text-rose-500">*</span>
              </Label>
              <Input
                className={priceError ? "border-rose-500 field-shake" : ""}
                inputMode={currency === "USD" ? "decimal" : "numeric"}
                placeholder={pricePlaceholder}
                value={formattedPrice}
                onChange={(e) => handleMoneyChange(e.target.value, onChange)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("inventory.addPhone.price.isPurchased")}</Label>
                <Select
                  value={isPhonePurchased ? "yes" : "no"}
                  onValueChange={(next) => onPurchasedChange(next === "yes")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">{t("common.no")}</SelectItem>
                    <SelectItem value="yes">{t("common.yes")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("inventory.addPhone.price.paymentMethod")}</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(next) => onPaymentMethodChange(next as "CASH" | "CARD")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">{t("inventory.addPhone.price.cash")}</SelectItem>
                    <SelectItem value="CARD">{t("inventory.addPhone.price.card")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paymentType === "PAY_LATER" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("inventory.addPhone.price.paymentType")}</Label>
                    <Select
                      value={paymentType}
                      onValueChange={(next) =>
                        onPaymentTypeChange(next as "FULL_PAYMENT" | "PAY_LATER")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_PAYMENT">
                          {t("inventory.addPhone.price.fullPayment")}
                        </SelectItem>
                        <SelectItem value="PAY_LATER">{t("inventory.addPhone.price.payLater")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      {t("inventory.addPhone.price.price")} <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      className={priceError ? "border-rose-500 field-shake" : ""}
                      inputMode={currency === "USD" ? "decimal" : "numeric"}
                      placeholder={pricePlaceholder}
                      value={formattedPrice}
                      onChange={(e) => handleMoneyChange(e.target.value, onChange)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("inventory.addPhone.price.initialPayment")}</Label>
                    <Input
                      inputMode={currency === "USD" ? "decimal" : "numeric"}
                      placeholder={initialPaymentPlaceholder}
                      value={formattedInitialPayment}
                      onChange={(event) => handleMoneyChange(event.target.value, onInitialPaymentChange)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("inventory.addPhone.price.paymentType")}</Label>
                  <Select
                    value={paymentType}
                    onValueChange={(next) => onPaymentTypeChange(next as "FULL_PAYMENT" | "PAY_LATER")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_PAYMENT">
                        {t("inventory.addPhone.price.fullPayment")}
                      </SelectItem>
                      <SelectItem value="PAY_LATER">{t("inventory.addPhone.price.payLater")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("inventory.addPhone.price.price")} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className={priceError ? "border-rose-500 field-shake" : ""}
                    inputMode={currency === "USD" ? "decimal" : "numeric"}
                    placeholder={pricePlaceholder}
                    value={formattedPrice}
                    onChange={(e) => handleMoneyChange(e.target.value, onChange)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
