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
    return data.id;
};
