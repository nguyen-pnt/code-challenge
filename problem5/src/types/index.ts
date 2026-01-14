export interface CreateResourceRequest {
  name: string;
  description: string;
  category: string;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  category?: string;
}

export interface ResourceFilters {
  category?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
