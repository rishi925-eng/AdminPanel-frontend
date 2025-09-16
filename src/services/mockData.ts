import type { ServiceRequest, Department, Worker, Analytics, User, Hotspot } from '../types';

// Mock departments
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Public Works',
    description: 'Road maintenance, infrastructure, and utilities',
    workers_count: 15,
    active_tickets: 28
  },
  {
    id: 2,
    name: 'Sanitation',
    description: 'Waste management and street cleaning',
    workers_count: 12,
    active_tickets: 22
  },
  {
    id: 3,
    name: 'Parks & Recreation',
    description: 'Park maintenance and recreational facilities',
    workers_count: 8,
    active_tickets: 15
  },
  {
    id: 4,
    name: 'Transportation',
    description: 'Traffic signals, street signs, and public transport',
    workers_count: 10,
    active_tickets: 19
  },
  {
    id: 5,
    name: 'Environmental Services',
    description: 'Environmental issues and pollution control',
    workers_count: 6,
    active_tickets: 8
  }
];

// Mock workers
export const MOCK_WORKERS: Worker[] = [
  {
    id: 1,
    name: 'Mike Johnson',
    phone: '+1234567890',
    email: 'mike.johnson@city.gov',
    department: 'Public Works',
    status: 'online',
    assigned_tickets: 5,
    location: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 2,
    name: 'Sarah Davis',
    phone: '+1234567891',
    email: 'sarah.davis@city.gov',
    department: 'Sanitation',
    status: 'busy',
    assigned_tickets: 7,
    location: { lat: 40.7589, lng: -73.9851 }
  },
  {
    id: 3,
    name: 'Tom Wilson',
    phone: '+1234567892',
    email: 'tom.wilson@city.gov',
    department: 'Parks & Recreation',
    status: 'online',
    assigned_tickets: 3,
    location: { lat: 40.7505, lng: -73.9934 }
  },
  {
    id: 4,
    name: 'Lisa Brown',
    phone: '+1234567893',
    email: 'lisa.brown@city.gov',
    department: 'Transportation',
    status: 'offline',
    assigned_tickets: 0,
    location: { lat: 40.7282, lng: -74.0776 }
  },
  {
    id: 5,
    name: 'James Miller',
    phone: '+1234567894',
    email: 'james.miller@city.gov',
    department: 'Environmental Services',
    status: 'online',
    assigned_tickets: 4,
    location: { lat: 40.7614, lng: -73.9776 }
  },
  {
    id: 6,
    name: 'Emily Taylor',
    phone: '+1234567895',
    email: 'emily.taylor@city.gov',
    department: 'Public Works',
    status: 'busy',
    assigned_tickets: 6,
    location: { lat: 40.7749, lng: -73.9442 }
  }
];

