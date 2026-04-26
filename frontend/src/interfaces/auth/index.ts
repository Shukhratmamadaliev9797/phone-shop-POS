export type AuthRole = "ADMIN" | "WORKER";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: AuthUser;
  auth: AuthTokens;
}

export interface LogoutResponse {
  message: string;
}

