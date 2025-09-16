import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';
import socketService from '../services/socket';
import type { ServiceRequest, TicketFilters, Department, Worker } from '../types';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'triaged', label: 'Triaged', color: 'yellow' },
  { value: 'assigned', label: 'Assigned', color: 'purple' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
  { value: 'duplicate', label: 'Duplicate', color: 'gray' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

const CATEGORIES = [
  'Pothole',
  'Street Lighting',
  'Garbage Collection',
  'Water Leakage',
  'Broken Sidewalk',
  'Traffic Signal',
  'Tree Removal',
  'Graffiti',
  'Noise Complaint',
  'Other'
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof ServiceRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter state
  const [filters, setFilters] = useState<TicketFilters>({
    status: searchParams.get('status') || '',
    department: searchParams.get('department') || '',
    category: searchParams.get('category') || '',
    assigned_worker_id: searchParams.get('assigned_worker_id') ? Number(searchParams.get('assigned_worker_id')) : undefined,
    q: searchParams.get('q') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: Number(searchParams.get('page')) || 1,
    limit: 50
  });

  useEffect(() => {
    fetchInitialData();
    setupRealtimeUpdates();
    
    return () => {
      socketService.off('ticket.created');
      socketService.off('ticket.updated');
    };
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [deptData, workerData] = await Promise.all([
        apiService.getDepartments().catch(() => []),
        apiService.getWorkers().catch(() => [])
      ]);
      
      setDepartments(deptData);
      setWorkers(workerData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTickets(filters);
      const ticketsData = response.items || response.data || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setError('');
    } catch (err: any) {
      setError('Failed to load tickets');
      console.error('Tickets error:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    socketService.on('ticket.created', (newTicket) => {
      setTickets(prev => [newTicket, ...prev]);
    });

    socketService.on('ticket.updated', (updatedTicket) => {
      setTickets(prev => prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
    });
  };

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        newParams.set(k, String(v));
      }
    });
    setSearchParams(newParams);
  };

  const handleSort = (field: keyof ServiceRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTicketSelect = (ticketId: number) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTickets.size === sortedTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(sortedTickets.map(t => t.id)));
    }
  };

  const handleBulkAction = async (action: string, value?: any) => {
    if (selectedTickets.size === 0) return;
    
    try {
      const ticketIds = Array.from(selectedTickets);
      
      switch (action) {
        case 'assign':
          await apiService.bulkAssignTickets(ticketIds, value);
          break;
        case 'status':
          await apiService.bulkUpdateStatus(ticketIds, value);
          break;
      }
      
      setSelectedTickets(new Set());
      fetchTickets(); // Refresh data
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  const clearFilters = () => {
    const newFilters = { page: 1, limit: 50 };
    setFilters(newFilters);
    setSearchParams(new URLSearchParams());
  };

  const sortedTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [tickets, sortField, sortDirection]);

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '' && v !== 1 && v !== 50).length;

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading tickets..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tickets</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage and track civic issue reports ({tickets.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/map')}
            className="btn-secondary"
          >
            <MapPinIcon className="h-4 w-4 mr-2" />
            Map View
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="input-field pl-10"
              value={filters.q || ''}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${activeFiltersCount > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <select
                className="input-field"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select
                className="input-field"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Department
              </label>
              <select
                className="input-field"
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Assigned Worker
              </label>
              <select
                className="input-field"
                value={filters.assigned_worker_id || ''}
                onChange={(e) => handleFilterChange('assigned_worker_id', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Workers</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={filters.from || ''}
                      onChange={(e) => handleFilterChange('from', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={filters.to || ''}
                      onChange={(e) => handleFilterChange('to', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary text-sm"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTickets.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary-900">
                {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="input-field text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction('status', e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Update Status...</option>
                {STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              
              <select
                className="input-field text-sm"
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkAction('assign', { assignedDept: e.target.value });
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Assign Department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setSelectedTickets(new Set())}
                className="btn-secondary text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={fetchTickets}
            className="ml-2 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTickets.size === sortedTickets.length && sortedTickets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-secondary-300"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? 
                      <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? 
                      <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Description
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                      <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? 
                      <ChevronUpIcon className="ml-1 h-4 w-4" /> : 
                      <ChevronDownIcon className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {sortedTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-secondary-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTickets.has(ticket.id)}
                      onChange={() => handleTicketSelect(ticket.id)}
                      className="rounded border-secondary-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    #{ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {ticket.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500">
                    <div className="max-w-xs truncate">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <div className="space-y-1">
                      {ticket.assigned_dept && (
                        <div className="flex items-center">
                          <BuildingOffice2Icon className="h-3 w-3 mr-1" />
                          {ticket.assigned_dept}
                        </div>
                      )}
                      {ticket.assigned_worker && (
                        <div className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {ticket.assigned_worker.name}
                        </div>
                      )}
                      {!ticket.assigned_dept && !ticket.assigned_worker && (
                        <span className="text-secondary-400">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sortedTickets.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-secondary-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-secondary-900">No tickets found</h3>
              <p className="text-sm text-secondary-500">
                {Object.values(filters).some(v => v && v !== '' && v !== 1 && v !== 50) 
                  ? 'Try adjusting your filters to see more tickets.'
                  : 'No tickets have been submitted yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}