import { supabase } from '@/lib/supabaseClient';
/**
 * Fetch toutes les notifications d'un user, les plus récentes en premier.
 */
export const fetchNotifications = async (userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, body, resource_type, resource_id, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw error;
    return data || [];
};
/**
 * Marque une notification comme lue.
 */
export const markNotificationRead = async (notificationId) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error) throw error;
};
/**
 * Marque toutes les notifications d'un user comme lues.
 */
export const markAllNotificationsRead = async (userId) => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
};
/**
 * Compte les notifications non lues.
 */
export const countUnreadNotifications = async (userId) => {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
    return count || 0;
};
