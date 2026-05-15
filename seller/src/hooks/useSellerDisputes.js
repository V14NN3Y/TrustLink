import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSellerDisputes(sellerId) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    if (!sellerId) { setLoading(false); return; }
    setLoading(true);
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("seller_id", sellerId);
    if (!orderItems || orderItems.length === 0) {
      setDisputes([]);
      setLoading(false);
      return;
    }
    const orderIds = [...new Set(orderItems.map((oi) => oi.order_id))];
    const { data } = await supabase
      .from("disputes")
      .select("*, order:orders(id, status, total_amount), video:delivery_videos(video_url)")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false });
    setDisputes(data || []);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);
  return { disputes, loading, refetch: fetchDisputes };
}
