import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Mail, 
  Clock, 
  GraduationCap, 
  Award, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Download,
  Calendar
} from 'lucide-react';
import { PERSONAL_CONFIG, SKILL_CATEGORIES, TIMELINE_CONFIG, STATS_CONFIG } from '../config/personalData';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';

export const AboutPage: React.FC = () => {
  const [timelineFilter, setTimelineFilter] = useState<'All' | 'Experience' | 'Education' | 'Achievements'>('All');

  const filteredTimeline = TIMELINE_CONFIG.filter(
    (item) => timelineFilter === 'All' || item.type === timelineFilter
  );

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-12">
      <div className="w-full max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="relative pb-8 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111416] border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
              ABOUT ME
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-[-0.035em]">
              About <span className="text-[#E51F2A]">Me</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A8A1A1]">
              Get to know my engineering philosophy, background, and vision.
            </p>
          </div>

          <div className="shrink-0 hidden sm:block w-36 h-36">
            <Cyber3DSystem variant="minimal" height={130} />
          </div>
        </div>

        {/* Profile & Biography Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Side: Biography & Info Rows */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#111416]/90 border border-white/10 flex flex-col justify-between space-y-8 shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {PERSONAL_CONFIG.name}
                </h2>
                <div className="text-sm font-mono text-[#E51F2A]">
                  {PERSONAL_CONFIG.role}
                </div>
              </div>

              <p className="text-base text-[#D1D1D1] leading-relaxed">
                {PERSONAL_CONFIG.fullBio}
              </p>
            </div>

            {/* Information Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080808]/60 border border-white/5">
                <MapPin className="w-5 h-5 text-[#E51F2A] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-[#A8A1A1] uppercase font-mono">Location</div>
                  <div className="text-xs sm:text-sm font-medium text-white truncate">{PERSONAL_CONFIG.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080808]/60 border border-white/5">
                <Briefcase className="w-5 h-5 text-[#E51F2A] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-[#A8A1A1] uppercase font-mono">Experience</div>
                  <div className="text-xs sm:text-sm font-medium text-white truncate">5+ Years Industry</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080808]/60 border border-white/5">
                <Mail className="w-5 h-5 text-[#E51F2A] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-[#A8A1A1] uppercase font-mono">Email</div>
                  <div className="text-xs sm:text-sm font-medium text-white truncate">{PERSONAL_CONFIG.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080808]/60 border border-white/5">
                <Clock className="w-5 h-5 text-[#E51F2A] shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] text-[#A8A1A1] uppercase font-mono">Availability</div>
                  <div className="text-xs sm:text-sm font-medium text-white truncate">Immediate / Global</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: 3D Visual Architectural Core Node */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#111416]/90 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl">
            {/* Background Red Glow */}
            <div className="absolute inset-0 bg-radial from-[#8C0B12]/20 to-transparent blur-2xl pointer-events-none" />

            <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 bg-gradient-to-b from-[#E51F2A] to-white/10 mb-6 shadow-[0_0_40px_rgba(229,31,42,0.25)]">
              <div className="w-full h-full rounded-full bg-[#080808] flex flex-col items-center justify-center overflow-hidden border border-white/10">
                <Cyber3DSystem variant="about" height={190} />
              </div>
            </div>

            <div className="relative z-10 space-y-2 max-w-sm">
              <div className="text-lg font-heading font-bold text-white tracking-tight">
                Architectural Neural Core
              </div>
              <p className="text-xs text-[#A8A1A1] leading-relaxed">
                Signature geometric core running real-time WebGL spatial shaders. Reusable design system with dark ambient illumination and crimson transmission.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-mono text-[#E51F2A] bg-[#080808] px-3.5 py-1.5 rounded-full border border-white/10">
              <Sparkles size={12} />
              <span>NODE STATUS: ACTIVE</span>
            </div>
          </div>

        </div>

        {/* Technical Competencies / Skills Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest mb-1">CAPABILITIES</div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">Technical Arsenal</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKILL_CATEGORIES.map((catGroup) => (
              <div
                key={catGroup.category}
                className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-[#E51F2A]/40 transition-all shadow-lg"
              >
                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center justify-between">
                  <span>{catGroup.category}</span>
                  <Layers size={16} className="text-[#E51F2A]" />
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catGroup.skills.map((s) => (
                    <span
                      key={s.name}
                      className="px-3 py-1.5 rounded-xl bg-[#080808] border border-white/10 text-xs font-mono text-[#D1D1D1] hover:text-white hover:border-[#E51F2A]/50 transition-colors"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline / Experience & Education */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest mb-1">CHRONOLOGY</div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">Journey & Milestones</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111416] border border-white/10">
              {(['All', 'Experience', 'Education', 'Achievements'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimelineFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    timelineFilter === tab
                      ? 'bg-[#E51F2A] text-white shadow-[0_0_10px_#E51F2A]'
                      : 'text-[#A8A1A1] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredTimeline.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#111416]/80 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#E51F2A]/10 text-[#E51F2A] border border-[#E51F2A]/30 text-[10px] font-mono uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs font-mono text-[#A8A1A1]">{item.year}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-heading font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#A8A1A1]">{item.institution} • {item.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#E51F2A]">
                  <CheckCircle2 size={14} />
                  <span>VERIFIED RECORD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
