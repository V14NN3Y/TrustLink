import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: 'trustlink-admin', public_settings: {} });

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    };
    
    initSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
        setAuthError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const loadProfile = async (authUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (error || !data) {
      setAuthError({ type: 'user_not_registered', message: 'Profil non trouvé dans la base' });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    // Sécurité : seuls les admins peuvent utiliser l'app admin
    if (data.role !== 'admin') {
      setAuthError({ type: 'not_admin', message: 'Accès réservé aux administrateurs' });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    setUser(authUser);
    setProfile(data);
    setIsAuthenticated(true);
    setAuthError(null);
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadProfile(data.user);
    return data;
  };
  const register = async ({ email, password, name }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'admin',
        },
      },
    });
    if (error) throw error;
    return data;
  };
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };
  const checkUserAuth = async () => {
    // Déjà géré par onAuthStateChange
  };
  const checkAppState = async () => {
    // Non utilisé avec Supabase direct
  };
  const navigateToLogin = () => {
    window.location.href = '/login';
  };
  return (
    <AuthContext.Provider value={{
      user,
      profile,
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
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
