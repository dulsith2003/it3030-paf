import React from 'react';
import { Link } from 'react-router-dom';

export default function TechnicianDashboardPage() {
  return (
    <section className="panel">
      <h2>Technician Dashboard</h2>
      <p>Track campus service tasks and technical alerts in one place.</p>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Work Queue</h3>
          <p>Review current system notices and maintenance updates.</p>
          <Link to="/notifications">Open Notifications</Link>
        </article>

        <article className="dashboard-card">
          <h3>Service Notes</h3>
          <p>Use notifications to mark resolved technical events.</p>
          <Link to="/notifications">Go to Service Feed</Link>
        </article>
      </div>
    </section>
  );
}
