import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { useAuth } from './auth/AuthProvider';
import { getDefaultDashboardPath } from './auth/roleRouting';
import NavBar from './components/NavBar';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import UserDashboardPage from './pages/UserDashboardPage';

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="panel">Loading session...</div>;
  }

  return <Navigate to={getDefaultDashboardPath(user)} replace />;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  const hideHeaderOnAuthPages = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`app-shell ${hideHeaderOnAuthPages ? 'auth-layout' : 'workspace-layout'}`}>
      {!hideHeaderOnAuthPages && <NavBar />}
      <main className={`page-wrap ${hideHeaderOnAuthPages ? '' : 'workspace-content'}`}>
        {!hideHeaderOnAuthPages && (
          <header className="workspace-topbar">
            <div className="workspace-search">Search for resources, tickets...</div>
            <div className="workspace-user-chip">
              <span className="workspace-user-avatar">{(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{user?.displayName || user?.email || 'User'}</strong>
              </div>
            </div>
          </header>
        )}
        <Routes>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute roles={["USER"]}>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/technician"
            element={
              <ProtectedRoute roles={["TECHNICIAN"]}>
                <TechnicianDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={["USER", "ADMIN", "TECHNICIAN"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
