import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabaseClient';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }, []);
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (!mounted) return;
          setUser(session.user);
          setProfile(profileData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          setAuthError({ type: 'unknown', message: error.message });
        }
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setAuthChecked(true);
        }
      }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (!mounted) return;
          setUser(session.user);
          setProfile(profileData);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);
  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError({ type: 'login_failed', message: error.message });
      return { success: false, error };
    }
    return { success: true };
  }, []);
  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setAuthError({ type: 'login_failed', message: error.message });
      return { success: false, error };
    }
    return { success: true };
  }, []);
  const registerWithEmail = useCallback(async (email, password, fullName) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'buyer',
        },
      },
    });
    if (error) {
      setAuthError({ type: 'register_failed', message: error.message });
      return { success: false, error };
    }
    return { success: true };
  }, []);
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isLoadingAuth,
        authError,
        authChecked,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
        refreshProfile,
      }}
    >
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
