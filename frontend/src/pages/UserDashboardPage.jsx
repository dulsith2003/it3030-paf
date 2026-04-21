import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';

export default function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <section className="panel">
      <h2>User Dashboard</h2>
      <p>Keep track of your campus updates and account details from one place.</p>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Notifications</h3>
          <p>Review your latest alerts and mark items as read when you are done.</p>
          <Link to="/notifications">Open Notifications</Link>
        </article>

        <article className="dashboard-card">
          <h3>Account summary</h3>
          <p>{user?.displayName || user?.email}</p>
          <p>Role: {user?.roles?.join(', ') || 'USER'}</p>
        </article>
      </div>
    </section>
  );
}