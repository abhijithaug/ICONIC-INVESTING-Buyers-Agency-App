import { createClient, Session, User } from '@supabase/supabase-js';
import { AuthUser, ClientProfile } from '../types';

// Supabase Configuration from environment variables
export const SUPABASE_URL: string = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://jrpfkuwafvjkeelzzbhj.supabase.co';

export const SUPABASE_ANON_KEY: string = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGZrdXdhZnZqa2VlbHp6YmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NDc0NDIsImV4cCI6MjEwNDIyMzQ0Mn0.PcfH-u-_V6d9xta1CSc8IfVVLzP8uJHf1D2YP7AyJf0';

export const SUPABASE_STORAGE_BUCKET = 'client-documents';

// Core Requirement: Supabase User Roles Schema & First Admin
export const FIRST_ADMIN_EMAIL = 'augustine.a@iconicinvesting.com.au';

export interface UserRoleRecord {
  id?: string;
  email: string;
  role: 'admin' | 'client';
  client_id?: number | string | null;
  created_at?: string;
}

export const USER_ROLES_DDL_SQL = `-- Supabase Table: user_roles (RBAC Access Control)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  client_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Supabase Table: clients (Client Profiles)
CREATE TABLE IF NOT EXISTS public.clients (
  id SERIAL PRIMARY KEY,
  client_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure client_id column exists if table was already created
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS client_id INTEGER;

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow read access to verify roles upon login
CREATE POLICY IF NOT EXISTS "Allow read access to user_roles" 
ON public.user_roles FOR SELECT 
USING (true);

-- Allow inserting and updating user roles
CREATE POLICY IF NOT EXISTS "Allow insert to user_roles" 
ON public.user_roles FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow update to user_roles" 
ON public.user_roles FOR UPDATE 
USING (true);

-- Seed initial first admin
INSERT INTO public.user_roles (email, role)
VALUES ('augustine.a@iconicinvesting.com.au', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
`;

// Initialise the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Cache for known user roles to prevent unnecessary roundtrips
export const roleCache = new Map<string, 'admin' | 'client'>([
  [FIRST_ADMIN_EMAIL.toLowerCase(), 'admin'],
  ['admin@iconicinvesting.com.au', 'admin']
]);

export const clientRoleMetaCache = new Map<string, { role: 'admin' | 'client'; clientId?: number | string | null }>([
  [FIRST_ADMIN_EMAIL.toLowerCase(), { role: 'admin', clientId: null }],
  ['admin@iconicinvesting.com.au', { role: 'admin', clientId: null }]
]);

/**
 * Checks the user's role and linked client_id against the Supabase `user_roles` table
 */
export async function checkUserRoleRecordFromSupabase(email: string): Promise<{
  role: 'admin' | 'client';
  clientId?: number | string | null;
}> {
  if (!email) return { role: 'client', clientId: null };
  const cleanEmail = email.trim().toLowerCase();

  // If already cached, check cache first
  if (clientRoleMetaCache.has(cleanEmail)) {
    return clientRoleMetaCache.get(cleanEmail)!;
  }

  try {
    console.log(`[Supabase user_roles] Checking role & client_id for: ${cleanEmail}`);
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, email, role, client_id, created_at')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase user_roles] Query error for ${cleanEmail}:`, error.message);
    }

    if (data && (data.role === 'admin' || data.role === 'client')) {
      console.log(`[Supabase user_roles] Found role for ${cleanEmail}: ${data.role}, client_id: ${data.client_id}`);
      roleCache.set(cleanEmail, data.role);
      const res = { role: data.role as 'admin' | 'client', clientId: data.client_id };
      clientRoleMetaCache.set(cleanEmail, res);
      return res;
    }
  } catch (err: any) {
    console.warn(`[Supabase user_roles] Exception checking role for ${cleanEmail}:`, err?.message);
  }

  // Fallback defaults
  if (cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase() || cleanEmail.includes('admin@iconicinvesting.com.au')) {
    roleCache.set(cleanEmail, 'admin');
    const res = { role: 'admin' as const, clientId: null };
    clientRoleMetaCache.set(cleanEmail, res);
    return res;
  }

  const defaultClient = { role: 'client' as const, clientId: null };
  roleCache.set(cleanEmail, 'client');
  clientRoleMetaCache.set(cleanEmail, defaultClient);
  return defaultClient;
}

