import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Flame,
  ExternalLink,
  Edit3,
  Trash2,
  Play,
  Share2,
  Sparkles,
  Youtube,
  Music,
  User,
  Tag,
  ArrowLeft,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertTriangle,
  Layers,
  BarChart3,
  SlidersHorizontal,
  CheckSquare,
  Square,
  HelpCircle,
  FileText
} from 'lucide-react';
import { MediaLinkItem, MediaPlatform, MediaType, MediaApprovalStatus } from '../types';
import { INITIAL_MEDIA_LINKS, parseMediaUrl, PERSONAL_CONFIG } from '../config/personalData';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import {
  db,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc
} from '../lib/firebase';

interface AdminMediaPageProps {
  onNavigate: (path: string) => void;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ onNavigate }) => {
  const { user, profile, isOwner, role } = useAuth();
  const { logActivity } = usePermissions();

  // Streams list state (Firestore + local fallback)
  const [links, setLinks] = useState<MediaLinkItem[]>(INITIAL_MEDIA_LINKS);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MediaApprovalStatus>('ALL');
  const [platformFilter, setPlatformFilter] = useState<'ALL' | MediaPlatform>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Multi-selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Preview & Live Test Sandbox Modal
  const [previewingLink, setPreviewingLink] = useState<MediaLinkItem | null>(null);

  // Edit / Create Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MediaLinkItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<MediaLinkItem>>({
    title: '',
    url: '',
    embedUrl: '',
    platform: 'YOUTUBE',
    mediaType: 'VIDEO',
    username: '',
    description: '',
    category: 'Coding Beats',
    tags: ['dev', 'focus'],
    thumbnailUrl: '',
    likes: 0,
    featured: false,
    visibility: 'PUBLIC',
    status: 'APPROVED',
    verified: true,
    adminNotes: '',
    rejectionReason: ''
  });
  const [tagsInput, setTagsInput] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseMediaUrl> | null>(null);

  // Rejection Reason Modal
  const [rejectingItem, setRejectingItem] = useState<MediaLinkItem | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('Content does not meet quality guidelines');

  // Real-time Firestore synchronization
  useEffect(() => {
    setLoading(true);
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'mediaLinks'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: MediaLinkItem[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });

            // Merge with seeded defaults if not in db
            const merged = [...fetched];
            INITIAL_MEDIA_LINKS.forEach((seed) => {
              if (!merged.some((m) => m.id === seed.id)) {
                merged.push(seed);
              }
            });
            setLinks(merged);
          } else {
            setLinks(INITIAL_MEDIA_LINKS);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('[ADMIN MEDIA] Firestore listener error (using seed):', error);
          setLinks(INITIAL_MEDIA_LINKS);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('[ADMIN MEDIA] Firestore init fallback:', err);
      setLinks(INITIAL_MEDIA_LINKS);
      setLoading(false);
    }
  }, []);

  // Live URL parser on URL input change
  useEffect(() => {
    if (formData.url && formData.url.trim().length > 5) {
      const parsed = parseMediaUrl(formData.url.trim());
      setParsedPreview(parsed);
      setFormData((prev) => ({
        ...prev,
        platform: parsed.platform,
        mediaType: parsed.mediaType,
        embedUrl: parsed.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl || prev.thumbnailUrl
      }));
    } else {
      setParsedPreview(null);
    }
  }, [formData.url]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = links.length;
    const pending = links.filter((l) => l.status === 'PENDING').length;
    const approved = links.filter((l) => (l.status || 'APPROVED') === 'APPROVED').length;
    const rejected = links.filter((l) => l.status === 'REJECTED').length;
    const youtube = links.filter((l) => l.platform === 'YOUTUBE').length;
    const spotify = links.filter((l) => l.platform === 'SPOTIFY').length;
    const featured = links.filter((l) => l.featured).length;

    return { total, pending, approved, rejected, youtube, spotify, featured };
  }, [links]);

  // Filtered and Sorted Links
  const filteredLinks = useMemo(() => {
    return links
      .filter((link) => {
        // Status filter
        const currentStatus = link.status || 'APPROVED';
        if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

        // Platform filter
        if (platformFilter !== 'ALL' && link.platform !== platformFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = link.title.toLowerCase().includes(q);
          const matchesUser = link.username.toLowerCase().includes(q);
          const matchesCategory = link.category?.toLowerCase().includes(q);
          const matchesDesc = link.description?.toLowerCase().includes(q);
          const matchesTags = link.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesUser && !matchesCategory && !matchesDesc && !matchesTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [links, statusFilter, platformFilter, searchQuery, sortBy]);

  // Single Item Actions
  const handleApprove = async (item: MediaLinkItem) => {
    const updated: Partial<MediaLinkItem> = {
      status: 'APPROVED',
      verified: true,
      reviewedBy: user?.email || PERSONAL_CONFIG.ownerEmail,
      reviewedAt: new Date().toISOString(),
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    };

    setLinks((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, ...updated } : l))
    );

    try {
      await updateDoc(doc(db, 'mediaLinks', item.id), updated);
      logActivity(
        'STREAM_APPROVED',
        item.username || 'user',
        item.title,
        `Approved stream link "${item.title}" submitted by @${item.username}`,
        'SUCCESS'
      );
    } catch (e) {
      console.warn('[ADMIN MEDIA] Local approve sync fallback:', e);
    }
  };

  const handleOpenRejectModal = (item: MediaLinkItem) => {
    setRejectingItem(item);
    setCustomRejectionReason('Content does not meet quality or focus guidelines');
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;

    const updated: Partial<MediaLinkItem> = {
      status: 'REJECTED',
      verified: false,
      rejectionReason: customRejectionReason.trim(),
      reviewedBy: user?.email || PERSONAL_CONFIG.ownerEmail,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLinks((prev) =>
      prev.map((l) => (l.id === rejectingItem.id ? { ...l, ...updated } : l))
    );

    try {
      await updateDoc(doc(db, 'mediaLinks', rejectingItem.id), updated);
      logActivity(
        'STREAM_REJECTED',
        rejectingItem.username || 'user',
        rejectingItem.title,
        `Rejected stream link "${rejectingItem.title}" by @${rejectingItem.username}. Reason: ${customRejectionReason}`,
        'FLAGGED'
      );
    } catch (e) {
      console.warn('[ADMIN MEDIA] Local reject sync fallback:', e);
    } finally {
      setRejectingItem(null);
    }
  };

  const handleToggleFeatured = async (item: MediaLinkItem) => {
    const newFeatured = !item.featured;
    setLinks((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, featured: newFeatured } : l))
    );

    try {
      await updateDoc(doc(db, 'mediaLinks', item.id), {
        featured: newFeatured,
        updatedAt: new Date().toISOString()
      });
      logActivity(
        'STREAM_FEATURED_TOGGLE',
        item.username || 'user',
        item.title,
        `${newFeatured ? 'Featured' : 'Unfeatured'} stream "${item.title}"`,
        'SUCCESS'
      );
    } catch (e) {
      console.warn('[ADMIN MEDIA] Local featured toggle fallback:', e);
    }
  };

  const handleToggleVerified = async (item: MediaLinkItem) => {
    const newVerified = !item.verified;
    setLinks((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, verified: newVerified } : l))
    );

    try {
      await updateDoc(doc(db, 'mediaLinks', item.id), {
        verified: newVerified,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[ADMIN MEDIA] Local verified toggle fallback:', e);
    }
  };

  const handleDelete = async (item: MediaLinkItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.title}"?`)) {
      return;
    }

    setLinks((prev) => prev.filter((l) => l.id !== item.id));
    setSelectedIds((prev) => prev.filter((id) => id !== item.id));

    try {
      await deleteDoc(doc(db, 'mediaLinks', item.id));
      logActivity(
        'STREAM_DELETED',
        item.username || 'user',
        item.title,
        `Deleted stream "${item.title}"`,
        'FLAGGED'
      );
    } catch (e) {
      console.warn('[ADMIN MEDIA] Local delete sync fallback:', e);
    }
  };

  // Bulk Operations
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLinks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLinks.map((l) => l.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    const now = new Date().toISOString();
    const reviewer = user?.email || PERSONAL_CONFIG.ownerEmail;

    setLinks((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id)
          ? { ...l, status: 'APPROVED', verified: true, reviewedBy: reviewer, reviewedAt: now }
          : l
      )
    );

    for (const id of selectedIds) {
      try {
        await updateDoc(doc(db, 'mediaLinks', id), {
          status: 'APPROVED',
          verified: true,
          reviewedBy: reviewer,
          reviewedAt: now,
          updatedAt: now
        });
      } catch (e) {
        // Fallback handled
      }
    }

    logActivity(
      'BULK_APPROVE_STREAMS',
      'multiple',
      'mediaLinks',
      `Bulk approved ${selectedIds.length} stream links`,
      'SUCCESS'
    );
    setSelectedIds([]);
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    const now = new Date().toISOString();
    const reviewer = user?.email || PERSONAL_CONFIG.ownerEmail;

    setLinks((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id)
          ? {
              ...l,
              status: 'REJECTED',
              verified: false,
              reviewedBy: reviewer,
              reviewedAt: now,
              rejectionReason: 'Bulk rejected during administrative review'
            }
          : l
      )
    );

    for (const id of selectedIds) {
      try {
        await updateDoc(doc(db, 'mediaLinks', id), {
          status: 'REJECTED',
          verified: false,
          reviewedBy: reviewer,
          reviewedAt: now,
          rejectionReason: 'Bulk rejected during administrative review',
          updatedAt: now
        });
      } catch (e) {
        // Fallback handled
      }
    }

    logActivity(
      'BULK_REJECT_STREAMS',
      'multiple',
      'mediaLinks',
      `Bulk rejected ${selectedIds.length} stream links`,
      'FLAGGED'
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete all ${selectedIds.length} selected stream links?`)) {
      return;
    }

    setLinks((prev) => prev.filter((l) => !selectedIds.includes(l.id)));

    for (const id of selectedIds) {
      try {
        await deleteDoc(doc(db, 'mediaLinks', id));
      } catch (e) {
        // Fallback handled
      }
    }

    logActivity(
      'BULK_DELETE_STREAMS',
      'multiple',
      'mediaLinks',
      `Bulk deleted ${selectedIds.length} stream links`,
      'FLAGGED'
    );
    setSelectedIds([]);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      url: '',
      embedUrl: '',
      platform: 'YOUTUBE',
      mediaType: 'VIDEO',
      username: profile?.displayName?.toLowerCase().replace(/\s+/g, '_') || 'ahmmad_sakib',
      description: '',
      category: 'Coding Beats',
      tags: ['Coding', 'Beats', 'Dev'],
      thumbnailUrl: '',
      likes: 0,
      featured: true,
      visibility: 'PUBLIC',
      status: 'APPROVED',
      verified: true,
      adminNotes: ''
    });
    setTagsInput('Coding, Beats, Dev');
    setParsedPreview(null);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: MediaLinkItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      tags: item.tags || []
    });
    setTagsInput((item.tags || []).join(', '));
    setParsedPreview(parseMediaUrl(item.url));
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save / Update Stream Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.url?.trim()) {
      setFormError('Please enter a valid YouTube or Spotify link');
      return;
    }
    if (!formData.title?.trim()) {
      setFormError('Please specify a title for this stream');
      return;
    }
    if (!formData.username?.trim()) {
      setFormError('Please specify a submitter username/handle');
      return;
    }

    setIsSubmitting(true);
    const parsed = parseMediaUrl(formData.url.trim());
    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const now = new Date().toISOString();
    const cleanUsername = formData.username.trim().replace(/^@/, '');

    const streamPayload: MediaLinkItem = {
      id: editingItem ? editingItem.id : `media-${Date.now()}`,
      title: formData.title.trim(),
      url: formData.url.trim(),
      embedUrl: parsed.embedUrl || formData.embedUrl || '',
      platform: parsed.platform || formData.platform || 'OTHER',
      mediaType: parsed.mediaType || formData.mediaType || 'VIDEO',
      username: cleanUsername,
      userId: editingItem ? editingItem.userId : user?.uid,
      userAvatar: editingItem?.userAvatar || user?.photoURL || undefined,
      description: formData.description?.trim() || '',
      category: formData.category || 'Coding Beats',
      tags: tagsArr.length > 0 ? tagsArr : ['Dev', parsed.platform],
      thumbnailUrl: parsed.thumbnailUrl || formData.thumbnailUrl || '',
      likes: formData.likes || 0,
      featured: formData.featured || false,
      visibility: formData.visibility || 'PUBLIC',
      status: formData.status || 'APPROVED',
      verified: formData.verified || false,
      adminNotes: formData.adminNotes?.trim() || '',
      rejectionReason: formData.status === 'REJECTED' ? formData.rejectionReason : undefined,
      reviewedBy: user?.email || PERSONAL_CONFIG.ownerEmail,
      reviewedAt: now,
      createdAt: editingItem ? editingItem.createdAt : now,
      updatedAt: now
    };

    try {
      await setDoc(doc(db, 'mediaLinks', streamPayload.id), streamPayload);

      setLinks((prev) => {
        if (editingItem) {
          return prev.map((l) => (l.id === streamPayload.id ? streamPayload : l));
        }
        return [streamPayload, ...prev];
      });

      logActivity(
        editingItem ? 'STREAM_UPDATED' : 'STREAM_CREATED',
        streamPayload.username || 'user',
        streamPayload.title,
        `${editingItem ? 'Updated' : 'Created'} stream "${streamPayload.title}" (@${streamPayload.username})`,
        'SUCCESS'
      );

      setIsFormModalOpen(false);
    } catch (err: any) {
      console.warn('[ADMIN MEDIA] Form save fallback:', err);
      // Local fallback
      setLinks((prev) => {
        if (editingItem) {
          return prev.map((l) => (l.id === streamPayload.id ? streamPayload : l));
        }
        return [streamPayload, ...prev];
      });
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auth Guard for Owner
  if (!isOwner()) {
    return (
      <div className="min-h-screen text-[#F1F1F1] flex items-center justify-center p-6 bg-[#080808]">
        <div className="max-w-md p-8 rounded-3xl bg-[#111416] border border-[#E51F2A]/40 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(229,31,42,0.3)]">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white">Owner Authorization Required</h2>
          <p className="text-xs text-[#A8A1A1] leading-relaxed">
            The Media Stream Moderation and Approval Console is restricted exclusively to the system owner (<span className="text-white font-mono">{PERSONAL_CONFIG.ownerEmail}</span>). Current tier: <span className="text-[#E51F2A] font-mono font-bold">[{role}]</span>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/admin')}
              className="w-full py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-[#F1F1F1] cursor-pointer"
            >
              RETURN TO HQ CONSOLE
            </button>
            <button
              onClick={() => onNavigate('/media')}
              className="w-full py-2.5 rounded-xl bg-[#181c1f] text-white font-mono text-xs hover:bg-[#22272b] cursor-pointer"
            >
              GO TO PUBLIC MEDIA HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-media-root" className="min-h-screen bg-[#080808] text-[#F1F1F1] pb-24">
      
      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="border-b border-white/10 bg-[#111416]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080808] hover:bg-white/10 text-xs font-mono text-[#A8A1A1] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>HQ CONSOLE</span>
          </button>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#E51F2A]" />
            <span className="text-sm font-heading font-bold text-white">Media Moderation & Stream Manager</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/media')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#080808] hover:bg-[#181c1f] text-xs font-mono text-[#A8A1A1] hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Open the public media hub in this tab"
          >
            <ExternalLink size={14} className="text-[#1DB954]" />
            <span>VIEW LIVE HUB</span>
          </button>

          <button
            id="admin-add-stream-top-btn"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-heading font-bold text-xs shadow-[0_0_20px_rgba(229,31,42,0.35)] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>NEW STREAM LINK</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-xs font-mono text-[#E51F2A]">
              <ShieldCheck size={14} />
              <span>CONTENT VERIFICATION MATRIX</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
              YouTube & Spotify <span className="text-[#E51F2A]">Stream Approvals</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A1A1] leading-relaxed">
              Verify community submissions, approve YouTube and Spotify links, curate featured focus streams, and manage metadata to display directly in the Media Hub.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-heading font-bold text-xs tracking-wider hover:bg-[#F1F1F1] shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>ADD VERIFIED STREAM</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* METRICS & VERIFICATION QUEUE SUMMARY STATS */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Total Submissions */}
          <div className="p-4 rounded-2xl bg-[#111416] border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A1A1]">
              <span>TOTAL STREAMS</span>
              <Layers size={14} className="text-[#A8A1A1]" />
            </div>
            <div className="text-2xl font-heading font-extrabold text-white">{metrics.total}</div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">All catalog items</div>
          </div>

          {/* Pending Approval (Pulsing highlight) */}
          <div 
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              statusFilter === 'PENDING'
                ? 'bg-[#FF9900]/20 border-[#FF9900] shadow-[0_0_20px_rgba(255,153,0,0.3)]'
                : 'bg-[#111416] border-white/10 hover:border-[#FF9900]/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#FF9900]">
              <span className="font-bold">PENDING REVIEW</span>
              <Clock size={14} className={metrics.pending > 0 ? 'animate-spin-slow' : ''} />
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#FF9900] flex items-center gap-2">
              <span>{metrics.pending}</span>
              {metrics.pending > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-ping" />
              )}
            </div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">Awaiting owner review</div>
          </div>

          {/* Approved & Live */}
          <div 
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              statusFilter === 'APPROVED'
                ? 'bg-[#34A853]/20 border-[#34A853] shadow-[0_0_20px_rgba(52,168,83,0.3)]'
                : 'bg-[#111416] border-white/10 hover:border-[#34A853]/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#34A853]">
              <span className="font-bold">APPROVED LIVE</span>
              <CheckCircle2 size={14} />
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#34A853]">{metrics.approved}</div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">Visible in Media Hub</div>
          </div>

          {/* Rejected */}
          <div 
            onClick={() => setStatusFilter('REJECTED')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              statusFilter === 'REJECTED'
                ? 'bg-[#E51F2A]/20 border-[#E51F2A] shadow-[0_0_20px_rgba(229,31,42,0.3)]'
                : 'bg-[#111416] border-white/10 hover:border-[#E51F2A]/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#E51F2A]">
              <span>REJECTED</span>
              <XCircle size={14} />
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#E51F2A]">{metrics.rejected}</div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">Hidden from public</div>
          </div>

          {/* YouTube breakdown */}
          <div 
            onClick={() => setPlatformFilter(platformFilter === 'YOUTUBE' ? 'ALL' : 'YOUTUBE')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              platformFilter === 'YOUTUBE'
                ? 'bg-[#FF0000]/20 border-[#FF0000]'
                : 'bg-[#111416] border-white/10 hover:border-[#FF0000]/40'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#FF0000]">
              <span className="font-bold">YOUTUBE</span>
              <Youtube size={14} />
            </div>
            <div className="text-2xl font-heading font-extrabold text-white">{metrics.youtube}</div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">Videos & playlists</div>
          </div>

          {/* Spotify breakdown */}
          <div 
            onClick={() => setPlatformFilter(platformFilter === 'SPOTIFY' ? 'ALL' : 'SPOTIFY')}
            className={`p-4 rounded-2xl transition-all cursor-pointer border ${
              platformFilter === 'SPOTIFY'
                ? 'bg-[#1DB954]/20 border-[#1DB954]'
                : 'bg-[#111416] border-white/10 hover:border-[#1DB954]/40'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-[#1DB954]">
              <span className="font-bold">SPOTIFY</span>
              <Music size={14} />
            </div>
            <div className="text-2xl font-heading font-extrabold text-white">{metrics.spotify}</div>
            <div className="text-[10px] font-mono text-[#A8A1A1]">Playlists & tracks</div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* FILTER CONTROLS, SEARCH, AND BULK ACTIONS */}
        {/* ------------------------------------------------------------- */}
        <div className="p-5 rounded-3xl bg-[#111416] border border-white/10 space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
              <input
                id="admin-media-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, @username, tags, category, URL..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1] hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#080808] border border-white/10 overflow-x-auto scrollbar-none">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => {
                const isActive = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? st === 'PENDING'
                          ? 'bg-[#FF9900] text-black shadow-md'
                          : st === 'APPROVED'
                          ? 'bg-[#34A853] text-white shadow-md'
                          : st === 'REJECTED'
                          ? 'bg-[#E51F2A] text-white shadow-md'
                          : 'bg-white text-black shadow-md'
                        : 'text-[#A8A1A1] hover:text-white'
                    }`}
                  >
                    <span>{st}</span>
                    {st === 'PENDING' && metrics.pending > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-black/40 text-white">
                        {metrics.pending}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort & View Toggle */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-[#A8A1A1] focus:outline-none focus:border-[#E51F2A] cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="likes">Sort: Most Liked</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>

              <div className="flex items-center p-1 rounded-xl bg-[#080808] border border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white/10 text-white' : 'text-[#A8A1A1] hover:text-white'
                  }`}
                  title="Table View"
                >
                  <FileText size={14} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-[#A8A1A1] hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <SlidersHorizontal size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Bulk Selection Bar (appears when items selected) */}
          {selectedIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-[#E51F2A]/10 border border-[#E51F2A]/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-[#E51F2A]" />
                <span className="font-bold">{selectedIds.length} stream links selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34A853] hover:bg-[#2e9449] text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  <span>Approve Selected</span>
                </button>

                <button
                  onClick={handleBulkReject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-black text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <XCircle size={13} />
                  <span>Reject Selected</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete Selected</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#A8A1A1] hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* STREAMS LIST / TABLE VIEW */}
        {/* ------------------------------------------------------------- */}
        {filteredLinks.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#111416] border border-white/10 space-y-4">
            <Radio size={36} className="mx-auto text-[#E51F2A]/60" />
            <div className="text-lg font-heading font-bold text-white">No streams found in this filter</div>
            <p className="text-xs text-[#A8A1A1] max-w-md mx-auto">
              There are no YouTube or Spotify links matching your search or moderation status filter.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => { setStatusFilter('ALL'); setPlatformFilter('ALL'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-[#181c1f] hover:bg-[#22272b] text-white font-mono text-xs cursor-pointer border border-white/10"
              >
                Reset Filters
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-[#E51F2A] text-white font-mono text-xs font-bold cursor-pointer"
              >
                Add New Stream
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="rounded-3xl bg-[#111416] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0c0e10] text-[11px] font-mono text-[#A8A1A1] uppercase tracking-wider">
                    <th className="p-4 w-10">
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-[#A8A1A1] hover:text-white cursor-pointer"
                      >
                        {selectedIds.length === filteredLinks.length && filteredLinks.length > 0 ? (
                          <CheckSquare size={16} className="text-[#E51F2A]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="p-4">Stream & Details</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Submitter</th>
                    <th className="p-4">Status & Trust</th>
                    <th className="p-4">Likes</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredLinks.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isYouTube = item.platform === 'YOUTUBE';
                    const itemStatus = item.status || 'APPROVED';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isSelected ? 'bg-[#E51F2A]/5' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleSelectOne(item.id)}
                            className="text-[#A8A1A1] hover:text-white cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-[#E51F2A]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Stream Title & Thumbnail */}
                        <td className="p-4">
                          <div className="flex items-center gap-3.5 max-w-md">
                            <div
                              onClick={() => setPreviewingLink(item)}
                              className="relative w-16 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10 group cursor-pointer"
                            >
                              <img
                                src={item.thumbnailUrl || (isYouTube ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200')}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play size={14} className="fill-white text-white" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="font-heading font-bold text-white line-clamp-1 flex items-center gap-2">
                                <span className="hover:text-[#E51F2A] cursor-pointer" onClick={() => handleOpenEditModal(item)}>
                                  {item.title}
                                </span>
                                {item.featured && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E51F2A] text-white shrink-0 flex items-center gap-1">
                                    <Flame size={10} /> FEATURED
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-[11px] text-[#A8A1A1]">
                                <span className="text-white/60 font-mono">{item.category || 'General'}</span>
                                <span>•</span>
                                <span className="font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                                {item.rejectionReason && itemStatus === 'REJECTED' && (
                                  <span className="text-[#E51F2A] italic line-clamp-1">
                                    Reason: {item.rejectionReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Platform */}
                        <td className="p-4">
                          {isYouTube ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30">
                              <Youtube size={12} /> YOUTUBE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                              <Music size={12} /> SPOTIFY
                            </span>
                          )}
                          <div className="text-[10px] font-mono text-[#A8A1A1] mt-0.5">{item.mediaType}</div>
                        </td>

                        {/* Submitter Handle */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {item.userAvatar ? (
                              <img
                                src={item.userAvatar}
                                alt={item.username}
                                className="w-5 h-5 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User size={13} className="text-[#A8A1A1]" />
                            )}
                            <span className="font-mono text-white text-xs font-semibold">
                              @{item.username}
                            </span>
                          </div>
                        </td>

                        {/* Status & Trust Badges */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            {itemStatus === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30 w-fit">
                                <CheckCircle2 size={11} /> APPROVED
                              </span>
                            )}
                            {itemStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/40 w-fit animate-pulse">
                                <Clock size={11} /> PENDING REVIEW
                              </span>
                            )}
                            {itemStatus === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 w-fit">
                                <XCircle size={11} /> REJECTED
                              </span>
                            )}

                            {item.verified && (
                              <span className="text-[10px] font-mono text-[#34A853] flex items-center gap-1">
                                <ShieldCheck size={11} /> Verified Source
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Likes */}
                        <td className="p-4 font-mono text-white">
                          {item.likes || 0}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Live Sandbox Preview */}
                            <button
                              onClick={() => setPreviewingLink(item)}
                              title="Play live test in sandbox"
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                            >
                              <Play size={14} />
                            </button>

                            {/* One Click Approve */}
                            {itemStatus !== 'APPROVED' && (
                              <button
                                onClick={() => handleApprove(item)}
                                title="Approve Stream"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#34A853]/15 hover:bg-[#34A853] text-[#34A853] hover:text-white border border-[#34A853]/30 font-mono text-[11px] font-bold transition-all cursor-pointer"
                              >
                                <Check size={12} />
                                <span>APPROVE</span>
                              </button>
                            )}

                            {/* Quick Reject */}
                            {itemStatus !== 'REJECTED' && (
                              <button
                                onClick={() => handleOpenRejectModal(item)}
                                title="Reject Stream"
                                className="p-1.5 rounded-lg bg-[#080808] hover:bg-[#E51F2A]/20 text-[#A8A1A1] hover:text-[#E51F2A] transition-colors cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}

                            {/* Toggle Featured */}
                            <button
                              onClick={() => handleToggleFeatured(item)}
                              title={item.featured ? 'Unfeature' : 'Feature on Top'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                item.featured
                                  ? 'bg-[#E51F2A]/20 text-[#E51F2A]'
                                  : 'bg-[#080808] text-[#A8A1A1] hover:text-white'
                              }`}
                            >
                              <Flame size={14} />
                            </button>

                            {/* Edit Modal */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Stream Metadata"
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(item)}
                              title="Delete Stream"
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-[#E51F2A]/20 text-[#A8A1A1] hover:text-[#E51F2A] transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((item) => {
              const isYouTube = item.platform === 'YOUTUBE';
              const itemStatus = item.status || 'APPROVED';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-[#111416] border border-white/10 hover:border-[#E51F2A]/40 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 group">
                      <img
                        src={item.thumbnailUrl || (isYouTube ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400')}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {isYouTube ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000] text-white flex items-center gap-1">
                            <Youtube size={11} /> YOUTUBE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1DB954] text-black flex items-center gap-1">
                            <Music size={11} /> SPOTIFY
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          itemStatus === 'APPROVED' ? 'bg-[#34A853] text-white' : itemStatus === 'PENDING' ? 'bg-[#FF9900] text-black animate-pulse' : 'bg-[#E51F2A] text-white'
                        }`}>
                          {itemStatus}
                        </span>
                      </div>

                      <button
                        onClick={() => setPreviewingLink(item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#E51F2A] flex items-center justify-center text-white">
                          <Play size={18} className="fill-white ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-white font-semibold">@{item.username}</span>
                        <span className="text-[10px] font-mono text-[#A8A1A1]">{item.category}</span>
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#A8A1A1] line-clamp-2 leading-relaxed">
                        {item.description || 'No description attached.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {itemStatus !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-2.5 py-1 rounded-lg bg-[#34A853] text-white font-mono text-[10px] font-bold cursor-pointer"
                        >
                          APPROVE
                        </button>
                      )}
                      {itemStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleOpenRejectModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-[#E51F2A]/20 text-[#E51F2A] hover:bg-[#E51F2A] hover:text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          REJECT
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg bg-[#080808] hover:bg-[#E51F2A]/20 text-[#A8A1A1] hover:text-[#E51F2A] transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* LIVE TEST PLAYER SANDBOX MODAL */}
      {/* ------------------------------------------------------------- */}
      {previewingLink && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#111416] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-[#E51F2A]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A8A1A1]">
                  ADMIN STREAM PLAYBACK SANDBOX
                </span>
              </div>
              <button
                onClick={() => setPreviewingLink(null)}
                className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Embedded Player */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 relative">
              <iframe
                src={previewingLink.embedUrl}
                title={previewingLink.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Stream Info & Quick Approval */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <h3 className="text-base font-heading font-bold text-white">{previewingLink.title}</h3>
                <div className="text-xs font-mono text-[#A8A1A1]">
                  Submitted by <span className="text-white font-semibold">@{previewingLink.username}</span> • {previewingLink.platform} {previewingLink.mediaType}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewingLink.status !== 'APPROVED' && (
                  <button
                    onClick={() => { handleApprove(previewingLink); setPreviewingLink(null); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#34A853] hover:bg-[#2e9449] text-white text-xs font-mono font-bold cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Approve Now</span>
                  </button>
                )}
                <a
                  href={previewingLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181c1f] hover:bg-[#22272b] text-white text-xs font-mono cursor-pointer border border-white/10"
                >
                  <ExternalLink size={13} />
                  <span>Open External</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT / CREATE STREAM FORM MODAL */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#111416] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 my-8 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30">
                  {editingItem ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">
                    {editingItem ? 'Edit Media Stream' : 'Add Verified Media Stream'}
                  </h3>
                  <p className="text-xs text-[#A8A1A1]">
                    Configure YouTube/Spotify URL, metadata, verification trust, and moderation status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-[#A8A1A1] hover:text-white bg-[#080808] border border-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center justify-between">
                  <span>YouTube or Spotify URL *</span>
                  {parsedPreview && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      parsedPreview.platform === 'YOUTUBE' ? 'bg-[#FF0000]/20 text-[#FF0000]' : 'bg-[#1DB954]/20 text-[#1DB954]'
                    }`}>
                      DETECTED: {parsedPreview.platform} {parsedPreview.mediaType}
                    </span>
                  )}
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://open.spotify.com/playlist/..."
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                />
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Stream Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Synthwave & Dark Electro"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs"
                />
              </div>

              {/* Submitter & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Submitter Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ahmmad_sakib"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Category / Genre
                  </label>
                  <select
                    value={formData.category || 'Coding Beats'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] text-xs"
                  >
                    <option value="Coding Beats">Coding Beats</option>
                    <option value="Lofi & Chill">Lofi & Chill</option>
                    <option value="Deep Focus">Deep Focus</option>
                    <option value="Tech & Tutorials">Tech & Tutorials</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Talks & Podcasts">Talks & Podcasts</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Description / Recommendation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the vibe, flow state benefits, or tech covered..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="beats, cyberpunk, focus, dev"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                />
              </div>

              {/* Status, Verification & Featured Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                
                {/* Moderation Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Approval Status
                  </label>
                  <select
                    value={formData.status || 'APPROVED'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] text-xs font-mono font-bold"
                  >
                    <option value="APPROVED">APPROVED (Live)</option>
                    <option value="PENDING">PENDING (Review)</option>
                    <option value="REJECTED">REJECTED (Hidden)</option>
                  </select>
                </div>

                {/* Verified Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Trust Verification
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      formData.verified
                        ? 'bg-[#34A853]/20 border-[#34A853] text-[#34A853]'
                        : 'bg-[#080808] border-white/10 text-[#A8A1A1]'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    <span>{formData.verified ? 'VERIFIED' : 'UNVERIFIED'}</span>
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Featured Showcase
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                      formData.featured
                        ? 'bg-[#E51F2A]/20 border-[#E51F2A] text-[#E51F2A]'
                        : 'bg-[#080808] border-white/10 text-[#A8A1A1]'
                    }`}
                  >
                    <Flame size={14} />
                    <span>{formData.featured ? 'FEATURED' : 'STANDARD'}</span>
                  </button>
                </div>

              </div>

              {/* Live Embed Preview Box */}
              {parsedPreview && (
                <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#A8A1A1] flex items-center justify-between">
                    <span>Embed Preview</span>
                    <span className="text-[#34A853] flex items-center gap-1 font-bold">
                      <CheckCircle2 size={12} /> Valid Stream Embed
                    </span>
                  </div>
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10">
                    <iframe
                      src={parsedPreview.embedUrl}
                      title="Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#080808] hover:bg-white/10 text-white font-semibold text-xs font-mono transition-colors cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-heading font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(229,31,42,0.4)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>{editingItem ? 'UPDATE STREAM' : 'PUBLISH STREAM'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REJECTION REASON MODAL */}
      {/* ------------------------------------------------------------- */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111416] border border-[#E51F2A]/40 rounded-3xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A]">
                <XCircle size={20} />
              </div>
              <div>
                <h4 className="text-base font-heading font-bold text-white">Reject Stream Submission</h4>
                <p className="text-xs text-[#A8A1A1]">@{rejectingItem.username}: "{rejectingItem.title}"</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#A8A1A1]">Rejection Reason</label>
              <select
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#080808] border border-white/10 text-xs text-white"
              >
                <option value="Content does not meet quality or focus guidelines">Does not meet quality or focus guidelines</option>
                <option value="Broken URL or unavailable video/playlist">Broken URL or unavailable video/playlist</option>
                <option value="Duplicate stream link already exists in hub">Duplicate stream link already in hub</option>
                <option value="Non-coding / unrelated media content">Non-coding / unrelated media content</option>
                <option value="Other / Inappropriate metadata">Other / Inappropriate metadata</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-mono font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
