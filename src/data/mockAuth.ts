import { AuthUser } from '../types';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  clientId?: string;
  agencyTitle?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'revoked';
  tempPassword?: string;
  createdAt?: string;
  lastLogin?: string;
}

export const SEED_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-0',
    email: 'augustine.a@iconicinvesting.com.au',
    password: 'Password123!',
    name: 'Augustine A',
    role: 'admin',
    agencyTitle: 'Principal Buyers Advocate & Licensee',
    phone: '+61 419 552 100',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-admin-1',
    email: 'admin@iconicinvesting.com.au',
    password: 'admin', // also accept admin123
    name: 'Damian Sterling',
    role: 'admin',
    agencyTitle: 'Senior Buyers Advocate',
    phone: '+61 419 552 101',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'usr-client-1',
    email: 'marcus.vance@investor.com.au',
    password: 'client123',
    name: 'Marcus & Elena Vance',
    role: 'client',
    clientId: 'client-1',
    phone: '+61 412 890 341',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    tempPassword: 'client123',
    createdAt: '2026-08-10'
  },
  {
    id: 'usr-client-2',
    email: 's.thornton@medicalinvest.com',
    password: 'client123',
    name: 'Dr. Sophia Thornton',
    role: 'client',
    clientId: 'client-2',
    phone: '+61 405 671 229',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    tempPassword: 'client123',
    createdAt: '2026-08-18'
  },
  {
    id: 'usr-client-3',
    email: 'liam.oconnor@investor.com.au',
    password: 'client123',
    name: "Liam & Chloe O'Connor",
    role: 'client',
    clientId: 'client-3',
    phone: '+61 411 223 344',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    tempPassword: 'client123',
    createdAt: '2026-08-25'
  },
  {
    id: 'usr-client-4',
    email: 'harrison.sterling@investor.com.au',
    password: 'client123',
    name: 'Harrison Sterling',
    role: 'client',
    clientId: 'client-4',
    phone: '+61 422 998 112',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'revoked', // demo revoked account!
    tempPassword: 'client123',
    createdAt: '2026-07-20'
  }
];

export const DEMO_CREDENTIALS = [
  {
    label: 'Augustine A (First Admin)',
    role: 'admin' as const,
    email: 'augustine.a@iconicinvesting.com.au',
    password: 'Password123!',
    description: 'First Administrator in Supabase user_roles: full agency portal access'
  },
  {
    label: 'Buyers Advocate (Admin)',
    role: 'admin' as const,
    email: 'admin@iconicinvesting.com.au',
    password: 'admin',
    description: 'Full agency access: manage all clients, edit profiles, add properties & negotiate deals'
  },
  {
    label: 'Marcus & Elena (Client - Active)',
    role: 'client' as const,
    email: 'marcus.vance@investor.com.au',
    password: 'client123',
    description: 'Investor portal: view personal profile, property shortlist & uploaded documents'
  },
  {
    label: 'Dr. Sophia Thornton (Client - Active)',
    role: 'client' as const,
    email: 's.thornton@medicalinvest.com',
    password: 'client123',
    description: 'SMSF investor portal: view high-yield cashflow shortlist & SMSF trust documents'
  },
  {
    label: 'Harrison Sterling (Client - REVOKED)',
    role: 'client' as const,
    email: 'harrison.sterling@investor.com.au',
    password: 'client123',
    description: 'Revoked demo account: test admin revocation blocking login attempts'
  }
];
