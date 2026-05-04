import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
export function useSellerOrders(sellerId) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      // Récupère le taux NGN → XOF depuis Supabase
      const { data: rateData } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency", "NGN")
        .eq("to_currency", "XOF")
        .maybeSingle();
      const rate = rateData?.rate || 0.89;
      const { data, error: supaError } = await supabase
        .from("order_items")
        .select(`id,
          status,
          quantity,
          product_name,
          product_price,
          subtotal,
          created_at,
          order:order_id (
            id,
            shipping_address_line1,
            shipping_city,
            shipping_country,
            notes,
            buyer:buyer_id ( full_name )
          ),
          product:product_id ( id, name )
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      if (supaError) {
        setError(supaError.message);
        setOrders([]);
      } else {
        const formatted = (data || []).map((item) => {
          const ngn = item.subtotal || item.product_price * item.quantity;
          return {
            id: item.order?.id?.slice(0, 8) || item.id.slice(0, 8),
            item_id: item.id,
            product: item.product_name || item.product?.name || "Produit",
            product_image: "",
            buyer: item.order?.buyer?.full_name || "Client",
            buyer_city: item.order?.shipping_city || "Cotonou",
            quantity: item.quantity,
            amount_ngn: ngn,
            amount_fcfa: Math.round(ngn * rate), // CORRECTION : multiplication
            status: item.status,
            created_at: item.created_at,
            items: [{
              product: item.product_name || item.product?.name,
              variant: "Standard",
              qty: item.quantity,
              unit_price: item.product_price,
              total: item.subtotal || item.product_price * item.quantity,
            }],
            order_address: item.order ? {
              line1: item.order.shipping_address_line1,
              city: item.order.shipping_city,
              country: item.order.shipping_country,
            } : null,
            notes: item.order?.notes || "",
            qr_code: item.order?.id || item.id,
          };
        });
        setOrders(formatted);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [sellerId]);
  return { orders, loading, error };
}
