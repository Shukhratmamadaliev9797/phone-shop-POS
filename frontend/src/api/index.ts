import { clearAuth, updateTokens } from "@/store/slices/auth.slice";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";
import { AUTH } from "./path";

const rawApiBaseUrl =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_BASE_URL ?? "";
const normalizedBaseUrl = rawApiBaseUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

function resolveApiPath(path: string): string {
  if (normalizedBaseUrl.endsWith("/api") && path.startsWith("/api/")) {
    return path.slice(4);
  }
  return path;
}

type RefreshPayload =
  | {
      auth?: {
        access_token?: string;
        refresh_token?: string;
      };
      tokens?: {
        accessToken?: string;
        refreshToken?: string;
      };
      access_token?: string;
      refresh_token?: string;
    }
  | undefined;

function extractTokens(payload: RefreshPayload): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const accessToken =
    payload?.tokens?.accessToken ??
    payload?.auth?.access_token ??
    payload?.access_token ??
    null;
  const refreshToken =
    payload?.tokens?.refreshToken ??
    payload?.auth?.refresh_token ??
    payload?.refresh_token ??
    null;

  return { accessToken, refreshToken };
}

// Oddiy baseQuery: har bir requestga token bo‘lsa Authorization header qo‘shish
const baseQuery = fetchBaseQuery({
  baseUrl: `${normalizedBaseUrl}`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;

    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  },
});

// Agar request 401 qaytarsa, refresh token orqali tokenni yangilab qayta urunadi
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 1) Avval original requestni yuboradi
  let result = await baseQuery(args, api, extraOptions);

  // 2) Agar 401 bo‘lsa — access token eskirgan bo‘lishi mumkin
  if (result.error?.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: resolveApiPath(AUTH.REFRESH),
          method: "POST",
          body: {
            refreshToken,
            refresh_token: refreshToken,
          },
        },
        api,
        extraOptions,
      );

      const refreshData = refreshResult?.data as RefreshPayload;
      const nextTokens = extractTokens(refreshData);

      // 3) Agar yangi tokenlar kelsa — store'ni yangilaymiz
      if (nextTokens.accessToken) {
        api.dispatch(
          updateTokens({
            accessToken: nextTokens.accessToken,
            refreshToken: nextTokens.refreshToken ?? undefined,
          }),
        );

        // 4) Keyin original requestni yana bir marta qayta yuboramiz
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh ham ishlamasa — userni logout qilamiz
        api.dispatch(clearAuth());
      }
    } else {
      // Refresh token bo‘lmasa — userni logout qilamiz
      api.dispatch(clearAuth());
    }
  }

  return result;
};

// RTK Query asosiy API instance
export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["AUTH", "USERS"],

  keepUnusedDataFor: 30,

  //Tabga qaytganimizda avtomatik refetch qiladi
  refetchOnFocus: true,

  // 🌐 Internet uzilib qaytsa refetch qiladi
  refetchOnReconnect: true,

  // 📌 Bu yerda endpoint yo‘q, keyin injectEndpoints orqali qo‘shiladi
  endpoints: () => ({}),
});
