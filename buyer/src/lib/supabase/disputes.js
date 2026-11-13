import { supabase } from '@/lib/supabaseClient';
const uploadDisputeVideo = async (blob, buyerId, orderId) => {
    const fileName = `disputes/${buyerId}/${orderId}/${Date.now()}.webm`;
    const { error: upErr } = await supabase.storage
        .from('delivery-videos')
        .upload(fileName, blob, { contentType: 'video/webm', upsert: false });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from('delivery-videos').getPublicUrl(fileName);
    return data.publicUrl;
};
/**
 * Opens a dispute: stores the unboxing video and moves the order to 'disputed'.
 * Accepts either a Blob (videoBlob, uploaded here) or an already uploaded path (videoFilePath).
 * Goes through the open_order_dispute() server function: buyers cannot change
 * orders.status directly (RLS), so the switch to 'disputed' has to happen
 * server-side, atomically with the dispute creation.
 */
export const createDispute = async ({ orderId, buyerId, reason, videoBlob, videoFilePath }) => {
    if (!buyerId || !orderId) throw new Error('buyerId and orderId required');
    const resolvedPath = videoFilePath
        ? supabase.storage.from('delivery-videos').getPublicUrl(videoFilePath).data.publicUrl
        : (videoBlob ? await uploadDisputeVideo(videoBlob, buyerId, orderId) : null);
    const { data: disputeId, error } = await supabase.rpc('open_order_dispute', {
        p_order_id: orderId,
        p_reason: reason,
        p_video_url: resolvedPath,
    });
    if (error) throw error;
    return { disputeId, videoUrl: resolvedPath };
};
/**
 * Fetches the signed-in buyer's disputes.
 */
export const fetchBuyerDisputes = async (buyerId) => {
    if (!buyerId) return [];
    const { data, error } = await supabase
        .from('disputes')
        .select(`
      *,
      order:orders(id, status, total_amount, created_at),
      video:delivery_videos(video_url, is_defective, reviewed_at)
    `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
