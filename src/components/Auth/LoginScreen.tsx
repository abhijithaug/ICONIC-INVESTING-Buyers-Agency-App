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
  KeyRound,
  UserPlus,
  LogIn,
  RefreshCw,
  Database
} from 'lucide-react';
import { AuthUser, ClientProfile } from '../../types';
import { DEMO_CREDENTIALS } from '../../data/mockAuth';
import { loginWithCredentials } from '../../utils/auth';
import { 
  supabase, 
  mapSupabaseUserToAuthUser, 
  SUPABASE_URL,
  FIRST_ADMIN_EMAIL,
  checkUserRoleFromSupabase,
  checkUserRoleRecordFromSupabase,
  setupUserRolesSystem,
  saveUserRoleToSupabase,
  USER_ROLES_DDL_SQL
} from '../../services/supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onOpenInviteToken?: (token: string) => void;
  clients?: ClientProfile[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLoginSuccess, 
  onOpenInviteToken,
  clients 
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Default to first admin email requested: augustine.a@iconicinvesting.com.au
  const [email, setEmail] = useState(FIRST_ADMIN_EMAIL);
  const [password, setPassword] = useState('Password123!');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<'admin' | 'client'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState<'admin' | 'client'>('admin');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [showDemoFallback, setShowDemoFallback] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // user_roles auto-setup and verification state
  const [userRolesStatus, setUserRolesStatus] = useState<{
    status: string;
    message: string;
    adminEmail: string;
  } | null>(null);
  const [detectedRole, setDetectedRole] = useState<'admin' | 'client'>('admin');
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Automatically setup user_roles system and verify first admin on mount
  React.useEffect(() => {
    setupUserRolesSystem().then(res => {
      setUserRolesStatus(res);
      console.log('[LoginScreen] user_roles table auto-setup status:', res);
    });

    try {
      const pwdSuccess = sessionStorage.getItem('iconic_pwd_change_success');
      if (pwdSuccess) {
        setSuccessMessage(pwdSuccess);
        sessionStorage.removeItem('iconic_pwd_change_success');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Update detected role when email changes
  React.useEffect(() => {
    if (!email) return;
    const timer = setTimeout(() => {
      checkUserRoleFromSupabase(email.trim().toLowerCase()).then(r => {
        setDetectedRole(r);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowDemoFallback(false);
    setUnconfirmedEmail(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Core requirement: Check email against user_roles table to determine their role
      console.log(`[user_roles check] Querying Supabase user_roles for: ${cleanEmail}`);
      const roleMeta = await checkUserRoleRecordFromSupabase(cleanEmail);
      const resolvedRole = roleMeta.role;
      const resolvedClientId = roleMeta.clientId;
      setDetectedRole(resolvedRole);
      console.log(`[user_roles check] Role determined: ${resolvedRole}, client_id: ${resolvedClientId}`);

      if (authMode === 'signin') {
        // Core requirement: Call supabase.auth.signInWithPassword()
        console.log(`[Supabase Auth] Attempting signInWithPassword for: ${cleanEmail}`);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          console.warn('[Supabase Auth] signInWithPassword error:', error);
          
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setUnconfirmedEmail(cleanEmail);
            setErrorMessage('Supabase Auth: Email address has not been confirmed yet. Please verify your inbox or click below to resend confirmation.');
          } else if (error.message.toLowerCase().includes('invalid login credentials')) {
            setErrorMessage('Supabase Auth: Invalid login credentials. If this user is not yet created in your Supabase Auth project, switch to the "Sign Up" tab to register, or use the demo login.');
            setShowDemoFallback(true);
          } else {
            setErrorMessage(`Supabase Auth: ${error.message}`);
          }
          return;
        }

        if (data.session && data.user) {
          console.log('[Supabase Auth] Login successful!', data.user.id);
          // Pass the role determined from user_roles table and linked client_id
          const authUser = mapSupabaseUserToAuthUser(data.user, clients, resolvedRole, resolvedClientId);
          onLoginSuccess(authUser, data.session.access_token);
        } else {
          setErrorMessage('Login succeeded but no active session was returned by Supabase.');
        }

      } else {
        // Sign Up with Supabase Auth
        console.log(`[Supabase Auth] Attempting signUp for: ${cleanEmail}`);
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: signupName.trim() || cleanEmail.split('@')[0],
              role: signupRole
            }
          }
        });

        if (error) {
          console.warn('[Supabase Auth] signUp error:', error);
          setErrorMessage(`Supabase Auth Sign Up Error: ${error.message}`);
          return;
        }

        // Insert / save into user_roles table
        await saveUserRoleToSupabase(cleanEmail, signupRole);

        if (data.session && data.user) {
          // Auto-login if email confirmation is disabled in Supabase
          const authUser = mapSupabaseUserToAuthUser(data.user, clients, signupRole);
          onLoginSuccess(authUser, data.session.access_token);
        } else if (data.user) {
          setSuccessMessage(`Account registered in Supabase and assigned '${signupRole}' role in user_roles! If email confirmation is enabled for your project, please check ${cleanEmail} for the activation link.`);
          setAuthMode('signin');
        }
      }
    } catch (err: any) {
      console.error('[Supabase Auth] Unexpected exception:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials and network connection.');
      setShowDemoFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to resend confirmation email
  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setIsResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail
      });
      if (error) {
        setErrorMessage(`Failed to resend confirmation: ${error.message}`);
      } else {
        setSuccessMessage(`Confirmation email resent to ${unconfirmedEmail}. Please check your inbox and spam folder.`);
      }
    } catch (e: any) {
      setErrorMessage(`Resend error: ${e.message}`);
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Quick fallback login for local demo / testing without blocking developers
  const handleDirectDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      // Check user_roles table
      const roleMeta = await checkUserRoleRecordFromSupabase(cleanEmail);
      const { token, user } = await loginWithCredentials(cleanEmail, password);
      // Ensure user role matches user_roles table
      user.role = roleMeta.role;
      if (roleMeta.clientId && user.role === 'client') {
        user.clientId = `client-${roleMeta.clientId}`;
      }
      onLoginSuccess(user, token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(demo.email);
    setPassword(demo.role === 'admin' ? 'Password123!' : 'ClientPass123!');
    setSelectedDemoRole(demo.role);
    setDetectedRole(demo.role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowDemoFallback(false);
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
        
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-[#B8960C]/30 text-amber-200 text-xs font-semibold tracking-wider uppercase">
            Client &amp; Advocate Portal
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-medium">
            <Database className="w-3 h-3 text-emerald-400" />
            Supabase Auth
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
          Australia's Premier Real Estate Buyers Agency Platform with Supabase Authentication.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-7 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/20">
          
          {/* Top Centre Brand Logo & Tagline */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <img
              id="login-card-logo"
              src="https://jrpfkuwafvjkeelzzbhj.supabase.co/storage/v1/object/public/assets/iconic_logo.png?v=2"
              alt="Iconic Investing"
              style={{ width: '180px', height: 'auto' }}
              className="w-[180px] h-auto object-contain mx-auto rounded-xl shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/assets/iconic_logo.png';
                }
              }}
            />
            <div className="mt-2 text-sm font-bold text-[#1A3A5C] tracking-wide">
              Buyers Agency Portal
            </div>
          </div>

          {/* Supabase Connection Status Banner */}
          <div className="mb-5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate font-mono text-[11px]">
                Connected: <strong className="text-slate-800">{SUPABASE_URL.replace('https://', '')}</strong>
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              Live Supabase Auth
            </span>
          </div>

          {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#1A3A5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (Existing User)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#1A3A5C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Supabase Account</span>
            </button>
          </div>

          {/* Supabase User Roles Admin System Info Banner */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#B8960C]/20 border border-[#B8960C]/40 flex items-center justify-center text-[#B8960C] shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Supabase <code className="font-mono text-[#1A3A5C] bg-white px-1.5 py-0.5 rounded border border-slate-200">user_roles</code> Active</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  First Admin: <strong className="text-slate-800">{FIRST_ADMIN_EMAIL}</strong> (Role: <span className="font-bold text-amber-800">admin</span>)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-2xs"
            >
              <FileText className="w-3 h-3 text-[#B8960C]" />
              <span>View SQL Setup</span>
            </button>
          </div>

          {/* Quick Demo Role Selector Pills */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#B8960C]" />
                Select Demo Account
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Click to auto-fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((demo) => {
                const isSelected = email === demo.email;
                return (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
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

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMessage}
                </div>
              </div>

              {unconfirmedEmail && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-700">Didn't receive the email?</span>
                  <button
                    type="button"
                    disabled={isResendingEmail}
                    onClick={handleResendConfirmation}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    {isResendingEmail ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                    <span>Resend Confirmation</span>
                  </button>
                </div>
              )}

              {showDemoFallback && (
                <div className="pt-2 border-t border-rose-200/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1A3A5C] hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Create account in Supabase</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectDemoLogin}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Continue with Demo Session</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Damian Sterling"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] bg-white transition"
                  />
                </div>
                <div>
                  <label htmlFor="signup-role" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Portal Role
                  </label>
                  <select
                    id="signup-role"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as 'admin' | 'client')}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1A3A5C] bg-white transition cursor-pointer"
                  >
                    <option value="admin">Admin (Buyers Advocate)</option>
                    <option value="client">Client (Investor)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Email Address
                </label>
                {/* Live Role Badge determined from Supabase user_roles table */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  detectedRole === 'admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Role: {detectedRole === 'admin' ? 'Admin (Full Dashboard)' : 'Client (Read-Only Portal)'}</span>
                </span>
              </div>
              <div className="relative rounded-xl shadow-xs">
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
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Verified against <code className="font-mono text-emerald-700 font-bold">user_roles</code> table</span>
                {email.toLowerCase() === FIRST_ADMIN_EMAIL.toLowerCase() && (
                  <span className="text-[#B8960C] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    First Admin Account
                  </span>
                )}
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
                <span>Calls <code className="font-mono text-emerald-700 font-bold">supabase.auth.{authMode === 'signin' ? 'signInWithPassword()' : 'signUp()'}</code></span>
                <span className="text-[#1A3A5C] font-semibold">Persisted via Supabase</span>
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
                    <span>Authenticating with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signin' ? 'Sign In with Supabase' : 'Create Supabase Account'}</span>
                    <ArrowRight className="w-4 h-4 text-[#B8960C]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Client Invitation & Activation Token Section */}
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-br from-amber-500/5 to-slate-50 border border-amber-300/40 text-xs">
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
                  When your Buyers Advocate registers your client account, you receive an invitation link valid for <strong>48 hours</strong>.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Paste invite link or token"
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
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Supabase GoTrue &amp; Encrypted Sessions</span>
            </span>
            <span>Iconic Investing v2.4</span>
          </div>

        </div>
      </div>

      {/* SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full border border-slate-700 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#B8960C]" />
                <h3 className="font-bold text-white text-sm">Supabase Database: user_roles Schema &amp; Seed SQL</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <p>
                The admin role system uses the <code className="font-mono text-amber-300">user_roles</code> table in your Supabase PostgreSQL database:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-mono">Column</div>
                  <div className="font-bold text-amber-300 font-mono">id (uuid)</div>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-mono">Column</div>
                  <div className="font-bold text-amber-300 font-mono">email (text)</div>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-mono">Column</div>
                  <div className="font-bold text-amber-300 font-mono">role (text)</div>
                </div>
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-mono">Column</div>
                  <div className="font-bold text-amber-300 font-mono">created_at (tz)</div>
                </div>
              </div>

              <div className="relative">
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto text-emerald-400 max-h-56">
                  {USER_ROLES_DDL_SQL}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(USER_ROLES_DDL_SQL);
                    setSqlCopied(true);
                    setTimeout(() => setSqlCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[10px] font-bold transition flex items-center gap-1"
                >
                  {sqlCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3" />}
                  <span>{sqlCopied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Automatic First Admin:</strong> <code className="text-white font-mono">{FIRST_ADMIN_EMAIL}</code> is guaranteed admin permissions upon setup and login.
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
