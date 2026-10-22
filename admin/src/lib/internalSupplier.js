import { supabase } from '@/lib/supabaseClient';

export const INTERNAL_SUPPLIER_SLUG = 'trustlink-sourcing';

let cachedId = null;

export async function getInternalSupplierId() {
  if (cachedId) return cachedId;
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('business_slug', INTERNAL_SUPPLIER_SLUG)
    .single();
  if (error || !data) {
    throw new Error('Profil fournisseur interne introuvable — exécuter scripts/create-internal-supplier.mjs.');
  }
  cachedId = data.id;
  return cachedId;
}
