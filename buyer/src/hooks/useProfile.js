import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchProfile, updateProfile } from '@/lib/supabase/profile';
export function useProfile() {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile(user.id);
      setProfile(data);
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  const saveProfile = useCallback(async (updates) => {
    if (!user?.id) return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const updated = await updateProfile(user.id, updates);
      setProfile(updated);
      setSaveSuccess(true);
      // Rafraîchit aussi le contexte Auth
      if (refreshProfile) await refreshProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
      setError(err);
    } finally {
      setSaving(false);
    }
  }, [user?.id, refreshProfile]);
  return { profile, loading, saving, error, saveSuccess, reload: loadProfile, saveProfile };
}
