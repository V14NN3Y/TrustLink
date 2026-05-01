import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { createDeliveryVideoRecord, getSignedVideoUrl } from '@/lib/supabase/deliveryVideos';
export function useDeliveryVideos() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const confirmDeliveryWithVideo = useCallback(
        async ({ orderId, videoFilePath, isDefective = false }) => {
            if (!user?.id) throw new Error('Non connecté');
            setUploading(true);
            setError(null);
            try {
                // Créer l'enregistrement dans delivery_videos
                const videoId = await createDeliveryVideoRecord({
                    orderId,
                    buyerId: user.id,
                    videoUrl: videoFilePath, // Chemin relatif (bucket privé)
                    durationSeconds: 0,
                    isDefective: isDefective,
                });
                // Mettre à jour le statut de la commande
                const { error } = await supabase
                    .from('orders')
                    .update({ status: isDefective ? 'disputed' : 'confirmed', updated_at: new Date().toISOString() })
                    .eq('id', orderId);
                if (error) throw error;
                return { videoId, isDefective };
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setUploading(false);
            }
        },
        [user?.id],
    );
    return { confirmDeliveryWithVideo, uploading, error, getSignedVideoUrl };
}
