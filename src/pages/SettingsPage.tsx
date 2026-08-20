import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Clock,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PERSONAL_CONFIG } from '../config/personalData';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { 
    user, 
    profile, 
    role, 
    status, 
    isOwner, 
    updateProfileData, 
    sendPasswordReset, 
    signOut 
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await updateProfileData(displayName.trim(), photoURL.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReset = async () => {
    const targetEmail = profile?.email || user?.email;
    if (!targetEmail) return;
    setError(null);
    try {
      await sendPasswordReset(targetEmail);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-14 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('/dashboard')}
            className="inline-flex items-center gap-1 text-xs text-[#A8A1A1] hover:text-white mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-heading font-bold text-white">
            Account & Security Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A1A1] mt-1">
            Manage your personal credentials, profile identity, and active clearance tokens.
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#080808] hover:bg-[#8C0B12]/20 border border-white/10 text-white text-xs font-semibold cursor-pointer"
        >
          <LogOut size={14} className="text-[#E51F2A]" />
          <span>Sign Out</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-[#E51F2A] text-xs flex items-center gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} className="text-[#E51F2A] shrink-0" />
          <span>Profile preferences successfully updated.</span>
        </div>
      )}

      {resetSent && (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 size={16} className="text-[#E51F2A] shrink-0" />
          <span>Password reset email dispatched to {profile?.email || user?.email}.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#111416]/90 border border-white/10 space-y-6">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E51F2A] flex items-center gap-2">
            <User size={14} />
            <span>Identity Configuration</span>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">Registered Email</label>
              <input
                type="email"
                disabled
                value={profile?.email || user?.email || ''}
                className="w-full px-4 py-3 rounded-xl bg-[#080808]/60 border border-white/5 text-[#A8A1A1] text-sm cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">Profile Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-sm"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(229,31,42,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
              </button>

              <button
                type="button"
                onClick={handleSendReset}
                className="px-5 py-3 rounded-xl bg-[#080808] hover:bg-white/5 border border-white/10 text-white text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound size={13} className="text-[#E51F2A]" />
                <span>Reset Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Clearance Details */}
        <div className="p-6 rounded-3xl bg-[#111416]/90 border border-white/10 space-y-6">
          <div className="text-xs font-mono uppercase tracking-wider text-[#E51F2A] flex items-center gap-2">
            <ShieldCheck size={14} />
            <span>Clearance Profile</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/5 space-y-1">
              <div className="text-[#A8A1A1] text-[10px] uppercase">Access Role Tier</div>
              <div className="text-white font-bold text-sm flex items-center justify-between">
                <span>{role}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-[#E51F2A] text-white">ENFORCED</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/5 space-y-1">
              <div className="text-[#A8A1A1] text-[10px] uppercase">Authorization Status</div>
              <div className="text-white font-bold text-sm flex items-center justify-between">
                <span className="uppercase">{status}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-white">LIVE</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/5 space-y-1">
              <div className="text-[#A8A1A1] text-[10px] uppercase">User UID Identifier</div>
              <div className="text-[#D1D1D1] text-[11px] truncate font-mono">
                {profile?.uid || user?.uid || 'anonymous'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/5 space-y-1">
              <div className="text-[#A8A1A1] text-[10px] uppercase">Clearance Capabilities</div>
              <ul className="text-[11px] text-[#A8A1A1] space-y-1 pt-1 list-disc list-inside">
                {isOwner() ? (
                  <>
                    <li className="text-white">Full Read / Write / Delete on all files</li>
                    <li className="text-white">Manage users, approvals, & permissions</li>
                    <li className="text-white">Security audit logs & system metrics</li>
                  </>
                ) : (
                  <>
                    <li>Read Public and Shared project files</li>
                    <li>Upload files to personal partition</li>
                    <li>Direct access to Sakib AI neural assistant</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
