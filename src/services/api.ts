import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ServiceRequest, 
  User, 
  Worker, 
  Department, 
  Analytics, 
  Hotspot, 
  ApiResponse, 
  TicketFilters 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { phoneOrEmail: string }): Promise<{ token: string }> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async verifyOtp(data: { otp: string }): Promise<{ token: string; user: User }> {
    const response = await this.api.post('/auth/verify-otp', data);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Tickets endpoints
  async getTickets(filters?: TicketFilters): Promise<ApiResponse<ServiceRequest>> {
    const response = await this.api.get('/tickets', { params: filters });
    return response.data;
  }

  async getTicket(id: number): Promise<ServiceRequest> {
    const response = await this.api.get(`/tickets/${id}`);
    return response.data;
  }

  async assignTicket(id: number, data: { assignedDept?: string; assignedWorkerId?: number }): Promise<void> {
    await this.api.post(`/tickets/${id}/assign`, data);
  }

  async updateTicketStatus(id: number, data: { status: string; note?: string }): Promise<void> {
    await this.api.patch(`/tickets/${id}/status`, data);
  }

  async addTicketComment(id: number, text: string): Promise<void> {
    await this.api.post(`/tickets/${id}/comments`, { text });
  }

  async getTicketHotspots(bbox?: string): Promise<Hotspot[]> {
    const response = await this.api.get('/tickets/hotspots', { params: { bbox } });
    return response.data;
  }

  // Workers endpoints
  async getWorkers(): Promise<Worker[]> {
    const response = await this.api.get('/workers');
    return response.data;
  }

  async getWorker(id: number): Promise<Worker> {
    const response = await this.api.get(`/workers/${id}`);
    return response.data;
  }

  async updateWorkerStatus(id: number, status: string): Promise<void> {
    await this.api.patch(`/workers/${id}/status`, { status });
  }

  // Departments endpoints
  async getDepartments(): Promise<Department[]> {
    const response = await this.api.get('/departments');
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(): Promise<Analytics> {
    const response = await this.api.get('/analytics/sla');
    return response.data;
  }

  async getTopHotspots(): Promise<Hotspot[]> {
    const response = await this.api.get('/analytics/top-hotspots');
    return response.data;
  }

  // Users endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.api.get('/users');
    return response.data;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Bulk operations
  async bulkAssignTickets(ticketIds: number[], assignData: { assignedDept?: string; assignedWorkerId?: number }): Promise<void> {
    await this.api.post('/tickets/bulk-assign', { ticketIds, ...assignData });
  }

  async bulkUpdateStatus(ticketIds: number[], status: string, note?: string): Promise<void> {
    await this.api.post('/tickets/bulk-status', { ticketIds, status, note });
  }
}

export default new ApiService();