import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiFetch, backendOrigin } from '../api/client';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'smartcampus-user';

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

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
    window.location.href = `${backendOrigin}/oauth2/authorization/google`;
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
    setUser(null);
    window.location.href = `${backendOrigin}/logout`;
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
