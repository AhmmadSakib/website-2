import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderLock, 
  Briefcase, 
  Award, 
  Users, 
  KeyRound, 
  Activity, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Download, 
  Share2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ExternalLink,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Play,
  RotateCcw,
  ShieldAlert,
  Server,
  FileCode,
  HardDrive,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { 
  ProjectItem, 
  CertificateItem, 
  VaultFileItem, 
  UserRole, 
  PermissionItem, 
  ResourceType, 
  PermissionAction 
} from '../types';
import { 
  PERSONAL_CONFIG,
  INITIAL_PROJECTS, 
  INITIAL_CERTIFICATES, 
  INITIAL_VAULT_FILES, 
  VAULT_FOLDERS 
} from '../config/personalData';
import { PermissionManagerModal } from '../components/admin/PermissionManagerModal';
import { AdminMediaPage } from './AdminMediaPage';

type AdminTab = 'dashboard' | 'files' | 'projects' | 'certificates' | 'media' | 'users' | 'permissions' | 'activity' | 'settings';

export const AdminPage: React.FC = () => {
  const { user, profile, isOwner, role } = useAuth();
  const { 
    permissions, 
    activityLogs, 
    users, 
    revokePermission, 
    updateUserRole, 
    toggleUserStatus, 
    runSecurityAudit, 
    runScenarioSimulation 
  } = usePermissions();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Modals
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
  const [selectedResourceForShare, setSelectedResourceForShare] = useState<{ id: string; name: string; type: ResourceType } | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  // Interactive Scenario Simulator State
  const [simRole, setSimRole] = useState<UserRole>('TRUSTED');
  const [simEmail, setSimEmail] = useState<string>('elena@enterprise.io');
  const [simResourceType, setSimResourceType] = useState<ResourceType>('FILE');
  const [simResourceId, setSimResourceId] = useState<string>('file-1');
  const [simAction, setSimAction] = useState<PermissionAction>('DOWNLOAD');
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  // Security Scan State
  const [scanResult, setScanResult] = useState<{ status: string; passed: number; total: number; logs: string[] } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Local state for Projects & Certs editing
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [certsList, setCertsList] = useState<CertificateItem[]>(INITIAL_CERTIFICATES);
  const [filesList, setFilesList] = useState<VaultFileItem[]>(INITIAL_VAULT_FILES);

  // Calculate Real Storage Metrics
  const totalFileBytes = filesList.reduce((acc, f) => acc + f.size, 0);
  const totalStorageMB = (totalFileBytes / (1024 * 1024)).toFixed(1);

  const storageCategories = [
    { name: 'Documents', bytes: 6270000, color: '#E51F2A' },
    { name: 'Videos', bytes: 42000000, color: '#8C0B12' },
    { name: 'Projects', bytes: 245000, color: '#FFFFFF' },
    { name: 'Certificates', bytes: 2890000, color: '#9CA3AF' },
    { name: 'Other', bytes: 850000, color: '#374151' }
  ];
  const totalCatBytes = storageCategories.reduce((acc, c) => acc + c.bytes, 0);

  // Handle Scenario Test
  const handleRunSimulation = () => {
    const res = runScenarioSimulation(simEmail, simRole, simResourceId, simResourceType, simAction);
    setSimulationResult(res);
  };

  // Run Security Audit
  const handleTriggerAudit = async () => {
    setIsScanning(true);
    const audit = await runSecurityAudit();
    setScanResult(audit);
    setIsScanning(false);
  };

  if (!isOwner()) {
    return (
      <div className="min-h-screen text-[#F1F1F1] flex items-center justify-center p-6 bg-[#080808]">
        <div className="max-w-md p-8 rounded-3xl bg-[#111416] border border-[#E51F2A]/40 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(229,31,42,0.3)]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white">Owner Authorization Required</h2>
          <p className="text-xs text-[#A8A1A1] leading-relaxed">
            The Central Management Console is restricted exclusively to the system owner (<span className="text-white font-mono">{PERSONAL_CONFIG.ownerEmail}</span>). Current identity tier: <span className="text-[#E51F2A] font-mono font-bold">[{role}]</span>.
          </p>
          <div className="p-3 rounded-xl bg-[#080808] border border-white/5 text-[11px] font-mono text-[#D1D1D1]">
            Please sign in as Owner with the verified OWNER Firebase account.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#F1F1F1] flex flex-col pt-32 px-4 sm:px-8 lg:px-14">
      
      {/* Admin Horizontal Navigation */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/40 flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(229,31,42,0.3)]">
            AS
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-[#E51F2A] uppercase font-bold">HQ CONSOLE</div>
            <div className="text-sm font-heading font-bold text-white">Owner Dashboard</div>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'files', label: 'Files', icon: FolderLock },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'certificates', label: 'Certificates', icon: Award },
            { id: 'media', label: 'Media', icon: Radio },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'permissions', label: 'Permissions', icon: KeyRound, badge: permissions.length },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-tab-${item.id}`}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-medium transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#E51F2A]/10 text-white font-bold border-[#E51F2A]' 
                    : 'text-[#A8A1A1] border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#E51F2A]' : 'text-[#A8A1A1]'} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ml-1 ${
                    isActive ? 'bg-[#E51F2A] text-white' : 'bg-[#080808] text-[#E51F2A] border border-[#E51F2A]/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 pb-28 max-w-7xl mx-auto w-full">
        
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Overview Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">System Overview</h1>
                <p className="text-xs text-[#A8A1A1] mt-1">
                  Real-time telemetry, storage quotas, permission grants, and security events.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedResourceForShare(null);
                    setEditingPermission(null);
                    setIsPermissionModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(229,31,42,0.3)] cursor-pointer"
                >
                  <KeyRound size={14} />
                  <span>GRANT ACCESS</span>
                </button>
              </div>
            </div>

            {/* Statistics Cards (Real Data) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Files */}
              <div className="p-5 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#A8A1A1]">
                  <span className="text-xs font-mono uppercase tracking-wider">Total Files</span>
                  <FolderLock size={18} className="text-[#E51F2A]" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-heading font-black text-white">{filesList.length}</div>
                  <div className="text-[11px] text-[#A8A1A1] font-mono mt-1">Across 4 Vault Categories</div>
                </div>
              </div>

              {/* Card 2: Storage Used */}
              <div className="p-5 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#A8A1A1]">
                  <span className="text-xs font-mono uppercase tracking-wider">Storage Used</span>
                  <HardDrive size={18} className="text-[#E51F2A]" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-heading font-black text-white">{totalStorageMB} <span className="text-sm font-normal text-[#A8A1A1]">MB</span></div>
                  <div className="text-[11px] text-[#A8A1A1] font-mono mt-1">Firebase Cloud Storage</div>
                </div>
              </div>

              {/* Card 3: Projects */}
              <div className="p-5 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#A8A1A1]">
                  <span className="text-xs font-mono uppercase tracking-wider">Projects</span>
                  <Briefcase size={18} className="text-[#E51F2A]" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-heading font-black text-white">{projectsList.length}</div>
                  <div className="text-[11px] text-[#A8A1A1] font-mono mt-1">Verified Portfolio Entities</div>
                </div>
              </div>

              {/* Card 4: Users */}
              <div className="p-5 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#A8A1A1]">
                  <span className="text-xs font-mono uppercase tracking-wider">Known Users</span>
                  <Users size={18} className="text-[#E51F2A]" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-heading font-black text-white">{users.length}</div>
                  <div className="text-[11px] text-[#A8A1A1] font-mono mt-1">
                    {users.filter(u => u.role === 'TRUSTED').length} Trusted • {users.filter(u => u.role === 'LIMITED').length} Limited
                  </div>
                </div>
              </div>

            </div>

            {/* Storage Visualization & Recent Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Storage Donut Visualization (Clean Red and Grayscale only) */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-heading font-bold text-white">Storage Overview</h2>
                    <span className="text-[10px] font-mono text-[#E51F2A] uppercase">Zero-Trust Vault</span>
                  </div>

                  {/* SVG Donut Chart in Red & Grayscale */}
                  <div className="relative flex items-center justify-center my-4 h-48">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1F2937" strokeWidth="12" />
                      
                      {/* Category segments: Videos (80%), Documents (12%), Certificates (5%), Projects (3%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#E51F2A"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="60"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#8C0B12"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="190"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#FFFFFF"
                        strokeWidth="12"
                        strokeDasharray="238.76"
                        strokeDashoffset="220"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold font-mono text-white">{totalStorageMB}</span>
                      <span className="text-[9px] font-mono text-[#A8A1A1] uppercase">MB USED</span>
                    </div>
                  </div>

                  {/* Categories Breakdown List */}
                  <div className="space-y-2 mt-4">
                    {storageCategories.map((cat) => {
                      const percent = ((cat.bytes / totalCatBytes) * 100).toFixed(0);
                      return (
                        <div key={cat.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                            <span className="text-[#D1D1D1]">{cat.name}</span>
                          </div>
                          <div className="font-mono text-[11px] text-[#A8A1A1]">
                            {(cat.bytes / (1024 * 1024)).toFixed(1)} MB ({percent}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4 text-[11px] text-[#A8A1A1] font-mono text-center">
                  Encrypted at rest with AES-256 GCM
                </div>
              </div>

              {/* Recent Activity Live Feed */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111416] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-heading font-bold text-white">Recent System & Audit Activity</h2>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-[#E51F2A] hover:underline font-mono cursor-pointer"
                    >
                      View All Logs →
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto pr-1">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-[#080808] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'DENIED'
                                ? 'bg-red-900/40 text-red-400 border border-red-800'
                                : 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-white truncate max-w-[220px]">
                              {log.resource || log.targetResource}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#A8A1A1] line-clamp-1">{log.details}</div>
                        </div>

                        <div className="text-[10px] text-[#A8A1A1] shrink-0 sm:text-right">
                          <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[#E51F2A]/70 truncate max-w-[120px]">{log.targetUser || log.actor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-[#A8A1A1]">
                  <span>Audit Logging: Active (Append-Only)</span>
                  <span className="font-mono">{activityLogs.length} Total Events Recorded</span>
                </div>
              </div>

            </div>

            {/* Recent Projects Table Preview */}
            <div className="p-6 rounded-2xl bg-[#111416] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-heading font-bold text-white">Recent Projects & Work</h2>
                  <p className="text-xs text-[#A8A1A1]">Live Firestore projects state.</p>
                </div>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs text-[#E51F2A] hover:underline font-mono cursor-pointer"
                >
                  Manage All Projects ({projectsList.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectsList.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-[#080808] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#E51F2A] px-2 py-0.5 rounded bg-[#E51F2A]/10 border border-[#E51F2A]/30">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-[#A8A1A1] font-mono">
                        {p.visibility || 'PUBLIC'}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{p.title}</div>
                    <p className="text-xs text-[#A8A1A1] line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex gap-1 text-[10px] text-[#A8A1A1]">
                        {(p.technologies || (p as any).tags || []).slice(0, 2).map((t: string) => <span key={t}>#{t}</span>)}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedResourceForShare({ id: p.id, name: p.title, type: 'PROJECT' });
                          setIsPermissionModalOpen(true);
                        }}
                        className="text-xs text-[#E51F2A] hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                      >
                        <Share2 size={12} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FILES & VAULT MANAGEMENT */}
        {activeTab === 'files' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">Vault File Management</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Private, shared, and public assets in digital vault storage.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert('New file upload dialog launched. Storing directly in Vault storage.')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Files Table */}
            <div className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080808] text-[#A8A1A1] font-mono border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">File Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4">Storage Path</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {filesList.map((file) => (
                      <tr key={file.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-medium flex items-center gap-2">
                          <FolderLock size={15} className="text-[#E51F2A] shrink-0" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                        </td>
                        <td className="p-4 text-[#A8A1A1] uppercase">{file.type}</td>
                        <td className="p-4 text-[#A8A1A1]">{(file.size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            file.visibility === 'PRIVATE'
                              ? 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30'
                              : file.visibility === 'SHARED'
                              ? 'bg-[#8C0B12]/20 text-[#D1D1D1] border border-[#8C0B12]/50'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}>
                            {file.visibility}
                          </span>
                        </td>
                        <td className="p-4 text-[#A8A1A1] text-[11px] truncate max-w-[150px]">{file.storagePath}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedResourceForShare({ id: file.id, name: file.name, type: 'FILE' });
                              setIsPermissionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#080808] hover:bg-[#E51F2A] hover:text-white text-[#A8A1A1] transition-colors cursor-pointer"
                            title="Grant Permission"
                          >
                            <KeyRound size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setFilesList(prev => prev.filter(f => f.id !== file.id));
                            }}
                            className="p-1.5 rounded-lg bg-[#080808] hover:bg-red-600 hover:text-white text-[#A8A1A1] transition-colors cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS MANAGEMENT */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">Projects Management</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Manage portfolio entities, case studies, and sharing scopes.
                </p>
              </div>
              <button
                onClick={() => {
                  const title = prompt('Enter new project title:');
                  if (title) {
                    const newProj: ProjectItem = {
                      id: `proj-${Date.now()}`,
                      title,
                      slug: title.toLowerCase().replace(/\s+/g, '-'),
                      category: 'WEB',
                      description: 'Custom full-stack project created via HQ Console.',
                      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
                      technologies: ['React', 'TypeScript', 'Zero-Trust'],
                      visibility: 'PUBLIC',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    setProjectsList(prev => [newProj, ...prev]);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsList.map((p) => (
                <div key={p.id} className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden flex flex-col justify-between">
                  <div className="h-40 bg-[#080808] relative overflow-hidden">
                    <img src={p.coverImage || (p as any).imageUrl} alt={p.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#E51F2A] border border-white/10">
                      {p.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-heading font-bold text-white">{p.title}</h3>
                      <p className="text-xs text-[#A8A1A1] mt-1 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedResourceForShare({ id: p.id, name: p.title, type: 'PROJECT' });
                          setIsPermissionModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 text-xs text-[#E51F2A] hover:underline font-mono cursor-pointer"
                      >
                        <KeyRound size={13} />
                        <span>Permissions</span>
                      </button>

                      <button
                        onClick={() => setProjectsList(prev => prev.filter(item => item.id !== p.id))}
                        className="text-xs text-[#A8A1A1] hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CERTIFICATES MANAGEMENT */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">Certificates & Verified Credentials</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Verified diplomas, cloud architecture seals, and cryptographic certifications.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certsList.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-[#111416] border border-white/10 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-[#E51F2A]" />
                      <span className="text-sm font-heading font-bold text-white">{c.title}</span>
                    </div>
                    <div className="text-xs text-[#A8A1A1]">Issuer: <span className="text-white">{c.issuer}</span> • Year: {c.issueDate}</div>
                    <div className="text-[11px] font-mono text-[#E51F2A]">Credential ID: {c.credentialId}</div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedResourceForShare({ id: c.id, name: c.title, type: 'CERTIFICATE' });
                      setIsPermissionModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-[#080808] text-[#E51F2A] hover:bg-[#E51F2A] hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                    title="Grant Certificate Access"
                  >
                    <KeyRound size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MEDIA & STREAMS HUB MANAGEMENT */}
        {activeTab === 'media' && (
          <div className="animate-fade-in">
            <AdminMediaPage onNavigate={(path) => {
              if (path.startsWith('/admin/')) {
                const tab = path.replace('/admin/', '') as AdminTab;
                setActiveTab(tab);
              } else if (path === '/media' || path === '/streams') {
                window.location.hash = path;
              } else {
                window.location.hash = path;
              }
            }} />
          </div>
        )}

        {/* TAB 5: USER MANAGEMENT (OWNER RBAC) */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">User Management & Access Tiers</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Manage user accounts, assign roles (OWNER, TRUSTED, LIMITED), and enable/disable access.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#080808] text-[#A8A1A1] border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4">Last Login</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center text-[10px] text-[#E51F2A]">
                            {u.displayName ? u.displayName[0] : 'U'}
                          </span>
                          <span>{u.displayName || 'Unknown User'}</span>
                        </td>
                        <td className="p-4 text-[#D1D1D1]">{u.email}</td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.uid, e.target.value as UserRole)}
                            className="px-2.5 py-1 rounded-lg bg-[#080808] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#E51F2A] cursor-pointer"
                          >
                            <option value="OWNER">OWNER</option>
                            <option value="TRUSTED">TRUSTED</option>
                            <option value="LIMITED">LIMITED</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.status}
                            onChange={(e) => toggleUserStatus(u.uid, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-lg bg-[#080808] border border-white/10 text-xs font-mono font-bold focus:outline-none focus:border-[#E51F2A] cursor-pointer ${
                              u.status === 'active' 
                                ? 'text-white' 
                                : 'text-[#E51F2A]'
                            }`}
                          >
                            <option value="active">ACTIVE</option>
                            <option value="pending">PENDING</option>
                            <option value="suspended">SUSPENDED</option>
                            <option value="denied">DENIED</option>
                          </select>
                        </td>
                        <td className="p-4 text-[#A8A1A1]">{new Date(u.lastLoginAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedResourceForShare(null);
                              setIsPermissionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-[#080808] border border-white/10 hover:border-white/30 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                            title="Direct Message / Note"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PERMISSIONS (COMPLETE PERMISSION MANAGER) */}
        {activeTab === 'permissions' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">Granular Permission Manager</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Assign and revoke READ, DOWNLOAD, WRITE, DELETE, SHARE capabilities with optional expiration.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedResourceForShare(null);
                  setEditingPermission(null);
                  setIsPermissionModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(229,31,42,0.35)] cursor-pointer"
              >
                <Plus size={15} />
                <span>Grant Access</span>
              </button>
            </div>

            {/* Active Permissions List */}
            <div className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#080808] flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <KeyRound size={14} className="text-[#E51F2A]" />
                  <span>ACTIVE PERMISSIONS CATALOG ({permissions.length})</span>
                </div>
                <div className="text-[11px] text-[#A8A1A1] font-mono">
                  Immediate Revocation Enforced
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#080808] text-[#A8A1A1] border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Target User</th>
                      <th className="p-4">Resource Category</th>
                      <th className="p-4">Resource Name</th>
                      <th className="p-4">Granted Permissions</th>
                      <th className="p-4">Expiration</th>
                      <th className="p-4 text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {permissions.map((perm) => {
                      const isExpired = perm.expiresAt && new Date(perm.expiresAt).getTime() < Date.now();
                      return (
                        <tr key={perm.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 text-white font-bold">{perm.userEmail}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-[#D1D1D1]">
                              {perm.resourceType}
                            </span>
                          </td>
                          <td className="p-4 text-[#D1D1D1] max-w-[200px] truncate">{perm.resourceName}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {perm.permissions.map((act) => (
                                <span key={act} className="px-1.5 py-0.5 rounded text-[10px] bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {perm.expiresAt ? (
                              <span className={`text-[11px] flex items-center gap-1 ${isExpired ? 'text-red-400 font-bold' : 'text-[#A8A1A1]'}`}>
                                <Clock size={12} />
                                <span>{isExpired ? 'EXPIRED' : new Date(perm.expiresAt).toLocaleDateString()}</span>
                              </span>
                            ) : (
                              <span className="text-[#A8A1A1] text-[11px]">Permanent</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingPermission(perm);
                                setIsPermissionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                              title="Edit Permission"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Immediately revoke access for ${perm.userEmail}?`)) {
                                  revokePermission(perm.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-red-600 text-[#E51F2A] hover:text-white transition-colors cursor-pointer"
                              title="Revoke Access Immediately"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ACTIVITY AUDIT TRAILS */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">Immutable Security Audit Trails</h1>
                <p className="text-xs text-[#A8A1A1] mt-0.5">
                  Append-only event telemetry: grants, revocations, uploads, downloads, and security events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `security_audit_logs_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#111416] border border-white/10 text-xs font-mono text-[#D1D1D1] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Download size={13} />
                  <span>Export JSON Log</span>
                </button>
              </div>
            </div>

            {/* Audit Log Stream */}
            <div className="rounded-2xl bg-[#111416] border border-white/10 p-4 space-y-3 font-mono text-xs">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-[#080808] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        log.status === 'DENIED'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30'
                      }`}>
                        [{log.action}]
                      </span>
                      <span className="text-white font-semibold">
                        {log.resource || log.targetResource}
                      </span>
                    </div>
                    <div className="text-[#A8A1A1] text-[11px]">{log.details}</div>
                  </div>

                  <div className="text-[10px] text-[#A8A1A1] sm:text-right shrink-0">
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-[#E51F2A]">Actor: {log.actor}</div>
                    <div>IP: {log.ipAddress || '10.240.0.1'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS & SCENARIO TESTER */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">System Security & Authorization Simulator</h1>
              <p className="text-xs text-[#A8A1A1] mt-0.5">
                Verify zero-trust authorization scenarios and audit mathematical rules enforcement.
              </p>
            </div>

            {/* Live Scenario Simulator */}
            <div className="p-6 rounded-2xl bg-[#111416] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
                    <Play size={16} className="text-[#E51F2A]" />
                    <span>Live Zero-Trust Authorization Tester</span>
                  </h2>
                  <p className="text-xs text-[#A8A1A1]">
                    Test exact permissions for Owner, Trusted, Limited, Expired, or Unauthorized actors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#A8A1A1]">Subject Role</label>
                  <select
                    value={simRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setSimRole(r);
                      if (r === 'OWNER') setSimEmail(PERSONAL_CONFIG.ownerEmail);
                      else if (r === 'TRUSTED') setSimEmail('elena@enterprise.io');
                      else setSimEmail('marcus@guest.dev');
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-white"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="TRUSTED">TRUSTED</option>
                    <option value="LIMITED">LIMITED</option>
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#A8A1A1]">User Email</label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-white"
                  />
                </div>

                {/* Resource Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#A8A1A1]">Resource Type</label>
                  <select
                    value={simResourceType}
                    onChange={(e) => {
                      const t = e.target.value as ResourceType;
                      setSimResourceType(t);
                      if (t === 'FILE') setSimResourceId('file-1');
                      else if (t === 'PROJECT') setSimResourceId('ai-assistant');
                      else if (t === 'CERTIFICATE') setSimResourceId('cert-1');
                      else setSimResourceId('documents');
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-white"
                  >
                    <option value="FILE">FILE</option>
                    <option value="FOLDER">FOLDER</option>
                    <option value="PROJECT">PROJECT</option>
                    <option value="CERTIFICATE">CERTIFICATE</option>
                  </select>
                </div>

                {/* Action */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-[#A8A1A1]">Action Capability</label>
                  <select
                    value={simAction}
                    onChange={(e) => setSimAction(e.target.value as PermissionAction)}
                    className="w-full p-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-white"
                  >
                    <option value="READ">READ</option>
                    <option value="DOWNLOAD">DOWNLOAD</option>
                    <option value="WRITE">WRITE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="SHARE">SHARE</option>
                  </select>
                </div>

                {/* Trigger Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleRunSimulation}
                    className="w-full py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(229,31,42,0.3)] cursor-pointer"
                  >
                    RUN TEST
                  </button>
                </div>

              </div>

              {/* Simulation Result Output */}
              {simulationResult && (
                <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 animate-fade-in ${
                  simulationResult.allowed 
                    ? 'bg-white/5 border-white/20 text-white' 
                    : 'bg-[#E51F2A]/10 border-[#E51F2A]/30 text-white'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {simulationResult.allowed ? (
                      <>
                        <CheckCircle2 size={18} className="text-white" />
                        <span className="text-white">ACCESS GRANTED (200 OK)</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="text-[#E51F2A]" />
                        <span className="text-[#E51F2A]">ACCESS DENIED (403 FORBIDDEN)</span>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#D1D1D1]">{simulationResult.reason}</div>
                  <div className="text-[10px] text-[#A8A1A1] pt-2 border-t border-white/10">
                    {simulationResult.auditTrail}
                  </div>
                </div>
              )}

            </div>

            {/* Deep Security Audit Scanner */}
            <div className="p-6 rounded-2xl bg-[#111416] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#E51F2A]" />
                    <span>Automated Security Rules Scanner</span>
                  </h2>
                  <p className="text-xs text-[#A8A1A1]">
                    Verify that rules enforce default-deny, owner root verification, and mathematical isolation.
                  </p>
                </div>

                <button
                  onClick={handleTriggerAudit}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-white hover:border-[#E51F2A] transition-colors cursor-pointer"
                >
                  {isScanning ? 'SCANNING...' : 'RUN AUDIT SCAN'}
                </button>
              </div>

              {scanResult && (
                <div className="p-4 rounded-xl bg-[#080808] border border-white/20 text-xs font-mono space-y-2 text-[#D1D1D1] animate-fade-in">
                  <div className="text-white font-bold flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#E51F2A]" />
                    <span>SECURITY AUDIT: {scanResult.status} ({scanResult.passed}/{scanResult.total} ASSERTIONS PASSED)</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-[#A8A1A1]">
                    {scanResult.logs.map((l, idx) => (
                      <div key={idx}>{l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Permission Manager Modal */}
      <PermissionManagerModal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setEditingPermission(null);
          setSelectedResourceForShare(null);
        }}
        initialResource={selectedResourceForShare}
        existingPermission={editingPermission}
      />

    </div>
  );
};
