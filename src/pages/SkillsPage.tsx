import React from 'react';
import { Cpu, Terminal, Sparkles, Layers, ShieldCheck, Database, Layout, Code2 } from 'lucide-react';
import { SKILL_CATEGORIES } from '../config/personalData';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';

export const SkillsPage: React.FC = () => {
  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-12">
      <div className="w-full max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="relative pb-8 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111416] border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
              ENGINEERING DOMAIN
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-[-0.035em]">
              Skills & <span className="text-[#E51F2A]">Stack</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A8A1A1]">
              A breakdown of full-stack engineering, spatial 3D WebGL, AI integrations, and zero-trust cloud infrastructure.
            </p>
          </div>

          <div className="shrink-0 hidden sm:block w-32 h-32">
            <Cyber3DSystem variant="minimal" height={120} />
          </div>
        </div>

        {/* Skill Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SKILL_CATEGORIES.map((catGroup) => (
            <div
              key={catGroup.category}
              className="p-8 rounded-3xl bg-[#111416]/90 border border-white/10 hover:border-[#E51F2A]/50 transition-all duration-300 shadow-xl relative overflow-hidden group"
            >
              {/* Subtle top red line indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E51F2A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-white">
                  {catGroup.category}
                </h2>
                <div className="p-2 rounded-xl bg-[#080808] border border-white/10 text-[#E51F2A]">
                  <Cpu size={18} />
                </div>
              </div>

              <div className="space-y-4">
                {catGroup.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-white font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
                        {skill.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#A8A1A1] px-2 py-0.5 rounded bg-[#080808]">
                        {skill.level}
                      </span>
                    </div>

                    {/* Clean Horizontal Indicator without fake percentages */}
                    <div className="w-full h-1.5 rounded-full bg-[#080808] overflow-hidden border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          skill.level === 'Mastery'
                            ? 'w-full bg-[#E51F2A]'
                            : skill.level === 'Advanced'
                            ? 'w-4/5 bg-gradient-to-r from-[#8C0B12] to-[#E51F2A]'
                            : 'w-3/5 bg-[#8C0B12]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Principles Matrix */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111416] border border-white/10">
          <div className="max-w-xl mb-8">
            <div className="text-xs uppercase font-mono text-[#E51F2A] tracking-widest mb-1">DESIGN PHILOSOPHY</div>
            <h3 className="text-2xl font-heading font-bold text-white">Core Engineering Principles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#080808] border border-white/5 space-y-2">
              <div className="text-xs font-mono text-[#E51F2A]">01. TYPE SAFETY</div>
              <div className="text-base font-bold text-white">Strict TypeScript</div>
              <p className="text-xs text-[#A8A1A1] leading-relaxed">
                Zero untyped payloads. Comprehensive interface schemas from Firestore database to UI props.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080808] border border-white/5 space-y-2">
              <div className="text-xs font-mono text-[#E51F2A]">02. ZERO TRUST</div>
              <div className="text-base font-bold text-white">Attribute Access Control</div>
              <p className="text-xs text-[#A8A1A1] leading-relaxed">
                Security by default. Server-side authorization, immutable audit logs, and strict Firestore rules.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080808] border border-white/5 space-y-2">
              <div className="text-xs font-mono text-[#E51F2A]">03. 60FPS WEBGL</div>
              <div className="text-base font-bold text-white">Spatial Aesthetics</div>
              <p className="text-xs text-[#A8A1A1] leading-relaxed">
                Hardware-accelerated Three.js geometry optimized for ultra-smooth responsiveness across mobiles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080808] border border-white/5 space-y-2">
              <div className="text-xs font-mono text-[#E51F2A]">04. ADAPTIVE AI</div>
              <div className="text-base font-bold text-white">Gemini 2.5 Workflows</div>
              <p className="text-xs text-[#A8A1A1] leading-relaxed">
                Server-side LLM proxies keeping secrets hidden while augmenting UI intelligence and indexing.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
