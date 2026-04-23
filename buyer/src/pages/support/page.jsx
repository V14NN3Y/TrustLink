import { useState, useEffect, useRef } from 'react';

const INITIAL_MESSAGES = [
  { role: 'bot', text: 'Bonjour ! 👋 Bienvenue sur le support TrustLink. Je suis là pour vous aider avec vos commandes, paiements Escrow ou toute autre question.', time: '00:48' },
];

const QUICK_REPLIES = ['Où est ma commande ?', 'Problème avec un produit', 'Remboursement Escrow', 'Modifier mon compte'];

const getAutoReply = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('commande') || m.includes('suivi') || m.includes('livraison')) return 'Pour suivre votre commande, rendez-vous dans Mon Compte → Mes Commandes. Vous y trouverez le statut en temps réel et le numéro de suivi. La livraison prend 2 à 7 jours ouvrables depuis Lagos.';
  if (m.includes('remboursement') || m.includes('retour') || m.includes('escrow')) return 'Notre système Escrow sécurise votre argent jusqu\'à confirmation de réception. En cas de problème, vous avez 48h après livraison pour ouvrir un litige. Le remboursement intervient sous 3-5 jours ouvrables.';
  if (m.includes('paiement') || m.includes('momo') || m.includes('wave') || m.includes('moov')) return 'Nous acceptons MTN Mobile Money, Moov Money et Wave. Ne partagez jamais vos codes MoMo ou mots de passe. TrustLink ne vous les demandera jamais.';
  return 'Je comprends votre préoccupation. Un agent humain va prendre en charge votre demande sous 5 minutes. En attendant, consultez notre Centre d\'aide pour des réponses immédiates.';
};

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

