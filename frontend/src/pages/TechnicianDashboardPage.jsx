import React from 'react';
import { Link } from 'react-router-dom';

export default function TechnicianDashboardPage() {
  return (
    <section className="student-dashboard dashboard-variant-tech">
      <div className="student-dashboard-head">
        <div>
          <h2>Technician Hub</h2>
          <p>Track service requests, incidents, and technical alerts from one place.</p>
        </div>
        <Link className="report-incident-btn" to="/notifications">
          + Open Work Queue
        </Link>
      </div>

      <div className="student-stats-grid">
        <article className="student-stat-card">
          <span className="student-stat-icon">🛠️</span>
          <p className="student-stat-label">Assigned Tasks</p>
          <strong>0</strong>
        </article>
        <article className="student-stat-card">
          <span className="student-stat-icon">⚠️</span>
          <p className="student-stat-label">Open Incidents</p>
          <strong>0</strong>
        </article>
      </div>

      <div className="student-main-grid">
        <article className="student-support-card">
          <h3>Work Queue</h3>
          <p>Review incoming system notices and resolve maintenance issues efficiently.</p>
          <Link to="/notifications" className="support-link-btn">Open Notifications</Link>
        </article>

        <article className="student-profile-card">
          <p className="profile-top-label">Active Profile</p>
          <div className="profile-role-box">
            <span>Access Level</span>
            <strong>
              <i aria-hidden="true" />
              TECHNICIAN
            </strong>
          </div>
          <small>
            This view is optimized for active service work and technical issue tracking.
          </small>
        </article>
      </div>

      <article className="student-tickets-card">
        <h3>Service Notes</h3>
        <p className="empty-ticket-copy">No unresolved items</p>
        <Link to="/notifications">Go to Service Feed</Link>
      </article>
    </section>
  );
}
