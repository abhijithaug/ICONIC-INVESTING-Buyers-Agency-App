import React, { useState } from 'react';
import {
  Mail,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { ClientInvitation } from '../../types';
import { formatTimeRemaining, simulateExpireInvitation, resendClientInvitation } from '../../utils/invitations';

interface EmailInviteModalProps {
  isOpen: boolean;
  invitation: ClientInvitation;
  onClose: () => void;
  onOpenInviteLink: (token: string) => void;
  onInvitationUpdated?: (updated: ClientInvitation) => void;
}

export const EmailInviteModal: React.FC<EmailInviteModalProps> = ({
  isOpen,
  invitation: initialInvitation,
  onClose,
  onOpenInviteLink,
  onInvitationUpdated
}) => {
  const [invitation, setInvitation] = useState<ClientInvitation>(initialInvitation);
  const [copied, setCopied] = useState(false);
  const [justSimulatedExpired, setJustSimulatedExpired] = useState(false);

  if (!isOpen) return null;

  const timeInfo = formatTimeRemaining(invitation.expiresAt);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitation.portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateExpiry = () => {
    const expired = simulateExpireInvitation(invitation.id);
    if (expired) {
      setInvitation(expired);
      setJustSimulatedExpired(true);
      if (onInvitationUpdated) onInvitationUpdated(expired);
    }
  };

  const handleReissueFresh = () => {
    const fresh = resendClientInvitation(
      invitation.clientId,
      invitation.clientName,
      invitation.clientEmail,
      invitation.invitedBy
    );
    setInvitation(fresh);
    setJustSimulatedExpired(false);
    if (onInvitationUpdated) onInvitationUpdated(fresh);
  };

  const formattedExpiry = new Date(invitation.expiresAt).toLocaleString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6 relative">
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-[#B8960C] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Client Email Invitation Sent
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  timeInfo.isExpired
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {timeInfo.isExpired ? 'Link Expired' : 'Secure Token Active (48h)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dispatched to <strong className="text-slate-800">{invitation.clientEmail}</strong> with a 48-hour password setup link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Preview Outer Frame */}
        <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-slate-50">
          
          {/* Email Client Bar */}
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-400">From:</span>{' '}
                <strong className="text-slate-800">{invitation.invitedBy}</strong> &lt;invitations@iconicinvesting.com.au&gt;
              </div>
              <span className="text-slate-400 text-[10px]">{new Date(invitation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="text-slate-400">To:</span>{' '}
              <strong className="text-slate-800">{invitation.clientName}</strong> &lt;{invitation.clientEmail}&gt;
            </div>
            <div>
              <span className="text-slate-400">Subject:</span>{' '}
              <span className="font-semibold text-slate-900">{invitation.emailSubject}</span>
            </div>
          </div>

          {/* Email Body Content */}
          <div className="p-6 bg-white space-y-4 text-xs text-slate-700 leading-relaxed">
            
            {/* Agency Banner */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold font-serif-heading text-slate-900 text-sm tracking-wide">
                  ICONIC <span className="text-[#B8960C]">INVESTING</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Private Investor Invitation</span>
            </div>

            <div>
              <p className="font-bold text-slate-900 text-sm">
                Dear {invitation.clientName},
              </p>
              <p className="mt-2 text-slate-600">
                Welcome to Iconic Investing. As your appointed Australian Buyers Advocate, I have provisioned your private client portal.
              </p>
              <p className="mt-1 text-slate-600">
                Your portal provides direct, confidential access to your investment brief, shortlisted properties, due diligence evaluations, Building & Pest risk audits, and settlement tracking.
              </p>
            </div>

            {/* 48-Hour Security Notice Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#B8960C] flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-[11px]">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Link Expiration Notice (48-Hour Window)</span>
                  <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono text-[10px]">
                    {timeInfo.isExpired ? 'EXPIRED' : timeInfo.text}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">
                  For your privacy and regulatory compliance, this secure activation link expires on:
                  <br />
                  <strong className="text-slate-800">{formattedExpiry}</strong>.
                  Please complete your password setup before this link lapses.
                </p>
              </div>
            </div>

            {/* Email CTA Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onOpenInviteLink(invitation.token)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A3A5C] hover:bg-[#254f7a] text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#B8960C]" />
                <span>Set Your Password & Access Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">
                (Clicking this button takes you to the secure password activation screen)
              </p>
            </div>

            {/* Direct URL Fallback in email */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Direct Portal Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitation.portalUrl}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Sign-off */}
            <div className="pt-3 text-[11px] text-slate-600">
              <p>Warm regards,</p>
              <p className="font-bold text-slate-900 mt-1">{invitation.invitedBy}</p>
              <p className="text-slate-500 text-[10px]">{invitation.invitedByRole}</p>
              <p className="text-slate-500 text-[10px]">Iconic Investing Buyers Agency | Sydney, Brisbane & Perth</p>
            </div>

          </div>
        </div>

        {/* Admin Testing & Simulation Controls */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Admin / Demo Verification Controls</span>
            <span className="text-[10px] font-normal text-slate-500">Test token & 48h expiration flow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Action 1: Open link as client */}
            <button
              type="button"
              onClick={() => onOpenInviteLink(invitation.token)}
              className="px-3 py-2 bg-[#1A3A5C] hover:bg-[#254f7a] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#B8960C]" />
              <span>Open Link as Client</span>
            </button>

            {/* Action 2: Simulate 48h passed / expiry */}
            <button
              type="button"
              onClick={handleSimulateExpiry}
              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Simulate Expired Link</span>
            </button>

            {/* Action 3: Reissue fresh token */}
            <button
              type="button"
              onClick={handleReissueFresh}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-issue Fresh 48h Link</span>
            </button>
          </div>

          {justSimulatedExpired && (
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              ⚡ Link has been set to <strong>Expired (48h passed)</strong>. Click "Open Link as Client" to verify that the expired link rejection screen appears!
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
