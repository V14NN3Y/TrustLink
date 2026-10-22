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
 * Crée un litige + vidéo de déballage + passe la commande en status 'disputed'.
 * Accepte soit un Blob (via videoBlob, upload automatique), soit un chemin déjà uploadé (via videoFilePath).
 * Passe par la fonction serveur open_order_dispute() : les buyers n'ont pas
 * le droit de modifier orders.status directement (RLS), donc la bascule en
 * 'disputed' doit être faite côté serveur, de façon atomique avec la
 * création du litige.
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
 * Récupère les litiges du buyer connecté.
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
