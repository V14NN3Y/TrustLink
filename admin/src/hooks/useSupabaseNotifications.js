import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  }, [userId]);
  const markAsRead = useCallback(async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }, []);
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, [userId]);
  const createNotification = useCallback(async ({ userId: targetId, type, title, body, resourceType, resourceId }) => {
    const { data } = await supabase.from('notifications').insert({
      user_id: targetId,
      type,
      title,
      body,
      resource_type: resourceType,
      resource_id: resourceId,
      is_read: false,
    }).select().single();
    return data;
  }, []);
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchNotifications, userId]);
  return { notifications, loading, markAsRead, markAllAsRead, createNotification, refresh: fetchNotifications };
}
