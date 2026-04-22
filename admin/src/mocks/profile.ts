export interface AdminProfile {
  id: string; name: string; email: string; role: string;
  phone: string; avatar?: string; joined_at: string; last_login: string; two_fa: boolean;
}

export interface TeamMember {
  id: string; name: string; email: string; role: string;
  initials: string; status: 'active' | 'inactive' | 'pending'; joined_at: string;
}

export interface Session {
  id: string; device: string; location: string; last_active: string; current: boolean;
}

export const ADMIN_PROFILE: AdminProfile = {
  id: 'adm-001', name: 'Admin Principal', email: 'admin@trustlink.bj',
  role: 'Super Administrateur', phone: '+229 97 12 34 56',
  joined_at: '2024-01-15T00:00:00Z', last_login: '2024-12-15T09:00:00Z', two_fa: true,
};

export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'adm-001', name: 'Admin Principal', email: 'admin@trustlink.bj', role: 'Super Admin', initials: 'AD', status: 'active', joined_at: '2024-01-15T00:00:00Z' },
  { id: 'adm-002', name: 'Awa Diallo', email: 'awa@trustlink.bj', role: 'Modérateur', initials: 'AW', status: 'active', joined_at: '2024-03-01T00:00:00Z' },
  { id: 'adm-003', name: 'Thierry Agossou', email: 'thierry@trustlink.bj', role: 'Support', initials: 'TA', status: 'active', joined_at: '2024-06-15T00:00:00Z' },
  { id: 'adm-004', name: 'Cécile Hounsou', email: 'cecile@trustlink.bj', role: 'Analyste', initials: 'CH', status: 'inactive', joined_at: '2024-04-20T00:00:00Z' },
  { id: 'adm-005', name: 'Paul Mensah', email: 'paul@trustlink.bj', role: 'Support', initials: 'PM', status: 'pending', joined_at: '2024-12-01T00:00:00Z' },
];

export const SESSIONS: Session[] = [
  { id: 'ses-001', device: 'Chrome / macOS — MacBook Pro', location: 'Cotonou, Bénin', last_active: '2024-12-15T15:00:00Z', current: true },
  { id: 'ses-002', device: 'Safari / iOS 17 — iPhone 14', location: 'Porto-Novo, Bénin', last_active: '2024-12-14T20:30:00Z', current: false },
  { id: 'ses-003', device: 'Firefox / Ubuntu — PC Bureau', location: 'Cotonou, Bénin', last_active: '2024-12-13T08:00:00Z', current: false },
];
