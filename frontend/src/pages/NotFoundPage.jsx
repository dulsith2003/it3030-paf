import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="panel">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/notifications">Go to app</Link>
    </section>
  );
}
