import { useState, useEffect, useRef } from 'react';

const INITIAL_MESSAGES = [
  { role: 'bot', text: 'Bonjour ! 👋 Bienvenue sur le support TrustLink. Je suis là pour vous aider avec vos commandes, paiements Escrow ou toute autre question.', time: '07:53' },
];

const QUICK_REPLIES = ['Où est ma commande ?', 'Problème avec un produit'];

const getAutoReply = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('commande') || m.includes('suivi')) return 'Pour suivre votre commande, rendez-vous dans Mon Compte → Mes Commandes. La livraison prend 2 à 7 jours ouvrables.';
  if (m.includes('remboursement') || m.includes('retour') || m.includes('escrow')) return 'Notre système Escrow sécurise votre argent. Vous avez 48h après livraison pour ouvrir un litige.';
  return 'Je vais vous mettre en contact avec notre équipe. En attendant, consultez notre Centre d\'aide.';
};

export default function FloatingSupportButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text: msg, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text: getAutoReply(msg), time }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E7EB', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#0E3A4F' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold relative" style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-shield-check-line text-base"></i>
              </div>
              <div>
                <p className="text-white text-sm font-poppins font-semibold">Support TrustLink</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span className="text-xs text-white/70">En ligne · Répond en &lt; 5 min</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2 px-3 py-2.5" style={{ backgroundColor: '#FFFBEB', borderBottom: '1px solid #FEF3C7' }}>
            <i className="ri-shield-check-line text-xs mt-0.5 flex-shrink-0" style={{ color: '#D97706' }}></i>
            <p className="text-xs font-inter" style={{ color: '#92400E' }}>Ne partagez jamais vos codes MoMo ou mots de passe. TrustLink ne vous les demandera jamais.</p>
          </div>

          {/* Messages */}
          <div className="h-60 overflow-y-auto p-3 flex flex-col gap-2.5" style={{ backgroundColor: '#F8FAFC' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-1.5`}>
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#125C8D' }}>
                    <i className="ri-shield-check-line text-xs"></i>
                  </div>
                )}
                <div>
                  <div className="max-w-[200px] px-3 py-2 text-xs font-inter leading-relaxed"
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
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: '#125C8D' }}>
                  <i className="ri-shield-check-line text-xs"></i>
                </div>
                <div className="px-3 py-2 flex gap-1" style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '0 12px 12px 12px' }}>
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
            <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1.5 bg-white">
              {QUICK_REPLIES.map((r) => (
                <button key={r} onClick={() => sendMessage(r)}
                  className="text-xs font-inter px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: '#374151' }}>
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-100 bg-white">
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

      {/* Trigger button — round circle with headset icon */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
        style={{ backgroundColor: '#0E3A4F', boxShadow: '0 4px 20px rgba(14,58,79,0.4)' }}
      >
        {open
          ? <i className="ri-close-line text-xl"></i>
          : <i className="ri-customer-service-2-line text-xl"></i>
        }
      </button>
    </div>
  );
}
