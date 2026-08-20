import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Award, 
  Lock, 
  Trash2, 
  RotateCcw, 
  Download, 
  Eye, 
  Search, 
  Upload, 
  Plus, 
  Edit2, 
  FolderInput, 
  SlidersHorizontal, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  HardDrive, 
  Grid3X3, 
  List, 
  ArrowLeft,
  KeyRound,
  X,
  FileCheck,
  Check
} from 'lucide-react';
import { VaultFileItem, VaultFolderItem, FileVisibility } from '../types';
import { INITIAL_VAULT_FILES, VAULT_FOLDERS } from '../config/personalData';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { FilePreviewModal } from '../components/vault/FilePreviewModal';
import { PermissionManagerModal } from '../components/admin/PermissionManagerModal';
import { db, collection, onSnapshot, doc, setDoc, deleteDoc } from '../lib/firebase';

interface AdminFilesPageProps {
  onNavigate: (path: string) => void;
}

export const AdminFilesPage: React.FC<AdminFilesPageProps> = ({ onNavigate }) => {
  const { isOwner, profile } = useAuth();
  const { logActivity } = usePermissions();

  const [files, setFiles] = useState<VaultFileItem[]>(INITIAL_VAULT_FILES);
  const [folders, setFolders] = useState<VaultFolderItem[]>(VAULT_FOLDERS);
  const [currentFolder, setCurrentFolder] = useState<string>('all'); // 'all', folder.id, or 'trash'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updatedAt' | 'type'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // Modals
  const [previewFile, setPreviewFile] = useState<VaultFileItem | null>(null);
  const [permissionFile, setPermissionFile] = useState<VaultFileItem | null>(null);
  const [renamingFile, setRenamingFile] = useState<VaultFileItem | null>(null);
  const [movingFile, setMovingFile] = useState<VaultFileItem | null>(null);
  const [bulkMoving, setBulkMoving] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [targetFolderId, setTargetFolderId] = useState('documents');

  // Destructive permanent delete confirmation modal
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [bulkPermanentDeleteOpen, setBulkPermanentDeleteOpen] = useState(false);

  // Multi-file drag and drop & upload simulation
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; percent: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          console.warn('[ADMIN FILES] Local state fallback active:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore file manager fallback active');
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('pdf') || t.includes('doc')) return <FileText className="text-[#E51F2A]" size={18} />;
    if (t.includes('mp4') || t.includes('video')) return <Video className="text-[#E51F2A]" size={18} />;
    if (t.includes('png') || t.includes('jpg') || t.includes('img')) return <ImageIcon className="text-[#E51F2A]" size={18} />;
    if (t.includes('json') || t.includes('code') || t.includes('csv')) return <FileCheck className="text-[#E51F2A]" size={18} />;
    return <FileText className="text-[#E51F2A]" size={18} />;
  };

  // Filter & Sort Logic
  const activeFiles = files.filter((file) => {
    // Trash filter
    if (currentFolder === 'trash') {
      if (!file.isTrash) return false;
    } else {
      if (file.isTrash) return false;
      if (currentFolder !== 'all' && file.folderId !== currentFolder) return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        file.name.toLowerCase().includes(q) ||
        file.type.toLowerCase().includes(q) ||
        (file.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortBy === 'size') comparison = a.size - b.size;
    else if (sortBy === 'type') comparison = a.type.localeCompare(b.type);
    else if (sortBy === 'updatedAt') comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedFileIds.length === activeFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(activeFiles.map((f) => f.id));
    }
  };

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Multi-file drag and drop
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(Array.from(e.target.files));
    }
  };

  const processUploadedFiles = async (fileList: File[]) => {
    setIsUploadModalOpen(true);
    const initialProgress = fileList.map((f) => ({ name: f.name, percent: 0 }));
    setUploadProgress(initialProgress);

    const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    const storage = getStorage();

    fileList.forEach((file, index) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const folderPath = currentFolder === 'all' || currentFolder === 'trash' ? 'documents' : currentFolder;
      const storagePath = `vault/${folderPath}/${fileId}_${file.name}`;
      
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          ownerId: profile?.uid || 'owner-root',
          visibility: 'PRIVATE'
        }
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) =>
            prev.map((item, i) => (i === index ? { ...item, percent: Math.min(p, 100) } : item))
          );
        },
        (err) => {
          console.error('Admin upload error:', err);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const newVaultFile: VaultFileItem = {
              id: fileId,
              name: file.name,
              type: ext,
              mimeType: file.type || 'application/octet-stream',
              size: file.size,
              storagePath: storagePath,
              downloadUrl: downloadUrl,
              ownerId: profile?.uid || 'owner-root',
              folderId: folderPath,
              visibility: 'PRIVATE',
              isTrash: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              contentPreview: `Indexed artifact: ${file.name} (${formatSize(file.size)})`,
              tags: [ext.toUpperCase(), 'Vault'],
            };

            setFiles((prev) => [newVaultFile, ...prev]);
            logActivity('FILE_UPLOADED', profile?.email || 'owner', `FILE:${file.name}`, `Uploaded to ${newVaultFile.folderId}`);
            await setDoc(doc(db, 'files', newVaultFile.id), newVaultFile);
          } catch (e) {
            console.error('Admin DB insert error', e);
          }
        }
      );
    });
  };

  // Trash, Restore & Permanent Delete Actions
  const handleMoveToTrash = (file: VaultFileItem) => {
    const updated = { ...file, isTrash: true, trashedAt: new Date().toISOString() };
    setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    logActivity('FILE_TRASHED', profile?.email || 'owner', `FILE:${file.name}`, 'Moved to Vault Recycle Bin.');
    try {
      setDoc(doc(db, 'files', file.id), updated);
    } catch (e) {
      console.warn('Local state updated');
    }
  };

  const handleRestoreFromTrash = (file: VaultFileItem) => {
    const updated = { ...file, isTrash: false, trashedAt: undefined };
    setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    logActivity('FILE_RESTORED', profile?.email || 'owner', `FILE:${file.name}`, 'Restored from Recycle Bin to active storage.');
    try {
      setDoc(doc(db, 'files', file.id), updated);
    } catch (e) {
      console.warn('Local state updated');
    }
  };

  const handlePermanentDelete = async (fileId: string, fileName: string) => {
    const target = files.find(f => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    logActivity('FILE_PERMANENT_DELETED', profile?.email || 'owner', `FILE:${fileName}`, 'Permanently purged from cryptographic database.');
    
    if (target?.storagePath) {
      try {
        const { getStorage, ref, deleteObject } = await import('firebase/storage');
        const storage = getStorage();
        const fileRef = ref(storage, target.storagePath);
        await deleteObject(fileRef).catch(e => console.warn('Storage delete fail', e));
      } catch (e) {
        console.warn('Storage delete error', e);
      }
    }

    try {
      await deleteDoc(doc(db, 'files', fileId));
    } catch (e) {
      console.warn('Deleted from local state');
    }
    setPermanentDeleteTarget(null);
  };

  // Bulk Actions
  const handleBulkMoveToTrash = () => {
    if (selectedFileIds.length === 0) return;
    const now = new Date().toISOString();
    setFiles((prev) =>
      prev.map((f) => (selectedFileIds.includes(f.id) ? { ...f, isTrash: true, trashedAt: now } : f))
    );
    logActivity('FILE_TRASHED', profile?.email || 'owner', `BULK (${selectedFileIds.length} items)`, 'Bulk moved to recycle bin.');
    selectedFileIds.forEach((id) => {
      const f = files.find((item) => item.id === id);
      if (f) {
        try {
          setDoc(doc(db, 'files', id), { ...f, isTrash: true, trashedAt: now });
        } catch (e) {}
      }
    });
    setSelectedFileIds([]);
  };

  const handleBulkRestore = () => {
    if (selectedFileIds.length === 0) return;
    setFiles((prev) =>
      prev.map((f) => (selectedFileIds.includes(f.id) ? { ...f, isTrash: false, trashedAt: undefined } : f))
    );
    logActivity('FILE_RESTORED', profile?.email || 'owner', `BULK (${selectedFileIds.length} items)`, 'Bulk restored from recycle bin.');
    selectedFileIds.forEach((id) => {
      const f = files.find((item) => item.id === id);
      if (f) {
        try {
          setDoc(doc(db, 'files', id), { ...f, isTrash: false, trashedAt: undefined });
        } catch (e) {}
      }
    });
    setSelectedFileIds([]);
  };

  const handleBulkPermanentDelete = async () => {
    setFiles((prev) => prev.filter((f) => !selectedFileIds.includes(f.id)));
    logActivity('FILE_PERMANENT_DELETED', profile?.email || 'owner', `BULK (${selectedFileIds.length} items)`, 'Bulk permanent purge executed.');
    for (const id of selectedFileIds) {
      try {
        await deleteDoc(doc(db, 'files', id));
      } catch (e) {}
    }
    setSelectedFileIds([]);
    setBulkPermanentDeleteOpen(false);
  };

  // Rename File
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !renameValue.trim()) return;
    const oldName = renamingFile.name;
    const updated = { ...renamingFile, name: renameValue.trim(), updatedAt: new Date().toISOString() };
    setFiles((prev) => prev.map((f) => (f.id === renamingFile.id ? updated : f)));
    logActivity('FILE_RENAMED', profile?.email || 'owner', `FILE:${oldName} -> ${renameValue}`, 'File renamed.');
    try {
      setDoc(doc(db, 'files', renamingFile.id), updated);
    } catch (e) {}
    setRenamingFile(null);
  };

  // Move File / Bulk Move
  const handleMoveFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkMoving) {
      setFiles((prev) =>
        prev.map((f) => (selectedFileIds.includes(f.id) ? { ...f, folderId: targetFolderId, updatedAt: new Date().toISOString() } : f))
      );
      logActivity('FILE_MOVED', profile?.email || 'owner', `BULK (${selectedFileIds.length} items)`, `Moved to partition /${targetFolderId}`);
      selectedFileIds.forEach((id) => {
        const target = files.find((f) => f.id === id);
        if (target) {
          try {
            setDoc(doc(db, 'files', id), { ...target, folderId: targetFolderId, updatedAt: new Date().toISOString() });
          } catch (e) {}
        }
      });
      setSelectedFileIds([]);
      setBulkMoving(false);
    } else if (movingFile) {
      const updated = { ...movingFile, folderId: targetFolderId, updatedAt: new Date().toISOString() };
      setFiles((prev) => prev.map((f) => (f.id === movingFile.id ? updated : f)));
      logActivity('FILE_MOVED', profile?.email || 'owner', `FILE:${movingFile.name}`, `Moved from ${movingFile.folderId} to ${targetFolderId}`);
      try {
        setDoc(doc(db, 'files', movingFile.id), updated);
      } catch (e) {}
      setMovingFile(null);
    }
  };

  // Create Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const slug = newFolderName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newFolder: VaultFolderItem = {
      id: slug,
      name: newFolderName.trim(),
      slug,
      fileCount: 0,
      totalSize: 0,
      icon: 'Folder',
      description: 'Custom encrypted partition.',
    };
    setFolders((prev) => [...prev, newFolder]);
    setIsNewFolderOpen(false);
    setNewFolderName('');
  };

  if (!isOwner()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="p-8 rounded-2xl bg-[#111416] border border-red-500/30 max-w-md space-y-4">
          <Lock size={40} className="mx-auto text-[#E51F2A]" />
          <h2 className="text-xl font-bold text-white">Owner Authorization Required</h2>
          <p className="text-xs text-[#A8A1A1]">
            The Advanced File Manager is restricted to the verified site owner.
          </p>
          <button
            onClick={() => onNavigate('/login')}
            className="px-6 py-2.5 rounded-xl bg-[#E51F2A] text-white font-bold text-xs"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  const trashCount = files.filter((f) => f.isTrash).length;

  return (
    <div
      className={`min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 transition-colors ${
        isDragOver ? 'bg-[#E51F2A]/5' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleFileDrop}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => onNavigate('/admin')}
                className="text-xs font-mono text-[#A8A1A1] hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} />
                HQ Dashboard
              </button>
              <span className="text-[#A8A1A1]">/</span>
              <span className="text-xs font-mono text-[#E51F2A] font-bold uppercase">Desktop File Manager</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
              VAULT <span className="text-[#E51F2A]">FILE MANAGER</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A1A1] mt-1">
              Multi-file streaming uploads, folder hierarchies, bulk actions, and recycle bin security.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewFolderOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111416] hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>New Folder</span>
            </button>

            <button
              id="admin-upload-trigger-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,31,42,0.4)] transition-all cursor-pointer"
            >
              <Upload size={15} />
              <span>Upload Files</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleManualUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Drag and Drop Zone Banner */}
        <div
          className={`p-4 rounded-2xl border border-dashed transition-all flex items-center justify-between gap-4 ${
            isDragOver
              ? 'border-[#E51F2A] bg-[#E51F2A]/10 text-white'
              : 'border-white/10 bg-[#111416]/50 text-[#A8A1A1]'
          }`}
        >
          <div className="flex items-center gap-3">
            <Upload size={20} className="text-[#E51F2A]" />
            <span className="text-xs font-mono">
              Drag and drop multiple files anywhere onto this canvas to upload directly into <strong className="text-white">/{currentFolder}</strong>.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-[#080808] px-2.5 py-1 rounded border border-white/10 text-[#D1D1D1]">
            Streaming Buffer Active
          </span>
        </div>

        {/* Navigation Tabs (All, Folders, Trash) */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
          <button
            onClick={() => setCurrentFolder('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentFolder === 'all'
                ? 'bg-[#E51F2A] text-white font-bold shadow-[0_0_15px_rgba(229,31,42,0.4)]'
                : 'bg-[#111416] text-[#A8A1A1] hover:text-white border border-white/5'
            }`}
          >
            <HardDrive size={14} />
            <span>ALL FILES ({files.filter((f) => !f.isTrash).length})</span>
          </button>

          {folders.map((folder) => {
            const count = files.filter((f) => !f.isTrash && f.folderId === folder.id).length;
            const isSelected = currentFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E51F2A] text-white font-bold shadow-[0_0_15px_rgba(229,31,42,0.4)]'
                    : 'bg-[#111416] text-[#A8A1A1] hover:text-white border border-white/5'
                }`}
              >
                <Folder size={14} />
                <span>{folder.name.toUpperCase()} ({count})</span>
              </button>
            );
          })}

          <button
            onClick={() => setCurrentFolder('trash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono ml-auto transition-all cursor-pointer ${
              currentFolder === 'trash'
                ? 'bg-[#E51F2A] text-white font-bold shadow-[0_0_15px_rgba(229,31,42,0.4)]'
                : 'bg-[#111416] text-[#A8A1A1] hover:text-red-400 border border-white/5'
            }`}
          >
            <Trash2 size={14} />
            <span>RECYCLE BIN ({trashCount})</span>
          </button>
        </div>

        {/* Toolbar & Bulk Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111416] border border-white/10">
          
          {/* Left: Search & Selection state */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="p-2 rounded-xl bg-[#080808] border border-white/10 text-[#A8A1A1] hover:text-white cursor-pointer"
              title={selectedFileIds.length === activeFiles.length ? 'Deselect All' : 'Select All'}
            >
              {selectedFileIds.length > 0 && selectedFileIds.length === activeFiles.length ? (
                <CheckSquare size={16} className="text-[#E51F2A]" />
              ) : (
                <Square size={16} />
              )}
            </button>

            <div className="relative flex-1 sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
              <input
                type="text"
                placeholder="Search file name, extension, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs text-white placeholder-[#A8A1A1]/60 focus:outline-none focus:border-[#E51F2A]"
              />
            </div>
          </div>

          {/* Center/Right: Bulk Action Buttons (if files selected) or Sort Controls */}
          {selectedFileIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-[#080808] px-4 py-2 rounded-xl border border-[#E51F2A]/30 animate-fadeIn">
              <span className="text-xs font-mono text-[#E51F2A] font-bold">
                {selectedFileIds.length} SELECTED
              </span>

              {currentFolder === 'trash' ? (
                <>
                  <button
                    onClick={handleBulkRestore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181c1f] hover:bg-white/10 text-white border border-white/10 text-xs font-mono cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Restore All</span>
                  </button>
                  <button
                    onClick={() => setBulkPermanentDeleteOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-mono cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Purge Selected</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setBulkMoving(true); setMovingFile(null); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181c1f] hover:bg-white/10 text-white text-xs font-mono cursor-pointer"
                  >
                    <FolderInput size={13} />
                    <span>Move</span>
                  </button>
                  <button
                    onClick={handleBulkMoveToTrash}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-400 text-xs font-mono cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Move to Trash</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs text-[#D1D1D1]">
                <SlidersHorizontal size={13} className="text-[#E51F2A]" />
                <select
                  aria-label="Sort files"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-mono"
                >
                  <option value="updatedAt" className="bg-[#111416]">Date Modified</option>
                  <option value="name" className="bg-[#111416]">File Name</option>
                  <option value="size" className="bg-[#111416]">File Size</option>
                  <option value="type" className="bg-[#111416]">Extension</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-xs font-mono text-[#E51F2A] ml-1 cursor-pointer"
                >
                  {sortOrder.toUpperCase()}
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-[#080808] border border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-[#E51F2A] text-white' : 'text-[#A8A1A1] hover:text-white'
                  }`}
                  title="Table View"
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#E51F2A] text-white' : 'text-[#A8A1A1] hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 size={15} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Files Main View Container */}
        <div className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden shadow-xl">
          {activeFiles.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Folder size={36} className="mx-auto text-[#A8A1A1]/40" />
              <div className="text-base text-white font-semibold">
                {currentFolder === 'trash' ? 'Recycle Bin is Empty' : 'No Files Found in this Partition'}
              </div>
              <p className="text-xs text-[#A8A1A1] max-w-sm mx-auto">
                {currentFolder === 'trash'
                  ? 'All deleted records have been purged.'
                  : 'Drag and drop files to populate this directory, or adjust your search filter.'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#080808] text-[11px] font-mono text-[#A8A1A1] uppercase border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-3">Folder</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Size</th>
                    <th className="py-3 px-4 hidden md:table-cell">Date</th>
                    <th className="py-3 px-3">Visibility</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {activeFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr
                        key={file.id}
                        onClick={() => toggleSelectFile(file.id)}
                        className={`hover:bg-white/5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-white/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSelectFile(file.id)}
                            className="text-[#A8A1A1] hover:text-white cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={15} className="text-[#E51F2A]" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>

                        {/* File Name */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[#080808] border border-white/10 shrink-0">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="truncate max-w-xs sm:max-w-md font-medium text-white">
                              {file.name}
                            </div>
                          </div>
                        </td>

                        {/* Folder */}
                        <td className="py-3.5 px-3 text-[#A8A1A1]">
                          /{file.folderId}
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-3 uppercase text-[#E51F2A] font-bold">
                          {file.type}
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-3 text-[#D1D1D1]">
                          {formatSize(file.size)}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#A8A1A1] hidden md:table-cell">
                          {new Date(file.updatedAt).toLocaleDateString()}
                        </td>

                        {/* Visibility */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                        <td className="py-3.5 px-4 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {currentFolder === 'trash' ? (
                              <>
                                <button
                                  onClick={() => handleRestoreFromTrash(file)}
                                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Restore File"
                                >
                                  <RotateCcw size={15} />
                                </button>
                                <button
                                  onClick={() => setPermanentDeleteTarget({ id: file.id, name: file.name })}
                                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Permanent Purge"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Preview"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => { setRenamingFile(file); setRenameValue(file.name); }}
                                  className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Rename"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() => { setMovingFile(file); setTargetFolderId(file.folderId); }}
                                  className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Move to Folder"
                                >
                                  <FolderInput size={15} />
                                </button>
                                <button
                                  onClick={() => setPermissionFile(file)}
                                  className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-[#E51F2A] hover:bg-white/10 transition-colors cursor-pointer"
                                  title="Share Access"
                                >
                                  <KeyRound size={15} />
                                </button>
                                <button
                                  onClick={() => handleMoveToTrash(file)}
                                  className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Move to Trash"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleSelectFile(file.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-[#181c1f] border-[#E51F2A] shadow-[0_0_20px_rgba(229,31,42,0.25)]'
                        : 'bg-[#080808] border-white/10 hover:border-white/30 hover:bg-[#111416]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-[#111416] border border-white/10">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-[#A8A1A1]">
                        {file.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{file.name}</h4>
                      <div className="flex items-center justify-between text-xs font-mono text-[#A8A1A1] mt-1">
                        <span>/{file.folderId}</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="text-[#E51F2A] hover:underline font-medium cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => (currentFolder === 'trash' ? handleRestoreFromTrash(file) : handleMoveToTrash(file))}
                        className="text-[#A8A1A1] hover:text-red-400 cursor-pointer"
                      >
                        {currentFolder === 'trash' ? 'Restore' : 'Trash'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Upload Progress Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-white/15 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Streaming Uploads Active</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#A8A1A1] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {uploadProgress.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#080808] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white truncate max-w-[200px]">{item.name}</span>
                    <span className="text-[#E51F2A] font-bold">{item.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#E51F2A] transition-all duration-300"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#E51F2A] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Close & View Records
            </button>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-white/15 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Rename File Record</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E51F2A]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingFile(null)}
                  className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E51F2A] text-white font-bold text-xs cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Modal (Single or Bulk) */}
      {(movingFile || bulkMoving) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-white/15 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {bulkMoving ? `Relocate ${selectedFileIds.length} Selected Records` : `Move "${movingFile?.name}"`}
            </h3>
            <form onSubmit={handleMoveFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A8A1A1] mb-2">SELECT DESTINATION PARTITION:</label>
                <select
                  value={targetFolderId}
                  onChange={(e) => setTargetFolderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E51F2A] cursor-pointer"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#111416]">
                      /{f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setMovingFile(null); setBulkMoving(false); }}
                  className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E51F2A] text-white font-bold text-xs cursor-pointer"
                >
                  Execute Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-white/15 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create New Partition Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                required
                placeholder="e.g. Research, Contracts, Shaders"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white text-xs focus:outline-none focus:border-[#E51F2A]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E51F2A] text-white font-bold text-xs cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete Single Confirmation Modal */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-red-500/40 p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-[#E51F2A]" />
            <h3 className="text-lg font-bold text-white">Confirm Permanent Deletion</h3>
            <p className="text-xs text-[#A8A1A1]">
              You are about to permanently purge <strong className="text-white">"{permanentDeleteTarget.name}"</strong> from cryptographic storage. This destructive operation cannot be reversed.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl bg-[#080808] hover:bg-white/10 border border-white/10 text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(permanentDeleteTarget.id, permanentDeleteTarget.name)}
                className="px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,31,42,0.5)] cursor-pointer"
              >
                Permanently Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Bulk Confirmation Modal */}
      {bulkPermanentDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111416] border border-red-500/40 p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-[#E51F2A]" />
            <h3 className="text-lg font-bold text-white">Purge {selectedFileIds.length} Selected Records?</h3>
            <p className="text-xs text-[#A8A1A1]">
              These records will be completely deleted from the database and all partitions. This action is irreversible.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkPermanentDeleteOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#080808] hover:bg-white/10 border border-white/10 text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPermanentDelete}
                className="px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,31,42,0.5)] cursor-pointer"
              >
                Purge All Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* Permission Manager Modal */}
      {permissionFile && (
        <PermissionManagerModal
          isOpen={!!permissionFile}
          onClose={() => setPermissionFile(null)}
          initialResource={{
            id: permissionFile.id,
            name: permissionFile.name,
            type: 'FILE',
          }}
        />
      )}
    </div>
  );
};
