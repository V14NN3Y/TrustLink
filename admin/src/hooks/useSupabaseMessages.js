import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseMessages(currentUserId) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        status,
        created_at,
        sender:profiles!sender_id (id, full_name, role, avatar_url),
        receiver:profiles!receiver_id (id, full_name, role, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: false });

    // Group by interlocutor, pick latest message per thread
    const convMap = {};
    (data || []).forEach(msg => {
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      const other = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
      if (!convMap[otherId]) {
        convMap[otherId] = {
          userId: otherId,
          user: other,
          lastMessage: msg,
          unread: 0,
          lastAt: msg.created_at,
        };
      }
      // Count unread = messages sent to me that are still 'sent' (not 'read')
      if (msg.status === 'sent' && msg.receiver_id === currentUserId) {
        convMap[otherId].unread++;
      }
    });

    // Sort by most recent message
    const sorted = Object.values(convMap).sort((a, b) =>
      new Date(b.lastAt) - new Date(a.lastAt)
    );
    setConversations(sorted);
    setLoading(false);
  }, [currentUserId]);

  const fetchThread = useCallback(async (otherUserId) => {
    if (!currentUserId || !otherUserId) return [];
    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        status,
        created_at,
        sender:profiles!sender_id (id, full_name, role, avatar_url)
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });
    return data || [];
  }, [currentUserId]);

  const sendMessage = useCallback(async ({ receiverId, content }) => {
    if (!currentUserId || !receiverId || !content?.trim()) return { error: 'Invalid params' };
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: content.trim(),
        status: 'sent',
      })
      .select()
      .single();
    return { data, error };
  }, [currentUserId]);

  const markAsRead = useCallback(async (messageIds) => {
    if (!messageIds?.length) return;
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .in('id', messageIds)
      .eq('receiver_id', currentUserId);
    // Update local unread count in conversations
    setConversations(prev =>
      prev.map(conv => ({
        ...conv,
        unread: 0,
        lastMessage: conv.lastMessage && messageIds.includes(conv.lastMessage.id)
          ? { ...conv.lastMessage, status: 'read' }
          : conv.lastMessage,
      }))
    );
  }, [currentUserId]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  useEffect(() => {
    if (!currentUserId) return;
    fetchConversations();
    const channel = supabase
      .channel(`messages-admin-${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      }, () => fetchConversations())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, () => fetchConversations())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [currentUserId, fetchConversations]);

  return { conversations, loading, totalUnread, fetchThread, sendMessage, markAsRead, refresh: fetchConversations };
}
