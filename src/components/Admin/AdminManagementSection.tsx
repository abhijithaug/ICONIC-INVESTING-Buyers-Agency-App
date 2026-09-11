import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  Mail, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Search, 
  Copy, 
  Check, 
  FileText, 
  Clock, 
  Shield, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { AuthUser, UserRoleRecord } from '../../types';
import { 
  FIRST_ADMIN_EMAIL, 
  fetchCurrentAdminsFromSupabase, 
  inviteAdminUserByEmail, 
  removeAdminUserRole,
  checkUserRoleFromSupabase,
  USER_ROLES_DDL_SQL,
  SUPABASE_URL
} from '../../services/supabaseClient';

interface AdminManagementSectionProps {
  currentUser: AuthUser;
  onNavigateSection?: (section: any) => void;
}

export const AdminManagementSection: React.FC<AdminManagementSectionProps> = ({
  currentUser,
  onNavigateSection
}) => {
  // Access Control: Only users with role = 'admin' in user_roles can access
  const [isVerifyingRole, setIsVerifyingRole] = useState(true);
  const [hasVerifiedAdminAccess, setHasVerifiedAdminAccess] = useState(currentUser.role === 'admin');

  // Admin list state
  const [admins, setAdmins] = useState<UserRoleRecord[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Remove state
  const [adminToRemove, setAdminToRemove] = useState<UserRoleRecord | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Confirmation / Action feedback messages
  const [confirmationMessage, setConfirmationMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
    timestamp: string;
  } | null>(null);

  // SQL Schema Drawer state
  const [showSqlDrawer, setShowSqlDrawer] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Verify that the current user actually holds 'admin' in the user_roles table
  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      setIsVerifyingRole(true);
      try {
        if (!currentUser || !currentUser.email) {
          if (isMounted) setHasVerifiedAdminAccess(false);
          return;
        }

        const cleanEmail = currentUser.email.trim().toLowerCase();
        // Check database user_roles table directly
        const role = await checkUserRoleFromSupabase(cleanEmail);
        const isAdmin = role === 'admin';

        if (isMounted) {
          setHasVerifiedAdminAccess(isAdmin);
          if (!isAdmin) {
            setConfirmationMessage({
              type: 'error',
              title: 'Access Denied',
              description: `User '${cleanEmail}' does not possess the 'admin' role in the user_roles table. Access to Admin Management is restricted.`,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        }
      } catch (err: any) {
        console.error('[AdminManagement] Role check error:', err);
        if (isMounted) setHasVerifiedAdminAccess(currentUser.role === 'admin');
      } finally {
        if (isMounted) setIsVerifyingRole(false);
      }
    };

    verifyAdmin();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Fetch all current admins from user_roles
  const loadAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const records = await fetchCurrentAdminsFromSupabase();
      setAdmins(records);
    } catch (err: any) {
      console.error('[AdminManagement] Failed to fetch admins:', err);
      setConfirmationMessage({
        type: 'error',
        title: 'Error Loading Admins',
        description: err.message || 'Failed to query user_roles table in Supabase.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (hasVerifiedAdminAccess) {
      loadAdmins();
    }
  }, [hasVerifiedAdminAccess]);

  // Handle invite new admin:
  // 1. Triggers supabase.auth.admin.inviteUserByEmail(email)
  // 2. Inserts into user_roles with role = 'admin'
  // 3. Shows confirmation message
  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setConfirmationMessage({
        type: 'error',
        title: 'Validation Error',
        description: 'Please enter a valid administrator email address.',
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    const cleanEmail = inviteEmail.trim().toLowerCase();
    setIsInviting(true);

    try {
      const result = await inviteAdminUserByEmail(cleanEmail);

      if (result.success) {
        setConfirmationMessage({
          type: 'success',
          title: 'Admin Invitation Dispatched & Saved',
          description: result.message,
          timestamp: new Date().toLocaleTimeString()
        });
        setInviteEmail('');
        await loadAdmins();
      } else {
        setConfirmationMessage({
          type: 'error',
          title: 'Invitation Failed',
          description: result.message,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err: any) {
      setConfirmationMessage({
        type: 'error',
        title: 'Unexpected Error',
        description: err.message || 'An error occurred while inviting the administrator.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Handle remove admin:
  // 1. Deletes record from user_roles
  // 2. Shows confirmation message
  const handleConfirmRemoveAdmin = async () => {
    if (!adminToRemove) return;
    const targetEmail = adminToRemove.email;
    setIsRemoving(true);

    try {
      const result = await removeAdminUserRole(targetEmail);
      if (result.success) {
        setConfirmationMessage({
          type: 'success',
          title: 'Admin Access Revoked',
          description: result.message,
          timestamp: new Date().toLocaleTimeString()
        });
        setAdminToRemove(null);
        await loadAdmins();
      } else {
        setConfirmationMessage({
          type: 'error',
          title: 'Removal Blocked',
          description: result.message,
          timestamp: new Date().toLocaleTimeString()
        });
        setAdminToRemove(null);
      }
    } catch (err: any) {
      setConfirmationMessage({
        type: 'error',
        title: 'Error Removing Admin',
        description: err.message || 'Could not delete record from user_roles.',
        timestamp: new Date().toLocaleTimeString()
      });
      setAdminToRemove(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(USER_ROLES_DDL_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  // Filtered admins based on search query
  const filteredAdmins = admins.filter(admin => 
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // GUARD: If not an admin in user_roles, show Access Restricted screen
  // ---------------------------------------------------------------------------
  if (!isVerifyingRole && !hasVerifiedAdminAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-slate-900 mb-2">
            Access Restricted: Administrator Permissions Required
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Only users with <code className="font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold">role = 'admin'</code> in the Supabase <code className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-bold">user_roles</code> table are authorized to access the Admin Management section.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left mb-6 space-y-1.5 font-mono">
            <div><strong>Logged In User:</strong> {currentUser.email}</div>
            <div><strong>Current Role:</strong> <span className="text-amber-700 font-bold">{currentUser.role}</span></div>
            <div><strong>Access Gate:</strong> public.user_roles.role = 'admin'</div>
          </div>
          {onNavigateSection && (
            <button
              onClick={() => onNavigateSection('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A3A5C] hover:bg-[#224b75] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <span>Return to Client Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. SECTION HERO & RBAC OVERVIEW BANNER */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] text-white rounded-3xl p-6 sm:p-8 border border-[#B8960C]/30 shadow-xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#B8960C]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Section: role = 'admin' in user_roles</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading tracking-tight text-white flex items-center gap-3">
              <span>Admin Management &amp; Team Access</span>
            </h1>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              View all active administrators recorded in the Supabase <code className="font-mono text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-amber-400/20">user_roles</code> table, invite new administrators via official Supabase Auth emails with automatic role assignment, or revoke administrator access.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-right min-w-[170px]">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Admins</div>
              <div className="text-2xl font-bold font-mono text-[#B8960C] flex items-center md:justify-end gap-2">
                <Users className="w-5 h-5 text-amber-300" />
                <span>{admins.length}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Verified in Supabase DB</div>
            </div>

            <button
              type="button"
              onClick={() => setShowSqlDrawer(!showSqlDrawer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-[#B8960C]" />
              <span>{showSqlDrawer ? 'Hide SQL Schema' : 'View DB Schema'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONFIRMATION MESSAGE BANNER (Dynamic after each action) */}
      {/* ========================================================================= */}
      {confirmationMessage && (
        <div 
          className={`p-4 rounded-2xl border shadow-sm transition-all duration-300 flex items-start justify-between gap-3 animate-in slide-in-from-top-2 ${
            confirmationMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300/80'
              : confirmationMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300/80'
              : 'bg-blue-50 text-blue-900 border-blue-300/80'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
              confirmationMessage.type === 'success'
                ? 'bg-emerald-200 text-emerald-800'
                : confirmationMessage.type === 'error'
                ? 'bg-rose-200 text-rose-800'
                : 'bg-blue-200 text-blue-800'
            }`}>
              {confirmationMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : confirmationMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">{confirmationMessage.title}</h4>
                <span className="text-[10px] opacity-75 font-mono">[{confirmationMessage.timestamp}]</span>
              </div>
              <p className="text-xs mt-0.5 leading-relaxed font-medium">
                {confirmationMessage.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setConfirmationMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SQL SCHEMA DRAWER (Collapsible) */}
      {/* ========================================================================= */}
      {showSqlDrawer && (
        <div className="p-5 rounded-3xl bg-slate-950 text-slate-200 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B8960C]" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                PostgreSQL Schema: <code className="text-amber-400 font-mono">public.user_roles</code>
              </h3>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The admin management section enforces role separation through the following schema. Row Level Security policies allow administrators to invite and manage agency team members:
          </p>
          <pre className="p-3 bg-black/70 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800 max-h-48">
            {USER_ROLES_DDL_SQL}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. INVITE NEW ADMIN FORM CARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#1A3A5C] text-white shadow-xs">
              <UserPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Invite New Administrator
              </h2>
              <p className="text-xs text-slate-500">
                Dispatches a Supabase authentication invite and grants administrative access
              </p>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold self-start sm:self-auto flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>role = 'admin' auto-assigned</span>
          </div>
        </div>

        <form onSubmit={handleInviteAdmin} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-8">
              <label htmlFor="invite-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Admin Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. advocate@iconicinvesting.com.au or newadmin@investor.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#1A3A5C] focus:border-[#1A3A5C] outline-hidden transition"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                <span>Triggers</span>
                <code className="font-mono text-[#1A3A5C] bg-slate-100 px-1 py-0.5 rounded text-[10px] font-bold">
                  supabase.auth.admin.inviteUserByEmail(email)
                </code>
                <span>and inserts into <code className="font-mono text-emerald-700 font-bold">user_roles</code></span>
              </p>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={isInviting}
                className="w-full py-2.5 px-4 bg-[#1A3A5C] hover:bg-[#224b75] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isInviting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Inviting Admin...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-300" />
                    <span>Invite Admin via Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 5. CURRENT ADMINS DIRECTORY TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300/60 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Current Administrators Listed in <code className="font-mono text-[#1A3A5C]">user_roles</code>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {filteredAdmins.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All accounts with verified <code className="font-mono font-bold text-amber-800">role = 'admin'</code> privileges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search admin email..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A3A5C] outline-hidden w-44 sm:w-56 transition"
              />
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={loadAdmins}
              disabled={isLoadingAdmins}
              title="Refresh admin records from Supabase"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdmins ? 'animate-spin text-[#1A3A5C]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Administrator Email</th>
                <th className="py-3 px-4">Database Role</th>
                <th className="py-3 px-4 hidden md:table-cell">Record ID (UUID)</th>
                <th className="py-3 px-4 hidden sm:table-cell">Added On</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingAdmins && admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#1A3A5C]" />
                      <span className="font-medium text-xs">Querying user_roles table in Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <p className="text-xs">No administrators found matching "{searchQuery}".</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isFirstAdmin = admin.email.toLowerCase() === FIRST_ADMIN_EMAIL.toLowerCase();
                  const isCurrentUser = admin.email.toLowerCase() === currentUser.email.toLowerCase();

                  return (
                    <tr 
                      key={admin.id || admin.email}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isFirstAdmin ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Email + Identification */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isFirstAdmin 
                              ? 'bg-gradient-to-br from-amber-400 to-[#B8960C] text-white shadow-xs'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                              <span>{admin.email}</span>
                              {isFirstAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                                  <Sparkles className="w-3 h-3 text-[#B8960C]" />
                                  <span>Designated First Admin</span>
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {isFirstAdmin ? 'Primary Designated Agency Administrator' : 'Authorized Agency Administrator'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>role = 'admin'</span>
                        </span>
                      </td>

                      {/* Record ID / UUID */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500 hidden md:table-cell">
                        {admin.id ? (
                          <span title={admin.id}>
                            {admin.id.length > 16 ? `${admin.id.slice(0, 8)}...${admin.id.slice(-6)}` : admin.id}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">auto-generated</span>
                        )}
                      </td>

                      {/* Created At Date */}
                      <td className="py-4 px-4 text-slate-600 text-[11px] hidden sm:table-cell font-medium">
                        {admin.created_at ? (
                          new Date(admin.created_at).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        ) : (
                          <span>Permanent Seed</span>
                        )}
                      </td>

                      {/* Action: Remove Admin Access */}
                      <td className="py-4 px-5 text-right">
                        {isFirstAdmin ? (
                          <span 
                            title="The first designated administrator is permanent and cannot be deleted"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Protected</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAdminToRemove(admin)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                            title={`Remove admin access for ${admin.email}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Admin</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admin privileges take effect immediately upon authentication against <code className="font-mono font-bold">user_roles</code>.</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Database host: <span className="font-mono font-bold text-slate-700">{SUPABASE_URL.replace('https://', '')}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. REMOVE ADMIN CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {adminToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Remove Administrator Access</h3>
                <p className="text-xs text-slate-500">Confirm deletion from user_roles</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-slate-800 space-y-2">
              <p>
                Are you sure you want to remove admin access for:
              </p>
              <div className="font-mono font-bold text-rose-900 bg-white p-2 rounded-xl border border-rose-200 break-all">
                {adminToRemove.email}
              </div>
              <p className="text-[11px] text-rose-700">
                This action will delete their record from the <code className="font-mono font-bold">user_roles</code> table. They will immediately lose access to all agency management sections and tools.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdminToRemove(null)}
                disabled={isRemoving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveAdmin}
                disabled={isRemoving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isRemoving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isRemoving ? 'Deleting Record...' : 'Confirm Removal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
