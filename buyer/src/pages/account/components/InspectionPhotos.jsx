import { useEffect, useState } from 'react';
import { fetchOrderInspections } from '@/lib/supabase/tracking';

// Statuses from which an inspection photo can exist (taken in Lagos before dispatch).
const STATUSES_WITH_INSPECTION = ['processing', 'in_transit', 'delivered', 'confirmed', 'disputed', 'refunded'];

/**
 * "Lagos inspection" block in the expanded order of /account: shows the
 * photo(s) the Lagos agent took of the goods before dispatch, so the buyer can
 * compare with what they receive.
 */
export default function InspectionPhotos({ orderIds, status }) {
  const [photos, setPhotos] = useState([]);
  const [zoomed, setZoomed] = useState(null);
  const enabled = STATUSES_WITH_INSPECTION.includes(status);
  const key = (orderIds || []).join(',');

  useEffect(() => {
    if (!enabled || !key) return undefined;
    let cancelled = false;
    fetchOrderInspections(key.split(','))
      .then((list) => { if (!cancelled) setPhotos(list); })
      .catch(() => { if (!cancelled) setPhotos([]); });
    return () => { cancelled = true; };
  }, [key, enabled]);

  if (!enabled || photos.length === 0) return null;

  return (
    <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#ECFDF5' }}>
      <div className="flex items-center gap-2 mb-2">
        <i className="ri-camera-lens-line text-xs" style={{ color: '#047857' }} />
        <span className="text-xs font-poppins font-semibold" style={{ color: '#047857' }}>Inspection à Lagos</span>
        <span className="text-xs font-inter" style={{ color: '#6B7280' }}>
          · contrôlé le {new Date(photos[0].createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <button key={p.id} type="button" onClick={() => setZoomed(p)} className="w-20 h-20 rounded-lg overflow-hidden cursor-zoom-in" style={{ backgroundColor: '#F8FAFC' }}>
            <img src={p.url} alt="Photo d'inspection" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {photos.some((p) => p.notes) && (
        <p className="text-xs font-inter mt-2" style={{ color: '#374151' }}>{photos.find((p) => p.notes).notes}</p>
      )}

      {zoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setZoomed(null)}>
          <img src={zoomed.url} alt="Photo d'inspection" className="max-w-full max-h-full rounded-xl" />
          <button type="button" className="absolute top-4 right-4 text-white text-2xl" aria-label="Fermer" onClick={() => setZoomed(null)}>
            <i className="ri-close-line" />
          </button>
        </div>
      )}
    </div>
  );
}
