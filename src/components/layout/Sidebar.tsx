import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import {
  HomeIcon,
  TicketIcon,
  MapIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  TicketIcon as TicketSolid,
  MapIcon as MapSolid,
  UsersIcon as UsersSolid,
  BuildingOfficeIcon as BuildingOfficeSolid,
  ChartBarIcon as ChartBarSolid,
  Cog6ToothIcon as Cog6ToothSolid,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeSolid },
    { name: 'Tickets', href: '/tickets', icon: TicketIcon, iconSolid: TicketSolid },
    { name: 'Map View', href: '/map', icon: MapIcon, iconSolid: MapSolid },
    { name: 'Workers', href: '/workers', icon: UsersIcon, iconSolid: UsersSolid },
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, iconSolid: BuildingOfficeSolid },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, iconSolid: ChartBarSolid },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothSolid },
  ];

  const filteredNavigation = navigation.filter(item => {
    // Filter navigation based on user role
    if (user?.role === 'viewer') {
      return ['Dashboard', 'Tickets', 'Map View', 'Reports'].includes(item.name);
    }
    if (user?.role === 'worker') {
      return ['Dashboard', 'Tickets', 'Map View'].includes(item.name);
    }
    return true; // Admin and Super Admin see all
  });

  return (
    <div className="flex flex-col flex-1">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Logo and branding */}
      <div className="flex items-center flex-shrink-0 px-4 py-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-secondary-900">Civic Admin</h1>
            <p className="text-sm text-secondary-500">Issue Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                isActive
                  ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 flex-shrink-0 h-5 w-5',
                  isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="flex-shrink-0 border-t border-secondary-200 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 truncate capitalize">
              {user?.role?.replace('_', ' ') || 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}