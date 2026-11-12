import { supabase } from '@/lib/supabaseClient';

// Doit rester aligné avec ALLOWED_HOSTS de supabase/functions/sourcing-preview/parse.ts
const PREVIEW_HOSTS = ['konga.com', 'jumia.com.ng'];

export const isPreviewSupported = (value) => {
  try {
    const u = new URL(String(value).trim());
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && PREVIEW_HOSTS.some((a) => h === a || h.endsWith(`.${a}`));
  } catch {
    return false;
  }
};

/** Aperçu automatique (titre, prix NGN, image) d'un lien Konga/Jumia. Lève une erreur si indisponible. */
export const previewSourcingLink = async (url) => {
  const { data, error } = await supabase.functions.invoke('sourcing-preview', { body: { url } });
  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error || 'preview_failed');
  return data;
};

export const createSourcingRequest = async ({
  buyerId, productUrl, title, quantity, budgetXof, notes, sourcePriceNgn, sourceImageUrl,
}) => {
  if (!buyerId) throw new Error('Non connecté');
  const row = {
    buyer_id: buyerId,
    product_url: productUrl,
    title: title || null,
    quantity,
    budget_xof: budgetXof || null,
    notes: notes || null,
  };
  // Colonnes ajoutées par migrations/2026_11_sourcing_preview_columns.sql : envoyées seulement si l'aperçu a abouti
  if (sourcePriceNgn) row.source_price_ngn = sourcePriceNgn;
  if (sourceImageUrl) row.source_image_url = sourceImageUrl;
  const { data, error } = await supabase.from('sourcing_requests').insert(row).select().single();
  if (error) throw error;
  return data;
};
