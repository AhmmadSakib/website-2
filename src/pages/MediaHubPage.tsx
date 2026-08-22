import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  Tv,
  Music,
  Youtube,
  Radio,
  Plus,
  Compass,
  ArrowRight,
  ArrowLeft,
  Share2,
  ExternalLink,
  Heart,
  Search,
  Filter,
  Check,
  X,
  Volume2,
  User,
  Sparkles,
  Layers,
  Clock,
  Tag,
  Maximize2,
  Minimize2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Headphones,
  CheckCircle2,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { MediaLinkItem, MediaPlatform, MediaType } from '../types';
import { INITIAL_MEDIA_LINKS, parseMediaUrl } from '../config/personalData';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from '../lib/firebase';

interface MediaHubPageProps {
  onNavigate: (path: string) => void;
}

export const MediaHubPage: React.FC<MediaHubPageProps> = ({ onNavigate }) => {
  const { user, profile, isOwner } = useAuth();

  // Local & Firestore synced links
  const [links, setLinks] = useState<MediaLinkItem[]>(INITIAL_MEDIA_LINKS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'ALL' | MediaPlatform>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Interactive Walkthrough / Guided Tour State
  const [isWalkthroughActive, setIsWalkthroughActive] = useState<boolean>(false);
  const [currentTourIndex, setCurrentTourIndex] = useState<number>(0);

  // Upload / Submit Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [inputTitle, setInputTitle] = useState<string>('');
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputCategory, setInputCategory] = useState<string>('AUTO');
  const [inputVisibility, setInputVisibility] = useState<'PUBLIC'|'PRIVATE'|'SHARED'>('PUBLIC');
  const [inputDescription, setInputDescription] = useState<string>('');
  const [inputTags, setInputTags] = useState<string>('beats, focus, dev');
  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseMediaUrl> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pending count for Admin badge
  const pendingCount = useMemo(() => {
    return links.filter((l) => l.status === 'PENDING').length;
  }, [links]);

  // Set default submitter username based on authenticated profile
  useEffect(() => {
    if (profile?.displayName) {
      setInputUsername(profile.displayName.toLowerCase().replace(/\s+/g, '_'));
    } else if (user?.email) {
      setInputUsername(user.email.split('@')[0]);
    } else if (!inputUsername) {
      setInputUsername('digital_surfer');
    }
  }, [profile, user]);

  // Firestore Real-Time Synchronization with local fallback
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
            // Combine with initial seeds if user added extras
            const merged = [...fetched];
            INITIAL_MEDIA_LINKS.forEach((seed) => {
              if (!merged.some((m) => m.id === seed.id)) {
                merged.push(seed);
              }
            });
            setLinks(merged);
          } else {
            // Seed defaults into local view
            setLinks(INITIAL_MEDIA_LINKS);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore mediaLinks listener error (using offline seed):', error);
          setLinks(INITIAL_MEDIA_LINKS);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore initialization fallback:', err);
      setLinks(INITIAL_MEDIA_LINKS);
      setLoading(false);
    }
  }, []);

  // Parse URL in real time as user types in upload modal
  useEffect(() => {
    if (inputUrl.trim().length > 5) {
      const parsed = parseMediaUrl(inputUrl);
      setParsedPreview(parsed);
      if (!inputTitle && parsed.detectedTitle) {
        setInputTitle(parsed.detectedTitle);
      }
    } else {
      setParsedPreview(null);
    }
  }, [inputUrl]);

  // Keyboard navigation for walkthrough (Left/Right arrows, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isWalkthroughActive) return;
      if (e.key === 'ArrowRight') {
        handleNextTourLink();
      } else if (e.key === 'ArrowLeft') {
        handlePrevTourLink();
      } else if (e.key === 'Escape') {
        setIsWalkthroughActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalkthroughActive, currentTourIndex, links]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [links]);

  // Filtered links (respects approval status: owners see all, public sees APPROVED or their own pending)
  const filteredLinks = useMemo(() => {
    const ownerMode = isOwner();
    const currentUid = user?.uid;

    return links.filter((link) => {
      const status = link.status || 'APPROVED';
      
      // Visibility rules
      if (!ownerMode) {
        if (link.visibility === 'PRIVATE') {
          if (!currentUid || link.userId !== currentUid) return false;
        }
        if (status === 'REJECTED') return false;
        if (status === 'PENDING') {
          // Only show pending items if current logged-in user submitted it
          if (!currentUid || link.userId !== currentUid) {
            return false;
          }
        }
      }

      let matchesCategory = true;
      if (selectedCategory !== 'ALL') {
        const cat = selectedCategory;
        if (cat === 'VIDEOS') matchesCategory = ['YOUTUBE', 'VIDEO'].includes(link.mediaType) || link.platform === 'YOUTUBE';
        else if (cat === 'WEBSITES') matchesCategory = link.mediaType === 'ARTICLE' || link.platform === 'WEBSITE';
        else if (cat === 'PROJECTS') matchesCategory = link.category?.toUpperCase() === 'PROJECT';
        else if (cat === 'ARTICLES') matchesCategory = link.mediaType === 'ARTICLE';
        else if (cat === 'DOCUMENTS') matchesCategory = link.mediaType === 'DOCUMENT';
        else if (cat === 'GITHUB') matchesCategory = link.platform === 'GITHUB';
        else if (cat === 'SOCIAL') matchesCategory = link.platform === 'SOCIAL';
        else if (cat === 'COURSES') matchesCategory = link.mediaType === 'COURSE';
        else if (cat === 'TOOLS') matchesCategory = link.mediaType === 'TOOL';
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        link.title.toLowerCase().includes(q) ||
        link.username.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q)) ||
        (link.tags && link.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [links, selectedCategory, searchQuery, isOwner, user]);

  // Active tour link item
  const activeTourLink = useMemo(() => {
    if (filteredLinks.length === 0) return links[0] || null;
    const safeIndex = Math.min(Math.max(currentTourIndex, 0), filteredLinks.length - 1);
    return filteredLinks[safeIndex];
  }, [filteredLinks, currentTourIndex, links]);

  const handleStartWalkthrough = (startIndex = 0) => {
    setCurrentTourIndex(startIndex);
    setIsWalkthroughActive(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNextTourLink = () => {
    setCurrentTourIndex((prev) => (prev + 1) % (filteredLinks.length || 1));
  };

  const handlePrevTourLink = () => {
    setCurrentTourIndex((prev) => (prev - 1 + (filteredLinks.length || 1)) % (filteredLinks.length || 1));
  };

  const handleCopyLink = (linkItem: MediaLinkItem) => {
    navigator.clipboard.writeText(linkItem.url);
    setCopiedId(linkItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleLike = async (linkId: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, likes: (l.likes || 0) + 1 } : l))
    );
    try {
      const docRef = doc(db, 'mediaLinks', linkId);
      const target = links.find((l) => l.id === linkId);
      if (target) {
        await updateDoc(docRef, { likes: (target.likes || 0) + 1 });
      }
    } catch (e) {
      // Ignored for offline seeds
    }
  };

  // Quick Admin Approval from Card
  const handleQuickApprove = async (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFields: Partial<MediaLinkItem> = {
      status: 'APPROVED',
      verified: true,
      reviewedBy: user?.email || 'admin',
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, ...updatedFields } : l))
    );

    try {
      await updateDoc(doc(db, 'mediaLinks', linkId), updatedFields);
    } catch (err) {
      console.warn('Quick approve local fallback:', err);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to remove this media stream link?')) return;
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    try {
      await deleteDoc(doc(db, 'mediaLinks', linkId));
    } catch (e) {
      console.warn('Delete fallback:', e);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setSubmitSuccessMessage(null);

    const urlValue = inputUrl.trim();
    if (!urlValue) {
      setUploadError('Please enter a valid link.');
      return;
    }
    
    // Strict URL scheme validation to prevent XSS / malicious links
    try {
      const urlObj = new URL(urlValue);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        setUploadError('Only http and https links are allowed.');
        return;
      }
    } catch (err) {
      setUploadError('Invalid URL format.');
      return;
    }

    if (!inputTitle.trim()) {
      setUploadError('Please specify a title for this link.');
      return;
    }

    if (!inputUsername.trim()) {
      setUploadError('Please specify your username/handle.');
      return;
    }

    const parsed = parseMediaUrl(urlValue);
    setIsSubmitting(true);

    const newId = `media-${Date.now()}`;
    const cleanUsername = inputUsername.trim().replace(/^@/, '');
    const tagsArray = inputTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const ownerUser = isOwner();
    const initialStatus = ownerUser ? 'APPROVED' : 'PENDING';
    const isVerified = ownerUser;

    const newLink: MediaLinkItem = {
      id: newId,
      title: inputTitle.trim(),
      url: urlValue,
      embedUrl: parsed.embedUrl,
      platform: parsed.platform,
      mediaType: inputCategory !== 'AUTO' ? (inputCategory as any) : parsed.mediaType,
      username: cleanUsername,
      userId: user?.uid,
      userAvatar: user?.photoURL || undefined,
      description: inputDescription.trim() || `Shared by @${cleanUsername}`,
      category: inputCategory !== 'AUTO' ? inputCategory : 'General',
      tags: tagsArray.length > 0 ? tagsArray : ['Stream', parsed.platform],
      thumbnailUrl: parsed.thumbnailUrl,
      likes: 1,
      featured: ownerUser,
      visibility: inputVisibility,
      status: initialStatus,
      verified: isVerified,
      reviewedBy: ownerUser ? (user?.email || 'owner') : undefined,
      reviewedAt: ownerUser ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString()
    };

    try {
      // Save directly to Firestore collection
      await setDoc(doc(db, 'mediaLinks', newId), newLink);
      setLinks((prev) => [newLink, ...prev]);
      
      // Reset form
      setInputUrl('');
      setInputTitle('');
      setInputDescription('');
      setInputTags('beats, focus, dev');
      setIsUploadModalOpen(false);

      if (ownerUser) {
        setSubmitSuccessMessage('Stream published and verified immediately as Owner!');
        setIsWalkthroughActive(true);
        setCurrentTourIndex(0);
      } else {
        setSubmitSuccessMessage('Stream submitted! Awaiting quick verification by the admin before appearing on the public catalog.');
      }
      setTimeout(() => setSubmitSuccessMessage(null), 8000);
    } catch (err: any) {
      console.warn('Firestore write warning (saving locally):', err);
      // Fallback local addition
      setLinks((prev) => [newLink, ...prev]);
      setIsUploadModalOpen(false);
      if (ownerUser) {
        setIsWalkthroughActive(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="media-hub-root" className="min-h-screen text-[#F1F1F1] pb-28 px-4 sm:px-8 lg:px-14 pt-8 lg:pt-14 relative overflow-hidden">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E51F2A]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#1DB954]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Owner Quick Moderation Alert Bar (if logged in as Owner) */}
        {isOwner() && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#111416] border border-[#E51F2A]/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>HQ STREAM MODERATION CONSOLE</span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FF9900] text-black font-bold animate-pulse">
                      {pendingCount} PENDING APPROVAL
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#A8A1A1]">
                  You have owner privileges to approve, verify, feature, edit, and delete YouTube & Spotify links.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="media-hub-admin-panel-btn"
                onClick={() => onNavigate('/admin/media')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(229,31,42,0.3)] cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>OPEN ADMIN MANAGER</span>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* User Submission Notice */}
        {submitSuccessMessage && (
          <div className="p-4 rounded-2xl bg-[#34A853]/15 border border-[#34A853]/30 text-white text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-[#34A853] shrink-0" />
              <span>{submitSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSubmitSuccessMessage(null)}
              className="text-[#A8A1A1] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Header Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#080808] border border-white/10 text-xs font-mono text-[#A8A1A1]">
              <Radio size={14} className="text-[#E51F2A] animate-pulse" />
              <span className="text-white font-medium">SONIC & VISUAL MATRIX</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[#E51F2A] font-semibold">{filteredLinks.length} STREAMS CURATED</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block">
                <Cyber3DSystem variant="media" height={140} />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                  THE DIGITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E51F2A] to-[#B5121B]">MEDIA HUB</span>
                </h1>
                <p className="text-sm sm:text-base text-[#A8A1A1] leading-relaxed mt-2">
                  A DIGITAL LIBRARY OF VIDEOS, LINKS, IDEAS AND EXPERIENCES.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="start-walkthrough-hero-btn"
              onClick={() => handleStartWalkthrough(0)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E51F2A] to-[#B5121B] hover:from-[#FF2A36] hover:to-[#E51F2A] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_30px_rgba(229,31,42,0.4)] transition-all cursor-pointer group"
            >
              <Play size={16} className="fill-white group-hover:scale-110 transition-transform" />
              <span>START GUIDED TOUR</span>
              <Sparkles size={15} className="text-white/80" />
            </button>

            {isOwner() && (
              <button
                id="open-upload-modal-btn"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#080808] hover:bg-white/5 text-white border border-white/10 hover:border-[#E51F2A]/40 font-heading font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-lg"
              >
                <Plus size={16} className="text-[#E51F2A]" />
                <span>ADD CONTENT</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE GUIDED WALKTHROUGH THEATER (The "Take them through") */}
        {/* ------------------------------------------------------------- */}
        {isWalkthroughActive && activeTourLink && (
          <div 
            id="guided-walkthrough-theater"
            className="p-6 sm:p-8 rounded-3xl bg-[#0d0f11]/98 border border-[#E51F2A]/40 shadow-[0_0_60px_rgba(229,31,42,0.2)] space-y-6 transition-all animate-fadeIn"
          >
            {/* Top Walkthrough Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E51F2A]/15 border border-[#E51F2A]/40 text-[#E51F2A]">
                  <Compass size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E51F2A]">
                      GUIDED WALKTHROUGH TOUR
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white">
                      Item {currentTourIndex + 1} of {filteredLinks.length}
                    </span>
                    {activeTourLink.verified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#34A853]/20 text-[#34A853] flex items-center gap-1 border border-[#34A853]/30">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-white line-clamp-1">
                    {activeTourLink.title}
                  </h2>
                </div>
              </div>

              {/* Tour Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="tour-prev-btn"
                  onClick={handlePrevTourLink}
                  title="Previous Link (Left Arrow)"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181c1f] hover:bg-[#22272b] text-white border border-white/10 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>PREV</span>
                </button>

                <button
                  id="tour-next-btn"
                  onClick={handleNextTourLink}
                  title="Next Link (Right Arrow)"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(229,31,42,0.3)] transition-all cursor-pointer"
                >
                  <span>NEXT</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  id="tour-close-btn"
                  onClick={() => setIsWalkthroughActive(false)}
                  title="Exit Walkthrough"
                  className="p-2 rounded-xl bg-[#181c1f] hover:bg-white/10 text-[#A8A1A1] hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Embedded Player Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Media Embed Player Iframe */}
              <div className="lg:col-span-8 bg-[#050607] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group">
                <div className="relative w-full aspect-video min-h-[300px] sm:min-h-[420px] bg-black">
                  <iframe
                    key={activeTourLink.embedUrl}
                    src={activeTourLink.embedUrl}
                    title={activeTourLink.title}
                    className="w-full h-full absolute inset-0 border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Right Side Walkthrough Inspector & Details */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Submitter Info Card */}
                <div className="p-4 rounded-2xl bg-[#111416] border border-white/10 space-y-3">
                  <div className="text-[11px] font-mono uppercase text-[#A8A1A1] tracking-wider flex items-center justify-between">
                    <span>Stream Curator & Submitter</span>
                    {activeTourLink.verified && (
                      <span className="text-[#34A853] flex items-center gap-1 font-bold">
                        <ShieldCheck size={12} /> Approved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTourLink.userAvatar ? (
                      <img
                        src={activeTourLink.userAvatar}
                        alt={activeTourLink.username}
                        className="w-10 h-10 rounded-xl object-cover border border-white/20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30 flex items-center justify-center font-mono font-bold">
                        {activeTourLink.username.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>@{activeTourLink.username}</span>
                        {activeTourLink.username === 'ahmmad_sakib' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E51F2A] text-white">
                            CREATOR
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#A8A1A1]">
                        Added {new Date(activeTourLink.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stream Metadata & Notes */}
                <div className="p-4 rounded-2xl bg-[#111416] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5">
                      {activeTourLink.platform === 'YOUTUBE' ? (
                        <span className="px-2 py-0.5 rounded bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30 font-bold flex items-center gap-1">
                          <Youtube size={12} /> YOUTUBE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 font-bold flex items-center gap-1">
                          <Music size={12} /> SPOTIFY
                        </span>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                      {activeTourLink.category || 'General'}
                    </span>
                  </div>

                  <p className="text-xs text-[#A8A1A1] leading-relaxed">
                    {activeTourLink.description || 'No description attached.'}
                  </p>

                  {/* Tags */}
                  {activeTourLink.tags && activeTourLink.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeTourLink.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#080808] text-[#A8A1A1] border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Actions & Direct Links */}
                <div className="space-y-2">
                  <a
                    id="tour-external-open-link"
                    href={activeTourLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-[#F1F1F1] text-black font-semibold text-xs tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    <span>OPEN DIRECTLY IN {activeTourLink.platform}</span>
                    <ExternalLink size={14} />
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="tour-like-btn"
                      onClick={() => handleToggleLike(activeTourLink.id)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#181c1f] hover:bg-white/10 text-white border border-white/10 text-xs font-mono transition-all cursor-pointer"
                    >
                      <Heart size={14} className="text-[#E51F2A] fill-[#E51F2A]" />
                      <span>{activeTourLink.likes || 0} Likes</span>
                    </button>

                    <button
                      id="tour-copy-btn"
                      onClick={() => handleCopyLink(activeTourLink)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#181c1f] hover:bg-white/10 text-white border border-white/10 text-xs font-mono transition-all cursor-pointer"
                    >
                      {copiedId === activeTourLink.id ? (
                        <>
                          <Check size={14} className="text-[#34A853]" />
                          <span className="text-[#34A853]">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} className="text-[#A8A1A1]" />
                          <span>SHARE LINK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick-Hop Walkthrough Queue Strip */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-mono uppercase text-[#A8A1A1] flex items-center justify-between">
                <span>Walkthrough Stream Queue ({filteredLinks.length} items)</span>
                <span>Click any stream to switch</span>
              </div>
              
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {filteredLinks.map((item, idx) => {
                  const isCurrent = idx === currentTourIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTourIndex(idx)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-left shrink-0 transition-all border cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E51F2A]/15 border-[#E51F2A] text-white shadow-[0_0_15px_rgba(229,31,42,0.3)]'
                          : 'bg-[#111416] border-white/10 text-[#A8A1A1] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center font-mono text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <div className="max-w-[150px]">
                        <div className="text-xs font-medium truncate text-white">{item.title}</div>
                        <div className="text-[10px] font-mono text-[#A8A1A1]">@{item.username}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FILTER CONTROLS & SEARCH BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#111416] border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
              <input
                id="media-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, YouTube videos, playlists, tags, or usernames (e.g. @ahmmad_sakib)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs sm:text-sm font-sans"
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

          </div>

          {/* Unified Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'VIDEOS', label: 'VIDEOS' },
              { id: 'WEBSITES', label: 'WEBSITES' },
              { id: 'PROJECTS', label: 'PROJECTS' },
              { id: 'ARTICLES', label: 'ARTICLES' },
              { id: 'DOCUMENTS', label: 'DOCUMENTS' },
              { id: 'GITHUB', label: 'GITHUB' },
              { id: 'SOCIAL', label: 'SOCIAL' },
              { id: 'COURSES', label: 'COURSES' },
              { id: 'TOOLS', label: 'TOOLS' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#E51F2A]/15 text-[#E51F2A] border-[#E51F2A]/40 shadow-[0_0_15px_rgba(229,31,42,0.2)]'
                    : 'bg-[#080808] text-[#A8A1A1] hover:text-white border-white/5 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MEDIA STREAMS CARD GRID */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#A8A1A1]">
            <span>SHOWING {filteredLinks.length} MEDIA STREAMS</span>
            <span>Click any card to play or step into tour</span>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#111416] border border-white/10 space-y-4">
              <AlertCircle size={32} className="mx-auto text-[#E51F2A]" />
              <div className="text-lg font-bold text-white">No streams found matching criteria</div>
              <p className="text-xs text-[#A8A1A1] max-w-sm mx-auto">
                Try adjusting your search terms or upload the first stream link in this category!
              </p>
              <button
                onClick={() => { setSelectedPlatform('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold cursor-pointer hover:bg-[#F1F1F1]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((item, index) => {
                const isYouTube = item.platform === 'YOUTUBE';
                const isPending = item.status === 'PENDING';

                return (
                  <div
                    key={item.id}
                    id={`media-card-${item.id}`}
                    className={`group rounded-3xl bg-[#111416] border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg ${
                      isPending
                        ? 'border-[#FF9900]/50 shadow-[0_0_20px_rgba(255,153,0,0.15)]'
                        : 'border-white/10 hover:border-[#E51F2A]/50 hover:shadow-[0_0_30px_rgba(229,31,42,0.15)]'
                    }`}
                  >
                    {/* Media Thumbnail & Play Trigger */}
                    <div className="relative aspect-video bg-[#080808] overflow-hidden">
                      <img
                        src={item.thumbnailUrl || (isYouTube ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600')}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        {isYouTube ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FF0000] text-white flex items-center gap-1 shadow-md">
                            <Youtube size={12} /> YOUTUBE {item.mediaType}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#1DB954] text-black flex items-center gap-1 shadow-md">
                            <Music size={12} /> SPOTIFY {item.mediaType}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#FF9900] text-black animate-pulse flex items-center gap-1">
                              <Clock size={10} /> PENDING
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-black/70 backdrop-blur-md text-white border border-white/10">
                            {item.category || 'Focus'}
                          </span>
                        </div>
                      </div>

                      {/* Play Overlay Button */}
                      <button
                        onClick={() => handleStartWalkthrough(index)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer"
                        title="Step into Walkthrough"
                      >
                        <div className="w-13 h-13 rounded-2xl bg-[#E51F2A] group-hover:bg-[#FF2A36] text-white flex items-center justify-center shadow-[0_0_25px_rgba(229,31,42,0.6)] transform group-hover:scale-110 transition-transform">
                          <Play size={22} className="fill-white ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      
                      <div className="space-y-2">
                        {/* Submitter Attribution Pill */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {item.userAvatar ? (
                              <img
                                src={item.userAvatar}
                                alt={item.username}
                                className="w-5 h-5 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User size={13} className="text-[#E51F2A]" />
                            )}
                            <span className="font-mono text-white text-xs font-semibold flex items-center gap-1">
                              @{item.username}
                              {item.verified && (
                                <span title="Verified by Admin">
                                  <ShieldCheck size={12} className="text-[#34A853]" />
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <span className="text-[10px] font-mono text-[#A8A1A1]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-[#A8A1A1] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleLike(item.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#080808] hover:bg-white/10 text-xs font-mono text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                          >
                            <Heart size={12} className="text-[#E51F2A] fill-[#E51F2A]" />
                            <span>{item.likes || 0}</span>
                          </button>

                          <button
                            onClick={() => handleCopyLink(item)}
                            title="Copy link"
                            className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === item.id ? <Check size={13} className="text-[#34A853]" /> : <Share2 size={13} />}
                          </button>

                          {/* Quick Approve button for Owner if pending */}
                          {isOwner() && isPending && (
                            <button
                              onClick={(e) => handleQuickApprove(item.id, e)}
                              title="Approve immediately"
                              className="px-2 py-1 rounded-lg bg-[#34A853] hover:bg-[#2e9449] text-white font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCheck size={12} />
                              <span>APPROVE</span>
                            </button>
                          )}

                          {(isOwner() || (user && item.userId === user.uid)) && (
                            <button
                              onClick={() => handleDeleteLink(item.id)}
                              title="Delete Link"
                              className="p-1.5 rounded-lg bg-[#080808] hover:bg-[#E51F2A]/20 text-[#A8A1A1] hover:text-[#E51F2A] transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#080808] hover:bg-white/10 text-[#A8A1A1] hover:text-white transition-colors"
                            title={`Open in ${item.platform}`}
                          >
                            <ExternalLink size={13} />
                          </a>

                          <button
                            onClick={() => handleStartWalkthrough(index)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#E51F2A] text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>TOUR</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* UPLOAD / SUBMIT MEDIA LINK MODAL */}
      {/* ------------------------------------------------------------- */}
      {isUploadModalOpen && (
        <div 
          id="upload-media-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            id="upload-media-modal-card"
            className="w-full max-w-xl bg-[#111416] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(229,31,42,0.25)] space-y-6 my-8 animate-scaleUp relative"
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">
                    Submit Stream Link
                  </h3>
                  <p className="text-xs text-[#A8A1A1]">
                    Add a YouTube video/playlist or Spotify playlist link with your username.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-xl text-[#A8A1A1] hover:text-white bg-[#080808] border border-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div className="p-3.5 rounded-2xl bg-[#E51F2A]/15 border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* URL Input */}
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
                  id="media-input-url"
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://open.spotify.com/playlist/..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs sm:text-sm font-mono"
                />
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Stream Title *
                </label>
                <input
                  id="media-input-title"
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Synthwave Coding Mix"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs sm:text-sm font-sans"
                />
              </div>

              {/* Submitter Username & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1] flex items-center gap-1">
                    <User size={12} />
                    <span>Your Username / Handle *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1] font-mono text-xs">@</span>
                    <input
                      id="media-input-username"
                      type="text"
                      required
                      placeholder="username"
                      value={inputUsername}
                      onChange={(e) => setInputUsername(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Visibility *
                  </label>
                  <select
                    id="media-input-visibility"
                    value={inputVisibility}
                    onChange={(e) => setInputVisibility(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                  >
                    <option value="PUBLIC">Public Portfolio</option>
                    <option value="PRIVATE">Private (Owner Only)</option>
                    <option value="SHARED">Shared (Authorized Users)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                    Content Type
                  </label>
                  <select
                    id="media-input-type"
                    value={inputCategory}
                    onChange={(e) => setInputCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                  >
                    <option value="AUTO">Auto Detect</option>
                    <option value="WEBSITE">Website</option>
                    <option value="YOUTUBE">YouTube Video</option>
                    <option value="PROJECT">Project</option>
                    <option value="ARTICLE">Article</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="GITHUB">GitHub Repo</option>
                    <option value="SOCIAL">Social Media</option>
                    <option value="TOOL">Tool</option>
                    <option value="COURSE">Course</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Recommendation Note / Description
                </label>
                <textarea
                  id="media-input-desc"
                  rows={3}
                  placeholder="Why do you recommend this stream? Mention ideal coding workflow or sound signature..."
                  value={inputDescription}
                  onChange={(e) => setInputDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-sans resize-none"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A8A1A1]">
                  Tags (comma-separated)
                </label>
                <input
                  id="media-input-tags"
                  type="text"
                  placeholder="synthwave, lofi, focus, masterclass"
                  value={inputTags}
                  onChange={(e) => setInputTags(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#080808] border border-white/10 text-white placeholder-[#A8A1A1]/40 focus:outline-none focus:border-[#E51F2A] text-xs font-mono"
                />
              </div>

              {/* Live Preview Embed Box */}
              {parsedPreview && (
                <div className="p-3.5 rounded-2xl bg-[#080808] border border-white/10 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#A8A1A1] flex items-center justify-between">
                    <span>Live Embed Preview</span>
                    <span className="text-[#34A853] flex items-center gap-1 font-bold">
                      <CheckCircle2 size={12} /> Valid Stream Embed
                    </span>
                  </div>
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10">
                    <iframe
                      src={parsedPreview.embedUrl}
                      title="Live Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}

              {/* Information Note */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#A8A1A1] flex items-start gap-2">
                <ShieldCheck size={14} className="text-[#E51F2A] shrink-0 mt-0.5" />
                <span>
                  {isOwner() 
                    ? 'As Owner, this stream will be published immediately with a Verified Source mark.'
                    : 'Your submitted stream link will be reviewed by the admin to verify playback quality before appearing in public listings.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#080808] hover:bg-white/10 text-white font-medium text-xs font-mono transition-colors cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  id="submit-media-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-heading font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(229,31,42,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'PROCESSING...' : isOwner() ? 'PUBLISH STREAM' : 'SUBMIT FOR APPROVAL'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
