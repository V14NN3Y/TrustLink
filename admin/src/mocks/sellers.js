export const mockSellers = [
  { id: 'adebayo-fashions', name: 'Adebayo Fashions', hub: 'Lagos Hub', category: 'Mode & Textile', rating: 4.9, totalOrders: 891, status: 'active', verified: true },
  { id: 'tech-nigeria', name: 'TechNigeria Store', hub: 'Lagos Hub', category: 'Électronique', rating: 4.7, totalOrders: 412, status: 'active', verified: true },
  { id: 'beauty-lagos', name: 'Beauty Lagos Pro', hub: 'Abuja Hub', category: 'Cosmétiques', rating: 4.5, totalOrders: 287, status: 'active', verified: true },
  { id: 'maison-abuja', name: 'Maison Abuja', hub: 'Abuja Hub', category: 'Maison & Déco', rating: 4.3, totalOrders: 134, status: 'active', verified: false },
  { id: 'sport-nigeria', name: 'SportNigéria', hub: 'Lagos Hub', category: 'Sport', rating: 4.6, totalOrders: 203, status: 'inactive', verified: true },
];

export function getActiveSellers() {
  return mockSellers.filter(s => s.status === 'active');
}
