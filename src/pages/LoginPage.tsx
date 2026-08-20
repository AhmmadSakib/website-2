import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  Loader2, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Clock, 
  Fingerprint, 
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAL_CONFIG, isAuthorizedOwnerEmail } from '../config/personalData';
import { UserRole, UserStatus } from '../types';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { 
    user, 
    profile, 
    role, 
    status,
    isActive,
    isPending,
    isSuspended,
    isDenied,
    isOwner, 
    signInWithEmail,
    signInWithGoogle, 
    signInAsDemo, 
    signOut, 
    loading: authLoading, 
    error: authError 
  } = useAuth();

  // Mode: 'admin' for strict zero-trust Google verification, 'guest' for client/email portal
  const [activeTab, setActiveTab] = useState<'admin' | 'guest'>('admin');
  
  // Form states for guest portal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);
  
  // Feedback and notification states
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success' | 'warning'; message: string } | null>(null);

  // 1. Strict Google Account Verification for Admin / Owner
  const handleAdminGoogleVerification = async () => {
    setFeedback(null);
    setIsVerifyingGoogle(true);
    try {
      const loggedProfile = await signInWithGoogle();
      const authenticatedEmail = loggedProfile?.email || user?.email || '';
      
      const isOwnerAccount = isAuthorizedOwnerEmail(authenticatedEmail) || loggedProfile?.role === 'OWNER';

      if (isOwnerAccount) {
        setFeedback({
          type: 'success',
          message: `Root Admin identity verified (${authenticatedEmail}). Launching Administrative Console...`
        });
        setTimeout(() => {
          onNavigate('/admin');
        }, 600);
      } else {
        setFeedback({
          type: 'warning',
          message: `Authenticated as ${authenticatedEmail}. This Google account is not an authorized Root Administrator. Redirecting to User Dashboard...`
        });
        setTimeout(() => {
          onNavigate('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Google account verification was cancelled or interrupted.'
      });
    } finally {
      setIsVerifyingGoogle(false);
    }
  };

  // 2. Client / Guest Google Login
  const handleGuestGoogleLogin = async () => {
    setFeedback(null);
    setIsVerifyingGoogle(true);
    try {
      const loggedProfile = await signInWithGoogle();
      const authenticatedEmail = loggedProfile?.email || user?.email || '';
      
      if (isAuthorizedOwnerEmail(authenticatedEmail) || loggedProfile?.role === 'OWNER') {
        onNavigate('/admin');
      } else if (loggedProfile?.status === 'pending') {
        onNavigate('/auth/pending');
      } else if (loggedProfile?.status === 'suspended') {
        onNavigate('/auth/suspended');
      } else if (loggedProfile?.status === 'denied') {
        onNavigate('/auth/denied');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Google authentication interrupted.'
      });
    } finally {
      setIsVerifyingGoogle(false);
    }
  };

  // 3. Client / Guest Email & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!email.trim() || !password) {
      setFeedback({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      
      if (isAuthorizedOwnerEmail(email.trim())) {
        onNavigate('/admin');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Authentication failed. Please verify your credentials.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Role Simulator Matrix (Dev & Testing)
  const handleDemoPreset = (selectedRole: UserRole, selectedStatus: UserStatus) => {
    signInAsDemo(selectedRole, selectedStatus);
    if (selectedStatus === 'pending') {
      onNavigate('/auth/pending');
    } else if (selectedStatus === 'denied') {
      onNavigate('/auth/denied');
    } else if (selectedStatus === 'suspended') {
      onNavigate('/auth/suspended');
    } else if (selectedRole === 'OWNER') {
      onNavigate('/admin');
    } else {
      onNavigate('/dashboard');
    }
  };

  return (
    <div id="login-page-root" className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-14 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8C0B12]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#E51F2A]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        
        {/* Active Session Card (If User is already logged in) */}
        {(user || profile) && (
          <div id="active-session-banner" className="p-6 rounded-3xl bg-[#111416]/95 border border-[#E51F2A]/30 shadow-[0_0_40px_rgba(229,31,42,0.12)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Profile'} 
                    className="w-12 h-12 rounded-2xl object-cover border border-[#E51F2A]/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 flex items-center justify-center font-bold font-mono text-lg">
                    {role[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-white">
                      {profile?.displayName || user?.displayName || 'Authenticated Session'}
                    </span>
                    {isOwner() && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E51F2A] text-white">
                        OWNER
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#A8A1A1] font-mono">
                    {profile?.email || user?.email || 'Logged In User'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase bg-white/10 text-white font-medium">
                  {status}
                </span>
              </div>
            </div>

            {/* Quick Navigation Action Grid */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-[#A8A1A1] uppercase tracking-wider">
                Instant Navigation Shortcuts:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {isOwner() && (
                  <button
                    id="nav-to-admin-btn"
                    onClick={() => onNavigate('/admin')}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E51F2A] text-white text-xs font-bold hover:bg-[#B5121B] shadow-[0_0_20px_rgba(229,31,42,0.4)] transition-all cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>LAUNCH ADMIN CONSOLE</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                <button
                  id="nav-to-dashboard-btn"
                  onClick={() => onNavigate('/dashboard')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#181c1f] text-white border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Layers size={15} className="text-[#E51F2A]" />
                  <span>Open User Dashboard</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  id="nav-to-vault-btn"
                  onClick={() => onNavigate('/vault')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#181c1f] text-white border border-white/10 text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Lock size={15} className="text-[#A8A1A1]" />
                  <span>Digital Vault</span>
                </button>

                <button
                  id="sign-out-btn"
                  onClick={() => signOut()}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#080808] text-[#A8A1A1] hover:text-white border border-white/10 text-xs font-semibold hover:bg-[#E51F2A]/10 hover:border-[#E51F2A]/30 transition-all cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416]/95 border border-white/10 shadow-[0_0_60px_rgba(229,31,42,0.15)] space-y-6">
          
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#080808] border border-[#E51F2A]/30 text-[#E51F2A] shadow-inner mb-1">
              <Shield size={26} />
            </div>
            
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E51F2A] animate-pulse" />
              <span>SECURE ACCESS GATEWAY</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Authentication Portal
            </h1>
            
            <p className="text-xs sm:text-sm text-[#A8A1A1] max-w-md mx-auto">
              Select your access channel. Administrators verify root authorization securely via their verified Google account.
            </p>
          </div>

          {/* Mode Switcher Navigation Tabs */}
          <div id="auth-mode-tabs" className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#080808] border border-white/10">
            <button
              id="tab-admin-access"
              type="button"
              onClick={() => { setActiveTab('admin'); setFeedback(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#E51F2A] text-white shadow-[0_0_20px_rgba(229,31,42,0.4)]'
                  : 'text-[#A8A1A1] hover:text-white hover:bg-white/5'
              }`}
            >
              <Fingerprint size={16} />
              <span>ADMIN ACCESS</span>
            </button>

            <button
              id="tab-guest-portal"
              type="button"
              onClick={() => { setActiveTab('guest'); setFeedback(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-[#181c1f] text-white border border-white/10 shadow-sm'
                  : 'text-[#A8A1A1] hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck size={16} />
              <span>CLIENT / GUEST</span>
            </button>
          </div>

          {/* Feedback & Error Alerts */}
          {(feedback || authError) && (
            <div 
              id="login-feedback-banner"
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 font-mono leading-relaxed transition-all ${
                feedback?.type === 'success' 
                  ? 'bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]' 
                  : feedback?.type === 'warning'
                  ? 'bg-[#FBBC05]/10 border-[#FBBC05]/30 text-[#FBBC05]'
                  : 'bg-[#E51F2A]/10 border-[#E51F2A]/30 text-[#E51F2A]'
              }`}
            >
              {feedback?.type === 'success' ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : feedback?.type === 'warning' ? (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold uppercase tracking-wider mb-0.5">
                  {feedback?.type === 'success' ? 'ACCESS CONFIRMED' : feedback?.type === 'warning' ? 'ACCESS WARNING' : 'AUTHENTICATION NOTICE'}
                </div>
                <span>{feedback?.message || authError}</span>
              </div>
            </div>
          )}

          {/* TAB 1: ADMIN & OWNER STRICT GOOGLE VERIFICATION */}
          {activeTab === 'admin' && (
            <div id="admin-auth-view" className="space-y-5 animate-fadeIn">
              
              {/* Zero-Trust Notice */}
              <div className="p-4 rounded-2xl bg-[#080808] border border-[#E51F2A]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E51F2A] uppercase">
                  <ShieldCheck size={16} />
                  <span>Strict Owner Verification Protocol</span>
                </div>
                <p className="text-xs text-[#A8A1A1] leading-relaxed">
                  To protect administrative systems and zero-trust vault permissions, passwords are not used for admin access. Click below to verify your authorized administrator Google account.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#A8A1A1]">
                  <span>Authorized Identity:</span>
                  <span className="text-white font-medium">{PERSONAL_CONFIG.ownerEmail}</span>
                </div>
              </div>

              {/* Large Dedicated Google Verification Button */}
              <button
                id="admin-google-auth-btn"
                onClick={handleAdminGoogleVerification}
                disabled={isVerifyingGoogle || authLoading}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white hover:bg-[#F1F1F1] text-black font-heading font-bold text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(229,31,42,0.4)] cursor-pointer disabled:opacity-50 group"
              >
                {isVerifyingGoogle ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-[#E51F2A]" />
                    <span className="font-mono uppercase tracking-wider text-xs">CONNECTING GOOGLE OAUTH...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="text-black">VERIFY ADMIN VIA GOOGLE ACCOUNT</span>
                    <ArrowRight size={16} className="text-[#E51F2A] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] font-mono text-[#A8A1A1]">
                🔒 256-bit cryptographically signed token verification with automatic claims sync.
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT & GUEST LOGIN */}
          {activeTab === 'guest' && (
            <div id="guest-auth-view" className="space-y-5 animate-fadeIn">
              
              {/* Quick Google Sign In for Clients */}
              <button
                id="guest-google-auth-btn"
                onClick={handleGuestGoogleLogin}
                disabled={isVerifyingGoogle || authLoading}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white hover:bg-[#F1F1F1] text-black font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isVerifyingGoogle ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>CONTINUE WITH GOOGLE</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="w-full h-[1px] bg-white/10" />
                <span className="absolute px-3 bg-[#111416] text-[11px] font-mono text-[#A8A1A1] uppercase tracking-wider">
                  Or use email credentials
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                    <Mail size={13} className="text-[#E51F2A]" />
                    <span>Account Email</span>
                  </label>
                  <input
                    id="guest-email-input"
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                      <Lock size={13} className="text-[#E51F2A]" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('/forgot-password')}
                      className="text-[11px] text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    id="guest-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
                  />
                </div>

                {/* Submit Button */}
                <button
                  id="guest-email-submit-btn"
                  type="submit"
                  disabled={isSubmitting || authLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(229,31,42,0.35)] cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN WITH EMAIL</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Create Account Link */}
              <div className="text-center pt-3 border-t border-white/5 text-xs text-[#A8A1A1]">
                <span>Need client or collaborator access? </span>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="text-[#E51F2A] hover:underline font-semibold cursor-pointer ml-1"
                >
                  CREATE NEW ACCOUNT
                </button>
              </div>
            </div>
          )}

          {/* Quick Navigation Footnote */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A8A1A1]">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>← Back to Public Portfolio</span>
            </button>
            <button
              onClick={() => onNavigate('/vault')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Public Vault →</span>
            </button>
          </div>

          {/* Security & Role Testing Matrix (Collapsible Simulation Engine) */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase text-[#A8A1A1] flex items-center justify-between">
              <span>Sandbox Access Simulator</span>
              <span className="text-[10px] text-[#E51F2A] font-bold">DEV AUDIT</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                id="sim-owner-btn"
                onClick={() => handleDemoPreset('OWNER', 'active')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#E51F2A]" />
                  <span>Owner</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Superadmin Root</div>
              </button>

              <button
                id="sim-trusted-btn"
                onClick={() => handleDemoPreset('TRUSTED', 'active')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <UserCheck size={12} className="text-white" />
                  <span>Trusted</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Shared / Collab</div>
              </button>

              <button
                id="sim-limited-btn"
                onClick={() => handleDemoPreset('LIMITED', 'active')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <UserCheck size={12} className="text-[#A8A1A1]" />
                  <span>Limited</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Public / Guest</div>
              </button>

              <button
                id="sim-pending-btn"
                onClick={() => handleDemoPreset('LIMITED', 'pending')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <Clock size={12} className="text-[#E51F2A]" />
                  <span>Pending</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Awaiting Review</div>
              </button>

              <button
                id="sim-suspended-btn"
                onClick={() => handleDemoPreset('LIMITED', 'suspended')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <ShieldAlert size={12} className="text-[#E51F2A]" />
                  <span>Suspended</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Account Locked</div>
              </button>

              <button
                id="sim-denied-btn"
                onClick={() => handleDemoPreset('LIMITED', 'denied')}
                className="p-2.5 rounded-xl bg-[#080808] border border-white/10 hover:border-[#E51F2A] text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#E51F2A] flex items-center gap-1">
                  <UserX size={12} className="text-[#E51F2A]" />
                  <span>Denied</span>
                </div>
                <div className="text-[10px] text-[#A8A1A1]">Access Refused</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