export default function Support() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [form, setForm] = useState({ email: 'adjoua.mensah@gmail.com', orderNumber: '', message: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    if (chatOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, chatOpen]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: 'user', text: msg, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text: getAutoReply(msg), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-inter text-white/80">Support en ligne · Répond en &lt; 5 min</span>
          </div>
          <h1 className="text-3xl font-poppins font-bold mb-2">Messagerie Support TrustLink</h1>
          <p className="text-sm font-inter text-white/70">Notre équipe est disponible 7j/7 pour vous aider avec vos commandes, paiements et litiges.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form */}
          <div className="flex-1 bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
            <h2 className="text-base font-poppins font-semibold mb-1" style={{ color: '#111827' }}>Envoyer un message</h2>
            <p className="text-xs font-inter mb-5" style={{ color: '#9CA3AF' }}>Décrivez votre problème en détail pour une réponse rapide.</p>

            <div className="mb-4">
              <label className="text-xs font-poppins font-medium mb-2 block" style={{ color: '#374151' }}>Sujet *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSubject(s.label)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-poppins transition-all"
                    style={selectedSubject === s.label
                      ? { borderColor: '#125C8D', backgroundColor: '#EBF4FB', color: '#125C8D' }
                      : { borderColor: '#E5E7EB', color: '#6B7280', backgroundColor: '#FAFAFA' }}
                  >
                    <i className={`${s.icon} text-sm`}></i>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-poppins font-medium mb-1.5 block" style={{ color: '#374151' }}>Votre email *</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-blue-400"
                placeholder="adjoua.mensah@gmail.com" />
            </div>
            <div className="mb-4">
              <label className="text-xs font-poppins font-medium mb-1.5 block" style={{ color: '#374151' }}>Numéro de commande <span className="text-gray-400 font-normal">(facultatif)</span></label>
              <input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-blue-400"
                placeholder="Ex: TL-K3X9M2P1" />
            </div>
            <div className="mb-4">
              <label className="text-xs font-poppins font-medium mb-1.5 block" style={{ color: '#374151' }}>Votre message *</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-blue-400 resize-none"
                placeholder="Décrivez votre problème en détail..." />
              <div className="flex justify-between text-xs mt-1" style={{ color: '#9CA3AF' }}>
                <span>Minimum 20 caractères</span>
                <span>{form.message.length}/500</span>
              </div>
            </div>

            <div className="rounded-lg p-3 mb-5 flex items-start gap-2" style={{ backgroundColor: '#FFF3EC', border: '1px solid #FFD0B0' }}>
              <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#FF6A00' }}></i>
              <p className="text-xs font-inter" style={{ color: '#92400E' }}>
                Ne partagez pas vos codes MoMo, Wave ou mots de passe avec notre équipe. TrustLink ne vous les demandera jamais.
              </p>
            </div>

            <button className="w-full py-3 text-white font-poppins font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
              <i className="ri-send-plane-fill"></i>
              Envoyer le message
            </button>
          </div>

          {/* Sidebar info */}
          <div className="lg:w-72 space-y-4">
            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full"></span>
                <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Support en ligne</h3>
              </div>
              {[
                { icon: 'ri-time-line', label: 'Temps de réponse', value: '< 5 min' },
                { icon: 'ri-calendar-line', label: 'Disponibilité', value: '7j/7 · 8h–22h' },
                { icon: 'ri-translate-2', label: 'Langue', value: 'Français / Anglais' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 mb-2.5 last:mb-0">
                  <i className={`${item.icon} text-sm`} style={{ color: '#9CA3AF' }}></i>
                  <span className="text-xs font-inter" style={{ color: '#6B7280' }}>{item.label}</span>
                  <span className="text-xs font-poppins font-semibold ml-auto" style={{ color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
              <h3 className="text-sm font-poppins font-semibold mb-3" style={{ color: '#111827' }}>Accès rapides</h3>
              <div className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <a key={link.label} href={link.to}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                    <i className={`${link.icon} text-sm`} style={{ color: '#125C8D' }}></i>
                    <span className="text-xs font-inter flex-1" style={{ color: '#374151' }}>{link.label}</span>
                    <i className="ri-arrow-right-s-line text-sm text-gray-400 group-hover:text-gray-600"></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF3EC', border: '1px solid #FFD0B0' }}>
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-shield-star-line" style={{ color: '#FF6A00' }}></i>
                <p className="text-sm font-poppins font-semibold" style={{ color: '#FF6A00' }}>Protection Escrow</p>
              </div>
              <p className="text-xs font-inter" style={{ color: '#6B7280' }}>Votre argent est en sécurité. Aucun paiement n'est libéré sans votre accord.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen && (
          <div className="mb-3 w-80 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#0E3A4F' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#FF6A00' }}>S</div>
                <div>
                  <p className="text-white text-sm font-poppins font-semibold">Support TrustLink</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span className="text-xs text-white/70">En ligne · Répond en &lt; 5 min</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-2 px-3 py-2.5 border-b border-gray-100" style={{ backgroundColor: '#FFFBEB' }}>
              <i className="ri-shield-check-line text-xs mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
              <p className="text-xs font-inter" style={{ color: '#92400E' }}>Ne partagez jamais vos codes MoMo ou mots de passe. TrustLink ne vous les demandera jamais.</p>
            </div>

            {/* Messages */}
            <div className="h-56 overflow-y-auto p-3 flex flex-col gap-2" style={{ backgroundColor: '#F8FAFC' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full flex-shrink-0 mr-1.5 flex items-center justify-center text-white text-xs font-bold self-end mb-3" style={{ backgroundColor: '#125C8D' }}>S</div>
                  )}
                  <div>
                    <div className="max-w-[200px] px-3 py-2 text-xs font-inter leading-relaxed rounded-2xl"
                      style={msg.role === 'bot'
                        ? { backgroundColor: '#fff', color: '#111827', borderRadius: '0 12px 12px 12px', border: '1px solid #E5E7EB' }
                        : { backgroundColor: '#125C8D', color: '#fff', borderRadius: '12px 0 12px 12px' }}>
                      {msg.text}
                    </div>
                    {msg.role === 'bot' && (
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <i className="ri-shield-check-fill text-xs" style={{ color: '#125C8D' }}></i>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{msg.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start items-end gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#125C8D' }}>S</div>
                  <div className="px-3 py-2 rounded-tr-xl rounded-b-xl flex gap-1" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB' }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: '#125C8D', animationDelay: `${i * 0.15}s` }}></span>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.slice(0, 2).map((r) => (
                  <button key={r} onClick={() => sendMessage(r)}
                    className="text-xs font-inter px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: '#374151' }}>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-gray-100">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                placeholder="Écrivez votre message..."
                className="flex-1 text-xs font-inter border border-gray-200 rounded-full px-3 py-2 outline-none" />
              <button onClick={() => sendMessage()}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: '#125C8D' }}>
                <i className="ri-send-plane-fill text-sm"></i>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex items-center gap-2.5 px-4 py-3 text-white font-poppins font-semibold rounded-full text-sm transition-transform hover:scale-105"
          style={{ backgroundColor: '#0E3A4F' }}
        >
          {!chatOpen && <><i className="ri-customer-service-2-line text-base"></i>Support TrustLink</>}
          {chatOpen && <i className="ri-close-line text-lg"></i>}
        </button>
      </div>
    </div>
  );
}
