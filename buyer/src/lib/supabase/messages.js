import { supabase } from '@/lib/supabaseClient';
export const fetchThreads = async (userId) => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
      id,
      subject,
      content,
      sender_id,
      receiver_id,
      parent_id,
      status,
      created_at,
      sender:profiles!sender_id (full_name, role),
      receiver:profiles!receiver_id (full_name, role)
    `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });
    if (error) throw error;
    const threadsMap = new Map();
    for (const msg of data || []) {
        const key = msg.parent_id || msg.id;
        if (!threadsMap.has(key)) {
            threadsMap.set(key, {
                threadId: key,
                subject: msg.subject,
                lastMessage: msg.content,
                lastDate: msg.created_at,
                unread: 0,
                messages: [],
            });
        }
        const thread = threadsMap.get(key);
        thread.messages.push(msg);
        if (msg.status === 'sent' && msg.receiver_id === userId) {
            thread.unread += 1;
        }
        if (new Date(msg.created_at) > new Date(thread.lastDate)) {
            thread.lastDate = msg.created_at;
            thread.lastMessage = msg.content;
        }
    }
    return Array.from(threadsMap.values()).sort(
        (a, b) => new Date(b.lastDate) - new Date(a.lastDate)
    );
};
export const fetchThreadMessages = async (threadId) => {
    const { data, error } = await supabase
        .from('messages')
        .select(`
      id,
      subject,
      content,
      sender_id,
      receiver_id,
      parent_id,
      status,
      created_at,
      sender:profiles!sender_id (full_name, role, avatar_url)
    `)
        .or(`id.eq.${threadId},parent_id.eq.${threadId}`)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const sendNewMessage = async ({ senderId, subject, body }) => {
    const { data: admin, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();
    if (adminError) throw adminError;
    const receiverId = admin?.id || null;
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            subject,
            content: body,
            status: 'sent',
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id;
};
export const replyToThread = async ({ senderId, threadId, body, receiverId }) => {
    const { data, error } = await supabase
        .from('messages')
        .insert({
            sender_id: senderId,
            receiver_id: receiverId,
            parent_id: threadId,
            subject: null,
            content: body,
            status: 'sent',
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id;
};
export const markThreadAsRead = async (threadId, userId) => {
    const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .or(`id.eq.${threadId},parent_id.eq.${threadId}`)
        .eq('receiver_id', userId);
    if (error) throw error;
};
