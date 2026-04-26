import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronsUpDown, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SellingOverviewSection } from "./components/selling-overview-section";
import { SalePriceOverviewSection } from "./components/sale-price-overview-section";
import { SellerDetailsSection } from "./components/seller-details-section";
import {
  createSale,
  getSale,
  listAvailableSaleItems,
  updateSale,
  type AvailableSaleItem,
  type CreateSalePayload,
  type SaleDetail,
  type SalePaymentMethod,
  type SalePaymentType,
} from "@/lib/api/sales";
import { listWorkers } from "@/lib/api/workers";
import { canManageSales } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";
import { useUzPhone } from "@/hooks/use-uz-phone";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import {
  useCurrencyFormatter,
} from "@/lib/currency/provider";

type CartItem = {
  itemId: number;
  imei: string;
  brand: string;
  model: string;
  salePrice: number;
};

type SellerOption = {
  id: string;
  fullName: string;
};

type NewSaleLocationState = {
  preselectedItemId?: number;
  from?: string;
  item?: {
    brand?: string | null;
    model?: string | null;
    imei?: string | null;
    condition?: string | null;
    storage?: string | null;
    color?: string | null;
    serialNumber?: string | null;
    phonePrice?: number;
    repairCost?: number;
    knownIssues?: string | null;
  };
};

const MAX_MONEY_ABS_UZS = 9_999_999_999.99;

