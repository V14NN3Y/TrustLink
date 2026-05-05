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
          order_id,
          product:product_id ( id, name )
        `)
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });
      if (supaError) {
        setError(supaError.message);
        setOrders([]);
      } else {
        // Récupérer les infos de commande et acheteur séparément
        const orderIds = [...new Set((data || []).map((item) => item.order_id))];
        const { data: ordersData } = await supabase
          .from("orders")
          .select(`id, shipping_address_line1, shipping_city, shipping_country, notes, buyer:buyer_id ( full_name )`)
          .in("id", orderIds);
        const orderMap = (ordersData || []).reduce((acc, o) => { acc[o.id] = o; return acc; }, {});

        // Grouper par order_id
        const grouped = (data || []).reduce((acc, item) => {
          const oid = item.order_id;
          if (!acc[oid]) {
            const order = orderMap[oid];
            acc[oid] = {
              id: oid.slice(0, 8),
              order_id: oid,
              buyer: order?.buyer?.full_name || "Client",
              buyer_city: order?.shipping_city || "Cotonou",
              status: item.status,
              created_at: item.created_at,
              amount_ngn: 0,
              amount_fcfa: 0,
              items: [],
              order_address: order ? {
                line1: order.shipping_address_line1,
                city: order.shipping_city,
                country: order.shipping_country,
              } : null,
              notes: order?.notes || "",
              qr_code: oid,
            };
          }
          const ngn = item.subtotal || item.product_price * item.quantity;
          acc[oid].amount_ngn += ngn;
          acc[oid].amount_fcfa += Math.round(ngn * rate);
          acc[oid].items.push({
            item_id: item.id,
            product: item.product_name || item.product?.name || "Produit",
            product_image: "",
            variant: "Standard",
            qty: item.quantity,
            unit_price: item.product_price,
            total: item.subtotal || item.product_price * item.quantity,
          });
          return acc;
        }, {});
        const formatted = Object.values(grouped);
        setOrders(formatted);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [sellerId]);
  return { orders, loading, error };
}
