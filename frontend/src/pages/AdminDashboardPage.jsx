import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <section className="student-dashboard dashboard-variant-admin">
      <div className="student-dashboard-head">
        <div>
          <h2>Admin Command Center</h2>
          <p>Manage user accounts, platform activity, and campus-wide communications.</p>
        </div>
        <Link className="report-incident-btn" to="/admin/users">
          + Manage Users
        </Link>
      </div>

      <div className="student-stats-grid">
        <article className="student-stat-card">
          <span className="student-stat-icon">👥</span>
          <p className="student-stat-label">Total Managed Users</p>
          <strong>0</strong>
        </article>
        <article className="student-stat-card">
          <span className="student-stat-icon">🔔</span>
          <p className="student-stat-label">System Notifications</p>
          <strong>0</strong>
        </article>
      </div>

      <div className="student-main-grid">
        <article className="student-support-card">
          <h3>User Administration</h3>
          <p>Review user accounts, assign access roles, and maintain platform integrity.</p>
          <Link to="/admin/users" className="support-link-btn">Open User Management</Link>
        </article>

        <article className="student-profile-card">
          <p className="profile-top-label">Active Profile</p>
          <div className="profile-role-box">
            <span>Access Level</span>
            <strong>
              <i aria-hidden="true" />
              ADMIN
            </strong>
          </div>
          <small>
            You can manage all users and monitor announcements from this dashboard.
          </small>
        </article>
      </div>

      <article className="student-tickets-card">
        <h3>Recent Admin Actions</h3>
        <p className="empty-ticket-copy">No recent actions</p>
        <Link to="/notifications">Open Notifications</Link>
      </article>
    </section>
  );
}
