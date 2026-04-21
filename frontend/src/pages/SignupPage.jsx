import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';

const roleOptions = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await signup(form);
      setSuccess('Account created successfully. You can now sign in from the login page.');
      setForm({ displayName: '', email: '', password: '', role: 'USER' });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel login-panel">
      <h2>Create Account</h2>
      <p>Register with email/password to access Smart Campus.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Display name
          <input
            value={form.displayName}
            onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>

        <label>
          Role
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="auth-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="auth-footnote">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
