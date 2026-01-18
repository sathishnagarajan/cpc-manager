import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('isAdminAuthenticated');
      // Clear cookie
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password, isAdmin: true });
    if (response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  // Users
  async getUsers(params?: { page?: number; per_page?: number; group?: string }) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: number) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: { username: string; email: string; password: string; group: string }) {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<{ username: string; email: string; password?: string; group: string; active: boolean }>) {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
