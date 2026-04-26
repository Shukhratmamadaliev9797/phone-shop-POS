import type { CustomerBalanceRow } from "@/lib/api/customers";
import type { CustomerBalanceType } from "@/lib/api/customers";

export type CustomerRow = CustomerBalanceRow & {
  debtSaleId?: number;
  debtSaleDate?: string;
  debtPhoneModel?: string;
  debtPhonePrice?: number;
  debtPaidAmount?: number;
  debtMonthsLeft?: number;
  creditPurchaseId?: number;
  creditPurchaseDate?: string;
  creditPhoneModel?: string;
  creditPhonePrice?: number;
  creditPaidAmount?: number;
  creditRemainingAmount?: number;
};

export type CustomersTabType = CustomerBalanceType;
