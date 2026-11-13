import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import SignedMedia from '@/components/base/SignedMedia';
import { formatDateTime } from '@/components/base/DataTransformer';

const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket limit in supabase/setup/00_buckets.sql
const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };

/**
 * "Inspection Lagos" tab of the order modal: the back-office uploads the photo
 * the Lagos agent took of the goods. It is shown next to the Cotonou customer
 * video in the disputes view (moderation page).
 */
export default function InspectionTab({ orderId }) {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [notes, setNotes] = useState('');
  const [visibleToBuyer, setVisibleToBuyer] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('order_inspections')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    if (err) setError("Impossible de charger les inspections : " + err.message);
    setInspections(data || []);
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    setError('');
    if (!f) { setFile(null); return; }
    if (!f.type.startsWith('image/')) { setError('Le fichier doit être une image.'); setFile(null); return; }
    if (f.size > MAX_BYTES) { setError('Image trop lourde (10 Mo maximum).'); setFile(null); return; }
    setFile(f);
  }

  async function handleSubmit() {
    if (!file || !user || saving) return;
    setSaving(true);
    setError('');
    const ext = EXT_BY_TYPE[file.type] || file.name.split('.').pop() || 'jpg';
    const path = `orders/${orderId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('inspection-photos')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) { setError("Échec de l'envoi : " + upErr.message); setSaving(false); return; }

    const { error: insErr } = await supabase.from('order_inspections').insert({
      order_id: orderId,
      photo_path: path,
      agent_name: agentName.trim() || null,
      notes: notes.trim() || null,
      inspected_by: user.id,
      visible_to_buyer: visibleToBuyer,
    });
    if (insErr) {
      // Do not leave an orphan file in the bucket.
      await supabase.storage.from('inspection-photos').remove([path]);
      setError("Échec de l'enregistrement : " + insErr.message);
      setSaving(false);
      return;
    }

    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'inspection_photo_added',
      resource_type: 'order',
      resource_id: orderId,
      old_value: null,
      new_value: { photo_path: path, visible_to_buyer: visibleToBuyer },
    });

    setFile(null); setAgentName(''); setNotes(''); setVisibleToBuyer(true);
    setSaving(false);
    await load();
  }

  // Publish / hide a photo for the buyer. Publishing notifies the buyer (DB trigger).
  async function toggleVisibility(inspection) {
    const next = !inspection.visible_to_buyer;
    const { error: upErr } = await supabase
      .from('order_inspections')
      .update({ visible_to_buyer: next })
      .eq('id', inspection.id);
    if (upErr) { setError("Impossible de modifier la visibilité : " + upErr.message); return; }
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: next ? 'inspection_photo_published' : 'inspection_photo_hidden',
      resource_type: 'order',
      resource_id: orderId,
      old_value: { visible_to_buyer: inspection.visible_to_buyer },
      new_value: { visible_to_buyer: next },
    });
    await load();
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Photos d'inspection (Lagos)</label>
        {loading ? (
          <p className="text-sm text-slate-400">Chargement…</p>
        ) : inspections.length === 0 ? (
          <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-xl">
            <i className="ri-image-line text-3xl mb-2 block" />
            <p className="text-sm">Aucune photo pour cette commande</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {inspections.map(i => (
              <div key={i.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="h-40 bg-slate-100">
                  <SignedMedia kind="image" bucket="inspection-photos" src={i.photo_path} alt="Inspection Lagos" className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2 bg-white">
                  <p className="text-xs text-slate-500">{[i.agent_name, formatDateTime(i.created_at)].filter(Boolean).join(' · ')}</p>
                  {i.notes && <p className="text-xs text-slate-600 mt-0.5">{i.notes}</p>}
                  <button
                    onClick={() => toggleVisibility(i)}
                    className={`mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${i.visible_to_buyer ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    title={i.visible_to_buyer ? 'Cliquer pour masquer à l\'acheteur' : 'Cliquer pour envoyer à l\'acheteur'}
                  >
                    <i className={`${i.visible_to_buyer ? 'ri-eye-line' : 'ri-eye-off-line'} mr-1`} />
                    {i.visible_to_buyer ? "Visible par l'acheteur" : 'Interne (non envoyée)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Ajouter une photo</label>
        <input type="file" accept="image/*" onChange={onPickFile} className="block w-full text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-blue-50 file:text-trustblue file:font-semibold file:cursor-pointer" />
        <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Nom de l'agent à Lagos (optionnel)" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes d'inspection (optionnel)" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none" />
        <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={visibleToBuyer} onChange={e => setVisibleToBuyer(e.target.checked)} className="mt-0.5" />
          <span>Envoyer la photo à l'acheteur <span className="text-slate-400">(il reçoit une notification et la voit dans le suivi de sa commande)</span></span>
        </label>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={handleSubmit} disabled={!file || saving} className="w-full py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
          {saving ? 'Envoi…' : 'Enregistrer la photo'}
        </button>
      </div>
    </div>
  );
}
