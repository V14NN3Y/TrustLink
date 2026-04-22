import { useState, useRef, useEffect } from 'react';
import StatusBadge from '@/components/base/StatusBadge';
import { formatDateTime, formatXOF } from '@/components/base/DataTransformer';

const ROLE_ALIGN = { BUYER: 'items-start', SELLER: 'items-end', ADMIN: 'items-center' };
const BUBBLE_STYLE = {
  BUYER: 'bg-blue-50 text-slate-800 rounded-2xl rounded-tl-sm',
  SELLER: 'bg-amber-50 text-slate-800 rounded-2xl rounded-tr-sm',
  ADMIN: 'bg-slate-100 text-slate-600 italic rounded-2xl',
};

export default function DisputeCenter({ disputes, onUpdate }) {
  const [selected, setSelected] = useState(disputes[0]);
  const [message, setMessage] = useState('');
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveAction, setResolveAction] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selected?.messages.length]);

  function sendMessage() {
    if (!message.trim() || !selected) return;
    const newMsg = { id: Date.now(), role: 'ADMIN', author: 'Admin TrustLink', content: message.trim(), timestamp: new Date().toISOString() };
    const updated = { ...selected, messages: [...selected.messages, newMsg] };
    onUpdate(updated); setSelected(updated); setMessage('');
  }

  function handleResolve(action) {
    if (!resolving) { setResolving(true); setResolveAction(action); return; }
    const updated = { ...selected, status: 'RESOLVED', resolution: action === 'refund' ? "Remboursement total accordé à l'acheteur." : 'Paiement forcé au vendeur validé.' };
    onUpdate(updated); setSelected(updated); setResolving(false); setResolveAction(null);
  }

  if (!selected) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex flex-col" style={{ height: 640 }}>
      <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Centre de litiges</h3>
        <span className="text-xs text-slate-500">{disputes.filter(d => d.status !== 'RESOLVED').length} actif(s)</span>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-72 border-r border-slate-100 flex-shrink-0 overflow-y-auto">
          {disputes.map(d => (
            <button key={d.id} onClick={() => setSelected(d)} className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${selected.id === d.id ? 'bg-blue-50 border-l-2 border-l-trustblue' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{d.order_ref}</p>
                <StatusBadge status={d.status === 'OPEN' ? 'DISPUTED' : d.status === 'INVESTIGATING' ? 'PENDING' : 'DELIVERED'} />
              </div>
              <p className="text-xs text-slate-500 truncate">{d.buyer_name} vs {d.seller_name}</p>
              <p className="text-xs font-bold text-trustblue mt-0.5">{formatXOF(d.amount_xof)}</p>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-semibold text-slate-800">{selected.order_ref} · {formatXOF(selected.amount_xof)}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{selected.reason}</p>
              </div>
              {selected.video_url && (
                <button onClick={() => setVideoExpanded(v => !v)} className="flex-shrink-0 px-3 py-1.5 bg-blue-50 border border-blue-100 text-trustblue rounded-xl text-xs font-semibold cursor-pointer">
                  <i className="ri-video-line mr-1" />{videoExpanded ? 'Masquer' : 'Vidéo'}
                </button>
              )}
            </div>
            {videoExpanded && selected.video_url && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-100 animate-fade-in">
                <video src={selected.video_url} controls className="w-full max-h-40 object-cover" />
                <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <i className="ri-shield-check-line text-xs" />In-app · Certifiée
                </span>
              </div>
            )}
            {selected.resolution && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700">
                <i className="ri-checkbox-circle-line mr-1" /><strong>Résolu :</strong> {selected.resolution}
              </div>
            )}
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {selected.messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${ROLE_ALIGN[msg.role]}`}>
                <span className="text-xs text-slate-400 mb-1 px-1">{msg.author} · {formatDateTime(msg.timestamp)}</span>
                <div className={`max-w-xs px-4 py-2.5 ${BUBBLE_STYLE[msg.role]}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {selected.status !== 'RESOLVED' && (
            <div className="flex-shrink-0 border-t border-slate-100 p-3 space-y-2">
              {resolving && (
                <div className="animate-fade-in bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Confirmer : {resolveAction === 'refund' ? 'Remboursement acheteur' : 'Paiement forcé vendeur'} ?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleResolve(resolveAction)} className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold cursor-pointer">Confirmer</button>
                    <button onClick={() => { setResolving(false); setResolveAction(null); }} className="px-4 py-1.5 border border-amber-300 text-amber-700 rounded-xl text-xs font-semibold cursor-pointer">Annuler</button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message admin…" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
                <button onClick={sendMessage} className="w-9 h-9 bg-trustblue text-white rounded-xl flex items-center justify-center cursor-pointer">
                  <i className="ri-send-plane-line" />
                </button>
              </div>
              {!resolving && (
                <div className="flex gap-2">
                  <button onClick={() => handleResolve('refund')} className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <i className="ri-refund-2-line mr-1" />Rembourser acheteur
                  </button>
                  <button onClick={() => handleResolve('force_pay')} className="flex-1 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <i className="ri-bank-card-line mr-1" />Paiement forcé
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
