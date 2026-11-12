import { supabase } from '@/lib/supabaseClient';

const SIGNED_URL_TTL = 60 * 60; // 1h, same as delivery videos

/**
 * Lagos inspection photos the team chose to share for these orders.
 * RLS only returns photos of the buyer's own orders with visible_to_buyer = true;
 * the bucket is private, so each photo comes with a short-lived signed URL.
 */
export const fetchOrderInspections = async (orderIds) => {
  if (!orderIds?.length) return [];
  const { data, error } = await supabase
    .from('order_inspections')
    .select('id, order_id, photo_path, notes, created_at')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];

  const { data: signed, error: signErr } = await supabase.storage
    .from('inspection-photos')
    .createSignedUrls(data.map((i) => i.photo_path), SIGNED_URL_TTL);
  if (signErr) throw signErr;

  const urlByPath = Object.fromEntries((signed || []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
  return data
    .map((i) => ({ id: i.id, orderId: i.order_id, notes: i.notes, createdAt: i.created_at, url: urlByPath[i.photo_path] || null }))
    .filter((i) => i.url);
};

/**
 * Timestamped history of the order journey (filled by a DB trigger on every
 * status change). Steps come from the `delivery_steps` table:
 * ordered → paid → inspection → in_transit → delivered → confirmed (+ disputed / cancelled / refunded).
 */
export const fetchOrderTracking = async (orderIds) => {
  if (!orderIds?.length) return [];
  const { data, error } = await supabase
    .from('order_tracking_events')
    .select('id, order_id, step, status, note, location, created_at, delivery_steps (label, icon, position, is_main_step)')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((e) => ({
    id: e.id,
    orderId: e.order_id,
    step: e.step,
    status: e.status,
    label: e.delivery_steps?.label || e.step,
    icon: e.delivery_steps?.icon || 'ri-checkbox-blank-circle-line',
    note: e.note,
    location: e.location,
    createdAt: e.created_at,
  }));
};
