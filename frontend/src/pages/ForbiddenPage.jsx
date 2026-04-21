import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { getDefaultDashboardPath } from '../auth/roleRouting';

export default function ForbiddenPage() {
  const { user } = useAuth();

  return (
    <section className="panel">
      <h2>Access denied</h2>
      <p>You do not have a role that can access this route.</p>
      <Link to={getDefaultDashboardPath(user)}>Back to dashboard</Link>
    </section>
  );
}
