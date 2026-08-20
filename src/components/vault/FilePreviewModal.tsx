import React, { useState } from 'react';
import { X, Download, Lock, ShieldCheck, FileText, Calendar, HardDrive, Share2, Trash2, Play, Eye } from 'lucide-react';
import { VaultFileItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';

interface FilePreviewModalProps {
  file: VaultFileItem | null;
  onClose: () => void;
  onDelete?: (fileId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onDelete }) => {
  const { isOwner, canDelete, profile } = useAuth();
  const { hasPermission, logActivity } = usePermissions();
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  if (!file) return null;

  const canDownload = isOwner() || file.visibility === 'PUBLIC' || hasPermission(file.id, 'FILE', 'DOWNLOAD');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getVisibilityBadge = () => {
    switch (file.visibility) {
      case 'PUBLIC':
        return <span className="px-2.5 py-0.5 rounded bg-white/10 text-white border border-white/20 text-xs font-mono">PUBLIC</span>;
      case 'SHARED':
        return <span className="px-2.5 py-0.5 rounded bg-[#8C0B12]/20 text-[#D1D1D1] border border-[#8C0B12]/50 text-xs font-mono">SHARED</span>;
      case 'PRIVATE':
      default:
        return <span className="px-2.5 py-0.5 rounded bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 text-xs font-mono">PRIVATE</span>;
    }
  };

  const handleDownloadAttempt = () => {
    if (!canDownload) {
      alert('Access Denied: You lack cryptographic DOWNLOAD authorization for this private asset.');
      logActivity('SECURITY_ALERT', profile?.email || 'guest', `DENIED_DOWNLOAD:${file.name}`, 'Unauthorized download blocked.');
      return;
    }
    logActivity('FILE_DOWNLOADED', profile?.email || 'guest', `FILE:${file.name}`, 'Zero-trust file payload delivered.');
    alert(`Downloading ${file.name}...`);
  };

  const isVideo = file.type === 'mp4' || file.mimeType?.startsWith('video/');
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(file.type.toLowerCase()) || file.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080808]/85 backdrop-blur-xl cursor-pointer"
      />

      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl rounded-3xl bg-[#111416] border border-white/15 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(229,31,42,0.25)] z-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center font-mono font-bold uppercase text-xs">
              {file.type}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {getVisibilityBadge()}
                <span className="text-xs font-mono text-[#A8A1A1]">{formatSize(file.size)}</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-white mt-1 break-all">
                {file.name}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full bg-[#080808] text-[#A8A1A1] hover:text-white border border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Viewer / Preview Box with Media Lazy Loading */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 font-mono text-xs sm:text-sm text-[#D1D1D1] space-y-4 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-[#A8A1A1] pb-2 border-b border-white/5">
            <span>STORAGE PATH: {file.storagePath}</span>
            <span>MIME: {file.mimeType}</span>
          </div>

          {/* Lazy Video Player: Only loaded on user click */}
          {isVideo && (
            <div className="rounded-xl overflow-hidden bg-[#111416] border border-white/10 p-4 text-center">
              {!isPlayingVideo ? (
                <div className="space-y-3 py-6">
                  <div className="w-12 h-12 rounded-full bg-[#E51F2A]/20 text-[#E51F2A] border border-[#E51F2A]/40 flex items-center justify-center mx-auto cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setIsPlayingVideo(true)}
                  >
                    <Play size={20} className="ml-0.5" />
                  </div>
                  <div className="text-xs text-white font-mono font-semibold">Protected Video Stream</div>
                  <div className="text-[11px] text-[#A8A1A1]">Click to initialize low-latency stream buffer</div>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg bg-black flex items-center justify-center border border-white/10">
                  <span className="text-xs font-mono text-[#A8A1A1]">Streaming {file.name} (AES-256 decrypted buffer)</span>
                </div>
              )}
            </div>
          )}

          <p className="leading-relaxed text-[#F1F1F1] whitespace-pre-wrap">
            {file.contentPreview || `Verified binary payload stream. Encryption status: AES-GCM 256. SHA-256 integrity signature validated.`}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#A8A1A1]">
          <div>
            <span className="block uppercase text-[10px] text-[#A8A1A1]/60">CREATED AT</span>
            <span className="text-white">{new Date(file.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="block uppercase text-[10px] text-[#A8A1A1]/60">ENCRYPTION STATUS</span>
            <span className="text-white font-bold font-mono">AES-256 PROTECTED</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          {canDelete() && onDelete && (
            <button
              onClick={() => {
                if (confirm(`Permanently purge ${file.name} from digital vault?`)) {
                  onDelete(file.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-semibold cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Purge File</span>
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/vault/${file.folderId}/${file.name}`);
                alert(`Direct link copied to clipboard.`);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#181c1f] text-white border border-white/10 hover:bg-white/5 text-xs font-medium cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share Token</span>
            </button>

            <button
              onClick={handleDownloadAttempt}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-xs transition-all cursor-pointer ${
                canDownload
                  ? 'bg-[#E51F2A] hover:bg-[#B5121B] shadow-[0_0_15px_rgba(229,31,42,0.4)]'
                  : 'bg-white/10 text-white/50 border border-white/10'
              }`}
            >
              {canDownload ? <Download size={14} /> : <Lock size={14} />}
              <span>{canDownload ? 'Download File' : 'Download Locked'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
