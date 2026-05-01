import { supabase } from '@/lib/supabaseClient';
/**
 * Fetch le profil complet d'un utilisateur.
 */
export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};
/**
 * Met à jour le profil d'un utilisateur.
 */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.fullName,
      phone: updates.phone,
      default_address_line1: updates.addressLine1,
      default_city: updates.city,
      default_country: updates.country || 'Bénin',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};