export default function NewSalePage() {
  const { t } = useI18n();
  const { money, currency } = useCurrencyFormatter();
  const { formatInput, inputToBase, baseToInput } = useCurrencyInput();
  const { formatInput: formatPhoneInput, normalizeForSave } = useUzPhone();
  const navigate = useNavigate();
  const { id: saleIdParam } = useParams<{ id: string }>();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserName = currentUser?.name ?? "";
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);
  const editSaleId = Number(saleIdParam);
  const isEditMode = Number.isFinite(editSaleId) && editSaleId > 0;
  const state = (location.state as NewSaleLocationState | null) ?? null;
  const isDirectSellFromInventory = isEditMode || Boolean(state?.preselectedItemId);

  const [inventory, setInventory] = React.useState<AvailableSaleItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [itemsOpen, setItemsOpen] = React.useState(false);

  const [paymentMethod, setPaymentMethod] = React.useState<SalePaymentMethod>("CASH");
  const [paymentType, setPaymentType] = React.useState<SalePaymentType>("PAID_NOW");
  const [installmentMonths, setInstallmentMonths] = React.useState("");
  const [salePriceInput, setSalePriceInput] = React.useState("");
  const [firstPaymentNow, setFirstPaymentNow] = React.useState<"YES" | "NO">("YES");
  const [customerFullName, setCustomerFullName] = React.useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [initialLoading, setInitialLoading] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [editSaleDetail, setEditSaleDetail] = React.useState<SaleDetail | null>(null);
  const [sellerOptions, setSellerOptions] = React.useState<SellerOption[]>([]);
  const [selectedSellerId, setSelectedSellerId] = React.useState("");
  const [prefillSellerName, setPrefillSellerName] = React.useState("");
  const [sellerLoading, setSellerLoading] = React.useState(false);

  const goBack = React.useCallback(() => {
    navigate(state?.from || "/sales");
  }, [navigate, state?.from]);

  const loadInventory = React.useCallback(async () => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      const rows = await listAvailableSaleItems({ q: query.trim() || undefined });
      setInventory(rows);
    } catch (error) {
      setInventoryError(
        error instanceof Error
          ? error.message
          : t("sales.new.error.loadInventory"),
      );
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [query, t]);

  React.useEffect(() => {
    if (!canManage) return;
    void loadInventory();
  }, [canManage, loadInventory]);

  React.useEffect(() => {
    if (!state?.preselectedItemId || inventory.length === 0) return;

    const selected = inventory.find((item) => item.id === state.preselectedItemId);
    if (!selected) return;

    setCart([
      {
        itemId: selected.id,
        imei: selected.imei,
        brand: selected.brand,
        model: selected.model,
        salePrice: Number(selected.purchasePrice || 0),
      },
    ]);
  }, [state?.preselectedItemId, inventory]);

  React.useEffect(() => {
    const preselectedId = state?.preselectedItemId;
    if (!isDirectSellFromInventory || !preselectedId) return;
    if (!state?.item) return;

    setCart((prev) => {
      if (prev[0]?.itemId === preselectedId) {
        return prev;
      }
      return [
        {
          itemId: preselectedId,
          imei: state.item?.imei ?? "",
          brand: state.item?.brand ?? "",
          model: state.item?.model ?? "",
          salePrice: Number(state.item?.phonePrice ?? 0),
        },
      ];
    });
  }, [isDirectSellFromInventory, state]);

  React.useEffect(() => {
    if (!isEditMode || !canManage) return;
    let active = true;

    const loadSaleForEdit = async () => {
      try {
        setInitialLoading(true);
        setErrorMessage(null);
        const detail = await getSale(editSaleId);
        if (!active) return;

        setEditSaleDetail(detail);
        const firstItem = detail.items?.[0];
        if (firstItem) {
          setCart([
            {
              itemId: firstItem.itemId,
              imei: firstItem.item.imei,
              brand: firstItem.item.brand,
              model: firstItem.item.model,
              salePrice: Math.min(
                Math.max(0, Number(firstItem.salePrice ?? 0)),
                MAX_MONEY_ABS_UZS,
              ),
            },
          ]);
          setSalePriceInput(
            baseToInput(
              Math.max(0, Math.round(Number(firstItem.salePrice ?? 0))),
            ),
          );
        }

        setPaymentMethod(detail.paymentMethod);
        setPaymentType(detail.paymentType);
        setInstallmentMonths(
          detail.installmentMonths ? String(detail.installmentMonths) : "",
        );
        setFirstPaymentNow(detail.firstPaymentNow === false ? "NO" : "YES");
        setCustomerFullName(detail.customer?.fullName ?? "");
        setCustomerPhoneNumber(
          formatPhoneInput(detail.customer?.phoneNumber ?? ""),
        );
        setCustomerAddress(detail.customer?.address ?? "");

        const note = detail.notes ?? "";
        const marker = "Sold by:";
        if (note.includes(marker)) {
          setPrefillSellerName(note.slice(note.indexOf(marker) + marker.length).trim());
        }
      } catch (error) {
        if (!active) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t("sales.new.error.loadSale"),
        );
      } finally {
        if (active) setInitialLoading(false);
      }
    };

    void loadSaleForEdit();
    return () => {
      active = false;
    };
  }, [baseToInput, canManage, editSaleId, isEditMode, t]);

  React.useEffect(() => {
    const fallbackId = String(currentUser?.id ?? "self");
    const fallbackName = currentUserName || t("user.unknownUser");

    const fallbackOptions: SellerOption[] = [
      { id: fallbackId, fullName: fallbackName },
    ];

    const loadSellers = async () => {
      try {
        setSellerLoading(true);
        const response = await listWorkers({
          page: 1,
          limit: 100,
          workerRole: "CASHIER",
        });

        const options: SellerOption[] = response.data
          .filter((worker) => worker.workerRole === "CASHIER")
          .map((worker) => ({
            id: String(worker.id),
            fullName: worker.fullName,
          }));

        if (options.length === 0) {
          setSellerOptions(fallbackOptions);
          setSelectedSellerId((prev) => prev || fallbackId);
          return;
        }

        setSellerOptions(options);
        setSelectedSellerId((prev) =>
          prev && options.some((option) => option.id === prev) ? prev : options[0].id,
        );
      } catch {
        setSellerOptions(fallbackOptions);
        setSelectedSellerId((prev) => prev || fallbackId);
      } finally {
        setSellerLoading(false);
      }
    };

    void loadSellers();
  }, [currentUser?.id, currentUserName, t]);

  React.useEffect(() => {
    if (!prefillSellerName || sellerOptions.length === 0) return;
    const matched = sellerOptions.find(
      (option) => option.fullName.trim().toLowerCase() === prefillSellerName.trim().toLowerCase(),
    );
    if (matched) {
      setSelectedSellerId(matched.id);
    }
  }, [prefillSellerName, sellerOptions]);

  const selectedCartItem = cart[0] ?? null;
  const total = selectedCartItem ? Number(selectedCartItem.salePrice) || 0 : 0;
  const installmentMonthsNumber = Math.max(1, Number(installmentMonths || 1));
  const payLaterMonthlyAmount = total / installmentMonthsNumber;
  const payLaterInitialPaidNow = firstPaymentNow === "YES" ? payLaterMonthlyAmount : 0;
  const effectivePaidNow = paymentType === "PAID_NOW" ? total : payLaterInitialPaidNow;
  const remaining = total - effectivePaidNow;

  const noItems = !selectedCartItem;
  const hasInvalidPrice = !selectedCartItem || !Number.isFinite(selectedCartItem.salePrice) || selectedCartItem.salePrice <= 0;
  const hasTooLargePrice = Boolean(
    selectedCartItem && selectedCartItem.salePrice > MAX_MONEY_ABS_UZS,
  );
  const requiresCustomer = paymentType === "PAY_LATER" || remaining > 0;
  const saveDisabled =
    !canManage ||
    saving ||
    initialLoading ||
    noItems ||
    hasInvalidPrice ||
    hasTooLargePrice;

  const addToCart = (item: AvailableSaleItem) => {
    setCart([
      {
        itemId: item.id,
        imei: item.imei,
        brand: item.brand,
        model: item.model,
        salePrice: Math.min(
          Math.max(0, Number(item.purchasePrice || 0)),
          MAX_MONEY_ABS_UZS,
        ),
      },
    ]);
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const updatePrice = (itemId: number, value: string) => {
    const next = Number(value);
    const bounded = Math.min(
      Math.max(0, Number.isFinite(next) ? next : 0),
      MAX_MONEY_ABS_UZS,
    );
    setCart((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, salePrice: bounded } : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!canManage) {
      setErrorMessage(t("sales.new.error.notAllowed"));
      return;
    }
    if (noItems) {
      setErrorMessage(t("sales.new.error.noItems"));
      return;
    }
    if (hasInvalidPrice) {
      setErrorMessage(t("sales.new.error.invalidPrice"));
      return;
    }
    if (hasTooLargePrice) {
      setErrorMessage(t("sales.new.error.invalidPrice"));
      return;
    }
    const parsedSellerWorkerId = Number(selectedSellerId);
    const normalizedCustomerPhone = normalizeForSave(customerPhoneNumber);
    const payload: CreateSalePayload = {
      sellerWorkerId:
        Number.isFinite(parsedSellerWorkerId) && parsedSellerWorkerId > 0
          ? parsedSellerWorkerId
          : undefined,
      customer:
        customerFullName.trim() ||
        normalizedCustomerPhone ||
        customerAddress.trim()
          ? {
              fullName: customerFullName.trim(),
              phoneNumber: normalizedCustomerPhone,
              address: customerAddress.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      paymentType,
      paidNow: paymentType === "PAID_NOW" ? total : undefined,
      installmentMonths:
        paymentType === "PAY_LATER" ? installmentMonthsNumber : undefined,
      firstPaymentNow:
        paymentType === "PAY_LATER" ? firstPaymentNow === "YES" : undefined,
      profit: sellingOverviewPrice - overviewTotal,
      notes: (() => {
        const sellerName = sellerOptions.find(
          (option) => option.id === selectedSellerId,
        )?.fullName;
        return sellerName ? `Sold by: ${sellerName}` : undefined;
      })(),
      items: selectedCartItem
        ? [
            {
              itemId: selectedCartItem.itemId,
              salePrice: selectedCartItem.salePrice,
            },
          ]
        : [],
    };

    try {
      setSaving(true);
      setErrorMessage(null);
      if (isEditMode) {
        await updateSale(editSaleId, {
          sellerWorkerId: payload.sellerWorkerId,
          customer: payload.customer,
          paymentMethod: payload.paymentMethod,
          paymentType: payload.paymentType,
          installmentMonths:
            paymentType === "PAY_LATER" ? installmentMonthsNumber : undefined,
          firstPaymentNow:
            paymentType === "PAY_LATER" ? firstPaymentNow === "YES" : undefined,
          notes: payload.notes,
          items: payload.items,
        });
        navigate(`/sales/${editSaleId}`);
      } else {
        await createSale(payload);
        goBack();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("sales.new.error.createFailed"),
      );
    } finally {
      setSaving(false);
    }
  };

  const availableRows = inventory.filter(
    (item) =>
      (item.status === "IN_STOCK" || item.status === "READY_FOR_SALE") &&
      (cart.length === 0 || cart[0]?.itemId === item.id),
  );
  const directSelectedItem = React.useMemo(() => {
    if (!isDirectSellFromInventory || !state?.preselectedItemId) return null;
    return cart.find((item) => item.itemId === state.preselectedItemId) ?? null;
  }, [cart, isDirectSellFromInventory, state?.preselectedItemId]);
  const directSelectedInventoryItem = React.useMemo(() => {
    if (!isDirectSellFromInventory || !state?.preselectedItemId) return null;
    return inventory.find((item) => item.id === state.preselectedItemId) ?? null;
  }, [inventory, isDirectSellFromInventory, state?.preselectedItemId]);
  React.useEffect(() => {
    if (!isDirectSellFromInventory || !state?.preselectedItemId) return;
    const selected = cart.find((item) => item.itemId === state.preselectedItemId);
    if (!selected) return;
    setSalePriceInput(
      baseToInput(Math.max(0, Math.round(selected.salePrice || 0))),
    );
  }, [
    baseToInput,
    isDirectSellFromInventory,
    state?.preselectedItemId,
    cart[0]?.itemId,
  ]);
  const directPhoneInfo = React.useMemo(
    () => ({
      brand:
        editSaleDetail?.items?.[0]?.item?.brand ??
        directSelectedItem?.brand ??
        state?.item?.brand ??
        directSelectedInventoryItem?.brand ??
        "",
      model:
        editSaleDetail?.items?.[0]?.item?.model ??
        directSelectedItem?.model ??
        state?.item?.model ??
        directSelectedInventoryItem?.model ??
        "",
      imei:
        editSaleDetail?.items?.[0]?.item?.imei ??
        directSelectedItem?.imei ??
        state?.item?.imei ??
        directSelectedInventoryItem?.imei ??
        "",
      condition:
        editSaleDetail?.items?.[0]?.item?.condition ??
        state?.item?.condition ??
        directSelectedInventoryItem?.condition ??
        null,
      storage:
        editSaleDetail?.items?.[0]?.item?.storage ??
        state?.item?.storage ??
        null,
      color: editSaleDetail?.items?.[0]?.item?.color ?? state?.item?.color ?? null,
      serialNumber:
        editSaleDetail?.items?.[0]?.item?.serialNumber ??
        state?.item?.serialNumber ??
        null,
      knownIssues:
        editSaleDetail?.items?.[0]?.item?.knownIssues ??
        state?.item?.knownIssues ??
        null,
      phonePrice: Number(
        isEditMode
          ? Number(editSaleDetail?.totalPrice ?? 0) - Number(editSaleDetail?.profit ?? 0)
          : state?.item?.phonePrice ?? directSelectedInventoryItem?.purchasePrice ?? 0,
      ),
    }),
    [directSelectedInventoryItem, directSelectedItem, editSaleDetail, isEditMode, state?.item],
  );
  const conditionLabel = React.useMemo(() => {
    const value = String(directPhoneInfo.condition ?? "").trim().toUpperCase();
    if (value === "GOOD") return t("inventory.condition.good");
    if (value === "USED") return t("inventory.condition.used");
    if (value === "BROKEN") return t("inventory.condition.broken");
    return directPhoneInfo.condition || "—";
  }, [directPhoneInfo.condition, t]);
  const overviewPrice = Number(
    isEditMode
      ? Number(editSaleDetail?.totalPrice ?? 0) - Number(editSaleDetail?.profit ?? 0)
      : state?.item?.phonePrice ?? directSelectedInventoryItem?.purchasePrice ?? 0,
  );
  const overviewRepairCost = Number(isEditMode ? 0 : state?.item?.repairCost ?? 0);
  const overviewTotal = overviewPrice + overviewRepairCost;
  const sellingOverviewPrice = isDirectSellFromInventory
    ? inputToBase(salePriceInput)
    : total;
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditMode ? t("sales.new.editTitle") : t("sales.new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? t("sales.new.editSubtitle") : t("sales.new.subtitle")}
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        </div>
        <Separator />
      </div>

      <div className="space-y-6">
        {isDirectSellFromInventory ? (
          <>
            <div className="space-y-2">
              <div className="text-sm font-semibold">
                {t("sales.new.phoneDetails")}
              </div>
              <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
                {directPhoneInfo.brand || directPhoneInfo.model || directPhoneInfo.imei ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("sales.new.brandModel")}</p>
                      <p className="text-sm font-medium">{directPhoneInfo.brand} {directPhoneInfo.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("inventory.details.phone.imei")}
                      </p>
                      <p className="text-sm font-medium">{directPhoneInfo.imei || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("sales.new.condition")}</p>
                      <p className="text-sm font-medium">{conditionLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("sales.new.storage")}</p>
                      <p className="text-sm font-medium">{directPhoneInfo.storage || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("sales.new.color")}</p>
                      <p className="text-sm font-medium">{directPhoneInfo.color || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("sales.new.serialNumber")}</p>
                      <p className="text-sm font-medium">{directPhoneInfo.serialNumber || "—"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    {inventoryLoading
                      ? t("sales.new.loadingPhoneInfo")
                      : t("sales.new.selectedPhoneNotFound")}
                  </div>
                )}
              </div>
            </div>

            {directPhoneInfo.knownIssues?.trim() ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold">
                  {t("sales.new.repairDetails")}
                </div>
                <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {directPhoneInfo.knownIssues}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-sm font-semibold">
                {t("sales.new.phonePrice")}
              </div>
              <SalePriceOverviewSection
                price={overviewPrice}
                repairCost={overviewRepairCost}
                total={overviewTotal}
              />
            </div>
          </>
        ) : (
          <>
            <div className="rounded-3xl border p-4">
              <div className="space-y-2">
                <Label>{t("sales.new.availablePhones")}</Label>
                <Popover open={itemsOpen} onOpenChange={setItemsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-10 w-full justify-between rounded-2xl"
                      disabled={!canManage}
                    >
                      {t("sales.new.searchAndSelectPhone")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                    <div className="space-y-2">
                      <Input
                        className="h-9 rounded-xl"
                        placeholder={t("sales.new.searchInventoryPlaceholder")}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      <div className="h-[18rem] overflow-y-auto rounded-xl border overscroll-contain">
                        {inventoryLoading ? (
                          <div className="p-3 text-sm text-muted-foreground">
                            {t("sales.new.loadingInventory")}
                          </div>
                        ) : null}
                        {!inventoryLoading && inventoryError ? (
                          <div className="p-3 text-sm text-rose-600">{inventoryError}</div>
                        ) : null}
                        {!inventoryLoading && !inventoryError && availableRows.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">
                            {t("sales.new.noAvailablePhones")}
                          </div>
                        ) : null}
                        {!inventoryLoading && !inventoryError
                          ? availableRows.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-2 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/60"
                                onClick={() => {
                                  addToCart(item);
                                  setItemsOpen(false);
                                }}
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium">
                                    {item.brand} {item.model}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    {t("inventory.details.phone.imei")}: {item.imei} • {t("sales.new.price")}:{" "}
                                    {money(Number(item.purchasePrice))}
                                  </div>
                                </div>
                              </button>
                            ))
                          : null}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {t("sales.new.selectedPhone")}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {cart[0] ? (
                  (() => {
                    const item = cart[0];
                    return (
                  <div key={item.itemId} className="rounded-2xl border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {item.brand} {item.model}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {t("inventory.details.phone.imei")}: {item.imei}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          className="h-9 w-40 rounded-xl"
                          placeholder={t("sales.new.salePrice")}
                          value={item.salePrice || ""}
                          onChange={(event) => updatePrice(item.itemId, event.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => removeFromCart(item.itemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                    );
                  })()
                ) : (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    {t("sales.new.noSelectedPhones")}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold">
            {t("sales.new.payment")}
          </div>
          <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
            <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("sales.new.paymentType")}</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as SalePaymentType)}>
                <SelectTrigger className="h-10 w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID_NOW">{t("sales.filters.fullPayment")}</SelectItem>
                  <SelectItem value="PAY_LATER">{t("sales.filters.monthlyInstallment")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("sales.new.paymentMethod")}</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as SalePaymentMethod)}>
                <SelectTrigger className="h-10 w-full rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">{t("sales.paymentMethod.cash")}</SelectItem>
                  <SelectItem value="CARD">{t("sales.paymentMethod.card")}</SelectItem>
                  <SelectItem value="OTHER">{t("sales.paymentMethod.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isDirectSellFromInventory ? (
              <div className={cn("mt-4 grid gap-4", paymentType === "PAY_LATER" ? "md:grid-cols-2" : "md:grid-cols-1")}>
              <div className="space-y-2">
                <Label>
                  {t("sales.new.salePrice")}{" "}
                  <span className="text-rose-600">*</span>
                </Label>
                <Input
                  type="text"
                  inputMode={currency === "USD" ? "decimal" : "numeric"}
                  className="h-10 rounded-xl"
                  placeholder={t("sales.new.salePricePlaceholder")}
                  value={salePriceInput}
                  onChange={(event) => {
                    const formatted = formatInput(event.target.value);
                    setSalePriceInput(formatted);
                    if (!state?.preselectedItemId) return;
                    updatePrice(
                      state.preselectedItemId,
                      String(inputToBase(formatted)),
                    );
                  }}
                />
                {paymentType === "PAY_LATER" ? (
                  <div className="space-y-2 pt-1">
                    <Label>
                      {t("sales.new.firstPaymentNowQuestion")}
                    </Label>
                    <Select
                      value={firstPaymentNow}
                      onValueChange={(value) =>
                        setFirstPaymentNow(value as "YES" | "NO")
                      }
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">
                          {t("common.yes")}
                        </SelectItem>
                        <SelectItem value="NO">
                          {t("common.no")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              {paymentType === "PAY_LATER" ? (
                <div className="space-y-2">
                  <Label>{t("sales.new.monthlyQuestion")}</Label>
                  <Input
                    inputMode="numeric"
                    className="h-10 rounded-xl"
                    placeholder={t("sales.new.monthlyPlaceholder")}
                    value={installmentMonths}
                    onChange={(event) => {
                      setInstallmentMonths(event.target.value.replace(/\D/g, ""));
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

            {!isDirectSellFromInventory ? (
              <div className="mt-4 rounded-2xl border bg-muted/20 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{t("sales.new.total")}</span>
                  <span className="font-semibold">{money(total)}</span>
                </div>
                {paymentType === "PAY_LATER" ? (
                  <div className="mt-1 flex items-center justify-between text-muted-foreground">
                    <span>{t("sales.new.remaining")}</span>
                    <span className="font-medium">{money(remaining)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {requiresCustomer ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">
              {t("sales.new.customerDetails")}
            </div>
            <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("sales.new.fullName")}</Label>
                  <Input
                    className="h-10 rounded-xl"
                    value={customerFullName}
                    onChange={(event) => setCustomerFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("sales.new.phoneNumber")}</Label>
                  <Input
                    className="h-10 rounded-xl"
                    inputMode="numeric"
                    placeholder="+998 94 171 14 38"
                    value={formatPhoneInput(customerPhoneNumber)}
                    onChange={(event) =>
                      setCustomerPhoneNumber(formatPhoneInput(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t("sales.new.address")}</Label>
                  <Input
                    className="h-10 rounded-xl"
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isDirectSellFromInventory ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold">
              {t("sales.new.sellingOverview")}
            </div>
            <SellingOverviewSection
              phonePrice={overviewTotal}
              salePrice={sellingOverviewPrice}
              paymentType={paymentType}
              installmentMonths={installmentMonthsNumber}
              firstPaymentNow={firstPaymentNow === "YES"}
            />
          </div>
        ) : null}

        {isDirectSellFromInventory ? (
          <SellerDetailsSection
            value={selectedSellerId}
            options={sellerOptions}
            onChange={setSelectedSellerId}
            loading={sellerLoading}
          />
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
        {initialLoading ? (
          <div className="rounded-2xl border border-muted/40 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            {t("sales.new.loadingSaleData")}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={goBack}>
            {t("common.cancel")}
          </Button>
          <Button className="rounded-xl" onClick={() => void handleSave()} disabled={saveDisabled}>
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? t("common.saving")
              : isEditMode
                ? t("sales.new.saveChanges")
                : t("sales.new.saveSale")}
          </Button>
        </div>
      </div>
    </div>
  );
}
