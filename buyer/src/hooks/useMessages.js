import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
    fetchThreads,
    fetchThreadMessages,
    sendNewMessage,
    replyToThread,
    markThreadAsRead,
} from '@/lib/supabase/messages';
export function useMessages() {
    const { user, isAuthenticated } = useAuth();
    const [threads, setThreads] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [threadMessages, setThreadMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const loadThreads = useCallback(async () => {
        if (!isAuthenticated || !user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchThreads(user.id);
            setThreads(data);
        } catch (err) {
            console.error('Erreur chargement threads:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);
    useEffect(() => {
        loadThreads();
    }, [loadThreads]);
    const openThread = useCallback(async (threadId) => {
        setActiveThread(threadId);
        try {
            const msgs = await fetchThreadMessages(threadId);
            setThreadMessages(msgs);
            await markThreadAsRead(threadId, user.id);
            // Mettre à jour le compteur unread localement
            setThreads((prev) =>
                prev.map((t) =>
                    t.threadId === threadId ? { ...t, unread: 0 } : t
                )
            );
        } catch (err) {
            console.error('Erreur chargement messages:', err);
        }
    }, [user?.id]);
    const sendMessage = useCallback(async ({ subject, body }) => {
        if (!user?.id) return;
        setSending(true);
        try {
            const newId = await sendNewMessage({ senderId: user.id, subject, body });
            await loadThreads();
            return newId;
        } catch (err) {
            console.error('Erreur envoi message:', err);
            throw err;
        } finally {
            setSending(false);
        }
    }, [user?.id, loadThreads]);
    const reply = useCallback(async ({ body, receiverId }) => {
        if (!user?.id || !activeThread) return;
        setSending(true);
        try {
            await replyToThread({
                senderId: user.id,
                threadId: activeThread,
                body,
                receiverId,
            });
            const msgs = await fetchThreadMessages(activeThread);
            setThreadMessages(msgs);
            await loadThreads();
        } catch (err) {
            console.error('Erreur réponse:', err);
            throw err;
        } finally {
            setSending(false);
        }
    }, [user?.id, activeThread, loadThreads]);
    const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);
    return {
        threads,
        activeThread,
        threadMessages,
        loading,
        sending,
        error,
        totalUnread,
        openThread,
        sendMessage,
        reply,
        reload: loadThreads,
    };
}
