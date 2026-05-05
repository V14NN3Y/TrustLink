import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDateTime } from '@/components/base/DataTransformer';
export default function DeliveryVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  async function fetchVideos() {
    setLoading(true);
    const { data } = await supabase
      .from('delivery_videos')
      .select(`
        *,
        buyer:profiles!buyer_id(full_name, email),
        order:orders!order_id(id, total_amount, status),
        reviewer:profiles!reviewed_by(full_name)
      `)
      .order('created_at', { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }
  useEffect(() => { fetchVideos(); }, []);
  async function handleReview(videoId, isDefective, reason = '') {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase
    .from('delivery_videos')
    .update({
      is_defective: isDefective,
      defective_reason: reason || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', videoId);

  // Si défectueux, vérifier s'il y a déjà un litige, sinon en créer un
  if (isDefective) {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      const { data: existingDispute } = await supabase
        .from('disputes')
        .select('id')
        .eq('order_id', video.order_id)
        .maybeSingle();
      
      if (!existingDispute) {
        await supabase.from('disputes').insert({
          order_id: video.order_id,
          buyer_id: video.buyer_id,
          video_id: videoId,
          reason: reason || 'Produit défectueux détecté lors de la review vidéo',
          status: 'open',
        });
      
        // Update order status to disputed
        await supabase
          .from('orders')
          .update({ status: 'disputed' })
          .eq('id', video.order_id);
        
        // Notification buyer
        await supabase.from('notifications').insert({
          user_id: video.buyer_id,
          type: 'dispute_update',
          title: 'Litige ouvert suite à la review de votre vidéo',
          body: reason || 'Un problème a été détecté sur votre commande.',
          resource_type: 'order',
          resource_id: video.order_id,
          is_read: false,
        });
      }
    }
  }

  // Admin log
  await supabase.from('admin_logs').insert({
    admin_id: user.id,
    action: isDefective ? 'video_marked_defective' : 'video_marked_ok',
    resource_type: 'delivery_video',
    resource_id: videoId,
    new_value: { is_defective: isDefective, reason },
  });

  await fetchVideos();
  setSelected(null);
}
  const filtered = videos.filter(v => {
    if (filter === 'pending') return v.is_defective === null;
    if (filter === 'defective') return v.is_defective === true;
    if (filter === 'ok') return v.is_defective === false;
    return true;
  });
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Vidéos de réception
      </h1>
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'pending', label: 'Non reviewées' },
          { key: 'defective', label: 'Défectueuses' },
          { key: 'ok', label: 'Conformes' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border transition-all ${
              filter === f.key ? 'bg-trustblue text-white border-trustblue' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Chargement...</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(v => (
              <div key={v.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                  <video src={v.video_url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <i className="ri-play-circle-line text-white text-2xl" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{v.buyer?.full_name || '—'}</p>
                  <p className="text-xs text-slate-500">Commande: {v.order_id?.slice(0, 8)}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(v.created_at)}</p>
                  {v.defective_reason && (
                    <p className="text-xs text-red-500 mt-1">{v.defective_reason}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {v.is_defective === null ? (
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">En attente</span>
                  ) : v.is_defective ? (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-semibold">Défectueux</span>
                  ) : (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">Conforme</span>
                  )}
                </div>
                <button
                  onClick={() => setSelected(v)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 cursor-pointer flex-shrink-0"
                >
                  <i className="ri-eye-line text-trustblue" />
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">Aucune vidéo trouvée</div>
            )}
          </div>
        )}
      </div>
      {/* Modal review */}
      {selected && (
        <VideoReviewModal
          video={selected}
          onClose={() => setSelected(null)}
          onReview={handleReview}
        />
      )}
    </div>
  );
}
function VideoReviewModal({ video, onClose, onReview }) {
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Revue vidéo — {video.buyer?.full_name}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
            <i className="ri-close-line text-slate-500 text-xl" />
          </button>
        </div>
        <video src={video.video_url} controls className="w-full rounded-xl mb-4 max-h-64 object-cover" />
        {video.is_defective === null && (
          <>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                Raison (si défectueux)
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Décrire le problème constaté..."
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onReview(video.id, false)}
                className="flex-1 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-checkbox-circle-line" /> Conforme
              </button>
              <button
                onClick={() => onReview(video.id, true, reason)}
                className="flex-1 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-error-warning-line" /> Défectueux
              </button>
            </div>
          </>
        )}
        {video.is_defective !== null && (
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
            video.is_defective
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            <i className={video.is_defective ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'} />
            {video.is_defective ? `Défectueux : ${video.defective_reason || 'Aucune raison'}` : 'Produit conforme'}
            {video.reviewer && <span className="ml-auto text-xs opacity-70">Reviewé par {video.reviewer.full_name}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
