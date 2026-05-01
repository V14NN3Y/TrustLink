import { supabase } from '@/lib/supabaseClient';
/**
 * Fetch le taux de change NGN → XOF depuis Supabase.
 */
export const fetchExchangeRate = async () => {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('rate, updated_at')
    .eq('from_currency', 'NGN')
    .eq('to_currency', 'XOF')
    .maybeSingle();
  if (error) throw error;
  return data;
};
