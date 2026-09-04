import { ClientInvitation, AuthUser } from '../types';
import { registerOrUpdateClientAccount, loginWithCredentials, setStoredUser, setStoredToken } from './auth';

export const INVITATIONS_STORAGE_KEY = 'iconic_investing_invitations_v2';

// Helper to generate a cryptographically strong token
export function generateSecureToken(): string {
  try {
    const array = new Uint8Array(24);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      return `inv_${hex}`;
    }
  } catch (e) {
    console.warn('Crypto random values failed, using fallback', e);
  }
  // Fallback random token
  return `inv_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}

// Initial seed invitations for demonstration
export const SEED_INVITATIONS: ClientInvitation[] = [
  {
    id: 'inv-seed-1',
    token: 'inv_8f9a2c4e1b3d5e7f9a0b2c4d',
    clientId: 'client-1',
    clientName: 'Marcus & Elena Vance',
    clientEmail: 'marcus.vance@investor.com.au',
    invitedBy: 'Damian Sterling',
    invitedByRole: 'Principal Buyers Advocate & Licensee',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h remaining
    status: 'accepted',
    usedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    portalUrl: (typeof window !== 'undefined' ? window.location.origin : '') + '/?token=inv_8f9a2c4e1b3d5e7f9a0b2c4d',
    emailSubject: 'Welcome to Iconic Investing — Set Your Password & Access Portal',
    emailPreview: 'Your private investor portal has been provisioned by Damian Sterling. Set your password to view your curated property shortlists.'
  },
  {
    id: 'inv-seed-2',
    token: 'inv_7a6b5c4d3e2f1a0b9c8d7e6f',
    clientId: 'client-2',
    clientName: 'Dr. Sophia Thornton',
    clientEmail: 's.thornton@medicalinvest.com',
    invitedBy: 'Damian Sterling',
    invitedByRole: 'Principal Buyers Advocate & Licensee',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(), // 38h remaining
    status: 'accepted',
    usedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    portalUrl: (typeof window !== 'undefined' ? window.location.origin : '') + '/?token=inv_7a6b5c4d3e2f1a0b9c8d7e6f',
    emailSubject: 'Welcome to Iconic Investing — Set Your Password & Access Portal',
    emailPreview: 'Your healthcare specialist commercial & residential mandate is active. Access your private buyer dashboard.'
  }
];

export function getStoredInvitations(): ClientInvitation[] {
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load invitations', e);
  }
  return SEED_INVITATIONS;
}

export function saveStoredInvitations(invites: ClientInvitation[]): void {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invites));
  } catch (e) {
    console.error('Failed to save invitations', e);
  }
}

// Format duration remaining until 48-hour expiration
export function formatTimeRemaining(expiresAtIso: string): { text: string; isExpired: boolean; hoursRemaining: number } {
  const expiresAt = new Date(expiresAtIso).getTime();
  const now = Date.now();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return { text: 'Expired', isExpired: true, hoursRemaining: 0 };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return {
      text: `${hours}h ${minutes}m remaining`,
      isExpired: false,
      hoursRemaining: hours + minutes / 60
    };
  }
  return {
    text: `${minutes}m remaining`,
    isExpired: false,
    hoursRemaining: minutes / 60
  };
}

// Generate new invitation for client
export function createClientInvitation(params: {
  clientId: string;
  clientName: string;
  clientEmail: string;
  invitedBy?: string;
  invitedByRole?: string;
  customHours?: number;
  customMessage?: string;
}): ClientInvitation {
  const invites = getStoredInvitations();
  const token = generateSecureToken();
  const now = new Date();
  const hours = params.customHours || 48; // 48 hours validity
  const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const portalUrl = `${origin}${pathname}?token=${token}`;

  const invitedBy = params.invitedBy || 'Damian Sterling';
  const invitedByRole = params.invitedByRole || 'Principal Buyers Advocate & Licensee';

  // Mark any previous pending invitations for this client as expired
  const updatedInvites = invites.map(inv => {
    if (inv.clientId === params.clientId && inv.status === 'pending') {
      return { ...inv, status: 'expired' as const };
    }
    return inv;
  });

  const newInvitation: ClientInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    token,
    clientId: params.clientId,
    clientName: params.clientName,
    clientEmail: params.clientEmail.trim().toLowerCase(),
    invitedBy,
    invitedByRole,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
    portalUrl,
    emailSubject: `Action Required: Welcome to Iconic Investing — Set Your Password for Your Client Portal`,
    emailPreview: `Welcome to Iconic Investing. Your Buyers Advocate ${invitedBy} has provisioned your private portal. Set your password within 48 hours to view property shortlists and due diligence reports.`,
    customMessage: params.customMessage
  };

  updatedInvites.unshift(newInvitation);
  saveStoredInvitations(updatedInvites);

  // Attempt backend API sync in background
  try {
    fetch('/api/invitations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInvitation)
    }).catch(() => {
      // Offline / fallback handled silently
    });
  } catch {}

  return newInvitation;
}

// Verify token validity and check 48-hour expiration
export function verifyInvitationToken(token: string): {
  valid: boolean;
  invitation?: ClientInvitation;
  reason?: 'not_found' | 'expired' | 'already_used';
  timeRemainingFormatted?: string;
  hoursRemaining?: number;
} {
  if (!token || !token.trim()) {
    return { valid: false, reason: 'not_found' };
  }

  const cleanToken = token.trim();
  const invites = getStoredInvitations();
  const invitation = invites.find(inv => inv.token === cleanToken);

  if (!invitation) {
    return { valid: false, reason: 'not_found' };
  }

  if (invitation.status === 'accepted') {
    return { valid: false, invitation, reason: 'already_used' };
  }

  // Check 48 hour expiration
  const { isExpired, text, hoursRemaining } = formatTimeRemaining(invitation.expiresAt);
  if (isExpired || invitation.status === 'expired') {
    if (invitation.status !== 'expired') {
      invitation.status = 'expired';
      saveStoredInvitations(invites);
    }
    return { valid: false, invitation, reason: 'expired', hoursRemaining: 0 };
  }

  return {
    valid: true,
    invitation,
    timeRemainingFormatted: text,
    hoursRemaining
  };
}

// Accept invitation, set new client password, and log in
export async function acceptInvitationAndSetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  const verification = verifyInvitationToken(token);
  if (!verification.valid || !verification.invitation) {
    if (verification.reason === 'expired') {
      return {
        success: false,
        error: 'This invitation link has expired after 48 hours. Please request a new invitation from your Buyers Advocate.'
      };
    }
    if (verification.reason === 'already_used') {
      return {
        success: false,
        error: 'This invitation has already been used. Please log in directly with your password.'
      };
    }
    return {
      success: false,
      error: 'Invalid invitation token. Please check your email link or contact your Buyers Advocate.'
    };
  }

  const cleanPassword = newPassword.trim();
  if (cleanPassword.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long (8+ recommended for optimal security).'
    };
  }

  const invitation = verification.invitation;
  const invites = getStoredInvitations();
  const targetIdx = invites.findIndex(i => i.id === invitation.id);

  if (targetIdx >= 0) {
    invites[targetIdx] = {
      ...invites[targetIdx],
      status: 'accepted',
      usedAt: new Date().toISOString()
    };
    saveStoredInvitations(invites);
  }

  // Update client account with new password and activate
  const updatedAccount = registerOrUpdateClientAccount({
    clientId: invitation.clientId,
    name: invitation.clientName,
    email: invitation.clientEmail,
    password: cleanPassword,
    status: 'active'
  });

  // Attempt backend accept sync
  try {
    const res = await fetch('/api/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        password: cleanPassword,
        clientId: invitation.clientId,
        email: invitation.clientEmail
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token && data.user) {
        setStoredToken(data.token);
        setStoredUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }
    }
  } catch (e) {
    console.warn('Backend invitation accept failed, using client fallback', e);
  }

  // Client-side session login
  try {
    const loginResult = await loginWithCredentials(invitation.clientEmail, cleanPassword);
    return { success: true, user: loginResult.user, token: loginResult.token };
  } catch {
    const fallbackUser: AuthUser = {
      id: updatedAccount.id,
      email: updatedAccount.email,
      name: updatedAccount.name,
      role: 'client',
      clientId: updatedAccount.clientId
    };
    const fallbackToken = `jwt_${token}_${Date.now()}`;
    setStoredToken(fallbackToken);
    setStoredUser(fallbackUser);
    return { success: true, user: fallbackUser, token: fallbackToken };
  }
}

// Resend invitation (generates fresh 48-hour token)
export function resendClientInvitation(
  clientId: string,
  clientName: string,
  clientEmail: string,
  invitedBy?: string
): ClientInvitation {
  return createClientInvitation({
    clientId,
    clientName,
    clientEmail,
    invitedBy: invitedBy || 'Damian Sterling',
    customHours: 48
  });
}

// Fast-forward / simulate expiry for test and validation purposes
export function simulateExpireInvitation(inviteId: string): ClientInvitation | null {
  const invites = getStoredInvitations();
  const idx = invites.findIndex(i => i.id === inviteId);
  if (idx >= 0) {
    invites[idx] = {
      ...invites[idx],
      expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours in the past
      status: 'expired'
    };
    saveStoredInvitations(invites);
    return invites[idx];
  }
  return null;
}
