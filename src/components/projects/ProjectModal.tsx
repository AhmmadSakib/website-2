import React from 'react';
import { X, ExternalLink, Github, Layers, Globe } from 'lucide-react';
import { ProjectItem } from '../../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  const cover = project.coverImage || (project as any).imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
  const techList = project.technologies || (project as any).tags || [];
  const demo = project.demoUrl || (project as any).liveUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080808]/85 backdrop-blur-xl transition-opacity cursor-pointer"
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111416] border border-white/15 shadow-[0_0_50px_rgba(229,31,42,0.25)] flex flex-col z-10"
      >
        {/* Header Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#080808]">
          <img
            src={cover}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111416] via-[#111416]/40 to-transparent" />
          
          <button
            id="close-project-modal-btn"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-[#080808]/80 text-white border border-white/20 hover:bg-[#E51F2A] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-lg bg-[#E51F2A] text-white text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_#E51F2A]">
              {project.category}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-3">
              {project.title}
            </h2>
            <p className="text-base sm:text-lg text-[#D1D1D1] leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          {/* Tech Stack Details */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-mono text-[#A8A1A1] mb-3 flex items-center gap-2">
              <Layers size={14} className="text-[#E51F2A]" />
              ENGINEERING STACK & ARCHITECTURE
            </h3>
            <div className="flex flex-wrap gap-2">
              {techList.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-xl bg-[#080808] border border-white/10 text-xs sm:text-sm font-mono text-[#F1F1F1]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
            {demo && (
              <a
                id="modal-live-link"
                href={demo}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)] cursor-pointer text-sm"
              >
                <Globe size={16} />
                <span>Launch Live Interface</span>
                <ExternalLink size={14} />
              </a>
            )}

            {project.githubUrl && (
              <a
                id="modal-github-link"
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#181c1f] hover:bg-white/10 text-white border border-white/15 font-medium transition-all cursor-pointer text-sm"
              >
                <Github size={16} />
                <span>View Source Code</span>
              </a>
            )}

            <button
              id="modal-dismiss-btn"
              onClick={onClose}
              className="ml-auto px-6 py-3 rounded-xl bg-transparent hover:bg-white/5 text-[#A8A1A1] hover:text-white text-sm transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
