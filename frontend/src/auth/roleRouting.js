const ROLE_PRIORITY = ['ADMIN', 'TECHNICIAN', 'USER'];

const DASHBOARD_ROUTES = {
  USER: '/dashboard/user',
  ADMIN: '/dashboard/admin',
  TECHNICIAN: '/dashboard/technician'
};

const DASHBOARD_LABELS = {
  USER: 'User Dashboard',
  ADMIN: 'Admin Dashboard',
  TECHNICIAN: 'Technician Dashboard'
};

export function getPrimaryRole(user) {
  if (!user?.roles) {
    return null;
  }

  return ROLE_PRIORITY.find((role) => user.roles.includes(role)) || null;
}

export function getDashboardPathForRole(role) {
  return DASHBOARD_ROUTES[role] || '/login';
}

export function getDashboardLabelForUser(user) {
  const role = getPrimaryRole(user);
  return role ? DASHBOARD_LABELS[role] : 'Dashboard';
}

export function getDefaultDashboardPath(user) {
  const role = getPrimaryRole(user);
  return role ? DASHBOARD_ROUTES[role] : '/login';
}
