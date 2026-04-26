import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPhoneModelsByBrand,
  PHONE_BRAND_OPTIONS,
  PHONE_COLOR_OPTIONS,
  PHONE_STORAGE_OPTIONS,
} from "@/lib/constants/phone-options";
import { useI18n } from "@/lib/i18n/provider";
import type { AddPhoneFormValue } from "../types";

type Props = {
  value: AddPhoneFormValue;
  onChange: (next: AddPhoneFormValue) => void;
  errors?: {
    brand?: boolean;
    model?: boolean;
    condition?: boolean;
  };
};

export function PhoneDetailsSection({ value, onChange, errors }: Props) {
  const { t } = useI18n();
  const [showBrandOptions, setShowBrandOptions] = React.useState(false);
  const [showModelOptions, setShowModelOptions] = React.useState(false);
  const [showStorageOptions, setShowStorageOptions] = React.useState(false);
  const [showColorOptions, setShowColorOptions] = React.useState(false);

  const brandBoxRef = React.useRef<HTMLDivElement | null>(null);
  const modelBoxRef = React.useRef<HTMLDivElement | null>(null);
  const storageBoxRef = React.useRef<HTMLDivElement | null>(null);
  const colorBoxRef = React.useRef<HTMLDivElement | null>(null);

  const modelOptions = React.useMemo(
    () => getPhoneModelsByBrand(value.brand),
    [value.brand],
  );

  const filteredBrandOptions = React.useMemo(() => {
    const query = value.brand.trim().toLowerCase();
    if (!query) return PHONE_BRAND_OPTIONS;
    return PHONE_BRAND_OPTIONS.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [value.brand]);

  const filteredModelOptions = React.useMemo(() => {
    const query = value.model.trim().toLowerCase();
    if (!query) return modelOptions;
    return modelOptions.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [modelOptions, value.model]);

  const filteredStorageOptions = React.useMemo(() => {
    const query = value.storage.trim().toLowerCase();
    if (!query) return PHONE_STORAGE_OPTIONS;
    return PHONE_STORAGE_OPTIONS.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [value.storage]);

  const filteredColorOptions = React.useMemo(() => {
    const query = value.color.trim().toLowerCase();
    if (!query) return PHONE_COLOR_OPTIONS;
    return PHONE_COLOR_OPTIONS.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [value.color]);

  React.useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (brandBoxRef.current && !brandBoxRef.current.contains(target)) {
        setShowBrandOptions(false);
      }
      if (modelBoxRef.current && !modelBoxRef.current.contains(target)) {
        setShowModelOptions(false);
      }
      if (storageBoxRef.current && !storageBoxRef.current.contains(target)) {
        setShowStorageOptions(false);
      }
      if (colorBoxRef.current && !colorBoxRef.current.contains(target)) {
        setShowColorOptions(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, []);

  return (
    <>
      <h3 className="text-sm font-semibold">{t("inventory.addPhone.phoneDetails.title")}</h3>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
        <div
          ref={brandBoxRef}
          className={`relative space-y-2 isolate ${showBrandOptions ? "z-[300]" : "z-[120]"}`}
        >
          <Label>
            {t("inventory.addPhone.phoneDetails.brand")}{" "}
            <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={value.brand}
              className={errors?.brand ? "border-rose-500 field-shake" : ""}
              placeholder={t("inventory.addPhone.phoneDetails.brandPlaceholder")}
              onFocus={() => setShowBrandOptions(true)}
              onChange={(e) => onChange({ ...value, brand: e.target.value, model: "" })}
            />
            {showBrandOptions && filteredBrandOptions.length > 0 ? (
              <div
                className="absolute left-0 right-0 top-full z-[9999] mt-1 h-56 overflow-y-auto overscroll-contain rounded-xl border bg-background p-1 shadow-2xl"
                style={{ height: "14rem", maxHeight: "14rem", overflowY: "auto" }}
                onWheel={(event) => {
                  const element = event.currentTarget;
                  element.scrollTop += event.deltaY;
                  event.preventDefault();
                }}
              >
                {filteredBrandOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange({ ...value, brand: option, model: "" });
                      setShowBrandOptions(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          ref={modelBoxRef}
          className={`relative space-y-2 isolate ${showModelOptions ? "z-[300]" : "z-[120]"}`}
        >
          <Label>
            {t("inventory.addPhone.phoneDetails.model")}{" "}
            <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Input
              value={value.model}
              className={errors?.model ? "border-rose-500 field-shake" : ""}
              disabled={!value.brand}
              placeholder={!value.brand
                ? t("inventory.addPhone.phoneDetails.modelPlaceholderNoBrand")
                : t("inventory.addPhone.phoneDetails.modelPlaceholder")}
              onFocus={() => setShowModelOptions(true)}
              onChange={(e) => onChange({ ...value, model: e.target.value })}
            />
            {showModelOptions && filteredModelOptions.length > 0 ? (
              <div
                className="absolute left-0 right-0 top-full z-[9999] mt-1 h-56 overflow-y-auto overscroll-contain rounded-xl border bg-background p-1 shadow-2xl"
                style={{ height: "14rem", maxHeight: "14rem", overflowY: "auto" }}
                onWheel={(event) => {
                  const element = event.currentTarget;
                  element.scrollTop += event.deltaY;
                  event.preventDefault();
                }}
              >
                {filteredModelOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChange({ ...value, model: option });
                      setShowModelOptions(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
          <div
            ref={storageBoxRef}
            className={`relative space-y-2 isolate ${showStorageOptions ? "z-[300]" : "z-[120]"}`}
          >
            <Label>{t("inventory.addPhone.phoneDetails.storage")}</Label>
            <div className="relative">
              <Input
                value={value.storage}
                placeholder={t("inventory.addPhone.phoneDetails.storagePlaceholder")}
                onFocus={() => setShowStorageOptions(true)}
                onChange={(e) => onChange({ ...value, storage: e.target.value })}
              />
              {showStorageOptions && filteredStorageOptions.length > 0 ? (
                <div
                  className="absolute left-0 right-0 top-full z-[9999] mt-1 h-56 overflow-y-auto overscroll-contain rounded-xl border bg-background p-1 shadow-2xl"
                  style={{ height: "14rem", maxHeight: "14rem", overflowY: "auto" }}
                  onWheel={(event) => {
                    const element = event.currentTarget;
                    element.scrollTop += event.deltaY;
                    event.preventDefault();
                  }}
                >
                  {filteredStorageOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onChange({ ...value, storage: option });
                        setShowStorageOptions(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              {t("inventory.addPhone.phoneDetails.condition")}{" "}
              <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={value.condition}
              onValueChange={(next) =>
                onChange({ ...value, condition: next as "GOOD" | "USED" | "BROKEN" })
              }
            >
              <SelectTrigger
                className={`w-full ${errors?.condition ? "border-rose-500 field-shake" : ""}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">{t("inventory.condition.new")}</SelectItem>
                <SelectItem value="USED">{t("inventory.condition.usedLower")}</SelectItem>
                <SelectItem value="BROKEN">{t("inventory.condition.brokenLower")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            ref={colorBoxRef}
            className={`relative space-y-2 isolate ${showColorOptions ? "z-[300]" : "z-[120]"}`}
          >
            <Label>{t("inventory.addPhone.phoneDetails.color")}</Label>
            <div className="relative">
              <Input
                value={value.color}
                placeholder={t("inventory.addPhone.phoneDetails.colorPlaceholder")}
                onFocus={() => setShowColorOptions(true)}
                onChange={(e) => onChange({ ...value, color: e.target.value })}
              />
              {showColorOptions && filteredColorOptions.length > 0 ? (
                <div
                  className="absolute left-0 right-0 top-full z-[9999] mt-1 h-56 overflow-y-auto overscroll-contain rounded-xl border bg-background p-1 shadow-2xl"
                  style={{ height: "14rem", maxHeight: "14rem", overflowY: "auto" }}
                  onWheel={(event) => {
                    const element = event.currentTarget;
                    element.scrollTop += event.deltaY;
                    event.preventDefault();
                  }}
                >
                  {filteredColorOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onChange({ ...value, color: option });
                        setShowColorOptions(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>IMEI</Label>
            <Input
              value={value.imei}
              placeholder={t("inventory.addPhone.phoneDetails.imeiPlaceholder")}
              onChange={(e) => onChange({ ...value, imei: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.phoneDetails.serialNumber")}</Label>
            <Input
              value={value.serialNumber}
              placeholder={t("inventory.addPhone.phoneDetails.serialPlaceholder")}
              onChange={(e) => onChange({ ...value, serialNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("inventory.addPhone.phoneDetails.needsRepair")}</Label>
            <Select
              value={value.needsRepair ? "yes" : "no"}
              onValueChange={(next) => onChange({ ...value, needsRepair: next === "yes" })}
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
        </div>

        </div>
      </div>
    </>
  );
}
