import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type WorkerRole = 'MANAGER' | 'CASHIER' | 'TECHNICIAN' | 'OTHER'
export type WorkerSalaryType = 'MONTHLY' | 'PERCENT'
export type WorkerLoginRole = 'OWNER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'

export type WorkerView = {
  createdAt: string
  id: number
  fullName: string
  phoneNumber?: string | null
  address?: string | null
  monthlySalary: string
  salaryType: WorkerSalaryType
  salaryPercent?: string | null
  soldPhonesCount?: number
  totalSoldAmount?: string
  totalProfitAmount?: string
  percentSalaryAccrued?: string
  workerRole: WorkerRole
  hasDashboardAccess: boolean
  userId?: number | null
  loginEmail?: string | null
  notes?: string | null
}

export type SalaryPaymentView = {
  id: number
  workerId: number
  month: string
  amountPaid: string
  paidAt: string
  notes?: string | null
}

export type WorkerDetailsView = WorkerView & {
  payments: SalaryPaymentView[]
  totalPaidThisMonth?: string
  lastPaymentAt?: string | null
}

export type WorkersListParams = {
  page?: number
  limit?: number
  search?: string
  workerRole?: WorkerRole
  hasDashboardAccess?: boolean
}

export type WorkersListResponse = {
  data: WorkerView[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type SalaryPaymentListParams = {
  page?: number
  limit?: number
  fromMonth?: string
  toMonth?: string
}

export type SalaryPaymentListResponse = {
  data: SalaryPaymentView[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CreateWorkerPayload = {
  fullName: string
  phoneNumber?: string
  address?: string
  monthlySalary?: number
  salaryType: WorkerSalaryType
  salaryPercent?: number
  workerRole: WorkerRole
  hasDashboardAccess?: boolean
  login?: {
    email: string
    password: string
    role?: WorkerLoginRole
  }
  notes?: string
}

export type UpdateWorkerPayload = {
  fullName?: string
  phoneNumber?: string
  address?: string
  monthlySalary?: number
  salaryType?: WorkerSalaryType
  salaryPercent?: number
  workerRole?: WorkerRole
  hasDashboardAccess?: boolean
  login?: {
    email?: string
    password?: string
    role?: WorkerLoginRole
  }
  notes?: string
}

export type AddSalaryPaymentPayload = {
  month: string
  amountPaid: number
  paidAt?: string
  notes?: string
}

export class ApiRequestError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

function normalizeApiError(error: unknown): ApiRequestError {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const status = axiosError.response?.status

  if (status === 401) {
    return new ApiRequestError('Unauthorized', 401)
  }

  const messagePayload = axiosError.response?.data?.message
  const message = Array.isArray(messagePayload)
    ? messagePayload.join(', ')
    : messagePayload

  return new ApiRequestError(message || axiosError.message || 'Request failed', status)
}

async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await call()
    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function listWorkers(params: WorkersListParams): Promise<WorkersListResponse> {
  return request(() => api.get('/api/workers', { params }))
}

export async function getWorker(id: number): Promise<WorkerDetailsView> {
  return request(() => api.get(`/api/workers/${id}`))
}

export async function createWorker(body: CreateWorkerPayload): Promise<WorkerView> {
  try {
    return await request(() => api.post('/api/workers', body))
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>
    const rawMessage = axiosError.response?.data?.message
    const combinedMessage = Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage ?? ''
    const isLegacyWorkerDtoError =
      axiosError.response?.status === 400 &&
      /salaryType should not exist|salaryPercent should not exist/i.test(combinedMessage)

    if (!isLegacyWorkerDtoError) {
      throw error
    }

    const fallbackBody: CreateWorkerPayload = {
      ...body,
      monthlySalary: body.salaryType === 'MONTHLY' ? body.monthlySalary ?? 0 : 0,
      notes:
        body.salaryType === 'PERCENT'
          ? [body.notes?.trim(), `Salary type: Percent (${Number(body.salaryPercent ?? 0)}%)`]
              .filter(Boolean)
              .join('\n')
          : body.notes,
    }

    // Old backend DTO: remove new fields and retry.
    delete (fallbackBody as { salaryType?: WorkerSalaryType }).salaryType
    delete (fallbackBody as { salaryPercent?: number }).salaryPercent
    return request(() => api.post('/api/workers', fallbackBody))
  }
}

export async function updateWorker(
  id: number,
  body: UpdateWorkerPayload,
): Promise<WorkerView> {
  try {
    return await request(() => api.patch(`/api/workers/${id}`, body))
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>
    const rawMessage = axiosError.response?.data?.message
    const combinedMessage = Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage ?? ''
    const isLegacyWorkerDtoError =
      axiosError.response?.status === 400 &&
      /salaryType should not exist|salaryPercent should not exist/i.test(combinedMessage)

    if (!isLegacyWorkerDtoError) {
      throw error
    }

    const fallbackBody: UpdateWorkerPayload = {
      ...body,
      monthlySalary:
        body.salaryType === 'MONTHLY'
          ? (body.monthlySalary ?? 0)
          : body.salaryType === 'PERCENT'
            ? 0
            : body.monthlySalary,
      notes:
        body.salaryType === 'PERCENT'
          ? [body.notes?.trim(), `Salary type: Percent (${Number(body.salaryPercent ?? 0)}%)`]
              .filter(Boolean)
              .join('\n')
          : body.notes,
    }

    delete (fallbackBody as { salaryType?: WorkerSalaryType }).salaryType
    delete (fallbackBody as { salaryPercent?: number }).salaryPercent
    return request(() => api.patch(`/api/workers/${id}`, fallbackBody))
  }
}

export async function addSalaryPayment(
  workerId: number,
  body: AddSalaryPaymentPayload,
): Promise<SalaryPaymentView> {
  return request(() => api.post(`/api/workers/${workerId}/salary-payments`, body))
}

export async function listSalaryPayments(
  workerId: number,
  params: SalaryPaymentListParams,
): Promise<SalaryPaymentListResponse> {
  return request(() => api.get(`/api/workers/${workerId}/salary-payments`, { params }))
}

export async function deleteWorker(id: number): Promise<{ success: true }> {
  return request(() => api.delete(`/api/workers/${id}`))
}
