export type UUID = string | number;
export type ISODateString = string;

export type SortOrder = "ASC" | "DESC";

export interface PaginationQuery {
  page?: number;
  take?: number;
  search?: string;
  searchField?: string;
  sortField?: string;
  sortOrder?: SortOrder;
  createdFrom?: string;
  createdTo?: string;
}

export interface PaginationResult<T> {
  count: number;
  results: T[];
  totalPages: number;
  page: number;
  take: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

