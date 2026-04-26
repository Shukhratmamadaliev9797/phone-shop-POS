import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";
import { useCurrencyFormatter } from "@/lib/currency/provider";
import { canManageSales } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import {
  getInventoryItem,
  updateInventoryItem,
  type InventoryCondition,
  type InventoryStatus,
} from "@/lib/api/inventory";
import {
  getPurchase,
  updatePurchase,
  type PurchaseDetail,
} from "@/lib/api/purchases";
import {
  INITIAL_ADD_PHONE_FORM,
  type AddPhoneFormValue,
} from "../addPhone/types";
import { PhoneDetailsSection } from "../addPhone/components/phone-details-section";
import { RepairDetailsSection } from "../addPhone/components/repair-details-section";
import { PriceSection } from "../addPhone/components/price-section";
import { CustomerDetailsSection } from "../addPhone/components/customer-details-section";

function toNumber(raw: string): number {
  const normalized = Number(raw || 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

export default function EditInventoryPhonePage() {
  const { t } = useI18n();
  const { money } = useCurrencyFormatter();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);

  const [value, setValue] = React.useState<AddPhoneFormValue>(INITIAL_ADD_PHONE_FORM);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showRequiredErrors, setShowRequiredErrors] = React.useState(false);
  const [purchaseId, setPurchaseId] = React.useState<number | null>(null);
  const [purchaseDetail, setPurchaseDetail] = React.useState<PurchaseDetail | null>(null);
  const initialRepairCostFromState = React.useMemo(() => {
    const state = location.state as { item?: { repairCost?: number } } | null;
    const value = state?.item?.repairCost;
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }, [location.state]);

  React.useEffect(() => {
    if (!id) return;
    let active = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getInventoryItem(Number(id));
        const detailRepairCost = Math.max(0, Math.round(Number(detail.repairCost ?? 0)));
        const effectiveRepairCost = Math.max(detailRepairCost, initialRepairCostFromState);
        const hasRepairData =
          detail.status === "IN_REPAIR" ||
          Boolean(detail.knownIssues?.trim()) ||
          effectiveRepairCost > 0;

        let next: AddPhoneFormValue = {
          ...INITIAL_ADD_PHONE_FORM,
          imei: detail.imei ?? "",
          serialNumber: "",
          brand: detail.brand ?? "",
          model: detail.model ?? "",
          storage: detail.storage ?? "",
          color: detail.color ?? "",
          condition: detail.condition as InventoryCondition,
          expectedSalePrice: String(
            Math.max(0, Math.round(Number(detail.expectedSalePrice ?? 0))),
          ),
          needsRepair: hasRepairData,
          repairDescription: detail.knownIssues ?? "",
          repairCost: effectiveRepairCost > 0 ? String(effectiveRepairCost) : "",
          isPhonePurchased: Boolean(detail.purchaseId),
          paymentMethod: "CASH",
          paymentType: "FULL_PAYMENT",
          initialPayment: "",
        };

        if (detail.purchaseId) {
          const purchase = await getPurchase(detail.purchaseId);
          if (active) setPurchaseDetail(purchase);
          const paymentType = purchase.paymentType === "PAY_LATER" ? "PAY_LATER" : "FULL_PAYMENT";
          const paidFromActivities = purchase.activities.reduce(
            (sum, activity) => sum + Number(activity.amount ?? 0),
            0,
          );
          const paidNow = Math.max(
            0,
            Math.round(
              paidFromActivities > 0 ? paidFromActivities : Number(purchase.paidNow ?? 0),
            ),
          );
          next = {
            ...next,
            isPhonePurchased: true,
            paymentMethod: purchase.paymentMethod === "CARD" ? "CARD" : "CASH",
            paymentType,
            initialPayment: paymentType === "PAY_LATER" ? String(paidNow) : "",
            customerFullName: purchase.customer?.fullName ?? "",
            customerPhoneNumber: purchase.customer?.phoneNumber ?? "",
            customerAddress: purchase.customer?.address ?? "",
          };
          if (active) setPurchaseId(purchase.id);
        } else if (active) {
          setPurchaseId(null);
          setPurchaseDetail(null);
        }

        if (active) setValue(next);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("inventory.edit.error.loadFailed"),
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [id, initialRepairCostFromState, t]);

  const isBrandMissing = value.brand.trim().length === 0;
  const isModelMissing = value.model.trim().length === 0;
  const isConditionMissing = !value.condition;
  const isPriceMissing = value.expectedSalePrice.trim().length === 0;
  const phonePrice = toNumber(value.expectedSalePrice);
  const initialPayment = toNumber(value.initialPayment);
  const initialPaymentExceedsPrice =
    value.isPhonePurchased &&
    value.paymentType === "PAY_LATER" &&
    initialPayment > phonePrice;

  const canSubmit =
    canManage &&
    !loading &&
    !saving &&
    !initialPaymentExceedsPrice &&
    !isBrandMissing &&
    !isModelMissing &&
    !isConditionMissing &&
    !isPriceMissing;

  async function handleSave() {
    if (!id) return;
    if (!canManage) {
      setError(t("inventory.page.error.notAllowed"));
      return;
    }

    setShowRequiredErrors(true);
    if (!canSubmit) {
      setError(
        initialPaymentExceedsPrice
          ? t("inventory.addPhone.error.initialPaymentTooHigh")
          : t("inventory.addPhone.error.fillRequired"),
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const totalPaidFromActivities = purchaseDetail
        ? purchaseDetail.activities.reduce(
            (sum, activity) => sum + Number(activity.amount ?? 0),
            0,
          )
        : 0;
      const initialActivityPayment = purchaseDetail?.activities.length
        ? Number(purchaseDetail.activities[0]?.amount ?? 0)
        : 0;
      const currentItemPurchasePrice = purchaseDetail
        ? Number(
            purchaseDetail.items.find(
              (item) => item.itemId === Number(id),
            )?.purchasePrice ?? 0,
          )
        : 0;
      const manualPaidNow = Number(value.initialPayment || 0);
      const nextTotal = Number(value.expectedSalePrice || 0);
      const shouldResetPaymentActivities =
        Boolean(purchaseDetail) &&
        Math.abs(currentItemPurchasePrice - nextTotal) > 0.009;
      const paidSource = shouldResetPaymentActivities
        ? initialActivityPayment
        : totalPaidFromActivities > 0
          ? totalPaidFromActivities
          : manualPaidNow;
      const nextPaymentType =
        value.paymentType === "PAY_LATER" || shouldResetPaymentActivities
          ? "PAY_LATER"
          : "PAID_NOW";
      const nextPaidNow =
        nextPaymentType === "PAY_LATER"
          ? Math.min(paidSource, nextTotal)
          : nextTotal;

      await updateInventoryItem(Number(id), {
        imei: value.imei.trim() || undefined,
        serialNumber: value.serialNumber.trim() || null,
        brand: value.brand.trim(),
        model: value.model.trim(),
        storage: value.storage.trim() || null,
        color: value.color.trim() || null,
        condition: value.condition,
        status: "IN_STOCK" as InventoryStatus,
        knownIssues: value.repairDescription.trim() || null,
        expectedSalePrice: Number(value.expectedSalePrice || 0),
        repairCost: value.needsRepair ? Number(value.repairCost || 0) : 0,
      });

      if (purchaseId) {
        await updatePurchase(purchaseId, {
          paymentMethod: value.paymentMethod,
          paymentType: nextPaymentType,
          paidNow: nextPaidNow,
          resetPaymentActivities: shouldResetPaymentActivities,
          customer:
            nextPaymentType === "PAY_LATER"
              ? {
                  fullName: value.customerFullName.trim() || undefined,
                  phoneNumber: value.customerPhoneNumber.trim() || undefined,
                  address: value.customerAddress.trim() || undefined,
                }
              : undefined,
          items: [
            {
              itemId: Number(id),
              imei: value.imei.trim() || `AUTO-${id}`,
              serialNumber: value.serialNumber.trim() || undefined,
              brand: value.brand.trim(),
              model: value.model.trim(),
              storage: value.storage.trim() || undefined,
              color: value.color.trim() || undefined,
              condition: value.condition,
              knownIssues: value.repairDescription.trim() || undefined,
              purchasePrice: Number(value.expectedSalePrice || 0),
            },
          ],
        });
      }

      navigate(`/inventory/${id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("inventory.edit.error.saveFailed"),
      );
    } finally {
      setSaving(false);
    }
  }

  const repairPrice = value.needsRepair ? toNumber(value.repairCost) : 0;
  const totalPrice = phonePrice + repairPrice;
  const paidFromActivities = purchaseDetail
    ? purchaseDetail.activities.reduce(
        (sum, activity) => sum + Number(activity.amount ?? 0),
        0,
      )
    : 0;
  const paidAmount =
    value.isPhonePurchased && value.paymentType === "PAY_LATER"
      ? paidFromActivities > 0
        ? paidFromActivities
        : toNumber(value.initialPayment)
      : 0;
  const remainingAmount = totalPrice - paidAmount;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("inventory.edit.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("inventory.edit.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => navigate(id ? `/inventory/${id}` : "/inventory")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
        <Separator />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading ? (
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
                    <span className="font-semibold">
                      {money(phonePrice)}
                    </span>
                  </div>
                  {value.needsRepair ? (
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {t("inventory.addPhone.overview.repairCost")}
                      </span>
                      <span className="font-semibold">
                        {money(repairPrice)}
                      </span>
                    </div>
                  ) : null}
                  {value.isPhonePurchased && value.paymentType === "PAY_LATER" ? (
                    <>
                      <div className="h-px w-full bg-border" />
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.initialPayment")}
                        </span>
                        <span className="font-semibold">
                          {money(paidAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {t("inventory.addPhone.overview.remaining")}
                        </span>
                        <span className="font-semibold">
                          {money(remainingAmount)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(id ? `/inventory/${id}` : "/inventory")}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={!canSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {saving
                ? t("common.saving")
                : t("inventory.edit.saveChanges")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4 text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      )}
    </div>
  );
}
