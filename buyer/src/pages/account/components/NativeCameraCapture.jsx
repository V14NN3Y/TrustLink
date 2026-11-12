import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const MAX_BYTES = 150 * 1024 * 1024;

// Ouvre la caméra native de l'appareil (attribut capture) puis envoie la vidéo.
export default function NativeCameraCapture({ orderId, onRecorded }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setDone(false);
    if (!file.type.startsWith('video/')) { setError('Le fichier doit être une vidéo.'); return; }
    if (file.size > MAX_BYTES) { setError('Vidéo trop volumineuse (150 Mo maximum).'); return; }
    if (!user?.id || !orderId) { setError('Session expirée, reconnectez-vous.'); return; }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
      const path = `disputes/${user.id}/${orderId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('delivery-videos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      setDone(true);
      onRecorded?.(path);
    } catch {
      setError("Erreur lors de l'envoi de la vidéo. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="video/*" capture="environment" onChange={handleFile} className="hidden" />
      {previewUrl && (
        <video src={previewUrl} controls playsInline className="w-full rounded-xl mb-3 bg-black max-h-64" />
      )}
      {error && <p className="text-xs font-inter mb-2" style={{ color: '#DC2626' }}>{error}</p>}
      {uploading && <p className="text-xs font-inter mb-2 text-gray-500">Envoi de la vidéo en cours…</p>}
      {done && <p className="text-xs font-inter mb-2 flex items-center gap-1" style={{ color: '#15803D' }}><i className="ri-check-line" /> Vidéo enregistrée</p>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-poppins font-semibold rounded-lg text-white disabled:opacity-50 cursor-pointer"
        style={{ backgroundColor: '#DC2626' }}
      >
        <i className="ri-camera-line text-lg" />
        {previewUrl ? 'Refilmer avec la caméra' : 'Ouvrir la caméra et filmer le déballage'}
      </button>
    </div>
  );
}
