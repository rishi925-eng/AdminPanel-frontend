import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className=\"h-screen bg-secondary-50 flex overflow-hidden\">
      {/* Desktop sidebar */}
      <div className=\"hidden md:flex md:w-64 md:flex-col\">
        <div className=\"flex flex-col flex-grow border-r border-secondary-200 bg-white overflow-y-auto\">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className=\"fixed inset-0 z-40 flex md:hidden\">
          <div 
            className=\"fixed inset-0 bg-secondary-600 bg-opacity-75\" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className=\"relative flex-1 flex flex-col max-w-xs w-full bg-white\">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className=\"flex flex-col flex-1 overflow-hidden\">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className=\"flex-1 relative overflow-y-auto focus:outline-none\">
          <div className=\"py-6\">
            <div className=\"max-w-7xl mx-auto px-4 sm:px-6 md:px-8\">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}