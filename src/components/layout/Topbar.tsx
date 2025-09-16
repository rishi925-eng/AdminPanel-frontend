import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import socketService from '../../services/socket';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen for real-time notifications
    const handleTicketCreated = (ticket: any) => {
      const notification = {
        id: `ticket-${ticket.id}-${Date.now()}`,
        type: 'ticket.created',
        title: 'New Ticket Created',
        message: `New ${ticket.category} ticket reported`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep only 20 notifications
      setUnreadCount(prev => prev + 1);
    };

    const handleTicketUpdated = (ticket: any) => {
      const notification = {
        id: `ticket-update-${ticket.id}-${Date.now()}`,
        type: 'ticket.updated',
        title: 'Ticket Updated',
        message: `Ticket #${ticket.id} status changed to ${ticket.status}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);
    };

    socketService.on('ticket.created', handleTicketCreated);
    socketService.on('ticket.updated', handleTicketUpdated);

    return () => {
      socketService.off('ticket.created', handleTicketCreated);
      socketService.off('ticket.updated', handleTicketUpdated);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Page title - will be updated based on route */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold text-secondary-900">Dashboard</h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              <div className={clsx(
                'h-2 w-2 rounded-full',
                socketService.isConnected() ? 'bg-success-500' : 'bg-danger-500'
              )} />
              <span className="text-sm text-secondary-500">
                {socketService.isConnected() ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Notifications */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="relative p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100">
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-secondary-200">
                      <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-secondary-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <Menu.Item key={notification.id}>
                            {({ active }) => (
                              <div
                                className={clsx(
                                  'px-4 py-3 border-b border-secondary-100 last:border-b-0',
                                  active ? 'bg-secondary-50' : '',
                                  !notification.read ? 'bg-primary-50' : ''
                                )}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-secondary-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-secondary-500 mt-1">
                                      {notification.message}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="h-2 w-2 bg-primary-600 rounded-full ml-2 mt-1" />
                                  )}
                                </div>
                                <p className="text-xs text-secondary-400 mt-2">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                            )}
                          </Menu.Item>
                        ))
                      )}
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* User menu */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100">
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-secondary-700 hidden sm:block">
                    {user?.name}
                  </span>
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-secondary-200">
                      <p className="text-sm font-medium text-secondary-900">{user?.name}</p>
                      <p className="text-sm text-secondary-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm text-secondary-700',
                            active ? 'bg-secondary-100' : ''
                          )}
                        >
                          <UserCircleIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Profile
                        </a>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm text-secondary-700',
                            active ? 'bg-secondary-100' : ''
                          )}
                        >
                          <Cog6ToothIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={logout}
                          className={clsx(
                            'flex items-center w-full px-4 py-2 text-sm text-secondary-700',
                            active ? 'bg-secondary-100' : ''
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}