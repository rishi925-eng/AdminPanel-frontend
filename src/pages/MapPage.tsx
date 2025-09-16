import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import socketService from '../services/socket';
import type { ServiceRequest, Department, Hotspot } from '../types';
import LeafletMap from '../components/map/LeafletMap';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  MapPinIcon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'triaged', label: 'Triaged', color: 'yellow' },
  { value: 'assigned', label: 'Assigned', color: 'purple' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
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

export default function MapPage() {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ServiceRequest | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    department: '',
    search: '',
    dateRange: 7, // days
    showHotspots: false,
  });

  useEffect(() => {
    fetchMapData();
    setupRealtimeUpdates();
    
    return () => {
      socketService.off('ticket.created');
      socketService.off('ticket.updated');
    };
  }, []);

  useEffect(() => {
    fetchTicketsWithFilters();
  }, [filters]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, deptData, hotspotsData] = await Promise.all([
        apiService.getTickets({ limit: 1000 }).catch(() => ({ items: [] })),
        apiService.getDepartments().catch(() => []),
        apiService.getTicketHotspots().catch(() => [])
      ]);
      
      const ticketsData = ticketsResponse.items || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setDepartments(deptData);
      setHotspots(hotspotsData);
      setError('');
    } catch (err: any) {
      setError('Failed to load map data');
      console.error('Map data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsWithFilters = async () => {
    if (loading) return; // Don't refetch during initial load
    
    try {
      const filterParams: any = {
        limit: 1000
      };
      
      if (filters.status) filterParams.status = filters.status;
      if (filters.category) filterParams.category = filters.category;
      if (filters.department) filterParams.department = filters.department;
      if (filters.search) filterParams.q = filters.search;
      
      // Date range filter
      if (filters.dateRange > 0) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - filters.dateRange);
        filterParams.from = fromDate.toISOString().split('T')[0];
      }
      
      const response = await apiService.getTickets(filterParams);
      const ticketsData = response.items || response.data || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error('Filter tickets error:', err);
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
      
      if (selectedTicket && selectedTicket.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
      }
    });
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      department: '',
      search: '',
      dateRange: 7,
      showHotspots: false,
    });
  };

  const handleTicketClick = (ticket: ServiceRequest) => {
    setSelectedTicket(ticket);
  };


  const getFilteredTickets = () => {
    return tickets.filter(ticket => {
      // Apply client-side filters for real-time data
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.category && ticket.category !== filters.category) return false;
      if (filters.department && ticket.assigned_dept !== filters.department) return false;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !ticket.description.toLowerCase().includes(searchLower) &&
          !ticket.category.toLowerCase().includes(searchLower) &&
          !(ticket.assigned_dept && ticket.assigned_dept.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredTickets = getFilteredTickets();
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value !== 7;
    if (key === 'showHotspots') return value === true;
    return value && value !== '';
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading map data..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Map View</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Geographic view of civic issue reports ({filteredTickets.length} visible)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/tickets')}
            className="btn-secondary"
          >
            <ListBulletIcon className="h-4 w-4 mr-2" />
            List View
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-secondary"
          >
            {sidebarOpen ? (
              <ArrowsPointingInIcon className="h-4 w-4" />
            ) : (
              <ArrowsPointingOutIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
            <button
              onClick={fetchMapData}
              className="ml-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
          <div className="w-80 bg-white rounded-lg shadow h-full flex flex-col">
            {/* Filters */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-sm px-2 py-1 rounded ${activeFiltersCount > 0 ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:text-secondary-900'}`}
                >
                  <FunnelIcon className="h-4 w-4 inline mr-1" />
                  {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>

              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full pl-9 pr-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {showFilters && (
                  <>
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-secondary-700 mb-1">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.status}
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

                    {/* Category Filter */}
                    <div>
                      <label className="block text-xs font-medium text-secondary-700 mb-1">
                        Category
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.category}
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

                    {/* Department Filter */}
                    <div>
                      <label className="block text-xs font-medium text-secondary-700 mb-1">
                        Department
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-secondary-700 mb-1">
                        Date Range
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.dateRange}
                        onChange={(e) => handleFilterChange('dateRange', Number(e.target.value))}
                      >
                        <option value={0}>All Time</option>
                        <option value={1}>Last 24 hours</option>
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                      </select>
                    </div>

                    {/* Show Hotspots */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showHotspots"
                        checked={filters.showHotspots}
                        onChange={(e) => handleFilterChange('showHotspots', e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="showHotspots" className="ml-2 text-sm text-secondary-700">
                        Show hotspots
                      </label>
                    </div>

                    <button
                      onClick={clearFilters}
                      className="w-full btn-secondary text-sm"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Clear Filters
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-secondary-900 mb-3">
                  Recent Tickets ({filteredTickets.length})
                </h3>
                <div className="space-y-2">
                  {filteredTickets.slice(0, 50).map(ticket => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-secondary-200 hover:bg-secondary-50'
                      }`}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-secondary-500">
                          #{ticket.id}
                        </span>
                        <StatusBadge status={ticket.status} size="sm" />
                      </div>
                      <h4 className="text-sm font-medium text-secondary-900 mb-1">
                        {ticket.category}
                      </h4>
                      <p className="text-xs text-secondary-600 line-clamp-2 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-secondary-500">
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {format(new Date(ticket.created_at), 'MMM d, HH:mm')}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tickets/${ticket.id}`);
                          }}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <EyeIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-8">
                      <MapPinIcon className="mx-auto h-8 w-8 text-secondary-300 mb-2" />
                      <p className="text-sm text-secondary-500">No tickets found</p>
                      <p className="text-xs text-secondary-400">
                        Try adjusting your filters
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 ml-4">
          <div className="bg-white rounded-lg shadow h-full overflow-hidden">
            <LeafletMap
              tickets={filteredTickets}
              hotspots={filters.showHotspots ? hotspots : []}
              height="100%"
              selectedTicket={selectedTicket}
              onTicketClick={handleTicketClick}
              onTicketSelect={setSelectedTicket}
              className="rounded-lg"
            />
            
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
              <h4 className="text-xs font-medium text-secondary-900 mb-2">Legend</h4>
              <div className="space-y-1">
                {STATUSES.map(status => (
                  <div key={status.value} className="flex items-center text-xs">
                    <div 
                      className={`w-3 h-3 rounded-full mr-2 bg-${status.color}-500`}
                    />
                    <span className="text-secondary-600">{status.label}</span>
                  </div>
                ))}
                {filters.showHotspots && (
                  <div className="flex items-center text-xs pt-1 border-t border-secondary-200">
                    <div className="w-3 h-3 rounded-full mr-2 bg-red-600 opacity-60" />
                    <span className="text-secondary-600">Hotspots</span>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Ticket Panel */}
            {selectedTicket && (
              <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-lg p-4 z-[1000] max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-secondary-900">
                    Ticket #{selectedTicket.id}
                  </h3>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-secondary-700">Category</span>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <p className="text-sm text-secondary-900">{selectedTicket.category}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Description</span>
                    <p className="text-sm text-secondary-600 mt-1">{selectedTicket.description}</p>
                  </div>
                  
                  {selectedTicket.assigned_dept && (
                    <div>
                      <span className="text-sm font-medium text-secondary-700">Assigned to</span>
                      <p className="text-sm text-secondary-600 mt-1">{selectedTicket.assigned_dept}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Created</span>
                    <p className="text-sm text-secondary-600 mt-1">
                      {format(new Date(selectedTicket.created_at), 'PPpp')}
                    </p>
                  </div>
                  
                  {selectedTicket.photo_url && (
                    <div>
                      <span className="text-sm font-medium text-secondary-700">Photo</span>
                      <img 
                        src={selectedTicket.photo_url} 
                        alt="Ticket photo"
                        className="mt-1 w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-secondary-200">
                    <button
                      onClick={() => navigate(`/tickets/${selectedTicket.id}`)}
                      className="w-full btn-primary text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}