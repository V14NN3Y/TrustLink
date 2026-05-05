import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseMessages(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    // Récupère tous les messages où l'admin est sender ou receiver
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (id, full_name, role, avatar_url),
        receiver:profiles!receiver_id (id, full_name, role, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .is('parent_id', null) // seulement les messages racines (threads)
      .order('created_at', { ascending: false });
    // Grouper par interlocuteur
    const convMap = {};
    (data || []).forEach(msg => {
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      const other = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
      if (!convMap[otherId]) {
        convMap[otherId] = { userId: otherId, user: other, lastMessage: msg, unread: 0 };
      }
      if (msg.status === 'sent' && msg.receiver_id === currentUserId) {
        convMap[otherId].unread++;
      }
    });
    setConversations(Object.values(convMap));
    setLoading(false);
  }, [currentUserId]);
  const fetchThread = useCallback(async (otherUserId) => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (id, full_name, role, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });
    return data || [];
  }, [currentUserId]);
  const sendMessage = useCallback(async ({ receiverId, subject, content, parentId }) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        subject,
        content,
        parent_id: parentId || null,
        status: 'sent',
      })
      .select()
      .single();
    return { data, error };
  }, [currentUserId]);
  const markAsRead = useCallback(async (messageIds) => {
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .in('id', messageIds)
      .eq('receiver_id', currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations();
    // Realtime
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchConversations, currentUserId]);
  return { conversations, loading, fetchThread, sendMessage, markAsRead, refresh: fetchConversations };
}
