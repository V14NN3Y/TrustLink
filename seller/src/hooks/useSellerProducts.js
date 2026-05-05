import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSellerProducts(sellerId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchProducts = useCallback(async () => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rateData } = await supabase
      .from("exchange_rates")
      .select("rate")
      .eq("from_currency", "NGN")
      .eq("to_currency", "XOF")
      .maybeSingle();
    const rate = rateData?.rate || 0.89;
    const { data, error } = await supabase
      .from("products")
      .select(`*, images:product_images(url, is_primary)`)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("useSellerProducts error:", error);
      setProducts([]);
      setLoading(false);
      return;
    }
    // Calcul des sales_count
    let salesMap = {};
    if (data && data.length > 0) {
      const productIds = data.map((p) => p.id);
      const { data: salesData } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .in("product_id", productIds)
        .not("status", "in", '("cancelled","refunded","disputed")');
      if (salesData) {
        salesData.forEach((item) => {
          salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1);
        });
      }
    }
    const formatted = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category_id,
      price_fcfa: p.price,
      price_ngn: Math.round(p.price / rate),
      image: p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url || "",
      status: p.status,
      stock_total: p.stock_quantity,
      sales_count: salesMap[p.id] || 0,
      description: p.description,
      created_at: p.created_at,
    }));
    setProducts(formatted);
    setLoading(false);
  }, [sellerId]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return { products, loading, refetch: fetchProducts };
}
