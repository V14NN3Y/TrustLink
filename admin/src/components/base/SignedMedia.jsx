import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Private buckets (delivery-videos, inspection-photos) cannot be read through a
 * public URL. We store either an object path or (legacy) a getPublicUrl() URL
 * in the database, so we normalise to an object path and ask Supabase for a
 * temporary signed URL. Admin RLS on storage.objects allows this.
 */
export function extractStoragePath(bucket, value) {
  if (!value) return null;
  if (!/^https?:\/\//.test(value)) return value;
  const marker = `/${bucket}/`;
  const i = value.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(value.slice(i + marker.length).split('?')[0]);
}

export function useSignedUrl(bucket, value, expiresIn = 3600) {
  const [state, setState] = useState({ url: null, loading: !!value, error: false });

  useEffect(() => {
    let cancelled = false;
    const path = extractStoragePath(bucket, value);
    if (!path) {
      setState({ url: null, loading: false, error: false });
      return undefined;
    }
    setState({ url: null, loading: true, error: false });
    supabase.storage.from(bucket).createSignedUrl(path, expiresIn).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data?.signedUrl) setState({ url: null, loading: false, error: true });
      else setState({ url: data.signedUrl, loading: false, error: false });
    });
    return () => { cancelled = true; };
  }, [bucket, value, expiresIn]);

  return state;
}

export default function SignedMedia({ kind = 'video', bucket, src, className = '', controls = true, alt = '', emptyLabel = 'Aucun fichier' }) {
  const { url, loading, error } = useSignedUrl(bucket, src);

  if (!src) {
    return <Placeholder icon={kind === 'video' ? 'ri-video-off-line' : 'ri-image-line'} label={emptyLabel} />;
  }
  if (loading) return <Placeholder icon="ri-loader-4-line animate-spin" label="Chargement…" />;
  if (error || !url) return <Placeholder icon="ri-error-warning-line" label="Fichier inaccessible" tone="error" />;

  return kind === 'video'
    ? <video src={url} controls={controls} className={className} preload="metadata" />
    : <img src={url} alt={alt} className={className} />;
}

function Placeholder({ icon, label, tone }) {
  return (
    <div className={`w-full h-full min-h-[8rem] flex flex-col items-center justify-center gap-1 text-xs ${tone === 'error' ? 'text-red-500' : 'text-slate-400'}`}>
      <i className={`${icon} text-2xl`} />
      <span>{label}</span>
    </div>
  );
}
