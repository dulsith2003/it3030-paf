import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { getDefaultDashboardPath, getPrimaryRole } from '../auth/roleRouting';

export default function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isAdmin = user?.roles?.includes('ADMIN');
  const isTechnician = user?.roles?.includes('TECHNICIAN');
  const dashboardPath = getDefaultDashboardPath(user);
  const primaryRole = getPrimaryRole(user);

  const navItems = [
    { to: dashboardPath, label: 'Dashboard', isActive: location.pathname.startsWith('/dashboard') },
    { to: '/notifications', label: 'Notifications', isActive: location.pathname.startsWith('/notifications') },
    { to: '/booking-form', label: 'Booking Form', isActive: location.pathname.startsWith('/booking-form') },
    { to: '/my-bookings', label: 'My Bookings', isActive: location.pathname.startsWith('/my-bookings') }
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin/users', label: 'Admin Users', isActive: location.pathname.startsWith('/admin/users') });
    navItems.push({ to: '/admin-bookings', label: 'Admin Bookings', isActive: location.pathname.startsWith('/admin-bookings') });
  }

  async function handleLogout() {
    await logout();
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
          <Link className={location.pathname.startsWith('/resources') ? 'active' : ''} to="/resources">
            Resources
          </Link>
        )}
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
