import React from 'react';
import { ShieldAlert, Mail, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAL_CONFIG } from '../config/personalData';

interface AuthSuspendedPageProps {
  onNavigate: (path: string) => void;
}

export const AuthSuspendedPage: React.FC<AuthSuspendedPageProps> = ({ onNavigate }) => {
  const { signOut, profile, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/login');
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-16 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8C0B12]/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416]/95 border border-[#8C0B12]/40 shadow-[0_0_60px_rgba(140,11,18,0.25)] space-y-6 text-center">
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#080808] border border-[#8C0B12]/50 text-[#E51F2A] shadow-inner mb-2">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest">
              ACCESS STATUS: SUSPENDED
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Your Account Has Been Suspended
            </h1>
            
            <p className="text-xs sm:text-sm text-[#A8A1A1] max-w-md mx-auto leading-relaxed">
              This account has been temporarily or permanently suspended by Ahmmad Sakib. All token credentials and vault file access privileges have been frozen.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#080808] border border-white/10 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Account Identity:</span>
              <span className="text-white font-semibold">{profile?.displayName || user?.displayName || 'Unknown'}</span>
            </div>
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Email:</span>
              <span className="text-white font-semibold">{profile?.email || user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Current Status:</span>
              <span className="text-[#E51F2A] font-bold">SECURITY LOCKDOWN / SUSPENDED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onNavigate('/contact')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(229,31,42,0.3)] cursor-pointer"
            >
              <Mail size={14} />
              <span>APPEAL SUSPENSION</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#080808] hover:bg-white/5 border border-white/10 text-white font-semibold text-xs tracking-wider transition-all cursor-pointer"
            >
              <LogOut size={14} className="text-[#E51F2A]" />
              <span>SIGN OUT</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 text-center">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Return to Public Portfolio</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
