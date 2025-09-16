import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import type { Department, Worker, ServiceRequest } from '../types';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatusBadge from '../components/shared/StatusBadge';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  TicketIcon,
  ClockIcon,
  // CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  // MapPinIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function DepartmentsPage() {
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tickets, setTickets] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      const [deptData, workersData, ticketsResponse] = await Promise.all([
        apiService.getDepartments(),
        apiService.getWorkers().catch(() => []),
        apiService.getTickets({ limit: 1000 }).catch(() => ({ items: [] }))
      ]);
      
      setDepartments(deptData);
      setWorkers(workersData);
      const ticketsData = ticketsResponse.items || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setError('');
    } catch (err: any) {
      setError('Failed to load departments data');
      console.error('Departments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentWorkers = (deptName: string) => {
    return workers.filter(worker => worker.department === deptName);
  };

  const getDepartmentTickets = (deptName: string) => {
    return tickets.filter(ticket => ticket.assigned_dept === deptName);
  };

  const getDepartmentStats = (deptName: string) => {
    const deptTickets = getDepartmentTickets(deptName);
    const deptWorkers = getDepartmentWorkers(deptName);
    
    return {
      total_tickets: deptTickets.length,
      active_tickets: deptTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
      resolved_tickets: deptTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
      overdue_tickets: deptTickets.filter(t => 
        t.sla_due && 
        new Date(t.sla_due) < new Date() && 
        !['resolved', 'closed'].includes(t.status)
      ).length,
      online_workers: deptWorkers.filter(w => w.status === 'online').length,
      total_workers: deptWorkers.length,
      avg_response_time: Math.floor(Math.random() * 24) + 1, // Mock data
      sla_compliance: Math.floor(Math.random() * 20) + 80, // Mock data
    };
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const overallStats = {
    total_departments: departments.length,
    total_workers: workers.length,
    online_workers: workers.filter(w => w.status === 'online').length,
    total_tickets: tickets.length,
    active_tickets: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading departments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Departments</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage departments and their workforce ({departments.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Analytics
          </button>
          <button className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <BuildingOffice2Icon className="w-4 h-4 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {overallStats.total_departments}
              </div>
              <div className="text-sm text-secondary-600">Departments</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {overallStats.total_workers}
              </div>
              <div className="text-sm text-secondary-600">Total Workers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full pulse-indicator"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {overallStats.online_workers}
              </div>
              <div className="text-sm text-secondary-600">Online Workers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TicketIcon className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {overallStats.total_tickets}
              </div>
              <div className="text-sm text-secondary-600">Total Tickets</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-secondary-900">
                {overallStats.active_tickets}
              </div>
              <div className="text-sm text-secondary-600">Active Tickets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-secondary-400" />
          <input
            type="text"
            placeholder="Search departments..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            {error}
            <button
              onClick={fetchDepartmentsData}
              className="ml-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDepartments.map((department) => {
          const stats = getDepartmentStats(department.name);
          const deptWorkers = getDepartmentWorkers(department.name);
          const deptTickets = getDepartmentTickets(department.name);
          const recentTickets = deptTickets.slice(0, 5);

          return (
            <div key={department.id} className="bg-white rounded-lg shadow border border-secondary-200">
              {/* Department Header */}
              <div className="p-6 border-b border-secondary-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BuildingOffice2Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {department.name}
                        </h3>
                        <p className="text-sm text-secondary-600">
                          {department.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-secondary-500 hover:text-secondary-700">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-danger-500 hover:text-danger-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-secondary-900">
                      {stats.total_workers}
                    </div>
                    <div className="text-xs text-secondary-600">Workers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {stats.online_workers}
                    </div>
                    <div className="text-xs text-secondary-600">Online</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-secondary-900">
                      {stats.total_tickets}
                    </div>
                    <div className="text-xs text-secondary-600">Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${stats.overdue_tickets > 0 ? 'text-danger-600' : 'text-secondary-900'}`}>
                      {stats.overdue_tickets}
                    </div>
                    <div className="text-xs text-secondary-600">Overdue</div>
                  </div>
                </div>
              </div>

              {/* Department Content */}
              <div className="p-6 space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">Performance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">SLA Compliance</span>
                        <span className={`text-sm font-medium ${
                          stats.sla_compliance >= 90 ? 'text-green-600' :
                          stats.sla_compliance >= 80 ? 'text-orange-600' : 'text-danger-600'
                        }`}>
                          {stats.sla_compliance}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            stats.sla_compliance >= 90 ? 'bg-green-500' :
                            stats.sla_compliance >= 80 ? 'bg-orange-500' : 'bg-danger-500'
                          }`}
                          style={{ width: `${stats.sla_compliance}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-secondary-600">Avg Response</span>
                        <span className="text-sm font-medium text-secondary-900">
                          {stats.avg_response_time}h
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <ClockIcon className="h-3 w-3 text-secondary-400 mr-1" />
                        <span className="text-xs text-secondary-500">
                          Last 30 days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workers Preview */}
                {deptWorkers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-secondary-900">Workers</h4>
                      <button
                        onClick={() => navigate(`/workers?department=${encodeURIComponent(department.name)}`)}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View All ({deptWorkers.length})
                      </button>
                    </div>
                    <div className="space-y-2">
                      {deptWorkers.slice(0, 3).map(worker => (
                        <div key={worker.id} className="flex items-center space-x-3 p-2 bg-secondary-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-secondary-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {worker.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`status-dot ${worker.status}`} />
                              <span className="text-xs text-secondary-500 capitalize">
                                {worker.status}
                              </span>
                              {worker.assigned_tickets && worker.assigned_tickets > 0 && (
                                <span className="text-xs text-secondary-500">
                                  • {worker.assigned_tickets} tickets
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {deptWorkers.length > 3 && (
                        <div className="text-xs text-secondary-500 text-center py-1">
                          +{deptWorkers.length - 3} more workers
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Tickets */}
                {recentTickets.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-secondary-900">Recent Tickets</h4>
                      <button
                        onClick={() => navigate(`/tickets?department=${encodeURIComponent(department.name)}`)}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View All ({deptTickets.length})
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentTickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center space-x-3 p-2 bg-secondary-50 rounded-lg">
                          <StatusBadge status={ticket.status} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {ticket.category}
                            </p>
                            <p className="text-xs text-secondary-500">
                              #{ticket.id} • {format(new Date(ticket.created_at), 'MMM d')}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="text-secondary-500 hover:text-secondary-700"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-secondary-200">
                  <button
                    onClick={() => navigate(`/tickets?department=${encodeURIComponent(department.name)}`)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <TicketIcon className="h-4 w-4 mr-1" />
                    Manage Tickets
                  </button>
                  <button
                    onClick={() => navigate(`/workers?department=${encodeURIComponent(department.name)}`)}
                    className="btn-secondary flex-1 text-sm"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    Manage Workers
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOffice2Icon className="mx-auto h-12 w-12 text-secondary-300" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No departments found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchQuery 
              ? 'Try adjusting your search terms.'
              : 'Get started by creating your first department.'
            }
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <button className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Department
              </button>
            </div>
          )}
        </div>
      )}

      {/* Department Workload Distribution */}
      {departments.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Workload Distribution</h3>
            <p className="text-sm text-secondary-600">Active tickets by department</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {departments.map(dept => {
                const stats = getDepartmentStats(dept.name);
                const maxTickets = Math.max(...departments.map(d => getDepartmentStats(d.name).active_tickets));
                const percentage = maxTickets > 0 ? (stats.active_tickets / maxTickets) * 100 : 0;
                
                return (
                  <div key={dept.id} className="flex items-center space-x-4">
                    <div className="w-24 text-sm text-secondary-600 truncate">
                      {dept.name}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-secondary-200 rounded-full h-3">
                          <div 
                            className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-secondary-900 w-8">
                          {stats.active_tickets}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-secondary-500">
                      {stats.online_workers}/{stats.total_workers} online
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}