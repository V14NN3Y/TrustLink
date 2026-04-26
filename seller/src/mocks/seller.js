export const mockSeller = {
  name: 'Adebayo Fashions',
  email: 'adebayo@fashions.ng',
  sellerId: 'adebayo-fashions',
  kycStatus: 'verified',
  hubLocation: 'Lagos Hub - Ikeja',
  memberSince: 'Janvier 2025',
};

export const mockStats = {
  balance_available: 1245000,
  escrow_amount: 890200,
  total_sales: 4820500,
  orders_to_ship: 34,
  conversion_rate: 98.2,
  dispute_rate: 1.8,
  balance_change_month: 320000,
  escrow_orders: 12,
};

export const mockRevenueData = [
  { month: 'Oct', ngn: 280000,  fcfa: Math.round(280000 * 0.4132)  },
  { month: 'Nov', ngn: 420000,  fcfa: Math.round(420000 * 0.4132)  },
  { month: 'Déc', ngn: 680000,  fcfa: Math.round(680000 * 0.4132)  },
  { month: 'Jan', ngn: 520000,  fcfa: Math.round(520000 * 0.4132)  },
  { month: 'Fév', ngn: 750000,  fcfa: Math.round(750000 * 0.4132)  },
  { month: 'Mar', ngn: 920000,  fcfa: Math.round(920000 * 0.4132)  },
  { month: 'Avr', ngn: 1250000, fcfa: Math.round(1250000 * 0.4132) },
];

export const mockRevenueChart = mockRevenueData;

export const mockAlerts = [
  {
    id: 'a1',
    order_id: 'TL-2026-0885',
    message: 'Dépôt au Hub en retard de 2 jours',
    type: 'critical',
    deadline: '18 Avr 2026',
  },
  {
    id: 'a2',
    order_id: 'TL-2026-0882',
    message: 'Bordereau non généré — commande prête',
    type: 'warning',
    deadline: '20 Avr 2026',
  },
  {
    id: 'a3',
    order_id: 'TL-2026-0879',
    message: 'Stock insuffisant pour variante Taille L / Rouge',
    type: 'info',
    deadline: null,
  },
];

export const mockTopProducts = [
  {
    id: 'p1',
    name: 'Agbada Premium Brodé',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=120&h=120&fit=crop',
    sold: 142,
    revenue: '₦12,070,000',
    stock: 23,
  },
  {
    id: 'p2',
    name: 'Tissu Ankara 6 yards',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&h=120&fit=crop',
    sold: 98,
    revenue: '₦3,136,000',
    stock: 67,
  },
  {
    id: 'p3',
    name: 'Sneakers Nike Air Max',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop',
    sold: 54,
    revenue: '₦6,480,000',
    stock: 12,
  },
];
