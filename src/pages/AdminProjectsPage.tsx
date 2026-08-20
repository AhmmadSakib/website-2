import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock, 
  Sparkles, 
  Github, 
  ExternalLink, 
  Layers, 
  Check, 
  X, 
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { ProjectItem, ProjectCategory } from '../types';
import { INITIAL_PROJECTS } from '../config/personalData';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { db, collection, onSnapshot, doc, setDoc, deleteDoc } from '../lib/firebase';

interface AdminProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const AdminProjectsPage: React.FC<AdminProjectsPageProps> = ({ onNavigate }) => {
  const { isOwner, profile } = useAuth();
  const { logActivity } = usePermissions();

  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    title: '',
    slug: '',
    category: 'WEB',
    description: '',
    longDescription: '',
    technologies: [],
    coverImage: '',
    gallery: [],
    demoUrl: '',
    githubUrl: '',
    featured: false,
    visibility: 'PUBLIC',
  });
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'projects'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: ProjectItem[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...docSnap.data() } as ProjectItem);
            });
            setProjects(fetched);
          }
        },
        (err) => {
          console.warn('[ADMIN PROJECTS] Local state fallback active:', err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore fallback active for admin projects');
    }
  }, []);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      category: 'WEB',
      description: '',
      longDescription: '',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      gallery: [],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com',
      featured: false,
      visibility: 'PUBLIC',
    });
  };

  const handleOpenEdit = (proj: ProjectItem) => {
    setEditingProject(proj);
    setIsCreating(false);
    setFormData({
      ...proj,
      technologies: proj.technologies || (proj as any).tags || [],
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      alert('Please provide Title and Slug');
      return;
    }

    const projectId = editingProject ? editingProject.id : `proj-${Date.now()}`;
    const projectItem: ProjectItem = {
      id: projectId,
      title: formData.title || 'Untitled Project',
      slug: (formData.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      category: (formData.category || 'WEB') as any,
      description: formData.description || '',
      longDescription: formData.longDescription || formData.description || '',
      technologies: formData.technologies || [],
      coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.coverImage || ''],
      demoUrl: formData.demoUrl || '',
      githubUrl: formData.githubUrl || '',
      featured: !!formData.featured,
      visibility: formData.visibility || 'PUBLIC',
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local state
    if (editingProject) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? projectItem : p)));
      logActivity('PROJECT_UPDATED', profile?.email || 'owner', `PROJECT:${projectItem.title}`, 'Project metadata updated.');
    } else {
      setProjects((prev) => [projectItem, ...prev]);
      logActivity('PROJECT_CREATED', profile?.email || 'owner', `PROJECT:${projectItem.title}`, 'New engineering project deployed.');
    }

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'projects', projectId), projectItem);
    } catch (err) {
      console.warn('Local state updated, firestore fallback:', err);
    }

    setIsCreating(false);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${projectTitle}"?`)) return;

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    logActivity('PROJECT_DELETED', profile?.email || 'owner', `PROJECT:${projectTitle}`, 'Project permanently removed.');

    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (e) {
      console.warn('Deleted from local state');
    }
  };

  const handleTogglePublish = async (proj: ProjectItem) => {
    const nextVis: 'PUBLIC' | 'PRIVATE' = proj.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    const updated = { ...proj, visibility: nextVis, updatedAt: new Date().toISOString() };
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
    logActivity('PROJECT_UPDATED', profile?.email || 'owner', `PROJECT:${proj.title}`, `Visibility toggled to ${nextVis}`);

    try {
      await setDoc(doc(db, 'projects', proj.id), updated);
    } catch (e) {
      console.warn('Updated local state');
    }
  };

  const handleToggleFeatured = async (proj: ProjectItem) => {
    const updated = { ...proj, featured: !proj.featured, updatedAt: new Date().toISOString() };
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
    logActivity('PROJECT_UPDATED', profile?.email || 'owner', `PROJECT:${proj.title}`, `Featured flag set to ${updated.featured}`);

    try {
      await setDoc(doc(db, 'projects', proj.id), updated);
    } catch (e) {
      console.warn('Updated local state');
    }
  };

  const addTechTag = () => {
    if (!tagInput.trim()) return;
    const current = formData.technologies || [];
    if (!current.includes(tagInput.trim())) {
      setFormData({ ...formData, technologies: [...current, tagInput.trim()] });
    }
    setTagInput('');
  };

  const removeTechTag = (tag: string) => {
    setFormData({
      ...formData,
      technologies: (formData.technologies || []).filter((t) => t !== tag),
    });
  };

  const addGalleryImage = () => {
    if (!galleryInput.trim()) return;
    const current = formData.gallery || [];
    setFormData({ ...formData, gallery: [...current, galleryInput.trim()] });
    setGalleryInput('');
  };

  const removeGalleryImage = (idx: number) => {
    setFormData({
      ...formData,
      gallery: (formData.gallery || []).filter((_, i) => i !== idx),
    });
  };

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  if (!isOwner()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="p-8 rounded-2xl bg-[#111416] border border-red-500/30 max-w-md space-y-4">
          <Lock size={40} className="mx-auto text-[#E51F2A]" />
          <h2 className="text-xl font-bold text-white">Owner Authorization Required</h2>
          <p className="text-xs text-[#A8A1A1]">
            Only the verified owner account can access the Project Management Console.
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

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
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
              <span className="text-xs font-mono text-[#E51F2A] font-bold uppercase">Projects Manager</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-white">
              PROJECTS <span className="text-[#E51F2A]">CONTROL</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A8A1A1] mt-1">
              Create, edit, publish, feature, and manage full-stack project portfolio entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/projects')}
              className="px-4 py-2.5 rounded-xl bg-[#111416] hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-all cursor-pointer"
            >
              Public View
            </button>
            <button
              id="admin-create-project-btn"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(229,31,42,0.4)] transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Search & Statistics Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111416] border border-white/10">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
            <input
              type="text"
              placeholder="Search projects by title, slug, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs text-white placeholder-[#A8A1A1]/60 focus:outline-none focus:border-[#E51F2A]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#A8A1A1]">
            <span>TOTAL: <strong className="text-white">{projects.length}</strong></span>
            <span>•</span>
            <span>PUBLIC: <strong className="text-white">{projects.filter(p => p.visibility === 'PUBLIC').length}</strong></span>
            <span>•</span>
            <span>FEATURED: <strong className="text-[#E51F2A]">{projects.filter(p => p.featured).length}</strong></span>
          </div>
        </div>

        {/* Projects Table */}
        <div className="rounded-2xl bg-[#111416] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#080808] text-[11px] font-mono text-[#A8A1A1] uppercase border-b border-white/5">
                <tr>
                  <th className="py-3 px-5">Project Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Visibility</th>
                  <th className="py-3 px-3">Featured</th>
                  <th className="py-3 px-3">Tech Count</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* Project Title & Cover */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.coverImage || (proj as any).imageUrl}
                          alt={proj.title}
                          className="w-12 h-9 rounded-lg object-cover bg-[#080808] border border-white/10 shrink-0"
                        />
                        <div className="font-sans">
                          <div className="font-bold text-white truncate max-w-xs">{proj.title}</div>
                          <div className="text-[11px] font-mono text-[#A8A1A1]">/{proj.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#080808] border border-white/10 text-[11px] text-[#E51F2A] font-bold">
                        {proj.category}
                      </span>
                    </td>

                    {/* Visibility Switch */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleTogglePublish(proj)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          proj.visibility === 'PUBLIC'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30'
                        }`}
                      >
                        {proj.visibility}
                      </button>
                    </td>

                    {/* Featured Switch */}
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleFeatured(proj)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          proj.featured ? 'text-[#E51F2A] bg-[#E51F2A]/10' : 'text-[#A8A1A1]/40 hover:text-white'
                        }`}
                        title={proj.featured ? 'Featured on Showcase' : 'Not Featured'}
                      >
                        <Sparkles size={16} />
                      </button>
                    </td>

                    {/* Tech count */}
                    <td className="py-3.5 px-3 text-[#D1D1D1]">
                      {(proj.technologies || (proj as any).tags || []).length} tags
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-5 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-1.5 rounded-lg text-[#A8A1A1] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Project Modal Form */}
        {(isCreating || editingProject) && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl bg-[#111416] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl my-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">
                    {editingProject ? 'Edit Project Specifications' : 'Deploy New Engineering Project'}
                  </h3>
                  <p className="text-xs text-[#A8A1A1]">
                    Enter technical parameters and live repository metadata.
                  </p>
                </div>
                <button
                  onClick={() => { setIsCreating(false); setEditingProject(null); }}
                  className="p-2 rounded-xl text-[#A8A1A1] hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-5 text-xs">
                
                {/* Title & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">PROJECT TITLE *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI Neural Assistant"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">URL SLUG *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ai-neural-assistant"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                    />
                  </div>
                </div>

                {/* Category, Visibility & Featured */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">CATEGORY</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] cursor-pointer"
                    >
                      <option value="WEB">WEB</option>
                      <option value="DESIGN">DESIGN</option>
                      <option value="3D">3D</option>
                      <option value="APP">APP</option>
                      <option value="AI">AI</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">VISIBILITY</label>
                    <select
                      value={formData.visibility}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A] cursor-pointer"
                    >
                      <option value="PUBLIC">PUBLIC (Visible to all)</option>
                      <option value="PRIVATE">PRIVATE (Owner only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">FEATURED SPOTLIGHT</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                      className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        formData.featured
                          ? 'bg-[#E51F2A] border-[#E51F2A] text-white font-bold'
                          : 'bg-[#080808] border-white/10 text-[#A8A1A1]'
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>{formData.featured ? 'Featured on Core' : 'Standard'}</span>
                    </button>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[#A8A1A1] mb-1.5 font-mono">SHORT DESCRIPTION</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview shown in project cards..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                  />
                </div>

                {/* Long Architecture Description */}
                <div>
                  <label className="block text-[#A8A1A1] mb-1.5 font-mono">TECHNICAL BLUEPRINT / ARCHITECTURE SPECS</label>
                  <textarea
                    rows={4}
                    placeholder="Detailed deep dive describing state machines, shader passes, zero-trust perimeter, database design..."
                    value={formData.longDescription || ''}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                  />
                </div>

                {/* Technologies Tag Manager */}
                <div>
                  <label className="block text-[#A8A1A1] mb-1.5 font-mono">TECHNOLOGY TAGS</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. Python, Three.js, Docker)..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechTag(); } }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTechTag}
                      className="px-4 py-2 rounded-xl bg-[#181c1f] hover:bg-white/10 border border-white/10 text-white cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(formData.technologies || []).map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080808] border border-white/10 text-white font-mono text-[11px]"
                      >
                        <span>{tech}</span>
                        <X
                          size={12}
                          className="text-[#A8A1A1] hover:text-red-400 cursor-pointer"
                          onClick={() => removeTechTag(tech)}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Image & Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">COVER IMAGE URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.coverImage || ''}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">ADD GALLERY IMAGE URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={galleryInput}
                        onChange={(e) => setGalleryInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-3 py-2 rounded-xl bg-[#181c1f] hover:bg-white/10 border border-white/10 text-white cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">LIVE DEMO URL</label>
                    <input
                      type="text"
                      placeholder="https://demo.example.com"
                      value={formData.demoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#A8A1A1] mb-1.5 font-mono">GITHUB REPOSITORY URL</label>
                    <input
                      type="text"
                      placeholder="https://github.com/..."
                      value={formData.githubUrl || ''}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white focus:outline-none focus:border-[#E51F2A]"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setEditingProject(null); }}
                    className="px-5 py-2.5 rounded-xl bg-[#080808] hover:bg-white/10 border border-white/10 text-white font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold shadow-[0_0_20px_rgba(229,31,42,0.4)] cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{editingProject ? 'Save Changes' : 'Deploy Project'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
