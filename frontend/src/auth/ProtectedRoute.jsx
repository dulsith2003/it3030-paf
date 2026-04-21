import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="panel">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length > 0) {
    const allowed = roles.some((role) => user.roles?.includes(role));
    if (!allowed) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children;
}
