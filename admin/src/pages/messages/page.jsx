import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages';
import { formatDateTime } from '@/components/base/DataTransformer';
import { supabase } from '@/lib/supabaseClient';

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, loading, fetchThread, sendMessage, markAsRead } = useSupabaseMessages(user?.id);
  const [selectedConv, setSelectedConv] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const chatRef = useRef(null);
  useEffect(() => {
    if (!selectedConv) return;
    fetchThread(selectedConv.userId).then(msgs => {
      setThread(msgs);
      const unreadIds = msgs.filter(m => m.status === 'sent' && m.receiver_id === user.id).map(m => m.id);
      if (unreadIds.length > 0) markAsRead(unreadIds);
    });
  }, [selectedConv]);

  useEffect(() => {
    if (!showNewConv || !user?.id) return;
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .neq('id', user.id)
      .then(({ data }) => setAllUsers(data || []));
  }, [showNewConv, user?.id]);

  useEffect(() => {
    if (!selectedConv || !user?.id) return;

    const loadThread = async () => {
      const msgs = await fetchThread(selectedConv.userId);
      setThread(msgs);
      const unreadIds = msgs
        .filter(m => m.status === 'sent' && m.receiver_id === user.id)
        .map(m => m.id);
      if (unreadIds.length > 0) markAsRead(unreadIds);
    };

    loadThread();

    // Realtime sur le thread actif
    const channel = supabase
      .channel(`thread-${selectedConv.userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => loadThread())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedConv, user?.id]);

  async function handleSend() {
    if (!newMsg.trim() || !selectedConv) return;
    setSending(true);
    await sendMessage({ receiverId: selectedConv.userId, content: newMsg.trim() });
    const updated = await fetchThread(selectedConv.userId);
    setThread(updated);
    setNewMsg('');
    setSending(false);
  }

  async function startConversation(profile) {
    setSelectedConv({ userId: profile.id, user: profile });
    setShowNewConv(false);
    const updated = await fetchThread(profile.id);
    setThread(updated);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex" style={{ height: 680 }}>
      {/* Liste conversations */}
      <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Messagerie</h3>
            <button
              onClick={() => setShowNewConv(v => !v)}
              className="text-xs px-3 py-1.5 rounded-lg bg-trustblue text-white"
            >
              Nouvelle conversation
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{conversations.length} conversation(s)</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {showNewConv ? (
            allUsers.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">Aucun utilisateur disponible</div>
            ) : allUsers.map(profile => (
              <button
                key={profile.id}
                onClick={() => startConversation(profile)}
                className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-trustblue text-xs">
                      {(profile.full_name || '??').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.full_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
                  </div>
                </div>
              </button>
            ))
          ) : loading ? (
            <div className="py-10 text-center text-sm text-slate-400">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">Aucune conversation</div>
          ) : conversations.map(conv => (
            <button
              key={conv.userId}
              onClick={() => setSelectedConv(conv)}
              className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${selectedConv?.userId === conv.userId ? 'bg-blue-50 border-l-2 border-l-trustblue' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-trustblue text-xs">
                    {(conv.user?.full_name || '??').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 truncate">{conv.user?.full_name || '—'}</p>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 bg-trustblue text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 capitalize">{conv.user?.role}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage?.content}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-bold text-trustblue text-xs">
                  {(selectedConv.user?.full_name || '??').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{selectedConv.user?.full_name}</p>
                <p className="text-xs text-slate-400 capitalize">{selectedConv.user?.role}</p>
              </div>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-5 space-y-3">
              {thread.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${isMe ? 'bg-trustblue text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>{formatDateTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Écrire un message..."
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMsg.trim()}
                className="w-10 h-10 bg-trustblue text-white rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <i className="ri-send-plane-line" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-message-3-line text-4xl text-slate-200 block mb-2" />
              <p className="text-sm text-slate-400">Sélectionnez une conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
