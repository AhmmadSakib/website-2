import React, { useState } from 'react';
import { KeyRound, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');
    setStatusMessage(null);

    try {
      await sendPasswordReset(email.trim());
      setStatus('success');
      setStatusMessage('Password reset link has been dispatched to your email.');
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Failed to dispatch reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-16 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[#8C0B12]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416]/95 border border-white/10 shadow-[0_0_60px_rgba(229,31,42,0.12)] space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#080808] border border-white/10 text-[#E51F2A] shadow-inner mb-1">
              <KeyRound size={24} />
            </div>
            
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest">
              CREDENTIAL RECOVERY
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Reset Your Password
            </h1>
            
            <p className="text-xs text-[#A8A1A1] max-w-xs mx-auto">
              Enter your registered email address to receive an official cryptographic password reset authorization link.
            </p>
          </div>

          {status === 'success' && (
            <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2.5 font-mono">
              <CheckCircle2 size={16} className="text-[#E51F2A] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-[#E51F2A] text-xs flex items-center gap-2.5 font-mono">
              <AlertCircle size={16} className="shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
                <Mail size={13} className="text-[#E51F2A]" />
                <span>Account Email</span>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(229,31,42,0.35)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>TRANSMITTING INSTRUCTIONS...</span>
                </>
              ) : (
                <>
                  <span>SEND RESET INSTRUCTIONS</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/5">
            <button
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Return to Login</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
