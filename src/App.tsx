import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Placeholder components for routes not yet implemented
function TicketsPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Tickets Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function MapPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Map Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function WorkersPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Workers Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function DepartmentsPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Departments Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function ReportsPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Reports Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-secondary-900 mb-4">Settings Page</h2>
      <p className="text-secondary-600">Coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:id" element={<div>Ticket Detail - Coming Soon</div>} />
              <Route path="map" element={<MapPage />} />
              <Route path="workers" element={<WorkersPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
