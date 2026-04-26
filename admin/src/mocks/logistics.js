export const VOYAGES = [
  { id: 'voy-001', voyage_id: 'VY-2026-041', status: 'IN_TRANSIT', hub_origin: 'Lagos', orders_count: 8, total_value_xof: 3750000, departure_date: '2026-04-14T06:00:00Z', estimated_arrival: '2026-04-17T18:00:00Z', driver_name: 'Taiwo Afolabi', truck_plate: 'LAS-441-BC' },
  { id: 'voy-002', voyage_id: 'VY-2026-042', status: 'PREPARING', hub_origin: 'Lagos', orders_count: 5, total_value_xof: 1875000, departure_date: '2026-04-16T06:00:00Z', estimated_arrival: '2026-04-19T18:00:00Z', driver_name: 'Emeka Chukwu', truck_plate: 'LAS-552-KJ' },
  { id: 'voy-003', voyage_id: 'VY-2026-040', status: 'CUSTOMS', hub_origin: 'Abuja', orders_count: 6, total_value_xof: 4250000, departure_date: '2026-04-12T06:00:00Z', estimated_arrival: '2026-04-15T18:00:00Z', driver_name: 'Ibrahim Musa', truck_plate: 'ABJ-223-MK', customs_agent: 'Agent Coulibaly' },
  { id: 'voy-004', voyage_id: 'VY-2026-039', status: 'ARRIVED', hub_origin: 'Abuja', orders_count: 7, total_value_xof: 5125000, departure_date: '2026-04-10T06:00:00Z', estimated_arrival: '2026-04-13T18:00:00Z', actual_arrival: '2026-04-13T15:30:00Z', driver_name: 'Yakubu Abubakar', truck_plate: 'ABJ-119-FA', customs_agent: 'Agent Bello' },
  { id: 'voy-005', voyage_id: 'VY-2026-038', status: 'COMPLETED', hub_origin: 'Lagos', orders_count: 10, total_value_xof: 4600000, departure_date: '2026-04-08T06:00:00Z', estimated_arrival: '2026-04-11T18:00:00Z', actual_arrival: '2026-04-11T14:00:00Z', driver_name: 'Sunday Okafor', truck_plate: 'LAS-773-PT' },
];

export const PACKAGES = [
  { id: 'pkg-001', order_ref: 'TL-2026-0001', product: 'Samsung Galaxy A54 × 3', buyer: 'Kofi Mensah', weight_kg: 2.1, hub: 'Lagos', voyage_id: 'VY-2026-041', steps: [
    { key: 'collected', label: 'Collecté Lagos', status: 'completed', timestamp: '2026-04-14T07:00:00Z', location: 'Hub Lagos' },
    { key: 'departed', label: 'Départ camion', status: 'completed', timestamp: '2026-04-14T06:30:00Z', location: 'Lagos' },
    { key: 'border', label: 'Frontière Sèmè', status: 'current', timestamp: '2026-04-15T12:00:00Z', location: 'Sèmè-Kraké' },
    { key: 'customs', label: 'Dédouanement Bénin', status: 'pending' },
    { key: 'delivered', label: 'Livraison finale', status: 'pending' },
  ]},
  { id: 'pkg-002', order_ref: 'TL-2026-0002', product: 'Tissus Ankara 50m', buyer: 'Parfait Hounto', weight_kg: 5.5, hub: 'Lagos', voyage_id: 'VY-2026-041', steps: [
    { key: 'collected', label: 'Collecté Lagos', status: 'completed', timestamp: '2026-04-14T07:30:00Z', location: 'Hub Lagos' },
    { key: 'departed', label: 'Départ camion', status: 'completed', timestamp: '2026-04-14T06:30:00Z', location: 'Lagos' },
    { key: 'border', label: 'Frontière Sèmè', status: 'current', timestamp: '2026-04-15T12:00:00Z', location: 'Sèmè-Kraké' },
    { key: 'customs', label: 'Dédouanement Bénin', status: 'pending' },
    { key: 'delivered', label: 'Livraison finale', status: 'pending' },
  ]},
  { id: 'pkg-003', order_ref: 'TL-2026-0005', product: 'Générateur 5KVA × 1', buyer: 'Bertrand Dossou', weight_kg: 85, hub: 'Abuja', steps: [
    { key: 'collected', label: 'Collecté Abuja', status: 'completed', timestamp: '2026-04-08T07:00:00Z', location: 'Hub Abuja' },
    { key: 'departed', label: 'Départ camion', status: 'completed', timestamp: '2026-04-08T06:30:00Z', location: 'Abuja' },
    { key: 'border', label: 'Frontière', status: 'completed', timestamp: '2026-04-09T10:00:00Z', location: 'Kétou' },
    { key: 'customs', label: 'Dédouanement', status: 'completed', timestamp: '2026-04-10T09:00:00Z', location: 'Cotonou' },
    { key: 'delivered', label: 'Livraison finale', status: 'completed', timestamp: '2026-04-11T14:00:00Z', location: 'Cotonou' },
  ]},
  { id: 'pkg-004', order_ref: 'TL-2026-0008', product: 'Téléviseur Sony 55"', buyer: 'Jérôme Houndjago', weight_kg: 18, hub: 'Lagos', voyage_id: 'VY-2026-041', steps: [
    { key: 'collected', label: 'Collecté Lagos', status: 'completed', timestamp: '2026-04-14T08:00:00Z', location: 'Hub Lagos' },
    { key: 'departed', label: 'Départ camion', status: 'completed', timestamp: '2026-04-14T06:30:00Z', location: 'Lagos' },
    { key: 'border', label: 'Frontière Sèmè', status: 'current', timestamp: '2026-04-15T12:00:00Z', location: 'Sèmè-Kraké' },
    { key: 'customs', label: 'Dédouanement Bénin', status: 'pending' },
    { key: 'delivered', label: 'Livraison finale', status: 'pending' },
  ]},
  { id: 'pkg-005', order_ref: 'TL-2026-0007', product: 'Climatiseur LG × 1', buyer: 'Pascal Vigan', weight_kg: 28, hub: 'Lagos', steps: [
    { key: 'collected', label: 'Collecté Lagos', status: 'pending' },
    { key: 'departed', label: 'Départ camion', status: 'pending' },
    { key: 'border', label: 'Frontière Sèmè', status: 'pending' },
    { key: 'customs', label: 'Dédouanement Bénin', status: 'pending' },
    { key: 'delivered', label: 'Livraison finale', status: 'pending' },
  ]},
  { id: 'pkg-006', order_ref: 'TL-2026-0009', product: 'Mixeur industriel × 2', buyer: 'Clémentine Zinsou', weight_kg: 12, hub: 'Abuja', steps: [
    { key: 'collected', label: 'Collecté Abuja', status: 'pending' },
    { key: 'departed', label: 'Départ camion', status: 'pending' },
    { key: 'border', label: 'Frontière', status: 'pending' },
    { key: 'customs', label: 'Dédouanement', status: 'pending' },
    { key: 'delivered', label: 'Livraison finale', status: 'pending' },
  ]},
];
