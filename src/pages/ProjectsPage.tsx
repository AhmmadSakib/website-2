import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Award, 
  Cpu, 
  List, 
  Grid3X3, 
  SlidersHorizontal,
  Search,
  Sparkles,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectDetails } from '../components/projects/ProjectDetails';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { INITIAL_PROJECTS, STATS_CONFIG } from '../config/personalData';
import { ProjectItem, ProjectCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { db, collection, onSnapshot } from '../lib/firebase';
import { pageTransitions, staggerContainer, staggerItem } from '../lib/motion';

interface ProjectsPageProps {
  initialSlug?: string;
  onNavigate?: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ initialSlug, onNavigate }) => {
  const { isOwner } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'title' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

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
        (error) => {
          console.warn('Using local project records:', error);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore fallback enabled for projects');
    }
  }, []);

  // Handle initial slug from route
  useEffect(() => {
    if (initialSlug) {
      const matched = projects.find((p) => p.slug === initialSlug || p.id === initialSlug);
      if (matched) setSelectedProject(matched);
    }
  }, [initialSlug, projects]);

  const categories: ProjectCategory[] = ['ALL', 'WEB', 'DESIGN', '3D', 'APP', 'AI', 'OTHER'];

  // Filter projects by public visibility (owner sees all)
  const accessibleProjects = projects.filter((item) => {
    if (!isOwner() && item.visibility === 'PRIVATE') return false;
    return true;
  });

  const filteredProjects = accessibleProjects
    .filter((item) => {
      const itemCat = (item.category || '').toUpperCase();
      const matchesCategory = activeCategory === 'ALL' || itemCat === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.technologies || (item as any).tags || []).some((t: string) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid':
        return <LayoutGrid className="w-6 h-6 text-[#E51F2A]" />;
      case 'Users':
        return <Users className="w-6 h-6 text-[#E51F2A]" />;
      case 'Award':
        return <Award className="w-6 h-6 text-[#E51F2A]" />;
      case 'Cpu':
      default:
        return <Cpu className="w-6 h-6 text-[#E51F2A]" />;
    }
  };

  // If a project is selected, render full ProjectDetails
  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        onBack={() => {
          setSelectedProject(null);
          if (onNavigate) onNavigate('/projects');
        }}
        onSelectProject={(p) => {
          setSelectedProject(p);
          if (onNavigate) onNavigate(`/projects/${p.slug}`);
        }}
        relatedProjects={accessibleProjects.filter((p) => p.id !== selectedProject.id && p.category === selectedProject.category)}
      />
    );
  }

  return (
    <motion.div 
      className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-12 relative overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitions}
    >
      
      {/* Ambient Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E51F2A]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#E51F2A]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      
      <div className="w-full max-w-7xl relative z-10 mx-auto space-y-12">
        
        {/* Header with 3D Sculpture Badge */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10"
        >
          <div className="max-w-2xl space-y-3">
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111416] border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
              ENGINEERING ARTIFACTS
            </motion.div>

            <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight">
              <span className="text-white">PROJECTS </span>
              <span className="text-[#E51F2A] drop-shadow-[0_0_20px_rgba(229,31,42,0.3)]">
                INDEX
              </span>
            </motion.h1>

            <motion.p variants={staggerItem} className="text-base sm:text-lg text-[#A8A1A1] leading-relaxed">
              Full-stack architectures, interactive 3D spatial environments, autonomous agents, and zero-trust cloud systems.
            </motion.p>
          </div>

          <motion.div variants={staggerItem} className="flex items-center gap-4 shrink-0">
            {isOwner() && onNavigate && (
              <button
                onClick={() => onNavigate('/admin/projects')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(229,31,42,0.3)] cursor-pointer"
              >
                <Plus size={15} />
                <span>Project Manager</span>
              </button>
            )}
            <div className="hidden sm:block w-32 h-32">
              <Cyber3DSystem variant="projects" height={120} />
            </div>
          </motion.div>
        </motion.div>

        {/* Filter and Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111416]/80 backdrop-blur-md p-4 rounded-2xl border border-white/10"
        >
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat.toLowerCase()}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E51F2A] text-white shadow-[0_0_15px_rgba(229,31,42,0.4)] font-bold'
                      : 'bg-[#181c1f] text-[#D1D1D1] border border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
              <input
                type="text"
                placeholder="Search projects or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs sm:text-sm text-white placeholder-[#A8A1A1]/60 focus:outline-none focus:border-[#E51F2A] transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs text-[#D1D1D1]">
              <SlidersHorizontal size={14} className="text-[#E51F2A]" />
              <select
                id="sort-projects-select"
                aria-label="Sort projects"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#111416]">Featured First</option>
                <option value="newest" className="bg-[#111416]">Newest First</option>
                <option value="title" className="bg-[#111416]">Alphabetical</option>
              </select>
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#080808] border border-white/10">
              <button
                id="view-mode-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#E51F2A] text-white' : 'text-[#A8A1A1] hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#E51F2A] text-white' : 'text-[#A8A1A1] hover:text-white'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>

        </motion.div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center rounded-2xl bg-[#111416]/50 border border-white/5 space-y-3"
          >
            <p className="text-base text-[#A8A1A1]">No projects found matching your filter criteria.</p>
            <button
              onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-[#E51F2A] text-xs font-semibold text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={staggerItem}>
                <ProjectCard
                  project={project}
                  onSelect={(proj) => {
                    setSelectedProject(proj);
                    if (onNavigate) onNavigate(`/projects/${proj.slug}`);
                  }}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom Statistics Panel */}
        <section className="pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="relative p-8 sm:p-10 rounded-3xl bg-[#111416] border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#8C0B12]/15 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {STATS_CONFIG.map((stat, idx) => (
                <div key={stat.id} className={`flex flex-col items-center text-center ${idx > 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#080808] border border-white/10 flex items-center justify-center mb-3 shadow-inner">
                    {getStatIcon(stat.icon)}
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-[#D1D1D1] mt-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-[#A8A1A1] mt-0.5">
                    {stat.subtext}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

      </div>
    </motion.div>
  );
};
