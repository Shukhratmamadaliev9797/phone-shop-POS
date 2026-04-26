import type { AxiosError } from "axios";
import api from "@/lib/api";

export type DashboardKpiPeriod = "daily" | "weekly" | "monthly" | "custom";

export type DashboardKpiItem = {
  current: number;
  previous: number;
  deltaPercent: number;
};

export type DashboardOverview = {
  kpis: {
    profit: DashboardKpiItem;
    purchaseSpending: DashboardKpiItem;
    repairSpending: DashboardKpiItem;
    soldPhones: DashboardKpiItem;
  };
  paidVsUnpaid: {
    debt: number;
    credit: number;
  };
  salarySummary: {
    paid: number;
    remaining: number;
  };
  phoneSummary: {
    sold: number;
    purchased: number;
  };
  inventorySummary: {
    count: number;
    totalPrice: number;
  };
  workerSummary: {
    count: number;
  };
  salesRevenue: {
    daily: Array<{ name: string; revenue: number }>;
    weekly: Array<{ name: string; revenue: number }>;
    monthly: Array<{ name: string; revenue: number }>;
    threeMonths: Array<{ name: string; revenue: number }>;
    sixMonths: Array<{ name: string; revenue: number }>;
    custom: Array<{ name: string; revenue: number }>;
  };
  topDebtCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
  }>;
  topCreditCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
  }>;
  recentSales: Array<{
    phone: string;
    amount: number;
    status: string;
  }>;
  recentPurchases: Array<{
    phone: string;
    amount: number;
    status: string;
  }>;
};

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function normalizeApiError(error: unknown): ApiRequestError {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data?.message;
  const message = Array.isArray(payload) ? payload.join(", ") : payload;
  return new ApiRequestError(message || axiosError.message || "Request failed", status);
}

async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await call();
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getDashboardOverview(
  kpiPeriod: DashboardKpiPeriod = "monthly",
  from?: string,
  to?: string,
): Promise<DashboardOverview> {
  return request(() =>
    api.get("/api/dashboard/overview", {
      params: { kpiPeriod, from, to },
    }),
  );
}
