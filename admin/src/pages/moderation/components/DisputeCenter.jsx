import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import StatusBadge from '@/components/base/StatusBadge';
import SignedMedia from '@/components/base/SignedMedia';
import { formatDateTime, formatXOF } from '@/components/base/DataTransformer';

const ROLE_ALIGN = { BUYER: 'items-start', SELLER: 'items-end', ADMIN: 'items-center' };
const BUBBLE_STYLE = {
  BUYER: 'bg-blue-50 text-slate-800 rounded-2xl rounded-tl-sm',
  SELLER: 'bg-amber-50 text-slate-800 rounded-2xl rounded-tr-sm',
  ADMIN: 'bg-slate-100 text-slate-600 italic rounded-2xl',
};

export default function DisputeCenter({ disputes, onUpdate }) {
  const { user } = useAuth();
  // Keep only the id: `disputes` arrives after the first render, so a
  // useState(disputes[0]) would stay undefined forever. Derive `selected` instead.
  const [selectedId, setSelectedId] = useState(null);
  const selected = disputes.find(d => d.id === selectedId) || disputes[0];
  const [message, setMessage] = useState('');
  const [evidenceOpen, setEvidenceOpen] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolveAction, setResolveAction] = useState(null);
  const [sending, setSending] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [selected?.messages?.length]);

  async function sendMessage() {
    if (!message.trim() || !selected || !user || sending) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selected.buyer_id,
      subject: `Litige #${selected.order_ref}`,
      content: message.trim(),
    });
    if (!error) {
      const newMsg = { id: Date.now(), sender_id: user.id, author: user.email || 'Admin', content: message.trim(), timestamp: new Date().toISOString() };
      const updated = { ...selected, messages: [...(selected.messages || []), newMsg] };
      onUpdate(updated); setMessage('');
    }
    setSending(false);
  }

  async function handleResolve(action) {
    if (!resolving) { setResolving(true); setResolveAction(action); return; }
    if (!selected || !user) return;
    const newStatus = action === 'refund' ? 'resolved_refund' : 'resolved_no_refund';
    const orderStatus = action === 'refund' ? 'refunded' : 'confirmed';
    const resolutionText = action === 'refund'
      ? "Remboursement total accordé à l'acheteur."
      : 'Commande confirmée, réclamation rejetée.';

    await supabase.from('disputes').update({
      status: newStatus,
      resolved_by: user.id,
      resolution_notes: resolutionText,
      resolved_at: new Date().toISOString(),
    }).eq('id', selected.id);

    await supabase.from('orders').update({ status: orderStatus }).eq('id', selected.order_id);

    await supabase.from('notifications').insert({
      user_id: selected.buyer_id,
      type: 'dispute_update',
      title: `Litige résolu : ${resolutionText}`,
      resource_type: 'dispute',
      resource_id: selected.id,
    });

    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'dispute_resolved',
      resource_type: 'dispute',
      resource_id: selected.id,
      old_value: { status: 'open' },
      new_value: { status: newStatus },
    });

    const updated = { ...selected, status: newStatus, resolution: resolutionText };
    onUpdate(updated);
    setResolving(false); setResolveAction(null);
  }

  if (!selected) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-400" style={{ height: 640 }}>
        Aucun litige pour le moment
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 flex flex-col" style={{ height: 640 }}>
      <div className="flex-shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Centre de litiges</h3>
        <span className="text-xs text-slate-500">{disputes.filter(d => d.status === 'open' || d.status === 'OPEN').length} actif(s)</span>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-72 border-r border-slate-100 flex-shrink-0 overflow-y-auto">
          {disputes.map(d => (
            <button key={d.id} onClick={() => setSelectedId(d.id)} className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${selected.id === d.id ? 'bg-blue-50 border-l-2 border-l-trustblue' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{d.order_ref}</p>
                <StatusBadge status={d.status === 'open' || d.status === 'OPEN' ? 'disputed' : d.status === 'resolved_refund' ? 'resolved_refund' : d.status === 'resolved_no_refund' ? 'resolved_no_refund' : 'resolved_refund'} />
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
              <button onClick={() => setEvidenceOpen(v => !v)} className="flex-shrink-0 px-3 py-1.5 bg-blue-50 border border-blue-100 text-trustblue rounded-xl text-xs font-semibold cursor-pointer">
                <i className="ri-layout-column-line mr-1" />{evidenceOpen ? 'Masquer les preuves' : 'Preuves'}
              </button>
            </div>
            {evidenceOpen && (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in">
                <EvidencePanel
                  icon="ri-camera-line"
                  title="Lagos · Photo de l'agent"
                  meta={selected.inspection
                    ? [selected.inspection.agent_name, selected.inspection.created_at && formatDateTime(selected.inspection.created_at)].filter(Boolean).join(' · ')
                    : null}
                  note={selected.inspection?.notes}
                >
                  <SignedMedia
                    kind="image"
                    bucket="inspection-photos"
                    src={selected.inspection?.photo_path}
                    alt="Inspection Lagos"
                    className="w-full h-full object-cover"
                    emptyLabel="Pas de photo d'inspection"
                  />
                </EvidencePanel>
                <EvidencePanel
                  icon="ri-video-line"
                  title="Cotonou · Vidéo du client"
                  meta={selected.video_created_at ? formatDateTime(selected.video_created_at) : null}
                >
                  <SignedMedia
                    kind="video"
                    bucket="delivery-videos"
                    src={selected.video_url}
                    className="w-full h-full object-cover"
                    emptyLabel="Pas de vidéo client"
                  />
                </EvidencePanel>
              </div>
            )}
            {selected.resolution && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-700">
                <i className="ri-checkbox-circle-line mr-1" /><strong>Résolu :</strong> {selected.resolution}
              </div>
            )}
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {(selected.messages || []).map(msg => {
              const role = msg.sender_id === selected.buyer_id ? 'BUYER' : msg.sender_id === selected.seller_id ? 'SELLER' : 'ADMIN';
              return (
                <div key={msg.id} className={`flex flex-col ${ROLE_ALIGN[role]}`}>
                  <span className="text-xs text-slate-400 mb-1 px-1">{msg.author} · {formatDateTime(msg.timestamp)}</span>
                  <div className={`max-w-xs px-4 py-2.5 ${BUBBLE_STYLE[role]}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {(selected.status === 'open' || selected.status === 'OPEN') && (
            <div className="flex-shrink-0 border-t border-slate-100 p-3 space-y-2">
              {resolving && (
                <div className="animate-fade-in bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Confirmer : {resolveAction === 'refund' ? 'Remboursement acheteur' : 'Confirmation de la commande'} ?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleResolve(resolveAction)} className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold cursor-pointer">Confirmer</button>
                    <button onClick={() => { setResolving(false); setResolveAction(null); }} className="px-4 py-1.5 border border-amber-300 text-amber-700 rounded-xl text-xs font-semibold cursor-pointer">Annuler</button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message admin…" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
                <button onClick={sendMessage} disabled={sending} className="w-9 h-9 bg-trustblue text-white rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50">
                  <i className="ri-send-plane-line" />
                </button>
              </div>
              {!resolving && (
                <div className="flex gap-2">
                  <button onClick={() => handleResolve('refund')} className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <i className="ri-refund-2-line mr-1" />Rembourser acheteur
                  </button>
                  <button onClick={() => handleResolve('force_pay')} className="flex-1 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-semibold cursor-pointer">
                    <i className="ri-bank-card-line mr-1" />Confirmer la commande
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

function EvidencePanel({ icon, title, meta, note, children }) {
  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
      <div className="px-3 py-1.5 bg-white border-b border-slate-100 flex items-center gap-1.5">
        <i className={`${icon} text-trustblue text-sm`} />
        <span className="text-xs font-semibold text-slate-700 truncate">{title}</span>
      </div>
      <div className="h-36 bg-slate-100">{children}</div>
      {(meta || note) && (
        <div className="px-3 py-1.5 border-t border-slate-100 bg-white">
          {meta && <p className="text-xs text-slate-500 truncate">{meta}</p>}
          {note && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{note}</p>}
        </div>
      )}
    </div>
  );
}
