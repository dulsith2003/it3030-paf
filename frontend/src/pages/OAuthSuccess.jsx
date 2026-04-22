import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthProvider';

const AUTH_STORAGE_KEY = 'smartcampus-user';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState('Completing sign in...');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function finalizeLogin() {
      try {
        const user = await apiFetch('/api/auth/me');
        if (!active) {
          return;
        }

        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setUser(user);
        setStatus('Login complete. Redirecting to your dashboard...');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || 'Unable to complete Google sign in');
        setStatus('');
      }
    }

    finalizeLogin();

    return () => {
      active = false;
    };
  }, [navigate, setUser]);

  return (
    <section className="login-page-shell">
      <div className="login-orb login-orb-left" aria-hidden="true" />
      <div className="login-orb login-orb-right" aria-hidden="true" />

      <article className="login-panel panel">
        <div className="login-panel-left">
          <div className="login-panel-content">
            <h2 className="login-title">GOOGLE SIGN IN</h2>
            {status && <p className="login-subtitle">{status}</p>}
            {error && <p className="error">{error}</p>}
            {error && (
              <p className="auth-footnote">
                <Link to="/login">Return to login</Link>
              </p>
            )}
          </div>
        </div>

        <div className="login-panel-right" aria-hidden="true">
          <div className="right-panel-glow" />
          <div className="right-panel-card">
            <h3>Smart Campus</h3>
            <p>Finalizing your session securely with the backend.</p>
          </div>
        </div>
      </article>
    </section>
  );
}