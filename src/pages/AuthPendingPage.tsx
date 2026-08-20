import React, { useState } from 'react';
import { 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  LogOut, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAL_CONFIG } from '../config/personalData';

interface AuthPendingPageProps {
  onNavigate: (path: string) => void;
}

export const AuthPendingPage: React.FC<AuthPendingPageProps> = ({ onNavigate }) => {
  const { profile, user, refreshProfile, signOut, status, isActive } = useAuth();
  const [checking, setChecking] = useState(false);
  const [refreshedNotice, setRefreshedNotice] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setRefreshedNotice(null);
    try {
      await refreshProfile();
      if (isActive) {
        setRefreshedNotice('Account approved! Redirecting to Digital Vault...');
        setTimeout(() => onNavigate('/dashboard'), 1200);
      } else {
        setRefreshedNotice('Account status verified: Access remains PENDING approval from Ahmmad Sakib.');
      }
    } catch (e: any) {
      setRefreshedNotice('Unable to sync status with authentication server.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/login');
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-16 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambient Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8C0B12]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416]/95 border border-white/10 shadow-[0_0_60px_rgba(229,31,42,0.12)] space-y-6 text-center">
          
          {/* Visual Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#080808] border border-white/15 text-[#E51F2A] shadow-inner mb-2 animate-pulse">
            <Clock size={32} />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest">
              ACCESS STATUS: PENDING APPROVAL
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Your Account Has Been Created
            </h1>
            
            <p className="text-xs sm:text-sm text-[#A8A1A1] max-w-md mx-auto leading-relaxed">
              Your access request is currently waiting for owner verification. Because this digital world contains private research files and proprietary archives, all external identities require explicit clearance from Ahmmad Sakib.
            </p>
          </div>

          {/* Account Details Box */}
          <div className="p-4 rounded-2xl bg-[#080808] border border-white/10 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Account Identity:</span>
              <span className="text-white font-semibold">{profile?.displayName || user?.displayName || 'Digital Explorer'}</span>
            </div>
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Email:</span>
              <span className="text-white font-semibold">{profile?.email || user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Assigned Clearance:</span>
              <span className="text-[#E51F2A] font-bold">LIMITED (PENDING OWNER APPROVAL)</span>
            </div>
            <div className="flex justify-between text-[#A8A1A1]">
              <span>Owner Contact:</span>
              <span className="text-white">{PERSONAL_CONFIG.ownerEmail}</span>
            </div>
          </div>

          {refreshedNotice && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white flex items-center gap-2 text-left font-mono">
              <CheckCircle2 size={16} className="text-[#E51F2A] shrink-0" />
              <span>{refreshedNotice}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(229,31,42,0.3)] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              <span>CHECK STATUS</span>
            </button>

            <button
              onClick={() => onNavigate('/contact')}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#080808] hover:bg-white/5 border border-white/10 text-white font-semibold text-xs tracking-wider transition-all cursor-pointer"
            >
              <Mail size={14} className="text-[#E51F2A]" />
              <span>CONTACT OWNER</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#A8A1A1]">
            <span>Need to switch accounts?</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-[#E51F2A] hover:underline cursor-pointer font-mono font-medium"
            >
              <LogOut size={13} />
              <span>SIGN OUT</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
