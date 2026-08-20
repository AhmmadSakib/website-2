import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Search, 
  Upload, 
  Folder, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Award, 
  Eye, 
  Download, 
  Trash2, 
  Share2, 
  HardDrive, 
  LogIn,
  KeyRound,
  Bot,
  Sparkles
} from 'lucide-react';
import { VAULT_FOLDERS, INITIAL_VAULT_FILES } from '../config/personalData';
import { VaultFileItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { UploadModal } from '../components/vault/UploadModal';
import { FilePreviewModal } from '../components/vault/FilePreviewModal';
import { PermissionManagerModal } from '../components/admin/PermissionManagerModal';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { db, collection, onSnapshot, doc, deleteDoc, setDoc } from '../lib/firebase';

interface VaultPageProps {
  initialFolderSlug?: string;
  onNavigate: (path: string) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({ initialFolderSlug = 'all', onNavigate }) => {
  const { user, profile, role, isOwner, canRead, canWrite, canDelete } = useAuth();
  const { hasPermission, logActivity } = usePermissions();

  const [selectedFolder, setSelectedFolder] = useState<string>(initialFolderSlug);
  const [files, setFiles] = useState<VaultFileItem[]>(INITIAL_VAULT_FILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PRIVATE' | 'SHARED' | 'PUBLIC'>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFileItem | null>(null);
  
  // Share modal state
  const [shareFile, setShareFile] = useState<VaultFileItem | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'files'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: VaultFileItem[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...docSnap.data() } as VaultFileItem);
            });
            setFiles(fetched);
          }
        },
        (err) => {
          console.warn('Using local vault state:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore fallback active for vault');
    }
  }, []);

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-6 h-6 text-[#E51F2A]" />;
      case 'Folder': return <Folder className="w-6 h-6 text-[#E51F2A]" />;
      case 'Video': return <Video className="w-6 h-6 text-[#E51F2A]" />;
      case 'Image': return <ImageIcon className="w-6 h-6 text-[#E51F2A]" />;
      case 'Award': return <Award className="w-6 h-6 text-[#E51F2A]" />;
      case 'Lock':
      default:
        return <Lock className="w-6 h-6 text-[#E51F2A]" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Filter files based on RBAC permissions and folder selection
  const accessibleFiles = files.filter((file) => {
    // 1. Permission evaluation via PermissionsContext
    const hasRead = isOwner() || hasPermission(file.id, 'FILE', 'READ') || canRead(file.visibility, file.ownerId);
    if (!hasRead) return false;

    // Folder filter
    if (selectedFolder !== 'all' && file.folderId !== selectedFolder) {
      return false;
    }

    // Visibility filter
    if (visibilityFilter !== 'ALL' && file.visibility !== visibilityFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        file.name.toLowerCase().includes(q) ||
        file.type.toLowerCase().includes(q) ||
        file.folderId.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleUploadSuccess = (newFile: VaultFileItem) => {
    setFiles((prev) => [newFile, ...prev]);
    logActivity('FILE_UPLOADED', profile?.email || 'owner', `FILE:${newFile.name}`, `Stored in ${newFile.folderId} partition.`);
    try {
      setDoc(doc(db, 'files', newFile.id), newFile).catch((e) =>
        console.warn('Local vault sync:', e)
      );
    } catch (e) {
      console.warn('Local vault state updated');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (target) {
      logActivity('FILE_DELETED', profile?.email || 'owner', `FILE:${target.name}`, 'Record purged from vault.');
      try {
        if (target.storagePath) {
          const { getStorage, ref, deleteObject } = await import('firebase/storage');
          const storage = getStorage();
          const fileRef = ref(storage, target.storagePath);
          await deleteObject(fileRef).catch(e => console.warn('Storage delete failed or file missing', e));
        }
      } catch (e) {
        console.warn('Storage delete logic error', e);
      }
    }
    try {
      await deleteDoc(doc(db, 'files', fileId));
    } catch (e) {
      console.warn('Local delete file state updated', e);
    }
  };

  const handleDownload = (file: VaultFileItem) => {
    const canDown = isOwner() || hasPermission(file.id, 'FILE', 'DOWNLOAD');
    if (!canDown) {
      alert('Access Denied: You lack explicit DOWNLOAD permission for this file.');
      return;
    }
    logActivity('FILE_DOWNLOADED', profile?.email || 'guest', `FILE:${file.name}`, 'Cryptographic download executed.');
    
    if (file.downloadUrl && file.downloadUrl !== '#') {
      window.open(file.downloadUrl, '_blank');
    } else {
      alert(`Downloading ${file.name}... (File may be virtual)`);
    }
  };

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-12">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex items-center gap-6">
            <div className="hidden sm:block w-24 h-24 shrink-0">
              <Cyber3DSystem variant="vault" height={96} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[2px] bg-[#E51F2A]" />
                <span className="text-[#E51F2A] text-xs font-mono tracking-widest uppercase">
                  Zero-Trust Storage Layer
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                MY <span className="text-[#E51F2A]">VAULT</span>
              </h1>
              <p className="text-sm sm:text-base text-[#A8A1A1] mt-1">
                Your files, encrypted, secured, and organized.
              </p>
            </div>
          </div>

          {/* Authorization Status Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111416] border border-white/10 text-xs font-mono">
              <span className="text-[#A8A1A1]">TIER:</span>
              <span className="text-[#E51F2A] font-bold">{role}</span>
            </div>

            <button
              id="vault-ai-assistant-btn"
              onClick={() => onNavigate('/vault/ai')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181c1f] hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition-all cursor-pointer"
            >
              <Bot size={15} className="text-[#E51F2A]" />
              <span>Sakib AI</span>
            </button>

            {isOwner() && (
              <button
                id="vault-owner-filemgr-btn"
                onClick={() => onNavigate('/admin/files')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181c1f] hover:bg-white/10 border border-white/10 text-white font-mono text-xs transition-all cursor-pointer"
              >
                <HardDrive size={15} className="text-[#E51F2A]" />
                <span>File Manager</span>
              </button>
            )}

            {canWrite() ? (
              <button
                id="vault-upload-trigger-btn"
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)] cursor-pointer"
              >
                <Upload size={15} />
                <span>UPLOAD</span>
              </button>
            ) : (
              <button
                id="vault-login-trigger-btn"
                onClick={() => onNavigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181c1f] hover:bg-white/10 text-white border border-white/10 font-medium text-xs sm:text-sm cursor-pointer"
              >
                <LogIn size={15} />
                <span>Elevate Privileges</span>
              </button>
            )}
          </div>
        </div>

        {/* Folder Directory Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-mono text-[#A8A1A1] tracking-wider">
              STORAGE DIRECTORIES
            </h2>
            <button
              onClick={() => setSelectedFolder('all')}
              className={`text-xs font-mono transition-colors cursor-pointer ${
                selectedFolder === 'all' ? 'text-[#E51F2A] font-bold' : 'text-[#A8A1A1] hover:text-white'
              }`}
            >
              View All Folders
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {VAULT_FOLDERS.map((folder) => {
              const isSelected = selectedFolder === folder.id;
              return (
                <div
                  key={folder.id}
                  id={`vault-folder-${folder.id}`}
                  onClick={() => setSelectedFolder(isSelected ? 'all' : folder.id)}
                  className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-[#181c1f] border-[#E51F2A] shadow-[0_0_25px_rgba(229,31,42,0.25)]'
                      : 'bg-[#111416] border-white/10 hover:border-white/30 hover:bg-[#181c1f]'
                  }`}
                >
                  <div className="mb-4">
                    {getFolderIcon(folder.icon)}
                  </div>

                  <div>
                    <h3 className="text-sm font-heading font-bold text-white mb-1">
                      {folder.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A1A1]">
                      <span>{folder.fileCount} files</span>
                      <span>{formatSize(folder.totalSize)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111416]/80 backdrop-blur-md border border-white/10">
          
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
            <input
              id="vault-search-input"
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs sm:text-sm text-white placeholder-[#A8A1A1]/60 focus:outline-none focus:border-[#E51F2A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {(['ALL', 'PRIVATE', 'SHARED', 'PUBLIC'] as const).map((vis) => (
              <button
                key={vis}
                onClick={() => setVisibilityFilter(vis)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  visibilityFilter === vis
                    ? 'bg-[#E51F2A] text-white font-bold shadow-[0_0_10px_rgba(229,31,42,0.3)]'
                    : 'bg-[#080808] text-[#A8A1A1] border border-white/5 hover:text-white'
                }`}
              >
                {vis}
              </button>
            ))}
          </div>

        </div>

        {/* Files Table View */}
        <div className="rounded-2xl bg-[#111416]/90 border border-white/10 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A8A1A1]">
              <HardDrive size={14} className="text-[#E51F2A]" />
              <span>INDEXED REPOSITORY RECORDS ({accessibleFiles.length})</span>
            </div>
            {selectedFolder !== 'all' && (
              <span className="text-xs font-mono text-[#E51F2A] bg-[#E51F2A]/10 px-2 py-0.5 rounded">
                FILTER: /{selectedFolder}
              </span>
            )}
          </div>

          {accessibleFiles.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Lock size={32} className="mx-auto text-[#A8A1A1]" />
              <div className="text-base text-white font-semibold">No Accessible Vault Files Found</div>
              <p className="text-xs text-[#A8A1A1] max-w-sm mx-auto">
                No records match your authorization criteria in this partition, or the search filter returned 0 matches.
              </p>
              {canWrite() && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#E51F2A] text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Upload First File
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#080808]/60 text-[11px] font-mono text-[#A8A1A1] uppercase border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-4 hidden md:table-cell">Modified</th>
                    <th className="py-3 px-3">Access</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accessibleFiles.map((file) => (
                    <tr
                      key={file.id}
                      id={`vault-file-row-${file.id}`}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setPreviewFile(file)}
                    >
                      {/* File Name & Icon */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#080808] text-[#E51F2A] border border-white/10 font-mono font-bold uppercase text-[10px]">
                            {file.type}
                          </div>
                          <span className="font-medium text-white group-hover:text-[#E51F2A] transition-colors truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 font-mono text-xs text-[#A8A1A1] uppercase">
                        {file.type}
                      </td>

                      {/* Size */}
                      <td className="py-3.5 px-3 font-mono text-xs text-[#D1D1D1]">
                        {formatSize(file.size)}
                      </td>

                      {/* Modified Date */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#A8A1A1] hidden md:table-cell">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </td>

                      {/* Visibility Access Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            file.visibility === 'PUBLIC'
                              ? 'bg-white/10 text-white border border-white/20'
                              : file.visibility === 'SHARED'
                              ? 'bg-[#8C0B12]/20 text-[#D1D1D1] border border-[#8C0B12]/50'
                              : 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30'
                          }`}
                        >
                          {file.visibility}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`preview-btn-${file.id}`}
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Preview File"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            id={`download-btn-${file.id}`}
                            onClick={() => handleDownload(file)}
                            className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download size={15} />
                          </button>

                          {isOwner() && (
                            <button
                              id={`share-btn-${file.id}`}
                              onClick={() => setShareFile(file)}
                              className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-[#E51F2A] hover:bg-white/10 transition-colors cursor-pointer"
                              title="Grant Access"
                            >
                              <KeyRound size={15} />
                            </button>
                          )}

                          {canDelete() && (
                            <button
                              id={`delete-btn-${file.id}`}
                              onClick={() => {
                                if (confirm(`Purge ${file.name}?`)) {
                                  handleDeleteFile(file.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        defaultFolderId={selectedFolder === 'all' ? 'documents' : selectedFolder}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDelete={handleDeleteFile}
      />

      {/* Permission Manager Modal for File Sharing */}
      {shareFile && (
        <PermissionManagerModal
          isOpen={!!shareFile}
          onClose={() => setShareFile(null)}
          initialResource={{
            id: shareFile.id,
            name: shareFile.name,
            type: 'FILE'
          }}
        />
      )}
    </div>
  );
};
