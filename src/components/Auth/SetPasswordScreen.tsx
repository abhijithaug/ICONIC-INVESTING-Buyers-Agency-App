import React, { useState, useEffect } from 'react';
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Mail
} from 'lucide-react';
import { AuthUser, ClientInvitation } from '../../types';
import {
  verifyInvitationToken,
  acceptInvitationAndSetPassword,
  formatTimeRemaining,
  resendClientInvitation
} from '../../utils/invitations';

interface SetPasswordScreenProps {
  token: string;
  onSuccess: (user: AuthUser, token: string) => void;
  onCancelToLogin: () => void;
  onResendNewToken?: (newInvite: ClientInvitation) => void;
}

export const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  token,
  onSuccess,
  onCancelToLogin,
  onResendNewToken
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<ClientInvitation | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isAlreadyUsed, setIsAlreadyUsed] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [reissuedInvite, setReissuedInvite] = useState<ClientInvitation | null>(null);

  // Validate token on mount
  useEffect(() => {
    const result = verifyInvitationToken(token);
    if (!result.valid) {
      if (result.reason === 'expired') {
        setIsExpired(true);
        if (result.invitation) setInvitation(result.invitation);
      } else if (result.reason === 'already_used') {
        setIsAlreadyUsed(true);
        if (result.invitation) setInvitation(result.invitation);
      } else {
        setIsNotFound(true);
      }
      return;
    }

    if (result.invitation) {
      setInvitation(result.invitation);
      setTimeRemaining(result.timeRemainingFormatted || '48 hours remaining');
    }
  }, [token]);

  // Periodic ticker to show remaining time
  useEffect(() => {
    if (!invitation || isExpired || isAlreadyUsed) return;
    const interval = setInterval(() => {
      const remaining = formatTimeRemaining(invitation.expiresAt);
      if (remaining.isExpired) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining.text);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [invitation, isExpired, isAlreadyUsed]);

  // Password criteria verification
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage('Please ensure your password satisfies all security criteria and passwords match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await acceptInvitationAndSetPassword(token, password);
      if (result.success && result.user && result.token) {
        onSuccess(result.user, result.token);
      } else {
        setErrorMessage(result.error || 'Failed to activate password. Please try again or contact your advocate.');
      }
    } catch (err: any) {
      console.error('Password setting error:', err);
      setErrorMessage(err.message || 'Error activating portal account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoReissue = () => {
    if (!invitation) return;
    const fresh = resendClientInvitation(
      invitation.clientId,
      invitation.clientName,
      invitation.clientEmail,
      invitation.invitedBy
    );
    setReissuedInvite(fresh);
    if (onResendNewToken) {
      onResendNewToken(fresh);
    }
  };

  // Case 1: Token Expired Screen
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-4 shadow-xl">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-white">
            Invitation Link Expired
          </h2>
          <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            For security and privacy, client portal invitation links expire strictly after <strong>48 hours</strong>.
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
          <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>48-Hour Validity Limit Reached</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {invitation ? (
                  <>
                    Invitation for <strong>{invitation.clientName}</strong> ({invitation.clientEmail}) was issued on{' '}
                    {new Date(invitation.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}{' '}
                    and expired after 48 hours.
                  </>
                ) : (
                  'This single-use invitation link is no longer valid.'
                )}
              </p>
            </div>

            {reissuedInvite ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>New 48-Hour Invitation Link Generated!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  A fresh 48-hour secure token has been created for {reissuedInvite.clientName}.
                </p>
                <div className="pt-2">
                  <a
                    href={`?token=${reissuedInvite.token}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.search = `?token=${reissuedInvite.token}`;
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    <span>Open New Invitation Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleDemoReissue}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1A3A5C] hover:bg-[#234b77] text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#B8960C]" />
                  <span>Re-issue Fresh 48h Invitation Link (Demo / Advocate Action)</span>
                </button>

                <button
                  type="button"
                  onClick={onCancelToLogin}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Return to Portal Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Already Used Screen
  if (isAlreadyUsed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4 shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-white">
            Password Already Configured
          </h2>
          <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
            This invitation has already been used to activate your account. You can log in directly using your email and password.
          </p>
          <div className="mt-6">
            <button
              onClick={onCancelToLogin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B8960C] hover:bg-[#a38409] text-white font-bold text-xs shadow-lg transition"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Token Not Found Screen
  if (isNotFound || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-4 shadow-xl">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-white">
            Invalid Invitation Link
          </h2>
          <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
            We could not find an active invitation matching this link. Please check the URL in your email or contact your Buyers Advocate.
          </p>
          <div className="mt-6">
            <button
              onClick={onCancelToLogin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Valid Invitation — Set Password Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B8960C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#B8960C] via-[#9E8009] to-[#7B6205] shadow-xl border border-amber-300/40 mb-3">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-wide">
          ICONIC <span className="text-[#B8960C]">INVESTING</span>
        </h1>
        <div className="inline-block mt-1 px-3 py-1 rounded-full bg-white/10 border border-[#B8960C]/30 text-amber-200 text-xs font-semibold tracking-wider uppercase">
          Client Portal Activation
        </div>
        <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
          Welcome, <strong>{invitation.clientName}</strong>. Choose a secure password to access your private investor portal.
        </p>
      </div>

      {/* Main Activation Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-7 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          
          {/* Invitation Meta & Expiry Banner */}
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 to-slate-50 border border-amber-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Agency Invitation
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px]">
                <Clock className="w-3 h-3 text-[#B8960C]" />
                {timeRemaining}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 border-t border-amber-200/60">
              <div>
                <span className="text-slate-400 block text-[10px]">Investor Account:</span>
                <strong className="text-slate-800">{invitation.clientEmail}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Buyers Advocate:</span>
                <strong className="text-slate-800">{invitation.invitedBy}</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              Link is single-use and expires 48 hours from issuance ({new Date(invitation.expiresAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}).
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Set New Password *
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Confirm Password *
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] bg-white transition"
                />
              </div>
            </div>

            {/* Password Strength Checklist */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
              <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                Security Requirements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>8+ characters minimum</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Includes numbers (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Capital letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${passwordsMatch ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg bg-[#1A3A5C] hover:bg-[#224b75] text-white font-bold text-sm tracking-wide transition-all disabled:opacity-50 cursor-pointer border border-[#B8960C]/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Encrypting & Activating Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account & Access Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#B8960C]" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <button
              type="button"
              onClick={onCancelToLogin}
              className="text-slate-500 hover:text-slate-800 transition font-medium"
            >
              Already know your password? Sign In
            </button>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encrypted SHA-256 Vault</span>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
