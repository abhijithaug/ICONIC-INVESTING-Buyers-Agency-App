import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  X, 
  Copy, 
  ExternalLink,
  Lock,
  Eye,
  FileText,
  CheckSquare,
  Search,
  Database
} from 'lucide-react';
import { ClientProfile } from '../../types';
import { inviteClientUserByEmail } from '../../services/supabaseClient';

interface InviteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientProfile | null;
  defaultEmail?: string;
  onSuccess?: (email: string, message: string) => void;
}

export const InviteClientModal: React.FC<InviteClientModalProps> = ({
  isOpen,
  onClose,
  client,
  defaultEmail,
  onSuccess
}) => {
  const [email, setEmail] = useState(defaultEmail || client?.email || client?.loginEmail || '');
  const [clientName, setClientName] = useState(client?.fullName || client?.name || '');
  const [clientId, setClientId] = useState(client?.id || `client-${Date.now()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteResult, setInviteResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid client email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log(`[InviteClientModal] Initiating client invitation for ${cleanEmail} (client ID: ${clientId})...`);
      const res = await inviteClientUserByEmail({
        email: cleanEmail,
        clientId,
        clientName: clientName.trim() || cleanEmail.split('@')[0],
        phone: client?.phone
      });

      if (res.success) {
        setInviteResult(res);
        setSuccessMessage(
          `Invitation sent successfully to ${cleanEmail}! The client will receive an email to set their own password, and their account has been linked in user_roles with role = 'client'.`
        );
        if (onSuccess) {
          onSuccess(cleanEmail, res.message);
        }
      } else {
        setErrorMessage(res.message || 'Failed to dispatch invitation.');
      }
    } catch (err: any) {
      console.error('[InviteClientModal] Invite error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while dispatching the invitation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#B8960C] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Invite Client to Dashboard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch Supabase Auth password setup invitation & link role
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Explanation Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-[#B8960C]" />
            <span>Supabase Auth Client Invitation Flow</span>
          </div>
          <p className="text-[11px] text-amber-950/80 leading-relaxed">
            The system calls <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono text-[10px] font-bold">supabase.auth.admin.inviteUserByEmail(email)</code> to send the client an invitation email with a link to set their own password.
          </p>
          <div className="pt-1.5 border-t border-amber-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-amber-900">
            <span className="flex items-center gap-1 font-semibold">
              <Search className="w-3.5 h-3.5 text-[#B8960C]" />
              Property Shortlist
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <FileText className="w-3.5 h-3.5 text-[#B8960C]" />
              Uploaded Documents
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <CheckSquare className="w-3.5 h-3.5 text-[#B8960C]" />
              Settlement Checklist
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-bold text-[10px] uppercase tracking-wider">
              All Read-Only Mode
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="font-semibold text-xs leading-normal">{successMessage}</div>
              </div>
              <div className="text-[11px] text-emerald-700 bg-white/70 p-2.5 rounded-lg border border-emerald-200 font-mono space-y-1">
                <div>✓ Table user_roles updated: role = 'client', client_id = '{clientId}'</div>
                <div>✓ Table clients updated: id = '{clientId}'</div>
                <div>✓ Supabase Auth: Invitation dispatched to {email}</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Client's Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. client.investor@example.com.au"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-[#1A3A5C]/20 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {email && (
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title="Copy email"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              The invitation email with secure password-setting link will be sent directly to this address.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client / Entity Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Liam & Chloe O'Connor"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-[#1A3A5C]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Linked Client ID
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono text-xs">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{clientId}</span>
              </div>
            </div>
          </div>

          {/* Read-Only Mode Summary Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Client Dashboard Permissions:</span>
            </div>
            <p>
              When this client signs in, they will see <strong>only their own dashboard</strong> in <strong>strict read-only mode</strong>:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
              <li>View curated property shortlist (cannot modify status or listings)</li>
              <li>View & download uploaded documents (contracts, building & pest, reports)</li>
              <li>View settlement checklist progress & due dates (cannot toggle advocate tasks)</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#B8960C] hover:bg-[#997B0A] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calling inviteUserByEmail...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation via Supabase</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
