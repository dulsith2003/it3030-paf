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
    <section className="panel login-panel">
      <h2>Welcome Back</h2>
      <p>Sign in with your account or continue with Google.</p>

      <form className="form-grid" onSubmit={handleSignIn}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="auth-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
          <button type="button" className="secondary" onClick={loginWithGoogle}>
            Continue with Google
          </button>
        </div>
      </form>

      <p className="auth-footnote">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}
