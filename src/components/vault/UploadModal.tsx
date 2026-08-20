import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { VaultFileItem, FileVisibility } from '../../types';
import { VAULT_FOLDERS } from '../../config/personalData';
import { useAuth } from '../../context/AuthContext';
import { db, storage, collection, doc, setDoc, ref, uploadBytesResumable, getDownloadURL } from '../../lib/firebase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newFile: VaultFileItem) => void;
  defaultFolderId?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  defaultFolderId = 'documents',
}) => {
  const { user, profile, isOwner, canWrite } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [visibility, setVisibility] = useState<FileVisibility>('PRIVATE');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'webm', 'mov', 'zip', 'json'];

  const validateFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(ext)) {
      setError(`File type .${ext} is not supported in the vault.`);
      return false;
    }
    // 100MB size limit
    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100MB security limit.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!canWrite() || !user) {
      setError('Your current authorization tier does not permit vault uploads.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'dat';
    const fileId = `file-${Date.now()}`;
    const storagePath = `vault/${folderId}/${fileId}_${selectedFile.name}`;
    
    // Create Storage reference
    const storageRef = ref(storage, storagePath);
    
    // Set up metadata
    const metadata = {
      contentType: selectedFile.type || 'application/octet-stream',
      customMetadata: {
        ownerId: user.uid,
        visibility: visibility
      }
    };

    // Start upload
    const uploadTask = uploadBytesResumable(storageRef, selectedFile, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercentage);
      },
      (err) => {
        console.error('Upload failed:', err);
        setError('Upload failed. Please try again.');
        setUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          const newFileItem: VaultFileItem = {
            id: fileId,
            name: selectedFile.name,
            type: ext,
            mimeType: selectedFile.type || 'application/octet-stream',
            size: selectedFile.size,
            storagePath: storagePath,
            downloadUrl: downloadUrl,
            ownerId: user.uid,
            folderId: folderId,
            visibility: visibility,
            isTrash: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contentPreview: `Encrypted binary buffer for ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
          };

          // Save to Firestore
          const docRef = doc(db, 'files', fileId);
          await setDoc(docRef, newFileItem);

          setUploading(false);
          onUploadSuccess(newFileItem);
          onClose();
        } catch (dbErr) {
          console.error('Database record creation failed:', dbErr);
          setError('Failed to create file record in database.');
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080808]/85 backdrop-blur-xl cursor-pointer"
      />

      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-3xl bg-[#111416] border border-white/15 p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(229,31,42,0.25)] z-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-[#E51F2A] uppercase">SECURE INGESTION</div>
            <h2 className="text-2xl font-heading font-bold text-white">Upload Vault Asset</h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full bg-[#080808] text-[#A8A1A1] hover:text-white border border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#E51F2A]/15 border border-[#E51F2A]/30 text-[#E51F2A] text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            dragActive 
              ? 'border-[#E51F2A] bg-[#E51F2A]/10' 
              : selectedFile 
              ? 'border-white/50 bg-white/5' 
              : 'border-white/15 bg-[#080808] hover:border-white/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-xl bg-[#111416] text-[#E51F2A] border border-white/10 flex items-center justify-center mb-3">
            <Upload size={22} />
          </div>

          {selectedFile ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white truncate max-w-xs">{selectedFile.name}</div>
              <div className="text-xs font-mono text-[#A8A1A1]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">Drag & drop files here, or click to browse</div>
              <div className="text-xs text-[#A8A1A1]">PDF, MP4, PNG, JPG, ZIP, DOCX (Max 100MB)</div>
            </div>
          )}
        </div>

        {/* Folder & Visibility Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#A8A1A1] uppercase">Destination Folder</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#E51F2A]"
            >
              {VAULT_FOLDERS.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#111416]">{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#A8A1A1] uppercase">Access Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as FileVisibility)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#E51F2A]"
            >
              <option value="PRIVATE" className="bg-[#111416]">PRIVATE (Owner Only)</option>
              <option value="SHARED" className="bg-[#111416]">SHARED (Trusted Members)</option>
              <option value="PUBLIC" className="bg-[#111416]">PUBLIC (World Accessible)</option>
            </select>
          </div>
        </div>

        {/* Progress Bar when uploading */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#A8A1A1]">
              <span>Ingesting into storage cluster...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#080808] overflow-hidden">
              <div 
                className="h-full bg-[#E51F2A] transition-all duration-200" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm text-[#A8A1A1] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(229,31,42,0.4)] disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Encrypting...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload to Vault</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
