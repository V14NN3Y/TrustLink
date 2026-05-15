import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSellerDeliveryVideos(sellerId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    if (!sellerId) { setLoading(false); return; }
    setLoading(true);
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", sellerId);
    if (!products || products.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }
    const productIds = products.map((p) => p.id);
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("seller_id", sellerId);
    if (!orderItems || orderItems.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }
    const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];
    const { data } = await supabase
      .from("delivery_videos")
      .select("*, order:orders(id, status)")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);
  return { videos, loading, refetch: fetchVideos };
}
