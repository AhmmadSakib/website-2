import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Sparkles, 
  Cpu, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Share2, 
  Lock,
  Globe,
  Maximize2
} from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectDetailsProps {
  project: ProjectItem;
  onBack: () => void;
  onSelectProject?: (proj: ProjectItem) => void;
  relatedProjects?: ProjectItem[];
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  onBack,
  onSelectProject,
  relatedProjects = [],
}) => {
  const cover = project.coverImage || (project as any).imageUrl;
  const gallery = project.gallery && project.gallery.length > 0 ? project.gallery : [cover];
  const [activeImage, setActiveImage] = useState<string>(cover || gallery[0]);
  const techList = project.technologies || (project as any).tags || [];

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111416] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-medium text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#E51F2A]" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#111416] border border-white/10 text-[#E51F2A] font-bold uppercase">
              {project.category}
            </span>
            {project.featured && (
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#E51F2A]/10 border border-[#E51F2A]/30 text-[#E51F2A] font-bold flex items-center gap-1.5">
                <Sparkles size={12} />
                Featured Work
              </span>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-[2px] bg-[#E51F2A]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#E51F2A]">
              System Architecture & Prototype
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-white leading-tight">
            {project.title}
          </h1>
          <p className="text-base sm:text-lg text-[#A8A1A1] max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Media Presentation Display */}
        <div className="space-y-4">
          {/* Main Visual Stage */}
          <div className="relative rounded-3xl overflow-hidden bg-[#080808] border border-white/15 aspect-video sm:aspect-21/9 max-h-[500px] shadow-2xl group">
            <img
              src={activeImage}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />

            {/* Quick Action Overlay Links */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#080808]/90 backdrop-blur-md border border-white/20 text-white">
                  SLUG: /{project.slug}
                </span>
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30">
                  {project.visibility}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {project.demoUrl && project.demoUrl !== '#' && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)]"
                  >
                    <Globe size={15} />
                    <span>Live Preview</span>
                    <ExternalLink size={13} />
                  </a>
                )}
                {project.githubUrl && project.githubUrl !== '#' && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111416]/90 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all"
                  >
                    <Github size={15} />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer ${
                    activeImage === img
                      ? 'border-[#E51F2A] shadow-[0_0_15px_rgba(229,31,42,0.4)] scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`Gallery thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Architecture Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center 2 Columns: Deep Dive & Technical Architecture */}
          <div className="lg:col-span-2 space-y-8">
            <div className="p-8 rounded-3xl bg-[#111416]/90 border border-white/10 space-y-6">
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
                <Layers className="text-[#E51F2A]" size={20} />
                <span>Technical Specifications & Engineering Blueprint</span>
              </h2>

              <div className="text-sm sm:text-base text-[#D1D1D1] leading-relaxed space-y-4 font-normal">
                <p>
                  {project.longDescription || project.description}
                </p>
                <p>
                  This project was designed with a heavy emphasis on zero-latency response times, mathematical typography layout, and modular component isolation. Core architectural patterns include declarative state trees, deterministic side-effect execution, and continuous zero-trust permission audits.
                </p>
              </div>

              {/* Highlights */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#080808]/60 border border-white/5">
                  <CheckCircle2 size={18} className="text-[#E51F2A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero Layout Shift</h4>
                    <p className="text-xs text-[#A8A1A1] mt-0.5">Optimized asset loaders and skeleton hydration metrics.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#080808]/60 border border-white/5">
                  <CheckCircle2 size={18} className="text-[#E51F2A] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">End-to-End Type Safety</h4>
                    <p className="text-xs text-[#A8A1A1] mt-0.5">Strict TypeScript schemas across frontend and backend boundaries.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Tech Stack Badge Matrix */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#111416]/90 border border-white/10 space-y-6">
              <h3 className="text-xs font-mono uppercase text-[#A8A1A1] tracking-widest">
                PROJECT METRICS
              </h3>

              <div className="space-y-4 divide-y divide-white/5 text-xs font-mono">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[#A8A1A1]">DOMAIN CATEGORY:</span>
                  <span className="text-white font-bold">{project.category}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#A8A1A1]">VISIBILITY TIER:</span>
                  <span className="text-[#E51F2A] font-bold">{project.visibility}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#A8A1A1]">INDEXED CREATED:</span>
                  <span className="text-[#D1D1D1]">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[#A8A1A1]">LATEST AUDIT:</span>
                  <span className="text-[#D1D1D1]">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="p-6 rounded-3xl bg-[#111416]/90 border border-white/10 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-[#E51F2A]" />
                <h3 className="text-xs font-mono uppercase text-white tracking-wider">
                  TECHNOLOGY STACK
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {techList.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-[#F1F1F1] hover:border-[#E51F2A] transition-colors"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Links */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#181c1f] to-[#111416] border border-white/10 space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#A8A1A1] tracking-wider">
                EXPLORATION ACTIONS
              </h4>
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-bold text-xs transition-all shadow-md"
                >
                  <Globe size={14} />
                  <span>Launch Live Deployment</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#080808] hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-all"
                >
                  <Github size={14} />
                  <span>Inspect Repository</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && onSelectProject && (
          <div className="pt-12 border-t border-white/10 space-y-6">
            <h3 className="text-xl font-heading font-bold text-white">
              Related Engineering Artifacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProject(rel)}
                  className="p-5 rounded-2xl bg-[#111416] border border-white/10 hover:border-[#E51F2A]/60 transition-all cursor-pointer group"
                >
                  <h4 className="font-bold text-white group-hover:text-[#E51F2A] transition-colors truncate">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-[#A8A1A1] line-clamp-2 mt-2">
                    {rel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
