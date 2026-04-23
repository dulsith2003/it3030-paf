import React, { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';
import { getDefaultDashboardPath } from '../auth/roleRouting';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, loginWithGoogle, signin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const redirectTo = location.state?.from || getDefaultDashboardPath(user);
      navigate(redirectTo, { replace: true });
    }
  }, [loading, user, location, navigate]);

  async function handleSignIn(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const signedInUser = await signin({ email, password });
      const redirectTo = location.state?.from || getDefaultDashboardPath(signedInUser);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Signin failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-page-shell">
      <div className="login-orb login-orb-left" aria-hidden="true" />
      <div className="login-orb login-orb-right" aria-hidden="true" />

      <article className="login-panel panel">
        <div className="login-panel-left">
          <div className="login-panel-content">
            <h2 className="login-title">LOGIN</h2>
            <p className="login-subtitle">Sign in to continue to your Smart Campus workspace</p>

            <form className="form-grid" onSubmit={handleSignIn}>
              <label className="login-field-wrap">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Username or email"
                  required
                />
              </label>

              <label className="login-field-wrap">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  placeholder="Password"
                  required
                />
              </label>

              {error && <p className="error">{error}</p>}

              <div className="auth-actions login-actions">
                <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Login Now'}
                </button>
              </div>
            </form>

            <div className="social-block">
              <p className="social-title"><span>Login with Others</span></p>
              <button type="button" className="social-btn" onClick={loginWithGoogle}>
                <span className="social-logo google-logo" aria-hidden="true">G</span>
                <span>Login with Google</span>
              </button>
            </div>

            <p className="auth-footnote">
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </div>

        <div className="login-panel-right" aria-hidden="true">
          <div className="right-panel-glow" />
          <div className="right-panel-card">
            <h3>Smart Campus</h3>
            <p>Secure access for students, admins, and technicians.</p>
          </div>
        </div>
      </article>
    </section>
  );
}
