import axios from 'axios'
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { store } from '@/store'
import { clearAuth, updateTokens } from '@/store/slices/auth.slice'

const rawApiBaseUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || ''
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '')

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
}

type RefreshResponse =
  | {
      tokens?: { accessToken?: string; refreshToken?: string }
      user?: unknown
    }
  | {
      auth?: { access_token?: string; refresh_token?: string }
      user?: unknown
    }
  | {
      access_token?: string
      refresh_token?: string
      user?: unknown
    }

let refreshPromise: Promise<string | null> | null = null

function buildRefreshUrl(baseURL?: string): string {
  const base = (baseURL ?? '').replace(/\/+$/, '')
  if (!base) return '/api/auth/refresh'
  if (base.endsWith('/api')) return `${base}/auth/refresh`
  return `${base}/api/auth/refresh`
}

function isRefreshRequest(url?: string): boolean {
  if (!url) return false
  return url.includes('/auth/refresh')
}

function forceLogoutAndRedirect() {
  store.dispatch(clearAuth())

  if (typeof window !== 'undefined') {
    const isOnSignIn = window.location.pathname === '/auth/sign-in'
    const isRedirecting = window.sessionStorage.getItem('auth_redirecting') === '1'
    if (isOnSignIn || isRedirecting) return
    window.sessionStorage.setItem('auth_redirecting', '1')
    window.location.replace('/auth/sign-in')
  }
}

function extractAccessToken(payload: RefreshResponse): string | null {
  if ('tokens' in payload && payload.tokens?.accessToken) {
    return payload.tokens.accessToken
  }
  if ('auth' in payload && payload.auth?.access_token) {
    return payload.auth.access_token
  }
  if ('access_token' in payload && payload.access_token) {
    return payload.access_token
  }
  return null
}

function extractRefreshToken(payload: RefreshResponse): string | null {
  if ('tokens' in payload && payload.tokens?.refreshToken) {
    return payload.tokens.refreshToken
  }
  if ('auth' in payload && payload.auth?.refresh_token) {
    return payload.auth.refresh_token
  }
  if ('refresh_token' in payload && payload.refresh_token) {
    return payload.refresh_token
  }
  return null
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    forceLogoutAndRedirect()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(
        buildRefreshUrl(api.defaults.baseURL),
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      .then(({ data }) => {
        const nextAccessToken = extractAccessToken(data)
        const nextRefreshToken = extractRefreshToken(data)

        if (!nextAccessToken) {
          forceLogoutAndRedirect()
          return null
        }

        localStorage.setItem('access_token', nextAccessToken)
        if (nextRefreshToken) {
          localStorage.setItem('refresh_token', nextRefreshToken)
        }
        if ('user' in data && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        store.dispatch(
          updateTokens({
            accessToken: nextAccessToken,
            refreshToken: nextRefreshToken ?? undefined,
          }),
        )

        return nextAccessToken
      })
      .catch(() => {
        forceLogoutAndRedirect()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (isRefreshRequest(originalRequest?.url)) {
      forceLogoutAndRedirect()
      return Promise.reject(error)
    }

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const nextAccessToken = await refreshAccessToken()

    if (!nextAccessToken) {
      forceLogoutAndRedirect()
      return Promise.reject(error)
    }

    originalRequest.headers = {
      ...(originalRequest.headers ?? {}),
      Authorization: `Bearer ${nextAccessToken}`,
    }

    return api.request(originalRequest)
  },
)

export default api
