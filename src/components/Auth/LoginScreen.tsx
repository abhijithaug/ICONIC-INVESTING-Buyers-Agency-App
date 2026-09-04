import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  KeyRound
} from 'lucide-react';
import { AuthUser } from '../../types';
import { DEMO_CREDENTIALS } from '../../data/mockAuth';
import { loginWithCredentials } from '../../utils/auth';
import { getStoredInvitations } from '../../utils/invitations';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onOpenInviteToken?: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenInviteToken }) => {
  const [email, setEmail] = useState('admin@iconicinvesting.com.au');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState<'admin' | 'client'>('admin');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { token, user } = await loginWithCredentials(email, password);
      onLoginSuccess(user, token);
    } catch (err: any) {
      console.error('Login error', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedDemoRole(demo.role);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1A2C] via-[#0E2238] to-[#1A3A5C] flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Gold Light Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B8960C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand Badge */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#B8960C] via-[#9E8009] to-[#7B6205] shadow-xl border border-amber-300/40 mb-3">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-heading text-white tracking-wide">
          ICONIC <span className="text-[#B8960C]">INVESTING</span>
        </h1>
        <div className="inline-block mt-1 px-3 py-1 rounded-full bg-white/10 border border-[#B8960C]/30 text-amber-200 text-xs font-semibold tracking-wider uppercase">
          Client & Advocate Portal
        </div>
        <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
          Australia's Premier Real Estate Buyers Agency Platform with JWT Role-Based Access Control.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          
          {/* Quick Demo Role Selector Pills */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#B8960C]" />
                Select Demo Account
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_CREDENTIALS.map((demo) => {
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? demo.role === 'admin'
                          ? 'bg-[#1A3A5C] text-white border-[#B8960C] ring-2 ring-[#B8960C]/50 shadow-md'
                          : 'bg-emerald-800 text-white border-emerald-400 ring-2 ring-emerald-400/50 shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          demo.role === 'admin'
                            ? isSelected
                              ? 'bg-[#B8960C] text-slate-950'
                              : 'bg-amber-100 text-amber-800'
                            : isSelected
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {demo.role}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />}
                    </div>
                    <div className="font-bold text-xs truncate">
                      {demo.label.split('(')[0].trim()}
                    </div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {demo.email.split('@')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Capabilities Notice */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            {selectedDemoRole === 'admin' ? (
              <div className="flex items-start gap-2.5 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-[#B8960C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1A3A5C] font-semibold">Admin (Buyers Advocate) Permissions:</strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    See all client dossiers, edit client briefs, add/edit properties, run AI B&P reports, manage offer negotiations, and upload documents.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-slate-700">
                <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 font-semibold">Client (Investor) Permissions:</strong>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Private access strictly locked to your own profile, your curated property shortlist, settlement timeline, and your uploaded documents.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@iconicinvesting.com.au"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] focus:border-[#1A3A5C] bg-white transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] focus:border-[#1A3A5C] bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Demo passwords: <code className="font-mono text-amber-700">admin</code> or <code className="font-mono text-emerald-700">client123</code></span>
                <span className="text-[#1A3A5C] font-semibold">JWT Session: 7 Days</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-lg bg-[#1A3A5C] hover:bg-[#224b75] text-white font-bold text-sm tracking-wide transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer border border-[#B8960C]/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying JWT Token...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#B8960C]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* New Client Invitation & 48h Token Link Section */}
          <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-slate-50 border border-amber-300/40 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Mail className="w-4 h-4 text-[#B8960C]" />
                <span className="font-bold text-[11px]">Received an Email Invitation?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="text-[11px] font-bold text-[#1A3A5C] hover:underline"
              >
                {showTokenInput ? 'Hide Activation' : 'Set Password with Link / Token'}
              </button>
            </div>

            {showTokenInput && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When your Buyers Advocate registers your client account, you receive an email invitation with a secure link valid for <strong>48 hours</strong>.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste invite link or token (e.g. inv_...)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#1A3A5C] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualToken.trim()) return;
                      let clean = manualToken.trim();
                      if (clean.includes('token=')) {
                        clean = clean.split('token=')[1].split('&')[0];
                      }
                      if (onOpenInviteToken) {
                        onOpenInviteToken(clean);
                      }
                    }}
                    className="px-3 py-2 bg-[#B8960C] hover:bg-[#a18208] text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
                  >
                    Activate
                  </button>
                </div>

                {/* Quick Test Demo Invitations */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Quick Test Links:</span>
                  <button
                    type="button"
                    onClick={() => onOpenInviteToken && onOpenInviteToken('inv_8f9a2c4e1b3d5e7f9a0b2c4d')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-mono transition"
                  >
                    Marcus Vance (Active 24h)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenInviteToken && onOpenInviteToken('inv_7a6b5c4d3e2f1a0b9c8d7e6f')}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-mono transition"
                  >
                    Dr. Sophia (Active 38h)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Encrypted JWT Sessions</span>
            </span>
            <span>Iconic Investing v2.4</span>
          </div>

        </div>
      </div>

    </div>
  );
};
