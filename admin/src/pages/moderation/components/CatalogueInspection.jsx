import { useState } from 'react';
import { getSharedRate } from '@/lib/sharedStorage';

function formatNumber(n) {
  return Number(n).toLocaleString('fr-FR');
}

export default function CatalogueInspection({ products, onApprove, onReject }) {
  const pending = products.filter(p => p.status === 'PENDING_REVIEW' || p.status === 'pending');
  const decided = products.filter(p => p.status !== 'PENDING_REVIEW' && p.status !== 'pending');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [commentError, setCommentError] = useState(false);

  const current = pending[currentIdx] || null;
  const { rate } = getSharedRate();

  function getPriceXof(p) {
    if (p.price_xof && p.price_xof > 0) return p.price_xof;
    return Math.round(p.price_ngn * rate);
  }

  function handleApprove() {
    if (!current) return;
    setSwipeDir('right');
    setTimeout(() => {
      onApprove(current, adminComment || undefined);
      setSwipeDir(null); setImgIdx(0); setAdminComment(''); setCommentError(false);
      setCurrentIdx(i => Math.min(i, pending.length - 2));
    }, 300);
  }

  function handleReject() {
    if (!current) return;
    if (!adminComment.trim()) { setCommentError(true); return; }
    setCommentError(false);
    setSwipeDir('left');
    setTimeout(() => {
      onReject(current, adminComment);
      setSwipeDir(null); setImgIdx(0); setAdminComment(''); setCommentError(false);
      setCurrentIdx(i => Math.min(i, pending.length - 2));
    }, 300);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Inspection catalogue</h3>
        <p className="text-xs text-slate-500 mt-0.5">{pending.length} produit{pending.length !== 1 ? 's' : ''} en attente</p>
      </div>

      {!current ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <i className="ri-checkbox-circle-line text-emerald-500 text-3xl" />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>File vide !</h4>
          <p className="text-sm text-slate-500">Tous les produits ont été modérés.</p>
        </div>
      ) : (
        <div className="p-5">
          <div className={`transition-all duration-300 ${swipeDir === 'right' ? 'translate-x-full opacity-0' : swipeDir === 'left' ? '-translate-x-full opacity-0' : ''}`}>
            {/* Badge Source */}
            <div className="flex justify-end mb-2">
              {current.seller_id ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(18,92,141,0.1)', color: '#125C8D' }}>
                  <i className="ri-store-2-line" />Seller Hub
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-400">
                  <i className="ri-test-tube-line" />Mock
                </span>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-100" style={{ aspectRatio: '4/3' }}>
              <img src={current.images[imgIdx]} alt={current.name} className="w-full h-full object-cover" />
              {current.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {current.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`rounded-full cursor-pointer transition-all ${i === imgIdx ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <p className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{current.name}</p>
                <p className="text-xs text-slate-500">{current.category} · {current.seller_name}</p>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#125C8D' }}>FCFA {formatNumber(getPriceXof(current))}</p>
                <p className="text-xs text-slate-400">₦ {formatNumber(current.price_ngn)}</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{current.description}</p>
            </div>

            <p className="text-xs text-slate-400 text-center mb-3">{currentIdx + 1} / {pending.length}</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={handleReject} className="py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-thumb-down-line" />Rejeter
              </button>
              <button onClick={handleApprove} className="py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-thumb-up-line" />Approuver
              </button>
            </div>

            <textarea
              value={adminComment}
              onChange={e => { setAdminComment(e.target.value); if (e.target.value.trim()) setCommentError(false); }}
              placeholder="Commentaire pour le vendeur (obligatoire pour le rejet)..."
              maxLength={150}
              rows={2}
              className="w-full border border-slate-200 rounded-lg text-xs p-2 resize-none focus:outline-none focus:ring-1 focus:ring-trustblue"
            />
            {commentError && (
              <p className="text-red-500 text-xs mt-1">Un commentaire est requis pour informer le vendeur.</p>
            )}
          </div>
        </div>
      )}

      <div className="px-5 pb-4 border-t border-slate-100 mt-2 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dernières décisions</p>
        <div className="space-y-1.5">
          {decided.slice(0, 3).map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <i className={`text-xs ${p.status === 'APPROVED' || p.status === 'approved' ? 'ri-checkbox-circle-line text-emerald-500' : 'ri-close-circle-line text-red-500'}`} />
              <p className="text-xs text-slate-600 truncate flex-1">{p.name}</p>
              <span className={`text-xs font-semibold ${p.status === 'APPROVED' || p.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                {p.status === 'APPROVED' || p.status === 'approved' ? 'OK' : 'KO'}
              </span>
            </div>
          ))}
          {decided.length === 0 && <p className="text-xs text-slate-400">Aucune décision encore.</p>}
        </div>
      </div>
    </div>
  );
}
