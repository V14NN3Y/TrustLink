export const mockSeller = {
  id: "seller-001",
  name: "Adebayo Fashions",
  email: "adebayo@trustlink.ng",
  kyc_status: "verified",
  balance_escrow: 890200,
  balance_available: 1245000,
  hub_location: "Lagos Hub",
  rating: 4.8,
  total_sales: 892,
  joined_date: "2024-03-15",
};

export const mockStats = {
  total_revenue_ngn: 4820500,
  orders_to_ship: 34,
  orders_to_ship_today: 7,
  balance_available: 1245000,
  balance_change_month: 320000,
  escrow_amount: 890200,
  escrow_orders: 12,
  completed_orders: 851,
  conversion_rate: 98.2,
  dispute_rate: 1.8,
  avg_delivery_days: 5.2,
};

export const mockRevenueChart = [
  { month: "Oct", revenue: 280000 },
  { month: "Nov", revenue: 420000 },
  { month: "Dec", revenue: 680000 },
  { month: "Jan", revenue: 520000 },
  { month: "Fev", revenue: 750000 },
  { month: "Mar", revenue: 920000 },
  { month: "Avr", revenue: 1250000 },
];

export const mockAlerts = [
  {
    id: "alert-1",
    type: "critical",
    order_id: "TL-2024-0885",
    message: "Depot au Hub en retard de 2 jours",
    deadline: "18 Avr 2026",
  },
  {
    id: "alert-2",
    type: "warning",
    order_id: "TL-2024-0882",
    message: "Bordereau non genere — commande prete",
    deadline: "20 Avr 2026",
  },
  {
    id: "alert-3",
    type: "info",
    order_id: "TL-2024-0879",
    message: "Stock insuffisant pour variante Taille L / Rouge",
    deadline: "",
  },
];

export const mockTopProducts = [
  {
    id: "top-1",
    name: "Agbada Premium Brode",
    sales: 142,
    revenue: 12000000,
    stock: 8,
    image: "https://readdy.ai/api/search-image?query=traditional Nigerian Agbada premium embroidered fabric clothing clean white background professional studio lighting minimalist product photography elegant fashion item&width=80&height=80&seq=top-prod-agbada-1&orientation=squarish",
  },
  {
    id: "top-2",
    name: "Tissu Ankara Wax",
    sales: 98,
    revenue: 3000000,
    stock: 24,
    image: "https://readdy.ai/api/search-image?query=Ankara wax African print fabric colorful textile clean white background professional studio lighting minimalist product photography folded cloth pattern&width=80&height=80&seq=top-prod-ankara-2&orientation=squarish",
  },
  {
    id: "top-3",
    name: "Nike Air Max",
    sales: 54,
    revenue: 6000000,
    stock: 12,
    image: "https://readdy.ai/api/search-image?query=Nike Air Max premium sneakers clean white background professional studio lighting minimalist product photography sport shoes side view athletic footwear&width=80&height=80&seq=top-prod-nike-3&orientation=squarish",
  },
];