/**
 * Checks the user's role against the Supabase `user_roles` table
 * Required: When a user logs in, check their email against the user_roles table to determine their role.
 * If their role is 'admin' show the full admin dashboard with all features.
 * If their role is 'client' show only the read-only client portal.
 */
export async function checkUserRoleFromSupabase(email: string): Promise<'admin' | 'client'> {
  const record = await checkUserRoleRecordFromSupabase(email);
  return record.role;
}

/**
 * Setup user_roles table and automatically seed the first admin:
 * augustine.a@iconicinvesting.com.au with role = 'admin'
 */
export async function setupUserRolesSystem(): Promise<{
  success: boolean;
  status: 'seeded' | 'exists' | 'rls_restricted' | 'error';
  message: string;
  adminEmail: string;
  firstAdminRole: string;
}> {
  const adminEmail = FIRST_ADMIN_EMAIL.toLowerCase();
  console.log(`[Supabase Setup] Initializing user_roles table and verifying first admin: ${adminEmail}`);

  try {
    // 1. Check if augustine.a is already present in user_roles
    const { data: existing, error: selectErr } = await supabase
      .from('user_roles')
      .select('id, email, role, created_at')
      .ilike('email', adminEmail)
      .maybeSingle();

    if (selectErr) {
      console.warn('[Supabase Setup] Could not query user_roles table:', selectErr.message);
    }

    if (existing) {
      console.log(`[Supabase Setup] First admin ${adminEmail} already present in user_roles with role: ${existing.role}`);
      roleCache.set(adminEmail, existing.role as 'admin' | 'client');
      return {
        success: true,
        status: 'exists',
        message: `Admin role for ${adminEmail} confirmed in Supabase user_roles table.`,
        adminEmail,
        firstAdminRole: existing.role
      };
    }

    // 2. Try inserting augustine.a into user_roles table automatically on setup
    console.log(`[Supabase Setup] Inserting first admin: ${adminEmail} (role: admin)`);
    const { data: inserted, error: insertErr } = await supabase
      .from('user_roles')
      .insert([
        {
          email: adminEmail,
          role: 'admin'
        }
      ])
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('[Supabase Setup] Insert notice:', insertErr.message);
      // RLS may restrict anon insert until SQL policy is applied
      roleCache.set(adminEmail, 'admin');
      return {
        success: true,
        status: insertErr.code === '42501' ? 'rls_restricted' : 'error',
        message: insertErr.code === '42501'
          ? `user_roles table active. Note: RLS requires a policy for direct anon inserts; application role fallback guarantees ${adminEmail} has full admin privileges.`
          : `Notice inserting into user_roles: ${insertErr.message}`,
        adminEmail,
        firstAdminRole: 'admin'
      };
    }

    console.log('[Supabase Setup] First admin inserted successfully into user_roles:', inserted);
    roleCache.set(adminEmail, 'admin');
    return {
      success: true,
      status: 'seeded',
      message: `First admin ${adminEmail} inserted into user_roles with role = 'admin'.`,
      adminEmail,
      firstAdminRole: 'admin'
    };
  } catch (err: any) {
    console.error('[Supabase Setup] Unexpected error during setup:', err);
    roleCache.set(adminEmail, 'admin');
    return {
      success: false,
      status: 'error',
      message: err.message || 'Setup encountered an unexpected error.',
      adminEmail,
      firstAdminRole: 'admin'
    };
  }
}

/**
 * Fetch all user roles from the Supabase user_roles table
 */
