import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createDispute, fetchBuyerDisputes } from '@/lib/supabase/disputes';
export function useDisputes() {
    const { user, isAuthenticated } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const loadDisputes = useCallback(async () => {
        if (!isAuthenticated || !user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBuyerDisputes(user.id);
            setDisputes(data);
        } catch (err) {
            setError(err.message);
            console.error('Erreur litiges:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id]);
    useEffect(() => {
        loadDisputes();
    }, [loadDisputes]);
    const openDispute = useCallback(async ({ orderId, reason, videoBlob }) => {
        if (!user?.id) throw new Error('Non connecté');
        setSubmitting(true);
        setError(null);
        try {
            const result = await createDispute({ orderId, buyerId: user.id, reason, videoBlob });
            await loadDisputes();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setSubmitting(false);
        }
    }, [user?.id, loadDisputes]);
    return { disputes, loading, submitting, error, openDispute, reload: loadDisputes };
}
