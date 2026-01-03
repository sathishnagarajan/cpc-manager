export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Enquiry {
  id: number;
  name: string;
  email?: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  enquiry_date: string;
  complaint?: string;
  source?: string;
  status: 'new' | 'contacted' | 'converted' | 'cancelled';
  notes?: string;
  created_by?: number;
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
