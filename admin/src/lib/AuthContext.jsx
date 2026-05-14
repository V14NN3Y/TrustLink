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
      console.error('[Auth] loadProfile error:', error?.message || 'Aucun profil trouvé');
      setAuthError({ type: 'user_not_registered', message: 'Profil non trouvé dans la base' });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return { success: false, error: 'Profil non trouvé dans la base' };
    }
    // Sécurité : seuls les admins peuvent utiliser l'app admin
    if (data.role !== 'admin') {
      console.error('[Auth] Accès refusé, rôle:', data.role);
      setAuthError({ type: 'not_admin', message: 'Accès réservé aux administrateurs' });
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return { success: false, error: 'Accès réservé aux administrateurs' };
    }
    setUser(authUser);
    setProfile(data);
    setIsAuthenticated(true);
    setAuthError(null);
    setIsLoadingAuth(false);
    setAuthChecked(true);
    return { success: true };
  };
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const result = await loadProfile(data.user);
    if (!result.success) throw new Error(result.error);
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
  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setProfile(data);
        setUser(session.user);
      }
    }
  };
  const navigateToLogin = () => {
    window.location.href = '/login';
  };
  const checkUserAuth = async () => {};
  const checkAppState = async () => {};
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
      refreshProfile,
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
