import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <section className="panel">
      <h2>Admin Dashboard</h2>
      <p>Manage platform users, monitor updates, and publish announcements.</p>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>User Administration</h3>
          <p>Review user accounts and manage access roles.</p>
          <Link to="/admin/users">Open User Management</Link>
        </article>

        <article className="dashboard-card">
          <h3>Notifications</h3>
          <p>Broadcast and manage all notification records.</p>
          <Link to="/notifications">Open Notifications</Link>
        </article>
      </div>
    </section>
  );
}
