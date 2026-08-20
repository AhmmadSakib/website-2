import React from 'react';
import { 
  FolderLock, 
  FileText, 
  Video, 
  Code2, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Sparkles, 
  Clock, 
  Lock, 
  Share2, 
  Bot,
  Settings,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAL_CONFIG } from '../config/personalData';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { profile, user, role, status, isOwner, isActive, isPending, isSuspended } = useAuth();

  const displayName = profile?.displayName || user?.displayName || 'Digital Explorer';
  const email = profile?.email || user?.email || 'authenticated@vault.internal';

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-14 max-w-7xl mx-auto space-y-8">
      
      {/* Header & Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111416]/90 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C0B12]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#E51F2A]">
                COMMAND CENTER & GATEWAY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E51F2A] text-white">
                {role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-[#F1F1F1]">
                {status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Welcome Back, {displayName}
            </h1>

            <p className="text-xs sm:text-sm text-[#A8A1A1] max-w-2xl">
              Access granted to the Ahmmad Sakib Digital World ecosystem. Explore proprietary project repositories, encrypted vault assets, and specialized AI reasoning tools.
            </p>
          </div>

          {/* Quick Profile Summary Box */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#080808] border border-white/10 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 flex items-center justify-center font-bold font-mono text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">{displayName}</div>
              <div className="text-[11px] text-[#A8A1A1] font-mono">{email}</div>
              <button
                onClick={() => onNavigate('/settings')}
                className="text-[10px] text-[#E51F2A] hover:underline flex items-center gap-1 mt-0.5"
              >
                <Settings size={10} />
                <span>Manage Security & Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning banner if account is pending */}
      {isPending && (
        <div className="p-4 rounded-2xl bg-[#8C0B12]/20 border border-[#E51F2A]/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[#E51F2A] shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white">Verification Pending: </span>
              <span className="text-[#A8A1A1]">Your account is currently waiting for full owner approval. Some private vault resources remain restricted.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/auth/pending')}
            className="px-3 py-1.5 rounded-lg bg-[#E51F2A] text-white text-xs font-mono font-semibold shrink-0 cursor-pointer"
          >
            VIEW STATUS
          </button>
        </div>
      )}

      {/* Primary 4 Pillar Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Vault & Files */}
        <div 
          onClick={() => onNavigate('/vault')}
          className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderLock size={22} />
            </div>

            <div>
              <div className="text-xs font-mono text-[#A8A1A1] uppercase tracking-wider">Storage Partition</div>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors">
                Digital Vault
              </h3>
              <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">
                Encrypted storage, source blueprints, research assets, and documents.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E51F2A]">
              <span>Enter File Vault</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div 
          onClick={() => onNavigate('/projects')}
          className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={22} />
            </div>

            <div>
              <div className="text-xs font-mono text-[#A8A1A1] uppercase tracking-wider">Engineering Work</div>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors">
                Project Library
              </h3>
              <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">
                Production web applications, 3D engines, AI tools, and architectures.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E51F2A]">
              <span>Explore Projects</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 3: AI Assistant */}
        <div 
          onClick={() => onNavigate('/ai')}
          className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot size={22} />
            </div>

            <div>
              <div className="text-xs font-mono text-[#A8A1A1] uppercase tracking-wider">Neural Assistant</div>
              <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors">
                Sakib AI
              </h3>
              <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">
                Ask questions regarding Ahmmad Sakib's skills, credentials, and projects.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E51F2A]">
              <span>Launch AI Terminal</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Card 4: Admin or Settings */}
        {isOwner() ? (
          <div 
            onClick={() => onNavigate('/admin')}
            className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck size={22} />
              </div>

              <div>
                <div className="text-xs font-mono text-[#A8A1A1] uppercase tracking-wider">Superadmin Root</div>
                <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors">
                  Administration
                </h3>
                <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">
                  User permissions, zero-trust audits, file management, and system logs.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E51F2A]">
                <span>Manage System</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => onNavigate('/settings')}
            className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/50 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings size={22} />
              </div>

              <div>
                <div className="text-xs font-mono text-[#A8A1A1] uppercase tracking-wider">Account Control</div>
                <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors">
                  Security Settings
                </h3>
                <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">
                  View assigned clearances, update display profile, and verify sessions.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#E51F2A]">
                <span>Account Profile</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Quick Security & Architecture Info */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-2">
            <Lock size={14} className="text-[#E51F2A]" />
            <span>Active Security Protocol</span>
          </div>
          <span className="text-xs font-mono text-[#E51F2A]">ZERO-TRUST ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#A8A1A1]">
          <div className="p-3 rounded-xl bg-[#111416] border border-white/5 space-y-1">
            <div className="text-white font-semibold">Server-Side Authorization</div>
            <div>Firestore security rules enforce deny-by-default on all data queries.</div>
          </div>

          <div className="p-3 rounded-xl bg-[#111416] border border-white/5 space-y-1">
            <div className="text-white font-semibold">Storage Partitioning</div>
            <div>Direct upload and download URLs are signed and authorized per clearance level.</div>
          </div>

          <div className="p-3 rounded-xl bg-[#111416] border border-white/5 space-y-1">
            <div className="text-white font-semibold">Audit Logging</div>
            <div>All access requests and file downloads are tracked in immutable activity logs.</div>
          </div>
        </div>
      </div>

    </div>
  );
};