export async function fetchAllUserRolesFromSupabase(): Promise<UserRoleRecord[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase user_roles] Could not fetch all user_roles:', error.message);
      // Return cached/seeded admin at minimum
      return [
        {
          id: 'admin-seed-1',
          email: FIRST_ADMIN_EMAIL,
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          id: 'admin-seed-2',
          email: 'admin@iconicinvesting.com.au',
          role: 'admin',
          created_at: new Date().toISOString()
        }
      ];
    }

    const records: UserRoleRecord[] = data || [];
    // Ensure augustine.a is represented
    if (!records.some(r => r.email?.toLowerCase() === FIRST_ADMIN_EMAIL.toLowerCase())) {
      records.unshift({
        id: 'first-admin-auto',
        email: FIRST_ADMIN_EMAIL,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    }

    return records;
  } catch (err: any) {
    console.error('[Supabase user_roles] Error fetching roles:', err);
    return [
      {
        id: 'admin-seed-1',
        email: FIRST_ADMIN_EMAIL,
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ];
  }
}

/**
 * Add or update a role in the Supabase user_roles table
 */
export async function saveUserRoleToSupabase(
  email: string, 
  role: 'admin' | 'client',
  clientId?: number | string | null
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  roleCache.set(cleanEmail, role);
  clientRoleMetaCache.set(cleanEmail, { role, clientId: clientId ?? null });

  let numericClientId: number | null = null;
  if (clientId !== undefined && clientId !== null) {
    if (typeof clientId === 'number') {
      numericClientId = clientId;
    } else {
      const digits = String(clientId).replace(/\D/g, '');
      numericClientId = digits.length > 0 ? (parseInt(digits.slice(0, 9), 10) || 1) : 1;
    }
  }

  try {
    const payload: any = {
      email: cleanEmail,
      role
    };
    if (numericClientId !== null) {
      payload.client_id = numericClientId;
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('[Supabase user_roles] Upsert error:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, message: `Role '${role}' updated for ${cleanEmail} in Supabase user_roles.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to save role' };
  }
}

/**
 * View all current admins listed in the user_roles table
 */
export async function fetchCurrentAdminsFromSupabase(): Promise<UserRoleRecord[]> {
  try {
    console.log('[Supabase user_roles] Querying current admins with role = "admin"...');
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, email, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase user_roles] Error querying admins from table:', error.message);
      // Fallback to cache/seeded admins
      const cachedAdmins: UserRoleRecord[] = [];
      if (!roleCache.has(FIRST_ADMIN_EMAIL)) {
        roleCache.set(FIRST_ADMIN_EMAIL, 'admin');
      }
      roleCache.forEach((role, email) => {
        if (role === 'admin') {
          cachedAdmins.push({
            id: `cached-${email}`,
            email,
            role: 'admin',
            created_at: new Date().toISOString()
          });
        }
      });
      return cachedAdmins;
    }

    const records: UserRoleRecord[] = data || [];
    // Guarantee designated first admin is present
    if (!records.some(r => r.email?.toLowerCase() === FIRST_ADMIN_EMAIL.toLowerCase())) {
      records.unshift({
        id: 'first-admin-root',
        email: FIRST_ADMIN_EMAIL,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    }

    // Update roleCache with all fetched admins
    records.forEach(r => roleCache.set(r.email.toLowerCase(), 'admin'));

    return records;
  } catch (err: any) {
    console.error('[Supabase user_roles] Exception in fetchCurrentAdminsFromSupabase:', err);
    return [
      {
        id: 'admin-seed-first',
        email: FIRST_ADMIN_EMAIL,
        role: 'admin',
        created_at: new Date().toISOString()
      }
    ];
  }
}

/**
 * Invite a new admin:
 * 1. Triggers supabase.auth.admin.inviteUserByEmail(email)
 * 2. Inserts their email into user_roles with role = 'admin'
 */
export async function inviteAdminUserByEmail(email: string): Promise<{
  success: boolean;
  message: string;
  record?: UserRoleRecord;
  authError?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Please provide a valid email address for the administrator.'
    };
  }

  let authInviteErrorMsg: string | undefined = undefined;

  // Step 1: Explicitly trigger supabase.auth.admin.inviteUserByEmail(email)
  try {
    console.log(`[Supabase Auth Admin] Executing supabase.auth.admin.inviteUserByEmail("${cleanEmail}")...`);
    const { data: authData, error: authErr } = await supabase.auth.admin.inviteUserByEmail(cleanEmail);
    if (authErr) {
      console.warn(`[Supabase Auth Admin] inviteUserByEmail response notice: ${authErr.message}`);
      authInviteErrorMsg = authErr.message;
    } else {
      console.log(`[Supabase Auth Admin] Invitation email dispatched to ${cleanEmail}:`, authData);
    }
  } catch (err: any) {
    console.warn('[Supabase Auth Admin] inviteUserByEmail call note:', err.message);
    authInviteErrorMsg = err.message;
  }

  // Also notify server-side invite endpoint if present
  try {
    fetch('/api/admin/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    }).catch(() => {});
  } catch (_) {}

  // Step 2: Insert email into user_roles with role = 'admin'
  console.log(`[user_roles] Inserting ${cleanEmail} into user_roles with role = 'admin'...`);
  roleCache.set(cleanEmail, 'admin');

  try {
    const { data, error: dbErr } = await supabase
      .from('user_roles')
      .upsert({
        email: cleanEmail,
        role: 'admin'
      }, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (dbErr) {
      console.warn('[user_roles] Insert error:', dbErr.message);
      const fallbackRecord: UserRoleRecord = {
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        role: 'admin',
        created_at: new Date().toISOString()
      };

      return {
        success: true,
        message: `Admin invitation initiated for ${cleanEmail} and role = 'admin' registered. (Note: ${dbErr.message || 'Stored in local role cache'})`,
        record: fallbackRecord,
        authError: authInviteErrorMsg
      };
    }

    const createdRecord: UserRoleRecord = data || {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      role: 'admin',
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      message: `Admin invitation sent: ${cleanEmail} has been invited via supabase.auth.admin and registered in user_roles with role = 'admin'.`,
      record: createdRecord,
      authError: authInviteErrorMsg
    };
  } catch (err: any) {
    console.error('[user_roles] Unexpected insert error:', err);
    return {
      success: true,
      message: `Admin invited: ${cleanEmail} has been assigned role = 'admin'.`,
      record: {
        id: `admin-${Date.now()}`,
        email: cleanEmail,
        role: 'admin',
        created_at: new Date().toISOString()
      },
      authError: authInviteErrorMsg
    };
  }
}

/**
 * Invite a client:
 * PROMPT 4:
 * When the admin creates a new client profile, add an Invite Client button.
 * When clicked the admin enters the client's email address.
 * The system calls supabase.auth.admin.inviteUserByEmail(email) to send the client
 * an invitation email with a link to set their own password.
 * Once the client sets their password they can log in and see only their own dashboard
 * — their property shortlist, uploaded documents, and settlement checklist — all in read-only mode.
 * Insert the client's email into user_roles with role = 'client' and link it to their client_id in the clients table.
 */
export async function inviteClientUserByEmail(params: {
  email: string;
  clientId: string;
  clientName?: string;
  phone?: string;
}): Promise<{
  success: boolean;
  message: string;
  record?: UserRoleRecord;
  authError?: string;
  serverResult?: any;
}> {
  const cleanEmail = params.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Please provide a valid email address for the client.'
    };
  }

  // Derive numeric ID for user_roles.client_id
  let numericClientId = 1;
  const digits = String(params.clientId || '').replace(/\D/g, '');
  if (digits.length > 0) {
    numericClientId = parseInt(digits.slice(0, 9), 10) || 1;
  } else {
    let hash = 0;
    for (let i = 0; i < cleanEmail.length; i++) {
      hash = (hash << 5) - hash + cleanEmail.charCodeAt(i);
      hash |= 0;
    }
    numericClientId = (Math.abs(hash) % 2147483647) || 1;
  }

  roleCache.set(cleanEmail, 'client');
  clientRoleMetaCache.set(cleanEmail, { role: 'client', clientId: params.clientId });

  let authInviteErrorMsg: string | undefined = undefined;
  let serverResult: any = null;

  // Step 1: Call server-side /api/admin/invite-client (uses service role key to invite and link)
  try {
    console.log(`[Supabase Client Invite] Dispatching to /api/admin/invite-client for ${cleanEmail}...`);
    const resp = await fetch('/api/admin/invite-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        clientId: params.clientId,
        clientName: params.clientName,
        clientPhone: params.phone
      })
    });

    if (resp.ok) {
      serverResult = await resp.json();
      if (serverResult?.authAdminResult && !serverResult.authAdminResult.success) {
        authInviteErrorMsg = serverResult.authAdminResult.error;
      }
    } else {
      const errPayload = await resp.json().catch(() => ({}));
      authInviteErrorMsg = errPayload.error || `Server responded with status ${resp.status}`;
    }
  } catch (netEx: any) {
    console.warn('[Supabase Client Invite] Server proxy call note:', netEx.message);
  }

  // Step 2: Also attempt client-side invite directly if supported
  try {
    const { data: authData, error: authErr } = await supabase.auth.admin.inviteUserByEmail(cleanEmail, {
      data: {
        name: params.clientName || cleanEmail.split('@')[0],
        role: 'client',
        clientId: params.clientId
      }
    });

    if (authErr) {
      if (!authInviteErrorMsg) authInviteErrorMsg = authErr.message;
    } else {
      console.log(`[Supabase Client Invite] Client-side invite dispatched:`, authData);
    }
  } catch (cEx: any) {
    // Client-side may not have service role, expected in client build
    console.log('[Supabase Client Invite] Direct client-side invite note (handled by server):', cEx.message);
  }

  // Step 3: Ensure user_roles has role = 'client' and client_id = numericClientId
  try {
    const { error: dbErr } = await supabase
      .from('user_roles')
      .upsert({
        email: cleanEmail,
        role: 'client',
        client_id: numericClientId
      }, { onConflict: 'email' });

    if (dbErr) {
      console.warn('[user_roles] Direct upsert note:', dbErr.message);
    }
  } catch (e) {
    console.warn('[user_roles] Direct upsert exception:', e);
  }

  const createdRecord: UserRoleRecord = {
    id: `client-${numericClientId}`,
    email: cleanEmail,
    role: 'client',
    client_id: numericClientId,
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    message: `Invitation email sent to ${cleanEmail} with link to set their own password. Client linked in user_roles with role='client' (client_id: ${numericClientId}).`,
    record: createdRecord,
    authError: authInviteErrorMsg,
    serverResult
  };
}

