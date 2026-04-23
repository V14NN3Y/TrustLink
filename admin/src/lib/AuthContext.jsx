import React, { createContext, useState, useContext, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Check for existing session in storage
    const storedUser = StorageManager.getAdminUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    
    // Simulate loading delay for "premium" feel
    const timer = setTimeout(() => {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      setAppPublicSettings({ id: 'trustlink-admin', public_settings: {} });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    // Mock login logic
    const mockUser = {
      id: 'admin-001',
      email: email,
      name: email.split('@')[0],
      role: 'admin',
    };
    StorageManager.setAdminUser(mockUser);
    setUser(mockUser);
    setIsAuthenticated(true);
    return true;
  };

  const register = async (userData) => {
    const mockUser = {
      id: `admin-${Math.floor(Math.random() * 1000)}`,
      ...userData,
      role: 'admin',
    };
    StorageManager.setAdminUser(mockUser);
    setUser(mockUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = (shouldRedirect = true) => {
    StorageManager.setAdminUser(null);
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkUserAuth = async () => {
    const storedUser = StorageManager.getAdminUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  const checkAppState = async () => {
    setIsLoadingPublicSettings(false);
    setIsLoadingAuth(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
