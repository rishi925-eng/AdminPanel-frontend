export interface User {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'worker' | 'viewer';
  password_hash?: string;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  external_id?: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  photo_url?: string;
  thumbnail_url?: string;
  reporter_contact?: string;
  status: 'submitted' | 'triaged' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'duplicate' | 'rejected';
  assigned_dept?: string;
  assigned_worker_id?: number;
  assigned_worker?: Worker;
  sla_due?: string;
  created_at: string;
  updated_at: string;
  timeline?: TicketTimeline[];
}

export interface TicketTimeline {
  id: number;
  ticket_id: number;
  actor_id?: number;
  actor?: User;
  action: string;
  payload?: Record<string, any>;
  created_at: string;
}

export interface Worker {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  department?: string;
  status: 'online' | 'offline' | 'busy';
  assigned_tickets?: number;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  workers_count: number;
  active_tickets: number;
}

export interface Analytics {
  total_tickets: number;
  resolved_tickets: number;
  pending_tickets: number;
  overdue_tickets: number;
  avg_resolution_time: number;
  sla_performance: number;
}

export interface Hotspot {
  lat: number;
  lng: number;
  count: number;
  category?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T> {
  items?: T[];
  data?: T;
  total?: number;
  page?: number;
  perPage?: number;
  success?: boolean;
  message?: string;
}

export interface TicketFilters {
  status?: string;
  department?: string;
  category?: string;
  assigned_worker_id?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  q?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SocketEvents {
  'ticket.created': ServiceRequest;
  'ticket.updated': ServiceRequest;
  'ticket.assigned': { ticketId: number; workerId: number };
  'worker.status': { workerId: number; status: string };
}