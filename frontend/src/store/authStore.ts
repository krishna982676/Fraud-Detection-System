import { useState, useEffect } from 'react';

export interface UserSession {
  username: string;
  role: 'ANALYST' | 'ADMIN' | 'ENGINEER';
  token: string;
  loginTime: string;
}

const STORAGE_KEY = 'sentinelx_auth';

export const DEFAULT_DEMO_SESSION: UserSession = {
  username: 'analyst@sentinelx.io',
  role: 'ANALYST',
  token: 'sx_demo_analyst_session',
  loginTime: new Date().toISOString(),
};

let memorySession: UserSession | null = null;

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // fallback
  }
  return null;
}

export function getStoredSession(): UserSession | null {
  const storage = getStorage();
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw === 'LOGGED_OUT') return null;
      if (!raw) {
        // Auto-initialize demo clearance session for instant analyst access
        storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_SESSION));
        return DEFAULT_DEMO_SESSION;
      }
      return JSON.parse(raw) as UserSession;
    } catch {
      return DEFAULT_DEMO_SESSION;
    }
  }
  return memorySession || DEFAULT_DEMO_SESSION;
}

export function saveSession(session: UserSession) {
  memorySession = session;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

export function clearSession() {
  memorySession = null;
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, 'LOGGED_OUT');
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(getStoredSession);

  useEffect(() => {
    const sync = () => setSession(getStoredSession());
    window.addEventListener('auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const login = (username: string, role: 'ANALYST' | 'ADMIN' | 'ENGINEER' = 'ANALYST') => {
    const newSession: UserSession = {
      username,
      role,
      token: `sx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toISOString(),
    };
    saveSession(newSession);
    return newSession;
  };

  const logout = () => {
    clearSession();
  };

  return {
    user: session,
    isAuthenticated: !!session,
    login,
    logout,
  };
}
