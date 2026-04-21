import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { getDashboardLabelForUser, getDefaultDashboardPath, getPrimaryRole } from '../auth/roleRouting';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.roles?.includes('ADMIN');
  const isTechnician = user?.roles?.includes('TECHNICIAN');
  const isUser = user?.roles?.includes('USER') || (!isAdmin && !isTechnician);
  const dashboardPath = getDefaultDashboardPath(user);
  const dashboardLabel = getDashboardLabelForUser(user);
  const primaryRole = getPrimaryRole(user);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  }

  return (
    <header className="topbar">
      <h1>Smart Campus Portal</h1>
      <nav>
        {user ? (
          <>
            <Link className={location.pathname.startsWith('/dashboard') ? 'active' : ''} to={dashboardPath}>
              {dashboardLabel}
            </Link>
            {(isUser || isTechnician || isAdmin) && (
              <Link className={location.pathname.startsWith('/notifications') ? 'active' : ''} to="/notifications">
                Notifications
              </Link>
            )}
            {isAdmin && (
              <Link className={location.pathname.startsWith('/admin/users') ? 'active' : ''} to="/admin/users">
                Admin Users
              </Link>
            )}
          </>
        ) : (
          <>
            <Link className={location.pathname.startsWith('/login') ? 'active' : ''} to="/login">
              Login
            </Link>
            <Link className={location.pathname.startsWith('/signup') ? 'active' : ''} to="/signup">
              Signup
            </Link>
          </>
        )}
      </nav>
      <div className="user-block">
        {user ? (
          <>
            <span>{user.displayName || user.email}</span>
            {primaryRole && <small>{primaryRole}</small>}
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </header>
  );
}
