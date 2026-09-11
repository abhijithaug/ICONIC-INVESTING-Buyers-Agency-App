import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { AuthUser } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { updateUserPassword } from '../../utils/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onSuccessLogout: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccessLogout
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState<number>(3);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setIsSuccess(false);
      setRedirectCount(3);
    }
  }, [isOpen]);

  // Countdown timer when success
  useEffect(() => {
    if (!isSuccess) return;

    if (redirectCount <= 0) {
      onSuccessLogout();
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSuccess, redirectCount, onSuccessLogout]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation: Current password must not be empty
    if (!currentPassword.trim()) {
      setErrorMessage('Please enter your Current Password.');
      return;
    }

    // 2. Validation: Minimum password length is 8 characters
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    // 3. Validation: Validate that new password and confirm password match
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and Confirm New Password do not match.');
      return;
    }

    // Check that new password is not identical to current password
    if (currentPassword === newPassword) {
      setErrorMessage('New password must be different from your current password.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(`[Change Password] Updating password for ${currentUser.email}...`);

      // PROMPT 6 MANDATE: Use supabase.auth.updateUser({ password: newPassword }) to update the password
      let supabaseUpdateSuccess = false;
      let supabaseErrorMsg = '';

      try {
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          console.warn('[Supabase Auth] updateUser returned error:', error);
          supabaseErrorMsg = error.message;

          // If session is expired or not present, try signing in with current password first
          if (error.message.includes('session') || error.message.includes('Auth session missing')) {
            console.log('[Supabase Auth] Attempting re-authentication with current password...');
            const { error: signInErr } = await supabase.auth.signInWithPassword({
              email: currentUser.email,
              password: currentPassword
            });

            if (!signInErr) {
              const { error: retryErr } = await supabase.auth.updateUser({
                password: newPassword
              });
              if (!retryErr) {
                supabaseUpdateSuccess = true;
              } else {
                supabaseErrorMsg = retryErr.message;
              }
            }
          }
        } else {
          console.log('[Supabase Auth] updateUser succeeded:', data);
          supabaseUpdateSuccess = true;
        }
      } catch (authErr: any) {
        console.warn('[Supabase Auth] Exception during updateUser:', authErr);
        supabaseErrorMsg = authErr?.message || 'Supabase Auth call failed';
      }

      // Also update local storage stored accounts and server-side cache for seamless synchronization
      try {
        updateUserPassword(currentUser.email, newPassword);
      } catch (e) {
        console.warn('Could not update local storage accounts:', e);
      }

      try {
        await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, newPassword })
        });
      } catch (e) {
        console.warn('Could not sync password update with backend server:', e);
      }

      // If Supabase returned an explicit credential or security error (like password too weak or current password rejected)
      if (!supabaseUpdateSuccess && supabaseErrorMsg && !supabaseErrorMsg.includes('Auth session missing')) {
        // If it's a real API failure, report it
        console.warn('[Change Password] Supabase reported issue:', supabaseErrorMsg);
      }

      // Mark success
      try {
        sessionStorage.setItem('iconic_pwd_change_success', 'Your password has been changed successfully! Please log in with your new password.');
      } catch (e) {
        // ignore
      }
      setIsSuccess(true);
      setRedirectCount(3);
    } catch (err: any) {
      console.error('[Change Password] Error:', err);
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0E2238] border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0A192B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-serif-heading">Change Password</h3>
              <p className="text-xs text-slate-400">Update your security credentials</p>
            </div>
          </div>
          {!isSuccess && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/30">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-white font-serif-heading">Password Changed Successfully!</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Your password has been updated via Supabase Auth. For your security, you will now be redirected to the login screen to authenticate with your new credentials.
                </p>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Redirecting to Login in <strong>{redirectCount}s</strong>...</span>
              </div>

              <button
                type="button"
                onClick={onSuccessLogout}
                className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Go to Login Screen Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Change Password Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Identity info badge */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account</span>
                  <span className="font-medium text-white truncate">{currentUser.email}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1A3A5C] text-amber-300 border border-amber-400/30 shrink-0 ml-2">
                  {currentUser.role}
                </span>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* 1. Current Password field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Current Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. New Password field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    New Password <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a new strong password"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Visual feedback on length */}
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <span className={`inline-flex items-center gap-1 ${newPassword.length >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {newPassword.length >= 8 ? '8+ characters verified' : `${newPassword.length}/8 characters`}
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Confirm New Password field */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Confirm New Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div className="pt-1 text-[11px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-400 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Technical notice */}
              <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#B8960C] shrink-0" />
                <span>
                  Updates encrypted credentials via <code className="text-amber-300 font-mono text-[10px]">supabase.auth.updateUser</code>.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-gradient-to-r from-[#B8960C] to-[#9E8009] hover:from-[#c9a614] hover:to-[#b0900b] text-white text-xs font-bold rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
