import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const isCheckingAuthRef = useRef(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  };
  const checkUserAuth = useCallback(async ({ silent = false } = {}) => {
    if (isCheckingAuthRef.current) return;
    isCheckingAuthRef.current = true;

    const shouldShowLoading = !silent || !authChecked || !isAuthenticated;

    try {
      if (shouldShowLoading) setIsLoadingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Attendre que le trigger ait créé le profil (retry 3x avec délai)
        let profileData = null;
        let attempts = 0;
        while (!profileData && attempts < 3) {
          profileData = await fetchProfile(session.user.id);
          if (!profileData) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
          }
        }
        if (!profileData) {
          if (!silent) {
            setAuthError({ type: 'profile_missing', message: 'Profil non créé. Réessayez.' });
            setIsAuthenticated(false);
          }
          return;
        }
        // Vérification rôle seller
        if (profileData?.role !== 'seller') {
          if (!silent) {
            setAuthError({ type: 'auth_required', message: 'Accès réservé aux vendeurs' });
            setIsAuthenticated(false);
          }
          return;
        }
        setUser(session.user);
        setProfile(profileData);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        if (!silent) {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      if (!silent) {
        setAuthError({ type: 'auth_required', message: error.message });
        setIsAuthenticated(false);
      }
    } finally {
      if (shouldShowLoading) setIsLoadingAuth(false);
      setAuthChecked(true);
      isCheckingAuthRef.current = false;
    }
  }, [authChecked, isAuthenticated]);
  useEffect(() => {
    checkUserAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Petit délai pour laisser le trigger créer le profil
        await new Promise(r => setTimeout(r, 300));
        await checkUserAuth({ silent: true });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await checkUserAuth({ silent: true });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        setIsLoadingAuth(false);
      }
    });

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkUserAuth({ silent: true });
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [checkUserAuth]);
  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await checkUserAuth();
  };
  const register = async (email, password, metadata = {}) => {
    // Inscription avec role='seller' dans les metadata pour le trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'seller',
          ...metadata,
        },
      },
    });

    if (error) throw error;

    // Mettre à jour le profil avec les infos business après création
    if (data?.user?.id) {
      await new Promise(r => setTimeout(r, 500)); // Attendre le trigger

      const updates = {};
      if (metadata.full_name) updates.full_name = metadata.full_name;
      if (metadata.business_name) updates.business_name = metadata.business_name;

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', data.user.id);
      }
    }
  };
  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    if (shouldRedirect) navigate('/login');
  };
  const navigateToLogin = () => navigate('/login');
  return (
    <AuthContext.Provider value={{
      user,
      profile,
      setProfile,
      isAuthenticated,
      isLoadingAuth,
      authError,
      authChecked,
      login,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
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
