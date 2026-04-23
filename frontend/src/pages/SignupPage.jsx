import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';

const roleOptions = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth();
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
    <section className="login-page-shell signup-page-shell">
      <div className="login-orb login-orb-left" aria-hidden="true" />
      <div className="login-orb login-orb-right" aria-hidden="true" />

      <article className="login-panel panel">
        <div className="login-panel-left">
          <div className="login-panel-content">
            <h2 className="login-title">SIGN UP</h2>
            <p className="login-subtitle">Create your Smart Campus account to get started</p>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label className="login-field-wrap">
                <span className="sr-only">Display Name</span>
                <input
                  value={form.displayName}
                  onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                  placeholder="Display name"
                  required
                />
              </label>

              <label className="login-field-wrap">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  required
                />
              </label>

              <label className="login-field-wrap">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  required
                />
              </label>

              <label className="login-field-wrap">
                <span className="sr-only">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  required
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </label>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <div className="auth-actions login-actions">
                <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="social-block">
              <p className="social-title"><span>Or continue with</span></p>
              <button type="button" className="social-btn" onClick={loginWithGoogle}>
                <span className="social-logo google-logo" aria-hidden="true">G</span>
                <span>Sign up with Google</span>
              </button>
            </div>

            <p className="auth-footnote">
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="login-panel-right signup-panel-right" aria-hidden="true">
          <div className="right-panel-glow" />
          <div className="right-panel-card">
            <h3>Welcome Aboard</h3>
            <p>Manage campus services, alerts, and dashboards in one place.</p>
          </div>
        </div>
      </article>
    </section>
  );
}
