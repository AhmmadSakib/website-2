import React from 'react';
import { ArrowRight, ExternalLink, Github, Sparkles, Layers } from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectCardProps {
  project: ProjectItem;
  onSelect: (project: ProjectItem) => void;
  viewMode?: 'grid' | 'list';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, viewMode = 'grid' }) => {
  const cover = project.coverImage || (project as any).imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
  const techList = project.technologies || (project as any).tags || [];

  if (viewMode === 'list') {
    return (
      <div
        id={`project-list-card-${project.id}`}
        onClick={() => onSelect(project)}
        className="group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl bg-[#111416]/90 border border-white/10 hover:border-[#E51F2A]/60 transition-all duration-300 hover:shadow-[0_0_25px_rgba(229,31,42,0.15)] cursor-pointer overflow-hidden"
      >
        <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden bg-[#080808] shrink-0 relative">
          <img
            src={cover}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111416]/80 via-transparent to-transparent" />
        </div>

        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#080808] border border-white/10 text-[#E51F2A] font-bold">
                {project.category}
              </span>
              {project.featured && (
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#E51F2A] bg-[#E51F2A]/10 border border-[#E51F2A]/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles size={11} />
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors mb-2">
              {project.title}
            </h3>

            <p className="text-sm text-[#A8A1A1] line-clamp-2 mb-4 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex flex-wrap gap-1.5">
              {techList.slice(0, 5).map((tech) => (
                <span key={tech} className="text-xs px-2 py-0.5 rounded bg-white/5 text-[#D1D1D1] font-mono">
                  {tech}
                </span>
              ))}
            </div>

            <button
              id={`view-btn-${project.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E51F2A] group-hover:text-white transition-colors cursor-pointer"
            >
              <span>Explore Architecture</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`project-card-${project.id}`}
      onClick={() => onSelect(project)}
      className="group relative rounded-2xl bg-[#111416]/90 border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[#E51F2A]/60 hover:shadow-[0_0_35px_rgba(229,31,42,0.22)] cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-[#080808]">
        <img
          src={cover}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111416] via-[#111416]/40 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-lg bg-[#080808]/85 backdrop-blur-md border border-white/10 text-xs font-mono text-[#E51F2A] font-bold tracking-wide">
          {project.category}
        </div>

        {project.featured && (
          <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-[#E51F2A] text-white text-[10px] font-mono tracking-wider uppercase shadow-[0_0_10px_#E51F2A] flex items-center gap-1">
            <Sparkles size={11} />
            Featured
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors mb-2.5">
            {project.title}
          </h3>

          <p className="text-sm text-[#A8A1A1] line-clamp-3 leading-relaxed mb-6">
            {project.description}
          </p>
        </div>

        <div>
          {/* Tech Badges */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {techList.slice(0, 4).map((tech) => (
              <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[#D1D1D1] font-mono">
                {tech}
              </span>
            ))}
            {techList.length > 4 && (
              <span className="text-xs px-2 py-1 rounded-md bg-[#080808] text-[#A8A1A1] font-mono">
                +{techList.length - 4}
              </span>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-xs font-mono text-[#A8A1A1] flex items-center gap-1">
              <Layers size={13} className="text-[#E51F2A]" />
              Interactive Prototype
            </span>
            <span className="text-xs font-bold text-[#E51F2A] group-hover:text-white flex items-center gap-1.5 transition-colors">
              <span>Inspect</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#E51F2A]" />
            </span>
          </div>
        </div>
      </div>

      {/* Glow Hover Accent */}
      <div className="absolute inset-0 rounded-2xl bg-radial from-[#E51F2A]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};
