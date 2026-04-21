import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data);
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginWithGoogle = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const signin = useCallback(async (credentials) => {
    const data = await apiFetch('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setUser(data);
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    return apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, refreshUser, loginWithGoogle, signin, signup, logout }),
    [user, loading, refreshUser, signin, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
