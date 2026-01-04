import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
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

    // Response interceptor for error handling
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

  // Token management
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
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

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Enquiry endpoints
  async getEnquiries(params?: { page?: number; per_page?: number; status?: string }) {
    const response = await this.api.get('/enquiries', { params });
    return response.data;
  }

  async getEnquiry(id: number) {
    const response = await this.api.get(`/enquiries/${id}`);
    return response.data;
  }

  async createEnquiry(data: any) {
    console.log('Sending enquiry data:', data);
    console.log('API URL:', `${API_URL}/enquiries`);
    const response = await this.api.post('/enquiries', data);
    console.log('Enquiry created successfully:', response.data);
    return response.data;
  }

  async updateEnquiry(id: number, data: any) {
    const response = await this.api.put(`/enquiries/${id}`, data);
    return response.data;
  }

  async deleteEnquiry(id: number) {
    const response = await this.api.delete(`/enquiries/${id}`);
    return response.data;
  }

  // Chennai areas
  async getChennaiAreas(query?: string) {
    const response = await this.api.get('/chennai-areas', {
      params: query ? { q: query } : {},
    });
    return response.data;
  }

  // Generic methods
  async get(url: string, config?: any) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: any) {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
