import React from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectItem } from '../../types';
import { LayoutGrid, ListFilter } from 'lucide-react';

interface ProjectGridProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  viewMode?: 'grid' | 'list';
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onSelectProject,
  viewMode = 'grid',
}) => {
  if (projects.length === 0) {
    return (
      <div className="py-24 text-center rounded-2xl bg-[#111416]/50 border border-white/5 space-y-3">
        <LayoutGrid size={36} className="mx-auto text-[#A8A1A1]/40" />
        <h3 className="text-lg font-bold text-white">No Matching Projects Found</h3>
        <p className="text-xs text-[#A8A1A1] max-w-sm mx-auto">
          Try adjusting your search query or category filter to discover other engineering works in the portfolio.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
            viewMode="list"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={onSelectProject}
          viewMode="grid"
        />
      ))}
    </div>
  );
};
