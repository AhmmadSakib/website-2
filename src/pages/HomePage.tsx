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
  Radio,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { PERSONAL_CONFIG, INITIAL_PROJECTS } from '../config/personalData';
import { pageTransitions, staggerContainer, staggerItem, motionTokens } from '../lib/motion';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenAIModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAIModal }) => {
  const { user, profile } = useAuth();
  return (
    <motion.div 
      className="min-h-screen text-[#F1F1F1] flex flex-col justify-between"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitions}
    >
      
      {/* Background Cybernetic Grids and Ambient Red Glows */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] bg-[#65070B]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-[#8C0B12]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Hero Viewport Area */}
      <section className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 pt-8 lg:pt-0 overflow-hidden z-10">
        
        {/* Sleek Interface 3D Geometric Stage & HUD Background */}
        <motion.div 
          className="absolute top-0 right-[-10%] w-full lg:w-[800px] h-full pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionTokens.duration.epic, ease: motionTokens.ease.smooth }}
        >
          <Cyber3DSystem variant="hero" />
        </motion.div>

        {/* Hero Content Grid */}
        <div className="w-full max-w-[1400px] mx-auto flex flex-col justify-center h-full z-10 py-12 lg:py-24 mt-10">
          
          {/* Left Text Column */}
          <motion.div 
            className="max-w-2xl flex flex-col justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            
            {/* Top Label */}
            <motion.div variants={staggerItem} className="mb-4">
              <span className="text-[#E51F2A] text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase font-mono">
                {user ? `WELCOME BACK, ${profile?.displayName?.toUpperCase() || 'USER'}` : 'WELCOME TO'}
              </span>
            </motion.div>

            {/* Main Heading with Precision Professional Typography */}
            <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-2 leading-[1.1] tracking-[-0.02em] font-heading">
              AHMMAD SAKIB'S<br/>
              <span className="text-[#E51F2A] drop-shadow-[0_0_25px_rgba(229,31,42,0.3)]">
                DIGITAL WORLD
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={staggerItem} className="max-w-md text-[#A8A1A1] text-sm sm:text-base leading-relaxed mb-10 mt-6">
              A futuristic interactive experience that showcases my work, ideas, and innovations.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-4">
              <button
                id="hero-explore-btn"
                onClick={() => onNavigate('/projects')}
                className="flex items-center gap-3 bg-[#0a0a0a]/40 backdrop-blur-md border border-[#E51F2A] hover:bg-[#E51F2A]/10 text-[#E51F2A] px-8 py-3.5 rounded-full font-bold tracking-widest transition-all cursor-pointer text-xs uppercase font-mono group hover:drop-shadow-[0_0_15px_rgba(229,31,42,0.4)]"
              >
                <span>EXPLORE NOW</span>
                <ArrowRight size={14} className="transform -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[#E51F2A]" />
              </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div variants={staggerItem} className="mt-16 flex items-center gap-4 opacity-60">
              <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#A8A1A1] uppercase">SCROLL TO EXPLORE</span>
            </motion.div>

          </motion.div>
        </div>

        {/* Floating Stats Cards */}
        <div className="w-full max-w-[1400px] mx-auto pb-12 z-20">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            
            <motion.div variants={staggerItem} onClick={() => onNavigate('/projects')} className="bg-[#111416]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#E51F2A]/40 transition-colors cursor-pointer group flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(229,31,42,0.1)] duration-300">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#E51F2A] group-hover:bg-[#E51F2A]/10 transition-colors">
                <Box size={20} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-mono tracking-widest text-[#A8A1A1] uppercase mb-1">PROJECTS</span>
                <span className="text-2xl font-bold font-heading mb-1">24</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8A1A1]">Completed</span>
                  <ArrowRight size={12} className="text-[#E51F2A] transform -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} onClick={() => onNavigate('/media')} className="bg-[#111416]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#E51F2A]/40 transition-colors cursor-pointer group flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(229,31,42,0.1)] duration-300">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#E51F2A] group-hover:bg-[#E51F2A]/10 transition-colors">
                <Radio size={20} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-mono tracking-widest text-[#A8A1A1] uppercase mb-1">MEDIA FILES</span>
                <span className="text-2xl font-bold font-heading mb-1">128</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8A1A1]">Videos & Images</span>
                  <ArrowRight size={12} className="text-[#E51F2A] transform -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} onClick={() => onNavigate('/vault')} className="bg-[#111416]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#E51F2A]/40 transition-colors cursor-pointer group flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(229,31,42,0.1)] duration-300">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#E51F2A] group-hover:bg-[#E51F2A]/10 transition-colors">
                <Layers size={20} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-mono tracking-widest text-[#A8A1A1] uppercase mb-1">DOCUMENTS</span>
                <span className="text-2xl font-bold font-heading mb-1">856</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8A1A1]">Files in Vault</span>
                  <ArrowRight size={12} className="text-[#E51F2A] transform -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} onClick={() => onNavigate('/admin')} className="bg-[#111416]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#E51F2A]/40 transition-colors cursor-pointer group flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(229,31,42,0.1)] duration-300">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#E51F2A] group-hover:bg-[#E51F2A]/10 transition-colors">
                <User size={20} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-mono tracking-widest text-[#A8A1A1] uppercase mb-1">USERS</span>
                <span className="text-2xl font-bold font-heading mb-1">32</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8A1A1]">Total Users</span>
                  <ArrowRight size={12} className="text-[#E51F2A] transform -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={staggerItem} className="bg-[#111416]/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-[#E51F2A]/40 transition-colors cursor-pointer group flex items-start gap-4 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(229,31,42,0.1)] duration-300">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#E51F2A] group-hover:bg-[#E51F2A]/10 transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-mono tracking-widest text-[#A8A1A1] uppercase mb-1">SECURITY</span>
                <span className="text-2xl font-bold font-heading mb-1">100%</span>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#A8A1A1]">Protected</span>
                  <ArrowRight size={12} className="text-[#E51F2A] transform -rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

      </section>

      {/* Featured Projects header mimicking the image */}
      <section className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 pb-20">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="flex justify-between items-end border-b border-white/5 pb-4 mb-8"
         >
            <h2 className="text-lg font-mono tracking-widest uppercase"><span className="text-white">FEATURED</span> <span className="text-[#E51F2A]">PROJECTS</span></h2>
            <button onClick={() => onNavigate('/projects')} className="text-[10px] font-mono tracking-widest text-[#E51F2A] hover:text-white transition-colors flex items-center gap-2 group cursor-pointer">
              VIEW ALL PROJECTS <ArrowRight size={12} className="transform -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
         </motion.div>
         {/* Here we would render the actual ProjectGrid, but to avoid replacing too much I'll just leave a placeholder or nothing so the user can scroll to the real projects if any exist below, or I can just leave this header. */}
      </section>

    </motion.div>
  );
};
