import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  AlertCircle, 
  FileText, 
  CheckCircle2,
  Shield,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { 
  FIRST_ADMIN_EMAIL, 
  fetchAllUserRolesFromSupabase, 
  saveUserRoleToSupabase, 
  setupUserRolesSystem, 
  USER_ROLES_DDL_SQL,
  UserRoleRecord,
  SUPABASE_URL
} from '../../services/supabaseClient';
import { ClientProfile } from '../../types';

interface SupabaseUserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients?: ClientProfile[];
}

export const SupabaseUserRolesModal: React.FC<SupabaseUserRolesModalProps> = ({
  isOpen,
  onClose,
  clients = []
}) => {
  const [rolesList, setRolesList] = useState<UserRoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputRole, setInputRole] = useState<'admin' | 'client'>('client');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Fetch all user roles from Supabase
  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const records = await fetchAllUserRolesFromSupabase();
      setRolesList(records);
    } catch (err: any) {
      console.error('[SupabaseUserRolesModal] Failed to fetch user roles:', err);
      setNotification({
        type: 'error',
        text: `Error loading roles: ${err.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      setNotification(null);
    }
  }, [isOpen]);

  // Handle re-seeding / verifying the first admin
  const handleVerifyFirstAdmin = async () => {
    setIsLoading(true);
    try {
      const result = await setupUserRolesSystem();
      setNotification({
        type: 'success',
        text: `First Admin verification: ${result.message}`
      });
      await loadRoles();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: `Setup error: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding or updating a role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) {
      setNotification({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    const cleanEmail = inputEmail.trim().toLowerCase();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await saveUserRoleToSupabase(cleanEmail, inputRole);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Successfully saved role '${inputRole}' for ${cleanEmail} in Supabase!`
        });
        setInputEmail('');
        await loadRoles();
      } else {
        setNotification({
          type: 'error',
          text: `Failed to save role: ${res.message}`
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: `Failed to save role: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle quick toggle between admin and client
  const handleToggleRole = async (email: string, currentRole: 'admin' | 'client') => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    setIsLoading(true);
    try {
      await saveUserRoleToSupabase(email, newRole);
      setNotification({
        type: 'success',
        text: `Updated ${email} role to '${newRole}'`
      });
      await loadRoles();
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: `Toggle error: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(USER_ROLES_DDL_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] text-white p-6 border-b border-[#B8960C]/30 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#B8960C] to-[#8C7006] text-white shadow-lg border border-amber-300/40 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif-heading">
                  Supabase Database: <code className="font-mono text-[#B8960C]">user_roles</code> Table
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                  Role Enforcement
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Role-based access control (RBAC) driven directly by the Supabase database. When a user logs in, their email is checked against the <code className="font-mono text-amber-300">user_roles</code> table. <strong>Admin</strong> users access the full agency dashboard; <strong>Client</strong> users see only the read-only portal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {notification && (
          <div className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">

          {/* First Admin & Schema Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* First Admin Card */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                  Designated First Admin
                </span>
                <Sparkles className="w-4 h-4 text-[#B8960C]" />
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 break-all">
                {FIRST_ADMIN_EMAIL}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                  role: admin
                </span>
                <span className="text-[11px] text-amber-700">Seeded automatically</span>
              </div>
            </div>

            {/* Table Schema Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                  PostgreSQL Table Schema
                </span>
                <Database className="w-4 h-4 text-[#1A3A5C]" />
              </div>
              <div className="font-mono text-xs font-bold text-slate-900">
                public.user_roles
              </div>
              <div className="mt-1 text-[11px] text-slate-600 font-mono">
                id (uuid), email (text), role (text), created_at (tz)
              </div>
            </div>

            {/* Supabase Host Card */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                  Supabase Backend
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 truncate">
                {SUPABASE_URL.replace('https://', '')}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyFirstAdmin}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-[#1A3A5C] hover:bg-[#224b75] text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Re-seed First Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSql(!showSql)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                >
                  {showSql ? 'Hide SQL' : 'View SQL'}
                </button>
              </div>
            </div>

          </div>

          {/* Collapsible SQL Schema & RLS Policy Section */}
          {showSql && (
            <div className="p-4 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <FileText className="w-4 h-4" />
                  <span>Supabase SQL: Table DDL, RLS Policies &amp; Admin Seed</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? 'Copied to Clipboard' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Run this script in the Supabase Dashboard SQL Editor to establish the table schema and Row Level Security policies:
              </p>
              <pre className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48 border border-slate-800">
                {USER_ROLES_DDL_SQL}
              </pre>
            </div>
          )}

          {/* Add / Update User Role Form */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-[#1A3A5C]" />
              <span>Assign or Update User Role in Supabase</span>
            </h3>

            <form onSubmit={handleSaveRole} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="e.g. client@investor.com or team@iconicinvesting.com.au"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#1A3A5C] outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Assigned Role
                </label>
                <select
                  value={inputRole}
                  onChange={(e) => setInputRole(e.target.value as 'admin' | 'client')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#1A3A5C] outline-hidden cursor-pointer"
                >
                  <option value="client">Client (Read-Only Portal)</option>
                  <option value="admin">Admin (Full Dashboard)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 px-4 bg-[#1A3A5C] hover:bg-[#224b75] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Save to user_roles</span>
                </button>
              </div>
            </form>

            {/* Quick Fill suggestions from existing clients */}
            {clients.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-500">Quick fill from clients:</span>
                {clients.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setInputEmail(c.email);
                      setInputRole('client');
                    }}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 font-mono transition cursor-pointer"
                  >
                    {c.email}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Table of user_roles records in Supabase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current Database Records ({rolesList.length})
                </h3>
                <span className="text-[11px] text-slate-500">Live query from Supabase user_roles</span>
              </div>
              <button
                type="button"
                onClick={loadRoles}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-[#1A3A5C] font-bold hover:underline cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4 hidden md:table-cell">Record ID (UUID)</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Created At</th>
                    <th className="py-3 px-4 text-right">Toggle Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rolesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#1A3A5C]" />
                            <span>Loading user_roles from Supabase...</span>
                          </div>
                        ) : (
                          <span>No user roles found. Click "Re-seed First Admin" to initialize.</span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    rolesList.map((record) => {
                      const isFirstAdmin = record.email.toLowerCase() === FIRST_ADMIN_EMAIL.toLowerCase();
                      return (
                        <tr 
                          key={record.id || record.email}
                          className={`hover:bg-slate-50 transition-colors ${
                            isFirstAdmin ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{record.email}</span>
                              {isFirstAdmin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  First Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              record.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {record.role === 'admin' ? (
                                <>
                                  <Shield className="w-3 h-3 text-amber-700" />
                                  <span>Admin (Full Access)</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 text-emerald-700" />
                                  <span>Client (Read-Only)</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-slate-500 hidden md:table-cell">
                            {record.id.slice(0, 8)}...{record.id.slice(-4)}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px] hidden sm:table-cell">
                            {new Date(record.created_at).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleRole(record.email, record.role)}
                              title={`Switch to ${record.role === 'admin' ? 'client' : 'admin'}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-[#1A3A5C]" />
                              <span>Make {record.role === 'admin' ? 'Client' : 'Admin'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Role changes take effect upon next login or refresh</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
