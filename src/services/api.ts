import axios, { type AxiosInstance } from 'axios';
import type { 
  ServiceRequest, 
  User, 
  Worker, 
  Department, 
  Analytics, 
  Hotspot, 
  ApiResponse, 
  TicketFilters 
} from '../types';
import { mockAuthService } from './mockAuth';
import { 
  ALL_MOCK_TICKETS, 
  MOCK_DEPARTMENTS, 
  MOCK_WORKERS, 
  MOCK_ANALYTICS, 
  MOCK_HOTSPOTS
} from './mockData';

class ApiService {
  private api: AxiosInstance;
  private useMockAuth: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
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
  async login(credentials: { phoneOrEmail: string }): Promise<{ token?: string; message?: string; success?: boolean }> {
    try {
      console.log('🔑 Attempting login with:', credentials);
      const response = await this.api.post('/auth/login', credentials);
      console.log('✅ Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('🔄 Backend not available, switching to mock authentication');
        this.useMockAuth = true;
        return await mockAuthService.login(credentials);
      }
      if (error.response?.status === 404) {
        throw new Error('Authentication endpoint not found. Please check if the backend is properly configured.');
      }
      throw error;
    }
  }

  async verifyOtp(data: { otp: string }): Promise<{ token: string; user: User }> {
    try {
      console.log('🔐 Attempting OTP verification with:', { otp: data.otp.replace(/./g, '*') });
      const response = await this.api.post('/auth/verify-otp', data);
      console.log('✅ OTP verification successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock authentication for OTP verification');
        return await mockAuthService.verifyOtp(data);
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 Fetching current user info');
      const response = await this.api.get('/auth/me');
      console.log('✅ Current user fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock authentication for user verification');
        const token = localStorage.getItem('auth_token');
        if (token && token.startsWith('mock-jwt-token')) {
          return await mockAuthService.getCurrentUser(token);
        }
        throw new Error('Unable to verify user with mock service. Please login again.');
      }
      throw error;
    }
  }

  // Tickets endpoints
  async getTickets(filters?: TicketFilters): Promise<ApiResponse<ServiceRequest>> {
    try {
      const response = await this.api.get('/tickets', { params: filters });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for tickets');
        return this.getMockTickets(filters);
      }
      throw error;
    }
  }

  private getMockTickets(filters?: TicketFilters): ApiResponse<ServiceRequest> {
    let tickets = [...ALL_MOCK_TICKETS];
    
    // Apply filters
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(t => t.status === filters.status);
      }
      if (filters.category) {
        tickets = tickets.filter(t => t.category === filters.category);
      }
      if (filters.department) {
        tickets = tickets.filter(t => t.assigned_dept === filters.department);
      }
      if (filters.assigned_worker_id) {
        tickets = tickets.filter(t => t.assigned_worker_id === filters.assigned_worker_id);
      }
      if (filters.q) {
        const query = filters.q.toLowerCase();
        tickets = tickets.filter(t => 
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          (t.assigned_dept && t.assigned_dept.toLowerCase().includes(query))
        );
      }
      if (filters.from) {
        const fromDate = new Date(filters.from);
        tickets = tickets.filter(t => new Date(t.created_at) >= fromDate);
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        tickets = tickets.filter(t => new Date(t.created_at) <= toDate);
      }
    }
    
    // Sort by created_at desc
    tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = tickets.slice(startIndex, endIndex);
    
    return {
      items: paginatedTickets,
      total: tickets.length,
      page,
      perPage: limit
    };
  }

  async getTicket(id: number): Promise<ServiceRequest> {
    try {
      const response = await this.api.get(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        const ticket = ALL_MOCK_TICKETS.find(t => t.id === id);
        if (!ticket) throw new Error(`Ticket ${id} not found`);
        return ticket;
      }
      throw error;
    }
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


  // Workers endpoints
  async getWorkers(): Promise<Worker[]> {
    try {
      const response = await this.api.get('/workers');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for workers');
        return MOCK_WORKERS;
      }
      throw error;
    }
  }

  async getWorker(id: number): Promise<Worker> {
    try {
      const response = await this.api.get(`/workers/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        const worker = MOCK_WORKERS.find(w => w.id === id);
        if (!worker) throw new Error(`Worker ${id} not found`);
        return worker;
      }
      throw error;
    }
  }

  async updateWorkerStatus(id: number, status: string): Promise<void> {
    try {
      await this.api.patch(`/workers/${id}/status`, { status });
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn(`🔄 Mock: Updated worker ${id} status to ${status}`);
        // In a real app, this would update the mock data
        return;
      }
      throw error;
    }
  }

  // Departments endpoints
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await this.api.get('/departments');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for departments');
        return MOCK_DEPARTMENTS;
      }
      throw error;
    }
  }

  // Analytics endpoints
  async getAnalytics(): Promise<Analytics> {
    try {
      const response = await this.api.get('/analytics/sla');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for analytics');
        return MOCK_ANALYTICS;
      }
      throw error;
    }
  }

  async getTopHotspots(): Promise<Hotspot[]> {
    try {
      const response = await this.api.get('/analytics/top-hotspots');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for hotspots');
        return MOCK_HOTSPOTS;
      }
      throw error;
    }
  }

  async getTicketHotspots(bbox?: string): Promise<Hotspot[]> {
    try {
      const response = await this.api.get('/tickets/hotspots', { params: { bbox } });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || this.useMockAuth) {
        console.warn('🔄 Using mock data for ticket hotspots');
        return MOCK_HOTSPOTS;
      }
      throw error;
    }
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