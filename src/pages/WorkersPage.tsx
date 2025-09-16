import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import socketService from '../services/socket';
import type { Worker, Department, ServiceRequest } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UserPlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  ClockIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', color: 'green' },
  { value: 'offline', label: 'Offline', color: 'gray' },
  { value: 'busy', label: 'Busy', color: 'orange' }
];

export default function WorkersPage() {
  const navigate = useNavigate();
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedWorkers, setSelectedWorkers] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof Worker>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
  });

  useEffect(() => {
    fetchWorkersData();
    setupRealtimeUpdates();
    
    return () => {
      socketService.off('worker.status');
    };
  }, []);

  const fetchWorkersData = async () => {
    try {
      setLoading(true);
      const [workersData, deptData, ticketsResponse] = await Promise.all([
        apiService.getWorkers(),
        apiService.getDepartments().catch(() => []),
        apiService.getTickets({ limit: 1000 }).catch(() => ({ items: [] }))
      ]);
      
      setWorkers(workersData);
      setDepartments(deptData);
      const ticketsData = ticketsResponse.items || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setError('');
    } catch (err: any) {
      setError('Failed to load workers data');
      console.error('Workers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    socketService.on('worker.status', (data) => {
      setWorkers(prev => prev.map(worker => 
        worker.id === data.workerId ? { ...worker, status: data.status } : worker
      ));
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      department: '',
    });
  };

  const handleSort = (field: keyof Worker) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleWorkerSelect = (workerId: number) => {
    const newSelected = new Set(selectedWorkers);
    if (newSelected.has(workerId)) {
      newSelected.delete(workerId);
    } else {
      newSelected.add(workerId);
    }
    setSelectedWorkers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedWorkers.size === filteredAndSortedWorkers.length) {
      setSelectedWorkers(new Set());
    } else {
      setSelectedWorkers(new Set(filteredAndSortedWorkers.map(w => w.id)));
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedWorkers.size === 0) return;
    
    try {
      const promises = Array.from(selectedWorkers).map(workerId =>
        apiService.updateWorkerStatus(workerId, status)
      );
      
      await Promise.all(promises);
      
      // Update local state
      setWorkers(prev => prev.map(worker => 
        selectedWorkers.has(worker.id) ? { ...worker, status: status as Worker['status'] } : worker
      ));
      
      setSelectedWorkers(new Set());
    } catch (err) {
      console.error('Bulk status update error:', err);
    }
  };

  const getFilteredWorkers = () => {
    return workers.filter(worker => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !worker.name.toLowerCase().includes(searchLower) &&
          !(worker.email && worker.email.toLowerCase().includes(searchLower)) &&
          !(worker.phone && worker.phone.toLowerCase().includes(searchLower)) &&
          !(worker.department && worker.department.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }
      
      if (filters.status && worker.status !== filters.status) return false;
      if (filters.department && worker.department !== filters.department) return false;
      
      return true;
    });
  };

  const filteredAndSortedWorkers = getFilteredWorkers().sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getWorkerTickets = (workerId: number) => {
    return tickets.filter(ticket => ticket.assigned_worker_id === workerId);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'online': return 'worker-status-online';
      case 'offline': return 'worker-status-offline';
      case 'busy': return 'worker-status-busy';
      default: return 'worker-status-offline';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading workers..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Workers</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage field workers and their assignments ({workers.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add Worker
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
              placeholder="Search workers..."
              className="input-field pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Status
              </label>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
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
                value={filters.department}
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
        )}
      </div>

      {/* Bulk Actions */}
      {selectedWorkers.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary-900">
                {selectedWorkers.size} worker{selectedWorkers.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {STATUS_OPTIONS.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleBulkStatusUpdate(status.value)}
                  className={`btn-secondary text-sm ${
                    status.value === 'online' ? 'text-green-700' :
                    status.value === 'busy' ? 'text-orange-700' : 'text-secondary-700'
                  }`}
                >
                  Set {status.label}
                </button>
              ))}
              
              <button
                onClick={() => setSelectedWorkers(new Set())}
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
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
            <button
              onClick={fetchWorkersData}
              className="ml-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedWorkers.map((worker) => {
          const workerTickets = getWorkerTickets(worker.id);
          const activeTickets = workerTickets.filter(t => !['resolved', 'closed'].includes(t.status));
          
          return (
            <div
              key={worker.id}
              className={`bg-white rounded-lg shadow border-2 transition-all duration-200 ${
                selectedWorkers.has(worker.id) 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-secondary-200 hover:border-secondary-300'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedWorkers.has(worker.id)}
                      onChange={() => handleWorkerSelect(worker.id)}
                      className="rounded border-secondary-300"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                        {worker.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`status-dot ${worker.status} pulse-indicator`} />
                        <span className={getStatusBadgeClass(worker.status)}>
                          {STATUS_OPTIONS.find(s => s.value === worker.status)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingWorker(worker)}
                      className="text-secondary-500 hover:text-secondary-700"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {worker.email && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <a href={`mailto:${worker.email}`} className="hover:text-primary-600">
                        {worker.email}
                      </a>
                    </div>
                  )}
                  
                  {worker.phone && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <a href={`tel:${worker.phone}`} className="hover:text-primary-600">
                        {worker.phone}
                      </a>
                    </div>
                  )}
                  
                  {worker.department && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <BuildingOffice2Icon className="h-4 w-4 mr-2" />
                      {worker.department}
                    </div>
                  )}
                  
                  {worker.location && (
                    <div className="flex items-center text-sm text-secondary-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Lat: {worker.location.lat.toFixed(4)}, Lng: {worker.location.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-secondary-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary-900">
                      {worker.assigned_tickets || activeTickets.length}
                    </div>
                    <div className="text-xs text-secondary-600">Active Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-secondary-900">
                      {workerTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length}
                    </div>
                    <div className="text-xs text-secondary-600">Completed</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/tickets?assigned_worker_id=${worker.id}`)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Tickets
                  </button>
                  
                  {worker.location && (
                    <button
                      onClick={() => {
                        // In a real app, this would open the map centered on the worker
                        navigate(`/map`);
                      }}
                      className="btn-secondary text-sm"
                    >
                      <MapPinIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAndSortedWorkers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-secondary-300" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No workers found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters to see more workers.'
              : 'Get started by adding your first worker.'
            }
          </p>
          {activeFiltersCount === 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Worker
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {workers.filter(w => w.status === 'online').length}
              </div>
              <div className="text-sm text-secondary-600">Online</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {workers.filter(w => w.status === 'busy').length}
              </div>
              <div className="text-sm text-secondary-600">Busy</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {workers.filter(w => w.status === 'offline').length}
              </div>
              <div className="text-sm text-secondary-600">Offline</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {workers.reduce((sum, w) => sum + (w.assigned_tickets || 0), 0)}
              </div>
              <div className="text-sm text-secondary-600">Total Assignments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}