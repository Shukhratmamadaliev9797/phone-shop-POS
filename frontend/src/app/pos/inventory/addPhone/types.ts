import type { InventoryCondition } from "@/lib/api/inventory";

export type AddPhoneFormValue = {
  imei: string;
  serialNumber: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: InventoryCondition;
  status: "IN_STOCK" | "SOLD";
  repairDescription: string;
  repairCost: string;
  needsRepair: boolean;
  expectedSalePrice: string;
  customerFullName: string;
  customerPhoneNumber: string;
  customerAddress: string;
  isPhonePurchased: boolean;
  paymentMethod: "CASH" | "CARD";
  paymentType: "FULL_PAYMENT" | "PAY_LATER";
  initialPayment: string;
};

export const INITIAL_ADD_PHONE_FORM: AddPhoneFormValue = {
  imei: "",
  serialNumber: "",
  brand: "",
  model: "",
  storage: "",
  color: "",
  condition: "USED",
  status: "IN_STOCK",
  repairDescription: "",
  repairCost: "",
  needsRepair: false,
  expectedSalePrice: "",
  customerFullName: "",
  customerPhoneNumber: "",
  customerAddress: "",
  isPhonePurchased: false,
  paymentMethod: "CASH",
  paymentType: "FULL_PAYMENT",
  initialPayment: "",
};
