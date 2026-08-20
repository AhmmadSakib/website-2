import React from 'react';
import { 
  ArrowRight, 
  Download, 
  Code2, 
  PenTool, 
  Box, 
  Lightbulb, 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Lock,
  Layers,
  Zap,
  Radio
} from 'lucide-react';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { PERSONAL_CONFIG, INITIAL_PROJECTS } from '../config/personalData';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAIModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAIModal }) => {
  return (
    <div className="min-h-screen text-[#F1F1F1] flex flex-col justify-between">
      
      {/* Background Cybernetic Grids and Ambient Red Glows */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] bg-[#65070B]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-[#8C0B12]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Hero Viewport Area */}
      <section className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 pt-8 lg:pt-0 overflow-hidden">
        
        {/* Sleek Interface 3D Geometric Stage & HUD Background */}
        <div className="absolute top-0 right-0 w-full lg:w-[650px] h-full pointer-events-none select-none">
          {/* Ambient red diffuse spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#E51F2A]/10 blur-[130px] rounded-full" />
          
          {/* Rotated wireframe square 1 */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rotate-[30deg] border border-[#ffffff08]" />
          
          {/* Rotated HUD square 2 with glowing red border corners */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[40%] w-[340px] h-[340px] rotate-[45deg] border border-[#E51F2A]/25 shadow-[0_0_40px_rgba(229,31,42,0.12)] bg-[#111416]/30 backdrop-blur-xs">
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#E51F2A]" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#E51F2A]" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 bg-gradient-to-tr from-[#111416] to-[#E51F2A] opacity-20 blur-xl" />
              <div className="relative w-36 h-36 border border-dashed border-[#ffffff10] rounded-full animate-pulse" />
              <div className="absolute w-16 h-16 bg-[#E51F2A] shadow-[0_0_60px_#E51F2A] opacity-10 rounded-full" />
            </div>
          </div>

          {/* Floating System Online telemetry badge */}
          <div className="hidden lg:flex absolute top-[18%] right-[8%] w-28 h-28 border border-[#ffffff10] backdrop-blur-md bg-[#080808]/60 transform rotate-6 flex-col items-center justify-center text-[10px] uppercase tracking-widest text-[#A8A1A1] shadow-xl">
            <span className="text-white font-mono font-bold mb-0.5">System</span>
            <span className="text-[#E51F2A] font-mono font-semibold">Active</span>
            <div className="mt-2 h-0.5 w-6 bg-[#E51F2A]" />
          </div>
        </div>

        {/* Hero Content Grid */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-12">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Top Label */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-6 h-[2px] bg-[#E51F2A]" />
              <span className="text-[#E51F2A] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase font-mono">
                Hey, I'm
              </span>
            </div>

            {/* Main Heading with Precision Professional Typography */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-[1.02] tracking-[-0.04em] font-heading">
              Ahmmad<br/>
              <span className="text-[#E51F2A] drop-shadow-[0_0_25px_rgba(229,31,42,0.3)]">
                Sakib
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-[#A8A1A1] font-medium tracking-tight mb-5">
              Developer • Designer • Problem Solver
            </p>

            {/* Description */}
            <p className="max-w-lg text-[#D1D1D1] text-sm sm:text-base leading-relaxed mb-8">
              I build modern, fast and secure digital experiences with clean code and creative design. Specializing in immersive full-stack solutions, spatial 3D interfaces, and zero-trust vault architectures.
            </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  id="hero-view-projects-btn"
                  onClick={() => onNavigate('/projects')}
                  className="bg-[#E51F2A] hover:bg-[#B5121B] text-white px-7 sm:px-9 py-3.5 font-bold tracking-wide transition-all shadow-[0_10px_25px_rgba(229,31,42,0.3)] hover:shadow-[0_15px_35px_rgba(229,31,42,0.45)] cursor-pointer text-xs sm:text-sm uppercase font-mono"
                >
                  VIEW PROJECTS
                </button>

                <button
                  id="hero-media-hub-btn"
                  onClick={() => onNavigate('/media')}
                  className="flex items-center gap-2 px-5 py-3.5 bg-[#111416] hover:bg-[#181c1f] text-white border border-white/20 hover:border-[#1DB954]/50 font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md group"
                >
                  <Radio size={15} className="text-[#1DB954] group-hover:animate-pulse" />
                  <span>MEDIA HUB</span>
                </button>

                <button
                  id="hero-download-cv-btn"
                  onClick={() => onNavigate('/vault')}
                  className="border border-white/80 hover:bg-white hover:text-[#080808] text-white px-7 sm:px-9 py-3.5 font-bold tracking-wide transition-all cursor-pointer text-xs sm:text-sm uppercase font-mono"
                >
                  DOWNLOAD CV
                </button>

                <button
                  id="hero-neural-ai-btn"
                  onClick={onOpenAIModal}
                  className="flex items-center gap-2 px-4 py-3.5 bg-[#111416] hover:bg-[#181c1f] text-[#E51F2A] border border-[#E51F2A]/30 font-mono text-xs font-bold transition-all cursor-pointer"
                  title="Ask AI Neural Agent (Ctrl+K)"
                >
                  <Sparkles size={15} />
                  <span>AI ASSISTANT</span>
                </button>
              </div>


          </div>

          {/* Right Column: 3D Hardware Accelerated Mesh */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <Cyber3DSystem variant="hero" />
          </div>

        </div>
      </section>

      {/* Sleek Services Section Bar */}
      <section className="relative bg-[#111416]/80 backdrop-blur-xl border-t border-white/10 px-4 sm:px-10 py-6 lg:py-0 lg:h-[150px] flex items-center">
        {/* Services Top Badge */}
        <div className="absolute top-0 left-6 sm:left-10 -translate-y-1/2 px-3.5 py-0.5 bg-[#E51F2A] text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_12px_#E51F2A]">
          Services
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-0 lg:divide-x divide-white/5">
          
          {/* Service 1 */}
          <div 
            onClick={() => onNavigate('/skills')}
            className="flex flex-col justify-center items-center group cursor-pointer p-3 hover:bg-white/5 transition-colors rounded-xl lg:rounded-none"
          >
            <Code2 className="w-7 h-7 text-[#A8A1A1] group-hover:text-[#E51F2A] mb-2 transition-colors" />
            <span className="text-xs font-bold tracking-wider text-[#D1D1D1] uppercase group-hover:text-white font-mono">
              Web Dev
            </span>
          </div>

          {/* Service 2 */}
          <div 
            onClick={() => onNavigate('/skills')}
            className="flex flex-col justify-center items-center group cursor-pointer p-3 hover:bg-white/5 transition-colors rounded-xl lg:rounded-none"
          >
            <PenTool className="w-7 h-7 text-[#A8A1A1] group-hover:text-[#E51F2A] mb-2 transition-colors" />
            <span className="text-xs font-bold tracking-wider text-[#D1D1D1] uppercase group-hover:text-white font-mono">
              UI/UX Design
            </span>
          </div>

          {/* Service 3 */}
          <div 
            onClick={() => onNavigate('/projects')}
            className="flex flex-col justify-center items-center group cursor-pointer p-3 hover:bg-white/5 transition-colors rounded-xl lg:rounded-none"
          >
            <Box className="w-7 h-7 text-[#A8A1A1] group-hover:text-[#E51F2A] mb-2 transition-colors" />
            <span className="text-xs font-bold tracking-wider text-[#D1D1D1] uppercase group-hover:text-white font-mono">
              3D Experience
            </span>
          </div>

          {/* Service 4 */}
          <div 
            onClick={() => onNavigate('/about')}
            className="flex flex-col justify-center items-center group cursor-pointer p-3 hover:bg-white/5 transition-colors rounded-xl lg:rounded-none"
          >
            <Lightbulb className="w-7 h-7 text-[#A8A1A1] group-hover:text-[#E51F2A] mb-2 transition-colors" />
            <span className="text-xs font-bold tracking-wider text-[#D1D1D1] uppercase group-hover:text-white font-mono">
              Problem Solver
            </span>
          </div>

          {/* Service 5 */}
          <div 
            onClick={() => onNavigate('/vault')}
            className="col-span-2 sm:col-span-1 flex flex-col justify-center items-center group cursor-pointer p-3 hover:bg-white/5 transition-colors rounded-xl lg:rounded-none"
          >
            <Zap className="w-7 h-7 text-[#A8A1A1] group-hover:text-[#E51F2A] mb-2 transition-colors" />
            <span className="text-xs font-bold tracking-wider text-[#D1D1D1] uppercase group-hover:text-white font-mono">
              Management
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};