// Mock tickets data
export const MOCK_TICKETS: ServiceRequest[] = [
  {
    id: 1,
    external_id: 'TKT-2024-001',
    category: 'Pothole',
    description: 'Large pothole on Main Street causing traffic issues',
    lat: 40.7128,
    lng: -74.0060,
    photo_url: 'https://via.placeholder.com/400x300/666/fff?text=Pothole',
    thumbnail_url: 'https://via.placeholder.com/150x150/666/fff?text=Pothole',
    reporter_contact: '+1234567890',
    status: 'in_progress',
    assigned_dept: 'Public Works',
    assigned_worker_id: 1,
    assigned_worker: MOCK_WORKERS[0],
    sla_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    external_id: 'TKT-2024-002',
    category: 'Street Lighting',
    description: 'Street light not working on Oak Avenue',
    lat: 40.7589,
    lng: -73.9851,
    reporter_contact: 'citizen@email.com',
    status: 'assigned',
    assigned_dept: 'Public Works',
    assigned_worker_id: 6,
    assigned_worker: MOCK_WORKERS[5],
    sla_due: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    external_id: 'TKT-2024-003',
    category: 'Garbage Collection',
    description: 'Missed garbage collection on Pine Street',
    lat: 40.7505,
    lng: -73.9934,
    photo_url: 'https://via.placeholder.com/400x300/999/fff?text=Garbage',
    reporter_contact: '+1234567891',
    status: 'resolved',
    assigned_dept: 'Sanitation',
    assigned_worker_id: 2,
    assigned_worker: MOCK_WORKERS[1],
    sla_due: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    external_id: 'TKT-2024-004',
    category: 'Water Leakage',
    description: 'Water leak near the park entrance',
    lat: 40.7282,
    lng: -74.0776,
    reporter_contact: 'park.visitor@email.com',
    status: 'submitted',
    sla_due: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    external_id: 'TKT-2024-005',
    category: 'Broken Sidewalk',
    description: 'Cracked sidewalk creating pedestrian hazard',
    lat: 40.7614,
    lng: -73.9776,
    photo_url: 'https://via.placeholder.com/400x300/777/fff?text=Sidewalk',
    reporter_contact: '+1234567892',
    status: 'triaged',
    assigned_dept: 'Public Works',
    sla_due: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    external_id: 'TKT-2024-006',
    category: 'Traffic Signal',
    description: 'Traffic light stuck on red at intersection',
    lat: 40.7749,
    lng: -73.9442,
    reporter_contact: '+1234567893',
    status: 'in_progress',
    assigned_dept: 'Transportation',
    assigned_worker_id: 4,
    assigned_worker: MOCK_WORKERS[3],
    sla_due: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 7,
    external_id: 'TKT-2024-007',
    category: 'Tree Removal',
    description: 'Dead tree branch hanging dangerously over sidewalk',
    lat: 40.7831,
    lng: -73.9712,
    photo_url: 'https://via.placeholder.com/400x300/8B4513/fff?text=Tree',
    reporter_contact: 'concerned.citizen@email.com',
    status: 'assigned',
    assigned_dept: 'Parks & Recreation',
    assigned_worker_id: 3,
    assigned_worker: MOCK_WORKERS[2],
    sla_due: new Date(Date.now() + 120 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 8,
    external_id: 'TKT-2024-008',
    category: 'Graffiti',
    description: 'Graffiti vandalism on public building wall',
    lat: 40.7424,
    lng: -74.0060,
    photo_url: 'https://via.placeholder.com/400x300/FF6347/fff?text=Graffiti',
    reporter_contact: '+1234567894',
    status: 'closed',
    assigned_dept: 'Public Works',
    assigned_worker_id: 1,
    assigned_worker: MOCK_WORKERS[0],
    sla_due: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Add more tickets for testing
const generateMoreTickets = () => {
  const categories = ['Pothole', 'Street Lighting', 'Garbage Collection', 'Water Leakage', 'Broken Sidewalk', 'Traffic Signal', 'Tree Removal', 'Graffiti', 'Noise Complaint', 'Other'];
  const statuses: ServiceRequest['status'][] = ['submitted', 'triaged', 'assigned', 'in_progress', 'resolved', 'closed'];
  const departments = MOCK_DEPARTMENTS.map(d => d.name);
  
  const additionalTickets: ServiceRequest[] = [];
  
  for (let i = 9; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const dept = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : undefined;
    const worker = dept && Math.random() > 0.4 ? MOCK_WORKERS[Math.floor(Math.random() * MOCK_WORKERS.length)] : undefined;
    
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000));
    
    // Generate random coordinates within NYC area
    const lat = 40.7128 + (Math.random() - 0.5) * 0.2;
    const lng = -74.0060 + (Math.random() - 0.5) * 0.2;
    
    additionalTickets.push({
      id: i,
      external_id: `TKT-2024-${i.toString().padStart(3, '0')}`,
      category,
      description: `Sample ${category.toLowerCase()} issue reported by citizen`,
      lat,
      lng,
      photo_url: Math.random() > 0.6 ? `https://via.placeholder.com/400x300/${Math.floor(Math.random() * 16777215).toString(16)}/fff?text=${category.replace(' ', '+')}` : undefined,
      thumbnail_url: Math.random() > 0.6 ? `https://via.placeholder.com/150x150/${Math.floor(Math.random() * 16777215).toString(16)}/fff?text=${category.replace(' ', '+')}` : undefined,
      reporter_contact: Math.random() > 0.5 ? `+123456789${Math.floor(Math.random() * 10)}` : `citizen${i}@email.com`,
      status,
      assigned_dept: dept,
      assigned_worker_id: worker?.id,
      assigned_worker: worker,
      sla_due: status !== 'closed' && status !== 'resolved' ? new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    });
  }
  
  return additionalTickets;
};

export const ALL_MOCK_TICKETS = [...MOCK_TICKETS, ...generateMoreTickets()];

// Mock analytics
export const MOCK_ANALYTICS: Analytics = {
  total_tickets: ALL_MOCK_TICKETS.length,
  resolved_tickets: ALL_MOCK_TICKETS.filter(t => ['resolved', 'closed'].includes(t.status)).length,
  pending_tickets: ALL_MOCK_TICKETS.filter(t => ['submitted', 'triaged'].includes(t.status)).length,
  overdue_tickets: ALL_MOCK_TICKETS.filter(t => t.sla_due && new Date(t.sla_due) < new Date() && !['resolved', 'closed'].includes(t.status)).length,
  avg_resolution_time: 48, // hours
  sla_performance: 85.2 // percentage
};

// Mock hotspots
export const MOCK_HOTSPOTS: Hotspot[] = [
  {
    lat: 40.7128,
    lng: -74.0060,
    count: 15,
    category: 'Pothole'
  },
  {
    lat: 40.7589,
    lng: -73.9851,
    count: 12,
    category: 'Street Lighting'
  },
  {
    lat: 40.7505,
    lng: -73.9934,
    count: 8,
    category: 'Garbage Collection'
  },
  {
    lat: 40.7749,
    lng: -73.9442,
    count: 6,
    category: 'Traffic Signal'
  }
];

// Mock users for admin
export const MOCK_ADMIN_USERS: User[] = [
  {
    id: 1,
    name: 'John Admin',
    phone: '+1234567890',
    email: 'admin@civic.com',
    role: 'admin',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'Jane Super Admin',
    phone: '+0987654321',
    email: 'superadmin@civic.com',
    role: 'super_admin',
    created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'Bob Worker',
    phone: '+1122334455',
    email: 'worker@civic.com',
    role: 'worker',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    name: 'Alice Viewer',
    phone: '+5566778899',
    email: 'viewer@civic.com',
    role: 'viewer',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions for mock data manipulation
export const createMockTicket = (data: Partial<ServiceRequest>): ServiceRequest => {
  const id = Math.max(...ALL_MOCK_TICKETS.map(t => t.id)) + 1;
  const now = new Date().toISOString();
  
  return {
    id,
    external_id: `TKT-2024-${id.toString().padStart(3, '0')}`,
    category: 'Other',
    description: '',
    lat: 40.7128,
    lng: -74.0060,
    status: 'submitted',
    created_at: now,
    updated_at: now,
    ...data
  };
};

export const updateMockTicket = (id: number, updates: Partial<ServiceRequest>): ServiceRequest | null => {
  const ticketIndex = ALL_MOCK_TICKETS.findIndex(t => t.id === id);
  if (ticketIndex === -1) return null;
  
  ALL_MOCK_TICKETS[ticketIndex] = {
    ...ALL_MOCK_TICKETS[ticketIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  return ALL_MOCK_TICKETS[ticketIndex];
};

export const createMockWorker = (data: Partial<Worker>): Worker => {
  const id = Math.max(...MOCK_WORKERS.map(w => w.id)) + 1;
  
  return {
    id,
    name: '',
    status: 'offline',
    assigned_tickets: 0,
    ...data
  };
};

export const updateMockWorker = (id: number, updates: Partial<Worker>): Worker | null => {
  const workerIndex = MOCK_WORKERS.findIndex(w => w.id === id);
  if (workerIndex === -1) return null;
  
  MOCK_WORKERS[workerIndex] = {
    ...MOCK_WORKERS[workerIndex],
    ...updates
  };
  
  return MOCK_WORKERS[workerIndex];
};