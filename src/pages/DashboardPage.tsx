import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import socketService from '../services/socket';
import { ServiceRequest, Analytics } from '../types';
import LeafletMap from '../components/map/LeafletMap';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentTickets, setRecentTickets] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    setupRealtimeUpdates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ticketsResponse, analyticsData] = await Promise.all([
        apiService.getTickets({ limit: 100 }),
        apiService.getAnalytics()
      ]);

      const ticketsData = ticketsResponse.items || [];
      setTickets(ticketsData);
      setAnalytics(analyticsData);
      setRecentTickets(ticketsData.slice(0, 10));
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    socketService.on('ticket.created', (newTicket) => {
      setTickets(prev => [newTicket, ...prev]);
      setRecentTickets(prev => [newTicket, ...prev.slice(0, 9)]);
      // Update analytics
      setAnalytics(prev => prev ? {
        ...prev,
        total_tickets: prev.total_tickets + 1,
        pending_tickets: prev.pending_tickets + 1
      } : null);
    });

    socketService.on('ticket.updated', (updatedTicket) => {
      setTickets(prev => prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
      setRecentTickets(prev => prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
    });
  };

  const getStatusCount = (status: string) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOverdueTickets = () => {
    const now = new Date();
    return tickets.filter(ticket => 
      ticket.sla_due && 
      new Date(ticket.sla_due) < now && 
      !['resolved', 'closed'].includes(ticket.status)
    );
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <LoadingSpinner size=\"lg\" text=\"Loading dashboard...\" />
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"text-center py-12\">
        <ExclamationTriangleIcon className=\"mx-auto h-12 w-12 text-danger-400\" />
        <h3 className=\"mt-2 text-sm font-medium text-secondary-900\">Error Loading Dashboard</h3>
        <p className=\"mt-1 text-sm text-secondary-500\">{error}</p>
        <button
          onClick={fetchDashboardData}
          className=\"mt-4 btn-primary\"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overdueTickets = getOverdueTickets();

  const stats = [
    {
      name: 'Total Tickets',
      value: analytics?.total_tickets || tickets.length,
      icon: TicketIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Pending',
      value: getStatusCount('submitted') + getStatusCount('triaged'),
      icon: ClockIcon,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      name: 'In Progress',
      value: getStatusCount('assigned') + getStatusCount('in_progress'),
      icon: ClockIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'Resolved',
      value: getStatusCount('resolved') + getStatusCount('closed'),
      icon: CheckCircleIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      name: 'Overdue',
      value: overdueTickets.length,
      icon: ExclamationTriangleIcon,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    }
  ];

  return (
    <div className=\"space-y-6\">
      {/* Page Header */}
      <div>
        <h1 className=\"text-2xl font-bold text-secondary-900\">Dashboard</h1>
        <p className=\"mt-1 text-sm text-secondary-600\">
          Overview of civic issue reports and system status
        </p>
      </div>

      {/* Statistics */}
      <div className=\"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5\">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className=\"card\">
              <div className=\"flex items-center\">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className=\"ml-4\">
                  <p className=\"text-sm font-medium text-secondary-600\">{stat.name}</p>
                  <p className=\"text-2xl font-semibold text-secondary-900\">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Map */}
        <div className=\"lg:col-span-2\">
          <div className=\"card\">
            <div className=\"flex items-center justify-between mb-4\">
              <h2 className=\"text-lg font-semibold text-secondary-900\">
                Recent Reports Map
              </h2>
              <button
                onClick={() => navigate('/map')}
                className=\"btn-secondary text-sm\"
              >
                <MapPinIcon className=\"h-4 w-4 mr-1\" />
                Full Map
              </button>
            </div>
            <LeafletMap
              tickets={tickets.slice(0, 50)} // Show recent 50 tickets
              height=\"400px\"
              onTicketClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
            />
          </div>
        </div>

        {/* Recent Tickets */}
        <div className=\"lg:col-span-1\">
          <div className=\"card\">
            <div className=\"flex items-center justify-between mb-4\">
              <h2 className=\"text-lg font-semibold text-secondary-900\">
                Recent Tickets
              </h2>
              <button
                onClick={() => navigate('/tickets')}
                className=\"text-sm text-primary-600 hover:text-primary-800\"
              >
                View all
              </button>
            </div>
            <div className=\"space-y-3 max-h-96 overflow-y-auto scrollbar-thin\">
              {recentTickets.length === 0 ? (
                <div className=\"text-center py-8 text-secondary-500\">
                  <TicketIcon className=\"mx-auto h-12 w-12 text-secondary-300\" />
                  <p className=\"mt-2 text-sm\">No tickets yet</p>
                </div>
              ) : (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className=\"p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 cursor-pointer transition-colors\"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className=\"flex items-start justify-between\">
                      <div className=\"flex-1 min-w-0\">
                        <h3 className=\"text-sm font-medium text-secondary-900 truncate\">
                          {ticket.category}
                        </h3>
                        <p className=\"text-xs text-secondary-500 mt-1 line-clamp-2\">
                          {ticket.description}
                        </p>
                        <div className=\"flex items-center mt-2 space-x-2\">
                          <StatusBadge status={ticket.status} size=\"sm\" />
                          <span className=\"text-xs text-secondary-400\">
                            #{ticket.id}
                          </span>
                        </div>
                      </div>
                      <div className=\"ml-2 text-xs text-secondary-400 text-right\">
                        <div className=\"flex items-center\">
                          <CalendarDaysIcon className=\"h-3 w-3 mr-1\" />
                          {formatDate(ticket.created_at)}
                        </div>
                        {ticket.assigned_dept && (
                          <div className=\"mt-1 text-xs text-primary-600\">
                            {ticket.assigned_dept}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tickets Alert */}
      {overdueTickets.length > 0 && (
        <div className=\"bg-danger-50 border border-danger-200 rounded-lg p-4\">
          <div className=\"flex items-center\">
            <ExclamationTriangleIcon className=\"h-5 w-5 text-danger-400 mr-2\" />
            <h3 className=\"text-sm font-medium text-danger-800\">
              {overdueTickets.length} Overdue Ticket{overdueTickets.length > 1 ? 's' : ''}
            </h3>
          </div>
          <p className=\"text-sm text-danger-700 mt-1\">
            These tickets have passed their SLA deadline and need immediate attention.
          </p>
          <button
            onClick={() => navigate('/tickets?status=overdue')}
            className=\"mt-2 btn-danger text-sm\"
          >
            View Overdue Tickets
          </button>
        </div>
      )}

      {/* Performance Summary */}
      {analytics && (
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
          <div className=\"card text-center\">
            <h3 className=\"text-lg font-semibold text-secondary-900 mb-2\">
              Resolution Rate
            </h3>
            <div className=\"text-3xl font-bold text-success-600\">
              {Math.round((analytics.resolved_tickets / analytics.total_tickets) * 100) || 0}%
            </div>
            <p className=\"text-sm text-secondary-500 mt-1\">
              {analytics.resolved_tickets} of {analytics.total_tickets} resolved
            </p>
          </div>
          
          <div className=\"card text-center\">
            <h3 className=\"text-lg font-semibold text-secondary-900 mb-2\">
              Avg Resolution Time
            </h3>
            <div className=\"text-3xl font-bold text-primary-600\">
              {Math.round(analytics.avg_resolution_time / 24) || 0}d
            </div>
            <p className=\"text-sm text-secondary-500 mt-1\">
              Average time to resolve
            </p>
          </div>
          
          <div className=\"card text-center\">
            <h3 className=\"text-lg font-semibold text-secondary-900 mb-2\">
              SLA Performance
            </h3>
            <div className={`text-3xl font-bold ${analytics.sla_performance >= 80 ? 'text-success-600' : 'text-warning-600'}`}>
              {Math.round(analytics.sla_performance) || 0}%
            </div>
            <p className=\"text-sm text-secondary-500 mt-1\">
              Tickets resolved on time
            </p>
          </div>
        </div>
      )}
    </div>
  );
}