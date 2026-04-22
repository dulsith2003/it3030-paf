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
  const dashboardPath = getDefaultDashboardPath(user);
  const primaryRole = getPrimaryRole(user);

  const navItems = [
    { to: dashboardPath, label: 'Dashboard', isActive: location.pathname.startsWith('/dashboard') },
    { to: '/notifications', label: 'Notifications', isActive: location.pathname.startsWith('/notifications') }
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin/users', label: 'Admin Users', isActive: location.pathname.startsWith('/admin/users') });
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  }

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">⚡</span>
        <span>SmartCampus</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.to} className={item.isActive ? 'active' : ''} to={item.to}>
            {item.label}
          </Link>
        ))}

        {(isTechnician || isAdmin) && (
          <button type="button" className="sidebar-muted-item" disabled>
            Resources
          </button>
        )}
        <button type="button" className="sidebar-muted-item" disabled>
          Bookings
        </button>
        <button type="button" className="sidebar-muted-item" disabled>
          Incidents
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <strong>{user?.displayName || user?.email || 'Guest'}</strong>
          {primaryRole && <small>{primaryRole}</small>}
        </div>
        <button type="button" className="sidebar-help-btn" disabled>
          Help Support
        </button>
        <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
