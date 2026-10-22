import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/supabase/notifications';

// NotificationBell (mounted globally in the header) and the /notifications
// page both call this hook at the same time, which used to open two
// independent realtime subscriptions on the same topic. This registry
// shares one actual channel per user across every mounted instance, each
// instance just registers its own listener on it.
const sharedChannels = new Map();

function subscribeShared(userId, onInsert) {
  let entry = sharedChannels.get(userId);
  if (!entry) {
    const listeners = new Set();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => { listeners.forEach((fn) => fn(payload)); }
      )
      .subscribe();
    entry = { channel, listeners };
    sharedChannels.set(userId, entry);
  }
  entry.listeners.add(onInsert);
  return () => {
    entry.listeners.delete(onInsert);
    if (entry.listeners.size === 0) {
      supabase.removeChannel(entry.channel);
      sharedChannels.delete(userId);
    }
  };
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const load = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    load();
  }, [load]);
  // Realtime Supabase subscription (shared channel, see subscribeShared above)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    return subscribeShared(user.id, (payload) => {
      setNotifications((prev) => [payload.new, ...prev]);
    });
  }, [isAuthenticated, user?.id]);
  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silently fail
    }
  }, []);
  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Silently fail
    }
  }, [user?.id]);
  return {
    notifications,
    loading,
    error,
    unreadCount,
    markRead,
    markAllRead,
    reload: load,
  };
}