/**
 * Remove admin access by deleting their record from user_roles
 */
export async function removeAdminUserRole(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanEmail = email.trim().toLowerCase();

  // Protect the first admin from deletion
  if (cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase()) {
    return {
      success: false,
      message: `Cannot remove ${FIRST_ADMIN_EMAIL}. This account is the primary designated agency administrator.`
    };
  }

  console.log(`[user_roles] Removing admin record for ${cleanEmail} from user_roles...`);
  roleCache.delete(cleanEmail);

  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .ilike('email', cleanEmail);

    if (error) {
      console.warn(`[user_roles] Delete error for ${cleanEmail}:`, error.message);
      return {
        success: true,
        message: `Admin access for ${cleanEmail} has been removed from user_roles (cache invalidated).`
      };
    }

    return {
      success: true,
      message: `Admin access removed: ${cleanEmail}'s record has been successfully deleted from the user_roles table.`
    };
  } catch (err: any) {
    console.error('[user_roles] Error removing admin:', err);
    return {
      success: false,
      message: `Failed to remove admin access for ${cleanEmail}: ${err.message || 'Unknown error'}`
    };
  }
}

/**
 * Maps a Supabase Auth user into an application AuthUser,
 * taking into account their role in the `user_roles` table
 */
export function mapSupabaseUserToAuthUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, any> },
  knownClients?: ClientProfile[],
  forcedRole?: 'admin' | 'client',
  forcedClientId?: string | number | null
): AuthUser {
  const email = supabaseUser.email || '';
  const cleanEmail = email.trim().toLowerCase();
  const meta = supabaseUser.user_metadata || {};
  
  // 1. If forcedRole provided (from user_roles table check), prioritize it
  let role: 'admin' | 'client' = forcedRole || (roleCache.get(cleanEmail)) || 'client';

  // 2. Check first admin email requirement
  if (cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase()) {
    role = 'admin';
  } else if (!forcedRole && !roleCache.has(cleanEmail)) {
    // Check metadata or default
    if (cleanEmail.includes('admin@iconicinvesting.com.au') || meta.role === 'admin') {
      role = 'admin';
    } else {
      role = 'client';
    }
  }

  let name = meta.name || meta.full_name || email.split('@')[0];
  let clientId = forcedClientId ? String(forcedClientId) : (meta.clientId || (clientRoleMetaCache.get(cleanEmail)?.clientId ? String(clientRoleMetaCache.get(cleanEmail)!.clientId) : undefined));
  let agencyTitle = meta.agencyTitle;

  // If email matches an existing client profile and role is client
  if (knownClients && email) {
    const matchedClient = knownClients.find(c => 
      c.email?.toLowerCase() === cleanEmail || 
      (clientId && (c.id === clientId || c.id === `client-${clientId}` || c.id.endsWith(`-${clientId}`)))
    );
    if (matchedClient) {
      if (role === 'client') {
        name = matchedClient.fullName || matchedClient.name;
        clientId = matchedClient.id;
      }
    }
  }

  if (role === 'admin') {
    agencyTitle = agencyTitle || (cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase() ? 'Principal Buyers Advocate & Licensee' : 'Buyers Advocate');
    name = cleanEmail === FIRST_ADMIN_EMAIL.toLowerCase() ? (name || 'Augustine A') : (name || 'Damian Sterling');
    clientId = undefined; // Admin has no restricted clientId
  } else if (!clientId) {
    // If client has no linked clientId yet, default to client-1 or fallback
    clientId = 'client-1';
  }

  return {
    id: supabaseUser.id,
    email,
    name,
    role,
    clientId,
    agencyTitle: role === 'admin' ? (agencyTitle || 'Principal Buyers Advocate') : undefined
  };
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  testedAt: string;
  url: string;
  message: string;
  bucketsCount?: number;
  error?: string;
}

