import type {
  WorkerCreateJobCategory,
  WorkerCreateLoginRoleOption,
  WorkerJobCategory,
  WorkerLoginRoleOption,
  WorkerSalaryType,
} from "@/types/workers";

type WorkerFormBase<TJobCategory, TLoginRoleOption> = {
  fullName: string;
  jobCategory: TJobCategory | "";
  salaryType: WorkerSalaryType | "";
  salaryValue: string;
  phoneNumber: string;
  address: string;
  notes: string;
  hasDashboardAccess: boolean;
  loginEmail: string;
  loginPassword: string;
  loginRole: TLoginRoleOption | "";
};

export type NewWorkerForm = WorkerFormBase<
  WorkerCreateJobCategory,
  WorkerCreateLoginRoleOption
>;

export type EditWorkerForm = WorkerFormBase<
  WorkerJobCategory,
  WorkerLoginRoleOption
>;

export type NewWorkerJobCategory = WorkerCreateJobCategory;
export type EditWorkerJobCategory = WorkerJobCategory;
export type NewWorkerLoginRoleOption = WorkerCreateLoginRoleOption;
export type EditWorkerLoginRoleOption = WorkerLoginRoleOption;
export type WorkerSalaryTypeOption = WorkerSalaryType;

export const initialNewWorkerForm: NewWorkerForm = {
  fullName: "",
  jobCategory: "",
  salaryType: "",
  salaryValue: "",
  phoneNumber: "+998",
  address: "",
  notes: "",
  hasDashboardAccess: false,
  loginEmail: "",
  loginPassword: "",
  loginRole: "",
};

export const initialEditWorkerForm: EditWorkerForm = {
  fullName: "",
  jobCategory: "",
  salaryType: "",
  salaryValue: "",
  phoneNumber: "+998",
  address: "",
  notes: "",
  hasDashboardAccess: false,
  loginEmail: "",
  loginPassword: "",
  loginRole: "",
};
