import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  User, 
  CheckSquare, 
  Square, 
  Clock, 
  AlertCircle,
  FileText,
  Folder,
  Briefcase,
  Award
} from 'lucide-react';
import { 
  ResourceType, 
  PermissionAction, 
  PermissionItem 
} from '../../types';
import { usePermissions } from '../../context/PermissionsContext';
import { INITIAL_PROJECTS, INITIAL_CERTIFICATES, INITIAL_VAULT_FILES, VAULT_FOLDERS } from '../../config/personalData';

interface PermissionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialResource?: {
    id: string;
    name: string;
    type: ResourceType;
  } | null;
  existingPermission?: PermissionItem | null;
}

export const PermissionManagerModal: React.FC<PermissionManagerModalProps> = ({
  isOpen,
  onClose,
  initialResource,
  existingPermission
}) => {
  const { grantPermission, updatePermission, users } = usePermissions();

  const [userEmail, setUserEmail] = useState<string>(existingPermission?.userEmail || '');
  const [resourceType, setResourceType] = useState<ResourceType>(
    existingPermission?.resourceType || initialResource?.type || 'PROJECT'
  );
  const [resourceId, setResourceId] = useState<string>(
    existingPermission?.resourceId || initialResource?.id || 'ai-assistant'
  );
  
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionAction[]>(
    existingPermission?.permissions || ['READ', 'DOWNLOAD']
  );
  
  const [hasExpiry, setHasExpiry] = useState<boolean>(!!existingPermission?.expiresAt);
  const [expiryDate, setExpiryDate] = useState<string>(
    existingPermission?.expiresAt 
      ? new Date(existingPermission.expiresAt).toISOString().split('T')[0] 
      : '2026-12-31'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Available resources based on selected type
  const getResourceOptions = () => {
    switch (resourceType) {
      case 'FILE':
        return INITIAL_VAULT_FILES.map(f => ({ id: f.id, name: f.name }));
      case 'FOLDER':
        return VAULT_FOLDERS.map(f => ({ id: f.slug, name: `${f.name} Vault Folder` }));
      case 'PROJECT':
        return INITIAL_PROJECTS.map(p => ({ id: p.id, name: p.title }));
      case 'CERTIFICATE':
        return INITIAL_CERTIFICATES.map(c => ({ id: c.id, name: c.title }));
      default:
        return [];
    }
  };

  const currentResourceOptions = getResourceOptions();

  const handleTogglePermission = (action: PermissionAction) => {
    setSelectedPermissions(prev => 
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    );
  };

  const getSelectedResourceName = () => {
    const found = currentResourceOptions.find(r => r.id === resourceId);
    return found ? found.name : resourceId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid user email address.' });
      return;
    }
    if (selectedPermissions.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one permission capability.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const calculatedExpiry = hasExpiry && expiryDate ? `${expiryDate}T23:59:59Z` : null;

    try {
      if (existingPermission) {
        await updatePermission(existingPermission.id, selectedPermissions, calculatedExpiry);
        setFeedback({ type: 'success', message: 'Permission updated successfully.' });
      } else {
        await grantPermission({
          userEmail,
          resourceId,
          resourceName: getSelectedResourceName(),
          resourceType,
          permissions: selectedPermissions,
          expiresAt: calculatedExpiry
        });
        setFeedback({ type: 'success', message: `Access successfully granted to ${userEmail}.` });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to apply permissions.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111416] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 text-[11px] font-mono">
              <ShieldCheck size={12} />
              <span>OWNER PERMISSION PROVISIONER</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-white">
              {existingPermission ? 'Modify Granted Permission' : 'Grant Resource Access'}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#080808] text-[#A8A1A1] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {feedback && (
          <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-white/10 border-white/20 text-white' 
              : 'bg-[#E51F2A]/10 border-[#E51F2A]/30 text-[#E51F2A]'
          }`}>
            <AlertCircle size={14} className="shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* User Email Selection / Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5">
              <User size={13} className="text-[#E51F2A]" />
              <span>Target User Email</span>
            </label>
            
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. someone@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E51F2A] transition-colors"
              />
            </div>

            {/* Quick autocomplete chips from existing catalog */}
            {users.length > 0 && !existingPermission && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#A8A1A1] font-mono">Known Users:</span>
                {users.slice(0, 3).map(u => (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => setUserEmail(u.email || '')}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#080808] border border-white/10 text-[#D1D1D1] hover:border-[#E51F2A] hover:text-white transition-colors cursor-pointer"
                  >
                    {u.email}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resource Type Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
              Resource Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['PROJECT', 'FILE', 'FOLDER', 'CERTIFICATE'] as ResourceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setResourceType(type);
                    const options = type === 'FILE' ? INITIAL_VAULT_FILES : type === 'FOLDER' ? VAULT_FOLDERS : type === 'PROJECT' ? INITIAL_PROJECTS : INITIAL_CERTIFICATES;
                    if (options.length > 0) {
                      setResourceId(type === 'FOLDER' ? (options[0] as any).slug : options[0].id);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-center text-xs font-medium border transition-all cursor-pointer ${
                    resourceType === type 
                      ? 'bg-[#E51F2A]/20 text-white border-[#E51F2A] shadow-[0_0_12px_rgba(229,31,42,0.2)]' 
                      : 'bg-[#080808] text-[#A8A1A1] border-white/5 hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
              Select Protected Resource
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white text-sm focus:outline-none focus:border-[#E51F2A] transition-colors cursor-pointer"
            >
              {currentResourceOptions.map(res => (
                <option key={res.id} value={res.id} className="bg-[#111416] text-white">
                  {res.name}
                </option>
              ))}
            </select>
          </div>

          {/* Permissions Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] block">
              Granular Permission Capabilities
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(['READ', 'DOWNLOAD', 'WRITE', 'DELETE', 'SHARE'] as PermissionAction[]).map((action) => {
                const isSelected = selectedPermissions.includes(action);
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => handleTogglePermission(action)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#E51F2A]/15 border-[#E51F2A] text-white' 
                        : 'bg-[#080808] border-white/10 text-[#A8A1A1] hover:border-white/30'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[#E51F2A]" />
                    ) : (
                      <Square size={16} className="text-[#A8A1A1]" />
                    )}
                    <span>{action}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiration Date Section */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1.5 cursor-pointer">
                <Clock size={13} className="text-[#E51F2A]" />
                <span>Time-Bounded Expiration</span>
              </label>
              
              <button
                type="button"
                onClick={() => setHasExpiry(!hasExpiry)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${hasExpiry ? 'bg-[#E51F2A]' : 'bg-white/10'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${hasExpiry ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {hasExpiry && (
              <div className="p-3.5 rounded-xl bg-[#080808] border border-white/10 space-y-2 animate-fade-in">
                <div className="text-[11px] text-[#A8A1A1]">
                  Access automatically revokes after midnight on the specified date.
                </div>
                <input
                  type="date"
                  value={expiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111416] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#E51F2A]"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-[#080808] border border-white/10 text-xs font-semibold text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'PROVISIONING...' : existingPermission ? 'UPDATE PERMISSION' : 'GRANT ACCESS'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