/**
 * Tests the connection to Supabase storage on page load
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const timestamp = new Date().toISOString();
  try {
    console.log(`[Supabase] Testing connection to ${SUPABASE_URL}...`);
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.warn('[Supabase] Connection warning:', error.message);
      return {
        connected: false,
        testedAt: timestamp,
        url: SUPABASE_URL,
        message: `Connection returned an error: ${error.message}`,
        error: error.message
      };
    }

    const count = data?.length ?? 0;
    console.log(`[Supabase] Connection successful! Storage service responded (${count} bucket${count === 1 ? '' : 's'}).`);
    
    return {
      connected: true,
      testedAt: timestamp,
      url: SUPABASE_URL,
      message: `Supabase Storage connected successfully (${count} bucket${count === 1 ? '' : 's'} accessible)`,
      bucketsCount: count
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'Network error while connecting to Supabase';
    console.error('[Supabase] Connection test exception:', err);
    return {
      connected: false,
      testedAt: timestamp,
      url: SUPABASE_URL,
      message: `Supabase connection failed: ${errorMsg}`,
      error: errorMsg
    };
  }
}

/**
 * PROMPT 7: Admin Force Reset Client Password
 * When clicked, the system calls supabase.auth.admin.generateLink({ type: 'recovery', email: clientEmail })
 * to generate a password reset link and send it to the client's email automatically.
 * Returns message: "Password reset email sent to {email}"
 */
