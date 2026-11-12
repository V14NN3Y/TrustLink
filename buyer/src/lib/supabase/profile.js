import { supabase } from '@/lib/supabaseClient';
/**
 * Fetches a user's full profile.
 */
export const fetchProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};
/**
 * Updates a user's profile.
 */
export const updateProfile = async (userId, updates) => {
  if (!userId) throw new Error('userId required');
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
