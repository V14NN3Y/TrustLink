import { supabase } from '@/lib/supabaseClient';
/**
 * Upload une vidéo de confirmation dans le bucket delivery-videos (privé).
 * Retourne le chemin du fichier pour générer une URL signée plus tard.
 */
export const uploadDeliveryVideo = async (blob, buyerId, orderId) => {
    const fileName = `confirmations/${buyerId}/${orderId}/${Date.now()}.webm`;
    const { error: upErr } = await supabase.storage
        .from('delivery-videos')
        .upload(fileName, blob, { contentType: 'video/webm', upsert: false });
    if (upErr) throw upErr;
    return fileName; // Retourne le chemin relatif, pas d'URL publique (bucket privé)
};
/**
 * Génère une URL signée pour accéder à une vidéo (bucket privé).
 * L'URL expire après 60 minutes.
 */
export const getSignedVideoUrl = async (filePath) => {
    const { data, error } = await supabase.storage
        .from('delivery-videos')
        .createSignedUrl(filePath, 60 * 60); // 1 heure
    if (error) throw error;
    return data.signedUrl;
};
/**
 * Crée un enregistrement dans delivery_videos.
 */
export const createDeliveryVideoRecord = async ({
    orderId,
    buyerId,
    videoUrl,
    durationSeconds,
    isDefective = false,
}) => {
    const { data, error } = await supabase
        .from('delivery_videos')
        .insert({
            order_id: orderId,
            buyer_id: buyerId,
            video_url: videoUrl,
            duration_seconds: durationSeconds,
            is_defective: isDefective,
        })
        .select('id')
        .single();
    if (error) throw error;
    return data.id;
};
/**
 * Confirme la réception d'une commande avec vidéo.
 * 1. Upload la vidéo
 * 2. Crée le record delivery_videos (is_defective = false)
 * 3. Met à jour le statut de la commande à 'confirmed'
 */
export const confirmOrderDelivery = async ({
    orderId,
    buyerId,
    videoBlob,
    durationSeconds,
}) => {
    const videoUrl = await uploadDeliveryVideo(videoBlob, buyerId, orderId);
    await createDeliveryVideoRecord({
        orderId,
        buyerId,
        videoUrl,
        durationSeconds,
        isDefective: false,
    });
    const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', orderId);
    if (error) throw error;
    return { videoUrl };
};
