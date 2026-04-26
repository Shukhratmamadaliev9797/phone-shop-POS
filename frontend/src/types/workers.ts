export type WorkerSalaryType = "PERCENT" | "MONTHLY";

export type WorkerJobCategory =
  | "ADMIN"
  | "CASHIER"
  | "TECHNICIAN"
  | "CLEANER"
  | "ACCOUNTANT";

export type WorkerCreateJobCategory = Exclude<WorkerJobCategory, "ADMIN">;

export type WorkerLoginRoleOption = "ADMIN" | "CASHIER" | "TECHNICIAN";
export type WorkerCreateLoginRoleOption = Exclude<WorkerLoginRoleOption, "ADMIN">;

export type WorkerPayStatus = "PAID" | "PARTIAL" | "UNPAID";

