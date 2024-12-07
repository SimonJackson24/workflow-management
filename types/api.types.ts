// types/api.types.ts

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  metadata?: ApiMetadata;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ApiMetadata {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiRequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface ApiCache {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
}
