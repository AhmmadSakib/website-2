import React, { useState } from 'react';
import { 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  Image as ImageIcon, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signUpWithEmail, signInWithGoogle, loading, error: authError } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProf = await signUpWithEmail(email.trim(), password, fullName.trim(), profileImage.trim());
      if (newProf.role === 'OWNER') {
        onNavigate('/admin');
      } else {
        onNavigate('/auth/pending');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setFormError(null);
    try {
      await signInWithGoogle();
      onNavigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Google account creation was cancelled.');
    }
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-14 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8C0B12]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#E51F2A]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        
        {/* Registration Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416]/95 border border-white/10 shadow-[0_0_60px_rgba(229,31,42,0.12)] space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#080808] border border-white/10 text-[#E51F2A] shadow-inner mb-1">
              <UserPlus size={24} />
            </div>
            
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest">
              REGISTRATION PROTOCOL
            </div>
            
            <h1 className="text-3xl font-heading font-bold text-white">
              Create Your Account
            </h1>
            
            <p className="text-xs sm:text-sm text-[#A8A1A1] max-w-sm mx-auto">
              Register for authenticated access. Non-owner accounts will enter approval verification prior to private resource authorization.
            </p>
          </div>

          {/* Form / API Alerts */}
          {(formError || authError) && (
            <div className="p-3.5 rounded-xl bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-[#E51F2A] text-xs flex items-center gap-2.5 font-mono">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                <User size={13} className="text-[#E51F2A]" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Johnathan Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                <Mail size={13} className="text-[#E51F2A]" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                  <Lock size={13} className="text-[#E51F2A]" />
                  <span>Password *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                  <Lock size={13} className="text-[#E51F2A]" />
                  <span>Confirm *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
                />
              </div>
            </div>

            {/* Optional Profile Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-[#A8A1A1]" />
                  <span>Profile Image URL</span>
                </span>
                <span className="text-[10px] text-[#A8A1A1]/60 lowercase">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(229,31,42,0.35)] cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>CREATING ACCOUNT...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="w-full h-[1px] bg-white/10" />
            <span className="absolute px-3 bg-[#111416] text-[11px] font-mono text-[#A8A1A1] uppercase tracking-wider">
              Or Connect With
            </span>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white hover:bg-[#F1F1F1] text-black font-semibold text-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          {/* Navigation to Login */}
          <div className="text-center pt-2 border-t border-white/5 text-xs text-[#A8A1A1]">
            <span>Already have an account? </span>
            <button
              onClick={() => onNavigate('/login')}
              className="text-[#E51F2A] hover:underline font-semibold cursor-pointer"
            >
              LOGIN
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
