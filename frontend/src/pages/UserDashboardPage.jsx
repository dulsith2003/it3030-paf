import React from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <section className="student-dashboard">
      <div className="student-dashboard-head">
        <div>
          <h2>Student Hub</h2>
          <p>Hello {displayName}, here&apos;s your prioritized view for today.</p>
        </div>
        <Link className="report-incident-btn" to="/notifications">
          + Report New Incident
        </Link>
      </div>

      <div className="student-stats-grid">
        <article className="student-stat-card">
          <span className="student-stat-icon">🎟️</span>
          <p className="student-stat-label">Incident Tickets</p>
          <strong>0</strong>
        </article>
        <article className="student-stat-card">
          <span className="student-stat-icon">ⓘ</span>
          <p className="student-stat-label">Open Issues</p>
          <strong>0</strong>
        </article>
      </div>

      <div className="student-main-grid">
        <article className="student-support-card">
          <h3>Campus Support</h3>
          <p>Report maintenance issues in your dorm or classroom and track progress in real-time.</p>
          <Link to="/notifications" className="support-link-btn">My Reported Tickets</Link>
        </article>

        <article className="student-profile-card">
          <p className="profile-top-label">Active Profile</p>
          <div className="profile-role-box">
            <span>Access Level</span>
            <strong>
              <i aria-hidden="true" />
              USER
            </strong>
          </div>
          <small>
            You are currently viewing the system as a user. Switch profiles in the header to see other dashboard views.
          </small>
        </article>
      </div>

      <article className="student-tickets-card">
        <h3>Active Tickets</h3>
        <p className="empty-ticket-copy">No active tickets</p>
        <Link to="/notifications">View All</Link>
      </article>

      <p className="student-footer-note">© 2026 Smart Campus Operations Hub • FAP Assignment</p>
    </section>
  );
}