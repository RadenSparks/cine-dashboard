/**
 * Common patterns and helper types for Redux slices
 * Reduces boilerplate and ensures consistency across slices
 */

/**
 * Standard pagination structure returned by paginated API endpoints
 */
export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElement: number;
    totalPages: number;
  };
};

/**
 * Standard API response wrapper used across all endpoints
 */
export type ApiResponseWrapper<T> = {
  data: T;
  message: string;
  status: "SUCCESS" | "ERROR" | "FAILURE";
};

/**
 * Standard async thunk result structure for paginated endpoints
 */
export type PaginatedThunkResult<T> = {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
};

/**
 * Standard state structure for slices managing lists of items with pagination
 */
export interface ListSliceState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

/**
 * Standard state structure for slices managing a simple list
 */
export interface SimpleListSliceState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}
