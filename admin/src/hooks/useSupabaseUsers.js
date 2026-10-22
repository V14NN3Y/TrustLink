import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { INTERNAL_SUPPLIER_SLUG } from '@/lib/internalSupplier';
export function useSupabaseUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) {
        setError(err.message);
      } else {
        // The internal supplier account isn't a real user to manage here.
        setUsers((data || []).filter(u => u.business_slug !== INTERNAL_SUPPLIER_SLUG));
      }
    } catch (e) {
      console.error('Error fetching users:', e);
      setError(e.message);
    }
    setLoading(false);
  }, []);
  const updateUser = useCallback(async (id, updates) => {
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (!err) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      }
      return { error: err };
    } catch (e) {
      console.error('Error updating user:', e);
      return { error: e };
    }
  }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  return { users, loading, error, refresh: fetchUsers, updateUser };
}
