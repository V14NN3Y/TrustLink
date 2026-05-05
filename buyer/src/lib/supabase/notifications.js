import { supabase } from '@/lib/supabaseClient';

/**
 * Créer une notification pour un utilisateur
 */
export const createNotification = async ({ userId, type, title, body, resourceType, resourceId }) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      resource_type: resourceType,
      resource_id: resourceId,
    });
  if (error) throw error;
};

/**
 * Récupérer les notifications d'un utilisateur
 */
export const fetchNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
};
