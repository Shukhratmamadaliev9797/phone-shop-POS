import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  createInventoryItem,
  type CreateInventoryItemPayload,
} from "@/lib/api/inventory";
import { canManageSales } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import { useUzPhone } from "@/hooks/use-uz-phone";
import {
  INITIAL_ADD_PHONE_FORM,
  type AddPhoneFormValue,
} from "./types";
import { PhoneDetailsSection } from "./components/phone-details-section";
import { PriceSection } from "./components/price-section";
import { CustomerDetailsSection } from "./components/customer-details-section";
import { RepairDetailsSection } from "./components/repair-details-section";

export default function AddInventoryPhonePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const { normalizeForSave } = useUzPhone();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);

  const [value, setValue] = React.useState<AddPhoneFormValue>(INITIAL_ADD_PHONE_FORM);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showRequiredErrors, setShowRequiredErrors] = React.useState(false);

  const buildAutoImei = React.useCallback(() => {
    const timestamp = Date.now().toString().slice(-10);
    const randomPart = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    return `${timestamp}${randomPart}`;
  }, []);

  const toNumber = React.useCallback((raw: string) => {
    const normalized = Number(raw || 0);
    return Number.isFinite(normalized) ? normalized : 0;
  }, []);

  const phonePrice = toNumber(value.expectedSalePrice);
  const repairPrice = value.needsRepair ? toNumber(value.repairCost) : 0;
  const totalPrice = phonePrice + repairPrice;
  const paidAmount = value.isPhonePurchased && value.paymentType === "PAY_LATER"
    ? toNumber(value.initialPayment)
    : 0;
  const initialPaymentExceedsPrice =
    value.isPhonePurchased &&
    value.paymentType === "PAY_LATER" &&
    paidAmount > phonePrice;
  const remainingAmount = totalPrice - paidAmount;
  const hasNegativeRemaining = remainingAmount < 0;

  const isBrandMissing = value.brand.trim().length === 0;
  const isModelMissing = value.model.trim().length === 0;
  const isConditionMissing = !value.condition;
  const isPriceMissing = value.expectedSalePrice.trim().length === 0;

  const canSubmit =
    canManage &&
    !saving &&
    !initialPaymentExceedsPrice &&
    !isBrandMissing &&
    !isModelMissing &&
    !isConditionMissing &&
    !isPriceMissing &&
    Number(value.expectedSalePrice) >= 0;

  async function handleSave() {
    if (!canManage) {
      setError(t("inventory.page.error.notAllowed"));
      return;
    }

    setShowRequiredErrors(true);

    if (!canSubmit) {
      if (initialPaymentExceedsPrice) {
        setError(
          t("inventory.addPhone.error.initialPaymentTooHigh"),
        );
        return;
      }
      setError(
        t("inventory.addPhone.error.fillRequired"),
      );
      return;
    }

    const customerPhone = normalizeForSave(value.customerPhoneNumber);
    const customerFullName = value.customerFullName.trim();
    const customerAddress = value.customerAddress.trim();
    const hasAnyCustomerData =
      customerPhone.length > 0 || customerFullName.length > 0 || customerAddress.length > 0;

    const payload: CreateInventoryItemPayload = {
      imei: value.imei.trim() || buildAutoImei(),
      serialNumber: value.serialNumber.trim() || undefined,
      brand: value.brand.trim(),
      model: value.model.trim(),
      storage: value.storage.trim() || undefined,
      color: value.color.trim() || undefined,
      condition: value.condition,
      status: value.status,
      knownIssues: value.needsRepair
        ? value.repairDescription.trim() || undefined
        : undefined,
      expectedSalePrice: Number(value.expectedSalePrice),
      isPhonePurchased: value.isPhonePurchased,
      paymentMethod: value.paymentMethod,
      paymentType: value.paymentType,
      initialPayment:
        value.paymentType === "PAY_LATER"
          ? Number(value.initialPayment || 0)
          : undefined,
      customer:
        value.isPhonePurchased && value.paymentType === "PAY_LATER" && hasAnyCustomerData
          ? {
              fullName: customerFullName || undefined,
              phoneNumber: customerPhone || undefined,
              address: customerAddress || undefined,
            }
          : undefined,
      needsRepair: value.needsRepair,
      repairDescription: value.repairDescription.trim() || undefined,
      repairCost: value.needsRepair ? Number(value.repairCost || 0) : undefined,
    };

    try {
      setSaving(true);
      setError(null);
      await createInventoryItem(payload);
      navigate("/inventory");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("inventory.addPhone.error.createFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("inventory.addPhone.title")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("inventory.addPhone.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
        <Separator />
      </div>

      <div>
        {!canManage ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {t("inventory.addPhone.error.notAllowed")}
          </div>
        ) : null}

        <div className="space-y-5">
          <PhoneDetailsSection
            value={value}
            onChange={setValue}
            errors={{
              brand: showRequiredErrors && isBrandMissing,
              model: showRequiredErrors && isModelMissing,
              condition: showRequiredErrors && isConditionMissing,
            }}
          />

          {value.needsRepair ? (
            <RepairDetailsSection
              repairDescription={value.repairDescription}
              repairCost={value.repairCost}
              onRepairDescriptionChange={(next) =>
                setValue((prev) => ({ ...prev, repairDescription: next }))
              }
              onRepairCostChange={(next) =>
                setValue((prev) => ({ ...prev, repairCost: next }))
              }
            />
          ) : null}

          <PriceSection
            value={value.expectedSalePrice}
            priceError={showRequiredErrors && isPriceMissing}
            isPhonePurchased={value.isPhonePurchased}
            paymentMethod={value.paymentMethod}
            paymentType={value.paymentType}
            initialPayment={value.initialPayment}
            onChange={(next) => setValue((prev) => ({ ...prev, expectedSalePrice: next }))}
            onPurchasedChange={(next) =>
              setValue((prev) => ({ ...prev, isPhonePurchased: next }))
            }
            onPaymentMethodChange={(next) =>
              setValue((prev) => ({ ...prev, paymentMethod: next }))
            }
            onPaymentTypeChange={(next) =>
              setValue((prev) => ({ ...prev, paymentType: next }))
            }
            onInitialPaymentChange={(next) =>
              setValue((prev) => ({ ...prev, initialPayment: next }))
            }
          />

          {value.isPhonePurchased && value.paymentType === "PAY_LATER" ? (
            <CustomerDetailsSection
              fullName={value.customerFullName}
              phoneNumber={value.customerPhoneNumber}
              address={value.customerAddress}
              onFullNameChange={(next) =>
                setValue((prev) => ({ ...prev, customerFullName: next }))
              }
              onPhoneNumberChange={(next) =>
                setValue((prev) => ({ ...prev, customerPhoneNumber: next }))
              }
              onAddressChange={(next) =>
                setValue((prev) => ({ ...prev, customerAddress: next }))
              }
            />
          ) : null}

          <h3 className="text-sm font-semibold">{t("inventory.addPhone.overview.title")}</h3>
          <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="hidden sm:block" />
              <div className="rounded-2xl border border-muted/40 bg-background/40 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {t("inventory.addPhone.overview.price")}
                    </span>
                    <span className="font-semibold">{money(phonePrice)}</span>
                  </div>

                  {value.needsRepair ? (
                    <>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.repairCost")}
                        </span>
                        <span className="font-semibold">{money(repairPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.total")}
                        </span>
                        <span className="font-semibold">{money(totalPrice)}</span>
                      </div>
                    </>
                  ) : null}

                  {value.isPhonePurchased && value.paymentType === "PAY_LATER" ? (
                    <>
                      <div className="h-px w-full bg-border" />
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.initialPayment")}
                        </span>
                        <span className="font-semibold">{money(paidAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.remaining")}
                        </span>
                        <span
                          className={`font-semibold ${
                            hasNegativeRemaining ? "text-rose-600 dark:text-rose-400" : ""
                          }`}
                        >
                          {money(remainingAmount)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate("/inventory")}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit}>
            {saving
              ? t("common.saving")
              : t("inventory.header.addPhone")}
          </Button>
        </div>
      </div>
    </div>
  );
}
