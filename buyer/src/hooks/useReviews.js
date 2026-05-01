import { useState, useEffect, useCallback } from 'react';
import {
  getProductReviews,
  getBuyerReview,
  canBuyerReview,
  submitReview,
  getProductRatingStats,
} from '@/lib/supabase/reviews';
import { useAuth } from '@/lib/AuthContext';
export const useReviews = (productId) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [myReview, setMyReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fetchAll = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, statsData] = await Promise.all([
        getProductReviews(productId),
        getProductRatingStats(productId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
      if (user) {
        const [myRev, eligible] = await Promise.all([
          getBuyerReview(productId, user.id),
          canBuyerReview(productId, user.id),
        ]);
        setMyReview(myRev);
        setCanReview(eligible);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const submit = async ({ rating, comment, orderId }) => {
    if (!user) throw new Error('Non connecté');
    setSubmitting(true);
    try {
      await submitReview({
        productId,
        buyerId: user.id,
        orderId,
        rating,
        comment,
      });
      await fetchAll(); // Refresh
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };
  return {
    reviews,
    stats,
    myReview,
    canReview,
    loading,
    submitting,
    error,
    refetch: fetchAll,
    submit,
  };
};
