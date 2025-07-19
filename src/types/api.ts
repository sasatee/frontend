/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  isSuccess?: boolean;
  message?: string;
  result?: T;
  data?: T;
  [key: string]: any;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Error response from API
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Standard mutation response
 */
export interface MutationResponse<T> {
  data: T;
  message: string;
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Base interface for all DTOs
 */
export interface BaseDto {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Base interface for all entities
 */
export interface BaseEntity extends BaseDto {
  id: string;
  createdAt: string;
  updatedAt: string;
}
