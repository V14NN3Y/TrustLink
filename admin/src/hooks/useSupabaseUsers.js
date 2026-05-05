import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, []);
  const updateUser = useCallback(async (id, updates) => {
    const { error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    if (!err) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    }
    return { error: err };
  }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  return { users, loading, error, refresh: fetchUsers, updateUser };
}
