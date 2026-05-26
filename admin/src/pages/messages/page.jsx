import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages';
import { supabase } from '@/lib/supabaseClient';

function Avatar({ name, size = 'md' }) {
  const initials = (name || '??').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-trustblue to-blue-700 flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatDateSeparator(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function isSameDay(a, b) {
  const da = new Date(a); const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { conversations, loading, totalUnread, fetchThread, sendMessage, markAsRead, refresh } = useSupabaseMessages(user?.id);
  const [selectedConv, setSelectedConv] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewConv, setShowNewConv] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior }), 50);
  }, []);

  // Load thread when conversation changes
  useEffect(() => {
    if (!selectedConv || !user?.id) return;
    let cancelled = false;

    async function load() {
      setThreadLoading(true);
      const msgs = await fetchThread(selectedConv.userId);
      if (cancelled) return;
      setThread(msgs);
      setThreadLoading(false);
      scrollToBottom('instant');

      // Mark unread messages as read
      const unreadIds = msgs.filter(m => m.status === 'sent' && m.receiver_id === user.id).map(m => m.id);
      if (unreadIds.length > 0) markAsRead(unreadIds);
    }

    load();

    // Real-time for active thread
    const channel = supabase
      .channel(`thread-${user.id}-${selectedConv.userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
        const msgs = await fetchThread(selectedConv.userId);
        if (cancelled) return;
        setThread(msgs);
        scrollToBottom();
        // Auto-mark new messages as read
        const unread = msgs.filter(m => m.status === 'sent' && m.receiver_id === user.id).map(m => m.id);
        if (unread.length > 0) markAsRead(unread);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedConv?.userId, user?.id]);

  // Load users for new conversation
  useEffect(() => {
    if (!showNewConv || !user?.id) return;
    supabase.from('profiles').select('id, full_name, role').neq('id', user.id).order('full_name')
      .then(({ data }) => setAllUsers(data || []));
  }, [showNewConv, user?.id]);

  async function handleSend() {
    if (!newMsg.trim() || !selectedConv || sending) return;
    setSending(true);
    const content = newMsg.trim();
    setNewMsg('');
    const { error } = await sendMessage({ receiverId: selectedConv.userId, content });
    if (!error) {
      const msgs = await fetchThread(selectedConv.userId);
      setThread(msgs);
      scrollToBottom();
      refresh();
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function startConversation(profile) {
    setSelectedConv({ userId: profile.id, user: profile });
    setShowNewConv(false);
    setSearch('');
    setUserSearch('');
  }

  const filteredConvs = conversations.filter(c =>
    !search || (c.user?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const roleColor = (role) => {
    const map = { admin: 'text-purple-600 bg-purple-50', seller: 'text-orange-600 bg-orange-50', buyer: 'text-blue-600 bg-blue-50' };
    return map[role] || 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex overflow-hidden" style={{ height: 700 }}>

      {/* ── LEFT PANEL: Conversation list ── */}
      <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">

        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Messagerie</h3>
              {totalUnread > 0 && (
                <p className="text-xs text-trustblue font-semibold mt-0.5">{totalUnread} non lu{totalUnread > 1 ? 's' : ''}</p>
              )}
            </div>
            <button
              onClick={() => { setShowNewConv(v => !v); setUserSearch(''); }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${showNewConv ? 'bg-trustblue text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Nouvelle conversation"
            >
              <i className={showNewConv ? 'ri-close-line' : 'ri-pencil-line'} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              value={showNewConv ? userSearch : search}
              onChange={e => showNewConv ? setUserSearch(e.target.value) : setSearch(e.target.value)}
              placeholder={showNewConv ? 'Rechercher un utilisateur…' : 'Rechercher…'}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-trustblue"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {showNewConv ? (
            filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                <i className="ri-user-search-line text-2xl block mb-2" />
                Aucun utilisateur
              </div>
            ) : filteredUsers.map(profile => (
              <button
                key={profile.id}
                onClick={() => startConversation(profile)}
                className="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={profile.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{profile.full_name}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md capitalize ${roleColor(profile.role)}`}>{profile.role}</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-slate-300" />
                </div>
              </button>
            ))
          ) : loading ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-trustblue/20 border-t-trustblue rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <i className="ri-message-3-line text-3xl block mb-2" />
              {search ? 'Aucun résultat' : 'Aucune conversation'}
            </div>
          ) : filteredConvs.map(conv => {
            const isSelected = selectedConv?.userId === conv.userId;
            const hasUnread = conv.unread > 0;
            return (
              <button
                key={conv.userId}
                onClick={() => setSelectedConv(conv)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-l-2 border-l-trustblue' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar name={conv.user?.full_name} size="sm" />
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {conv.user?.full_name || '—'}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{formatTime(conv.lastAt)}</span>
                    </div>
                    <p className={`text-xs truncate ${hasUnread ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {conv.lastMessage?.content || '—'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: Thread ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            {/* Thread header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-white flex-shrink-0">
              <Avatar name={selectedConv.user?.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{selectedConv.user?.full_name}</p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md capitalize ${roleColor(selectedConv.user?.role)}`}>
                  {selectedConv.user?.role}
                </span>
              </div>
              <button
                onClick={() => { setSelectedConv(null); setThread([]); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 cursor-pointer text-slate-400"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-slate-50/30">
              {threadLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-trustblue/20 border-t-trustblue rounded-full animate-spin" />
                </div>
              ) : thread.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                  <i className="ri-message-3-line text-4xl mb-3 block" />
                  <p className="text-sm">Démarrez la conversation</p>
                </div>
              ) : (
                thread.map((msg, i) => {
                  const isMe = msg.sender_id === user.id;
                  const prevMsg = thread[i - 1];
                  const showDate = !prevMsg || !isSameDay(msg.created_at, prevMsg.created_at);
                  const nextMsg = thread[i + 1];
                  const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                  const isRead = msg.status === 'read';

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-xs text-slate-400 font-medium px-3 py-1 bg-white rounded-full border border-slate-100 flex-shrink-0">
                            {formatDateSeparator(msg.created_at)}
                          </span>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isLastInGroup ? 'mb-3' : 'mb-0.5'}`}>
                        <div className={`max-w-sm ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-trustblue text-white rounded-tr-sm'
                              : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100 shadow-sm'
                          }`}>
                            {msg.content}
                          </div>
                          {isLastInGroup && (
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-slate-400">
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <span className={`text-[10px] ${isRead ? 'text-trustblue' : 'text-slate-400'}`}>
                                  {isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={newMsg}
                    onChange={e => {
                      setNewMsg(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrire un message… (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                    rows={1}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none overflow-hidden transition-colors"
                    style={{ minHeight: 42 }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || !newMsg.trim()}
                  className="w-10 h-10 bg-trustblue text-white rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40 hover:bg-trustblue/90 transition-colors flex-shrink-0"
                >
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <i className="ri-send-plane-fill text-sm" />
                  }
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 px-1">Entrée pour envoyer · Shift+Entrée pour saut de ligne</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <i className="ri-message-3-line text-3xl text-trustblue" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Messagerie admin</h3>
            <p className="text-sm text-slate-400 mb-4">Sélectionnez une conversation ou démarrez une nouvelle discussion</p>
            <button
              onClick={() => setShowNewConv(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-trustblue text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-trustblue/90 transition-colors"
            >
              <i className="ri-pencil-line" />Nouvelle conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
