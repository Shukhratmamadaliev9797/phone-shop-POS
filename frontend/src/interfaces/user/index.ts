import type { PaginationResult } from "@/interfaces/common";

export type AppUserRole = "user" | "admin" | "moderator";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: AppUserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: AppUserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: AppUserRole;
}

export type UsersListResponse = PaginationResult<AppUser>;

export interface UserResponse {
  user: AppUser;
}

