import { supabase } from '@/lib/supabaseClient';
/**
 * Upload une vidéo dans le bucket delivery-videos et retourne l'URL publique.
 */
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
 */
export const createDispute = async ({ orderId, buyerId, reason, videoBlob }) => {
    let videoUrl = null;
    let videoId = null;
    if (videoBlob) {
        videoUrl = await uploadDisputeVideo(videoBlob, buyerId, orderId);
        const { data: dv, error: dvErr } = await supabase
            .from('delivery_videos')
            .insert({ order_id: orderId, buyer_id: buyerId, video_url: videoUrl })
            .select('id')
            .single();
        if (dvErr) throw dvErr;
        videoId = dv.id;
    }
    const { data, error } = await supabase
        .from('disputes')
        .insert({ order_id: orderId, buyer_id: buyerId, video_id: videoId, reason, status: 'open' })
        .select()
        .single();
    if (error) throw error;
    // Met la commande en litige
    await supabase
        .from('orders')
        .update({ status: 'disputed', updated_at: new Date().toISOString() })
        .eq('id', orderId);
    return { dispute: data, videoUrl };
};
/**
 * Récupère les litiges du buyer connecté.
 */
export const fetchBuyerDisputes = async (buyerId) => {
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
