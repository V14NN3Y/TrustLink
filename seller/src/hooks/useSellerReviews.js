import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
export function useSellerReviews(sellerId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, fiveStars: 0 });
  const fetchReviews = useCallback(async () => {
    if (!sellerId) { setLoading(false); return; }
    setLoading(true);
    // 1. Récupère les IDs des produits du seller
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .eq("seller_id", sellerId);
    if (!products || products.length === 0) {
      setReviews([]);
      setStats({ total: 0, avg: 0, fiveStars: 0 });
      setLoading(false);
      return;
    }
    const productIds = products.map((p) => p.id);
    // 2. Récupère les reviews liées + infos buyer & produit
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        buyer:buyer_id ( full_name, avatar_url ),
        product:product_id ( name )
      `)
      .in("product_id", productIds)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("useSellerReviews error:", error);
      setReviews([]);
    } else {
      setReviews(data || []);
      const total = (data || []).length;
      const avg = total > 0
        ? ((data || []).reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : 0;
      const fiveStars = (data || []).filter((r) => r.rating === 5).length;
      setStats({ total, avg, fiveStars });
    }
    setLoading(false);
  }, [sellerId]);
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);
  return { reviews, loading, stats, refetch: fetchReviews };
}
