import { supabase } from '@/lib/supabaseClient';

export const getSignedVideoUrl = async (filePath) => {
    const { data, error } = await supabase.storage
        .from('delivery-videos')
        .createSignedUrl(filePath, 60 * 60);
    if (error) throw error;
    return data.signedUrl;
};

export const createDeliveryVideoRecord = async ({
    orderId,
    buyerId,
    videoUrl,
    durationSeconds,
}) => {
    if (!buyerId || !orderId) throw new Error('buyerId and orderId required');
    const { data, error } = await supabase
        .from('delivery_videos')
        .insert({
            order_id: orderId,
            buyer_id: buyerId,
            video_url: videoUrl,
            duration_seconds: durationSeconds,
        })
        .select('id')
        .single();
    if (error) throw error;
    // Les buyers n'ont pas de droit `update` sur orders (RLS) : la bascule
    // en 'confirmed' doit passer par cette fonction serveur dédiée.
    const { error: confirmError } = await supabase.rpc('confirm_order_receipt', {
        p_order_id: orderId,
    });
    if (confirmError) throw confirmError;
    return data.id;
};
