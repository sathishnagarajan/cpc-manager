export interface User {
  id: number;
  username: string;
  email: string;
  active: boolean;
  groups?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pager: {
    currentPage: number;
    perPage: number;
    total: number;
    pageCount: number;
  };
}
