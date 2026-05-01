import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useMessages } from '@/hooks/useMessages';
const SUBJECTS = [
  { icon: 'ri-shopping-bag-line', label: 'Problème de commande' },
  { icon: 'ri-shield-check-line', label: 'Paiement / Escrow' },
  { icon: 'ri-git-pull-request-line', label: 'Litige en cours' },
  { icon: 'ri-truck-line', label: 'Livraison / Suivi' },
  { icon: 'ri-user-3-line', label: 'Mon compte' },
  { icon: 'ri-more-line', label: 'Autre' },
];
const QUICK_LINKS = [
  { icon: 'ri-shield-star-line', label: 'Ouvrir un litige Escrow', to: '/legal?tab=escrow' },
  { icon: 'ri-arrow-go-back-line', label: 'Politique de retour', to: '/policy/returns' },
  { icon: 'ri-question-line', label: 'Centre d\'aide / FAQ', to: '/faq' },
  { icon: 'ri-shopping-bag-line', label: 'Mes commandes', to: '/account' },
];
function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
// ─── Nouveau message ──────────────────────────────────────────────────────────
function NewMessageForm({ onSent, onCancel }) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { sendMessage } = useMessages();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) { setError('Veuillez sélectionner un sujet.'); return; }
    if (body.trim().length < 10) { setError('Le message doit contenir au moins 10 caractères.'); return; }
    setError(null);
    setSending(true);
    try {
      await sendMessage({ subject: selectedSubject, body: body.trim() });
      setSuccess(true);
      setTimeout(() => onSent(), 1500);
    } catch {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSending(false);
    }
  };
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#DCFCE7' }}>
          <i className="ri-check-line text-2xl" style={{ color: '#15803D' }}></i>
        </div>
        <h3 className="text-base font-poppins font-bold mb-1" style={{ color: '#111827' }}>Message envoyé !</h3>
        <p className="text-sm font-inter" style={{ color: '#6B7280' }}>Notre équipe vous répondra sous 5 minutes.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
          <i className="ri-arrow-left-line text-base" style={{ color: '#374151' }}></i>
        </button>
        <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Nouveau message</h2>
      </div>
      <div className="mb-5">
        <p className="text-xs font-poppins font-medium mb-3" style={{ color: '#374151' }}>Sujet <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-2 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSelectedSubject(s.label)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-inter transition-all cursor-pointer text-left"
              style={selectedSubject === s.label
                ? { borderColor: '#125C8D', backgroundColor: '#EBF4FB', color: '#125C8D' }
                : { borderColor: '#E5E7EB', color: '#374151', backgroundColor: '#fff' }}
            >
              <i className={`${s.icon} text-sm flex-shrink-0`}></i>
              <span className="text-xs font-poppins font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="text-xs font-poppins font-medium block mb-2" style={{ color: '#374151' }}>
          Votre message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 500))}
          rows={5}
          placeholder="Décrivez votre problème en détail..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none resize-none focus:border-[#125C8D] transition-colors"
          style={{ color: '#111827' }}
        />
        <p className="text-xs font-inter text-right mt-1" style={{ color: '#9CA3AF' }}>{body.length}/500</p>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm font-inter" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-poppins font-semibold rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#125C8D' }}
        >
          <i className="ri-send-plane-line"></i>
          {sending ? 'Envoi...' : 'Envoyer le message'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-sm font-poppins font-medium rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
          style={{ color: '#374151' }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
// ─── Vue: Thread (conversation) ───────────────────────────────────────────────
function ThreadView({ thread, onBack }) {
  const { user } = useAuth();
  const { threadMessages, reply, sending, openThread } = useMessages();
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState(null);
  const bottomRef = useRef(null);
  useEffect(() => {
    openThread(thread.threadId);
  }, [thread.threadId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);
  const handleReply = async (e) => {
    e.preventDefault();
    if (replyBody.trim().length < 2) { setReplyError('Message trop court.'); return; }
    setReplyError(null);
    // Trouver le receiver : l'autre participant du thread
    const otherMsg = threadMessages.find((m) => m.sender_id !== user?.id);
    const receiverId = otherMsg?.sender_id || null;
    try {
      await reply({ body: replyBody.trim(), receiverId });
      setReplyBody('');
    } catch {
      setReplyError('Erreur lors de l\'envoi.');
    }
  };
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0">
          <i className="ri-arrow-left-line text-base" style={{ color: '#374151' }}></i>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-poppins font-semibold truncate" style={{ color: '#111827' }}>
            {thread.subject || 'Conversation'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Support TrustLink · En ligne</span>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#F8FAFC' }}>
        {threadMessages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
          </div>
        )}
        {threadMessages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const senderName = msg.sender?.full_name || (isMe ? 'Vous' : 'Support TrustLink');
          const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#125C8D' }}>
                  <i className="ri-shield-check-line text-xs"></i>
                </div>
              )}
              <div className="max-w-[75%]">
                {!isMe && (
                  <p className="text-xs font-poppins font-medium mb-1 ml-1" style={{ color: '#9CA3AF' }}>{senderName}</p>
                )}
                <div
                  className="px-4 py-2.5 text-sm font-inter leading-relaxed"
                  style={isMe
                    ? { backgroundColor: '#125C8D', color: '#fff', borderRadius: '12px 0 12px 12px' }
                    : { backgroundColor: '#fff', color: '#111827', borderRadius: '0 12px 12px 12px', border: '1px solid #E5E7EB' }}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end mr-1' : 'ml-1'}`}>
                  {!isMe && <i className="ri-shield-check-fill text-xs" style={{ color: '#125C8D' }}></i>}
                  <span className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{time}</span>
                  {isMe && msg.status === 'read' && <i className="ri-check-double-line text-xs" style={{ color: '#125C8D' }}></i>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {/* Reply input */}
      <div className="border-t border-gray-100 p-3 bg-white">
        {replyError && (
          <p className="text-xs font-inter text-red-500 mb-2">{replyError}</p>
        )}
        <form onSubmit={handleReply} className="flex gap-2 items-end">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value.slice(0, 500))}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
            rows={2}
            placeholder="Votre réponse..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-inter outline-none resize-none focus:border-[#125C8D] transition-colors"
            style={{ color: '#111827' }}
          />
          <button
            type="submit"
            disabled={sending || !replyBody.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#125C8D' }}
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              : <i className="ri-send-plane-fill text-sm"></i>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
// ─── Vue: Liste des threads ───────────────────────────────────────────────────
function ThreadList({ threads, loading, onOpen, onNew }) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#F1F5F9' }} />
        ))}
      </div>
    );
  }
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EBF4FB' }}>
          <i className="ri-chat-3-line text-2xl" style={{ color: '#125C8D' }}></i>
        </div>
        <p className="text-sm font-poppins font-semibold mb-1" style={{ color: '#111827' }}>Aucun message</p>
        <p className="text-xs font-inter mb-5" style={{ color: '#9CA3AF' }}>Démarrez une conversation avec notre équipe support.</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-poppins font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF6A00' }}
        >
          <i className="ri-add-line"></i>
          Nouveau message
        </button>
      </div>
    );
  }
  return (
    <div className="divide-y divide-gray-50">
      {threads.map((thread) => (
        <button
          key={thread.threadId}
          onClick={() => onOpen(thread)}
          className="w-full flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#125C8D' }}>
            <i className="ri-shield-check-line text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-sm font-poppins font-semibold truncate" style={{ color: '#111827' }}>
                {thread.subject || 'Support TrustLink'}
              </p>
              <span className="text-xs font-inter flex-shrink-0" style={{ color: '#9CA3AF' }}>
                {formatRelative(thread.lastDate)}
              </span>
            </div>
            <p className="text-xs font-inter truncate" style={{ color: '#6B7280' }}>
              {thread.lastMessage}
            </p>
          </div>
          {thread.unread > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#FF6A00' }}>
              {thread.unread}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
// ─── Composant principal ──────────────────────────────────────────────────────
export default function Support() {
  const { isAuthenticated } = useAuth();
  const { threads, loading, totalUnread, reload } = useMessages();
  const [view, setView] = useState('list'); // 'list' | 'new' | 'thread'
  const [activeThread, setActiveThread] = useState(null);
  const handleOpenThread = (thread) => {
    setActiveThread(thread);
    setView('thread');
  };
  const handleNewSent = () => {
    reload();
    setView('list');
  };
  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-10">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <i className="ri-customer-service-2-line text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-poppins font-bold">Support TrustLink</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-xs font-inter text-white/70">En ligne · Répond en moins de 5 min</span>
              </div>
            </div>
          </div>
          <p className="text-sm font-inter text-white/70">
            Notre équipe est disponible 7j/7 pour vous aider avec vos commandes, paiements Escrow et litiges.
          </p>
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar gauche */}
          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            {/* Sécurité */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
              <div className="flex items-start gap-2">
                <i className="ri-shield-check-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
                <p className="text-xs font-inter leading-relaxed" style={{ color: '#92400E' }}>
                  <strong>Sécurité :</strong> Ne partagez jamais vos codes MoMo ou mots de passe. TrustLink ne vous les demandera jamais.
                </p>
              </div>
            </div>
            {/* Liens rapides */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
              <p className="text-xs font-poppins font-semibold uppercase tracking-wider px-4 pt-4 pb-2" style={{ color: '#9CA3AF' }}>
                Liens rapides
              </p>
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-inter border-t border-gray-50 hover:bg-gray-50 transition-colors"
                  style={{ color: '#374151' }}
                >
                  <i className={`${link.icon} text-sm flex-shrink-0`} style={{ color: '#125C8D' }}></i>
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Horaires */}
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E7EB' }}>
              <p className="text-xs font-poppins font-semibold mb-3" style={{ color: '#111827' }}>Disponibilité</p>
              {[
                { day: 'Lun – Ven', hours: '08h – 22h' },
                { day: 'Sam – Dim', hours: '09h – 18h' },
                { day: 'Jours fériés', hours: '10h – 16h' },
              ].map((h) => (
                <div key={h.day} className="flex justify-between text-xs font-inter py-1.5 border-b border-gray-50 last:border-0">
                  <span style={{ color: '#6B7280' }}>{h.day}</span>
                  <span className="font-medium" style={{ color: '#111827' }}>{h.hours}</span>
                </div>
              ))}
            </div>
          </aside>
          {/* Zone principale */}
          <div className="flex-1 bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB', minHeight: '520px' }}>
            {/* Non connecté */}
            {!isAuthenticated && (
              <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-lock-line text-2xl" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>
                  Connectez-vous pour accéder au support
                </h2>
                <p className="text-sm font-inter mb-6" style={{ color: '#9CA3AF' }}>
                  Votre historique de messages est lié à votre compte.
                </p>
                <Link
                  to="/login"
                  className="px-6 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: '#FF6A00' }}
                >
                  Se connecter
                </Link>
              </div>
            )}
            {/* Connecté — vue liste */}
            {isAuthenticated && view === 'list' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>
                      Mes messages
                      {totalUnread > 0 && (
                        <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#FF6A00' }}>
                          {totalUnread}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs font-inter mt-0.5" style={{ color: '#9CA3AF' }}>
                      {threads.length} conversation{threads.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setView('new')}
                    className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#125C8D' }}
                  >
                    <i className="ri-add-line"></i>
                    Nouveau message
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ThreadList
                    threads={threads}
                    loading={loading}
                    onOpen={handleOpenThread}
                    onNew={() => setView('new')}
                  />
                </div>
              </div>
            )}
            {/* Connecté — nouveau message */}
            {isAuthenticated && view === 'new' && (
              <NewMessageForm
                onSent={handleNewSent}
                onCancel={() => setView('list')}
              />
            )}
            {/* Connecté — thread ouvert */}
            {isAuthenticated && view === 'thread' && activeThread && (
              <div className="flex flex-col" style={{ height: '520px' }}>
                <ThreadView
                  thread={activeThread}
                  onBack={() => { setView('list'); setActiveThread(null); }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