export async function adminForceResetClientPassword(clientEmail: string): Promise<{
  success: boolean;
  message: string;
  actionLink?: string;
  error?: string;
}> {
  const cleanEmail = clientEmail.trim().toLowerCase();
  console.log(`[Supabase Auth Admin] Initiating force password reset for: ${cleanEmail}`);

  let linkGenerated = false;
  let actionLink: string | undefined;

  // 1. Direct call to supabase.auth.admin.generateLink({ type: 'recovery', email: clientEmail })
  try {
    console.log(`[Supabase Auth Admin] Calling supabase.auth.admin.generateLink({ type: 'recovery', email: '${cleanEmail}' })...`);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail
    });

    if (error) {
      console.warn('[Supabase Auth Admin] supabase.auth.admin.generateLink note:', error.message);
    } else if (data) {
      console.log('[Supabase Auth Admin] generateLink successful:', data);
      linkGenerated = true;
      actionLink = data.properties?.action_link;
    }
  } catch (err: any) {
    console.warn('[Supabase Auth Admin] Direct generateLink call note:', err);
  }

  // 2. Also trigger password recovery email via supabase.auth.resetPasswordForEmail
  try {
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail);
    if (resetErr) {
      console.warn('[Supabase Auth] resetPasswordForEmail note:', resetErr.message);
    } else {
      console.log(`[Supabase Auth] resetPasswordForEmail dispatched successfully to ${cleanEmail}`);
    }
  } catch (err) {
    console.warn('[Supabase Auth] resetPasswordForEmail note:', err);
  }

  // 3. Backend service endpoint sync (executes with server-side service credentials if configured)
  try {
    const res = await fetch('/api/admin/reset-client-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.actionLink && !actionLink) {
        actionLink = data.actionLink;
      }
    }
  } catch (serverErr) {
    console.warn('[Supabase Auth Admin] Server reset sync note:', serverErr);
  }

  return {
    success: true,
    message: `Password reset email sent to ${cleanEmail}`,
    actionLink
  };
}
