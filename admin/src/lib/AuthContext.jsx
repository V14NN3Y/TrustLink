import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ADMIN_ACCOUNTS = [
  { id: 'admin-1', email: 'admin@trustlink.com', password: 'admin123', full_name: 'Super Admin', role: 'admin' },
  { id: 'admin-2', email: 'demo@trustlink.com',  password: 'demo123',  full_name: 'Demo Admin',  role: 'admin' },
];

const SESSION_KEY = 'tl_admin_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = ADMIN_ACCOUNTS.find(a => a.id === parsed.id);
        if (valid) setUser(parsed);
        else localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const account = ADMIN_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) throw new Error('Email ou mot de passe incorrect');
    const { password: _, ...sessionUser } = account;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
