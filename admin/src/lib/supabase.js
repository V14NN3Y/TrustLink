import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const TABLES = {
  SELLERS: 'sellers',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SELLER_PRODUCTS: 'seller_products',
  SELLER_WALLET: 'seller_wallet',
  SELLER_ORDERS: 'seller_orders',
  SELLER_TRANSACTIONS: 'seller_transactions',
  CATALOG_PENDING: 'catalog_pending',
  DISPATCHES: 'dispatches',
  EXCHANGE_RATES: 'exchange_rates',
  RATE_HISTORY: 'rate_history',
  SYSTEM_CONFIG: 'system_config',
};