import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatNGN, formatXOF } from '@/components/base/DataTransformer';

export default function CatalogueInspection({ products, onUpdate }) {
  const pending = products.filter(p => p.status === 'pending_review');
  const currentIdx = 0;
  const [imgIdx, setImgIdx] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);

  const current = pending[currentIdx] || null;

  async function handleSwipe(dir) {
    if (!current) return;
    setSwipeDir(dir);

    const newStatus = dir === 'right' ? 'approved' : 'rejected';

    // Log admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: dir === 'right' ? 'product_approved' : 'product_rejected',
      resource_type: 'product',
      resource_id: current.id,
      old_value: { status: 'pending_review' },
      new_value: { status: newStatus },
    });

    // Notification au seller
    const { data: prod } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', current.id)
      .single();

    if (prod?.seller_id) {
      await supabase.from('notifications').insert({
        user_id: prod.seller_id,
        type: dir === 'right' ? 'product_approved' : 'product_rejected',
        title: `Produit "${current.name}" ${dir === 'right' ? 'approuvé' : 'rejeté'}`,
        body: dir === 'right' ? 'Votre produit est maintenant visible sur la marketplace.' : 'Votre produit a été rejeté par un administrateur.',
        resource_type: 'product',
        resource_id: current.id,
        is_read: false,
      });
    }

    setTimeout(() => {
      onUpdate({ ...current, status: newStatus });
      setSwipeDir(null);
      setImgIdx(0);
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
              <div className="flex gap-3">
                <div><p className="text-xs text-slate-400">NGN</p><p className="font-bold text-sm text-orange-500">{formatNGN(current.price_ngn)}</p></div>
                <div><p className="text-xs text-slate-400">XOF</p><p className="font-bold text-sm text-trustblue">{formatXOF(current.price_xof)}</p></div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{current.description}</p>
            </div>
            <p className="text-xs text-slate-400 text-center mb-3">{currentIdx + 1} / {pending.length}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleSwipe('left')} className="py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-thumb-down-line" />Rejeter
              </button>
              <button onClick={() => handleSwipe('right')} className="py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                <i className="ri-thumb-up-line" />Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-4 border-t border-slate-100 mt-2 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Dernières décisions</p>
        <div className="space-y-1.5">
          {products.filter(p => p.status !== 'PENDING_REVIEW').slice(0, 3).map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <i className={`text-xs ${p.status === 'APPROVED' ? 'ri-checkbox-circle-line text-emerald-500' : 'ri-close-circle-line text-red-500'}`} />
              <p className="text-xs text-slate-600 truncate flex-1">{p.name}</p>
              <span className={`text-xs font-semibold ${p.status === 'APPROVED' ? 'text-emerald-600' : 'text-red-500'}`}>{p.status === 'APPROVED' ? 'OK' : 'KO'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
