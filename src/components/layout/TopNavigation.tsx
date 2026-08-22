import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Briefcase, 
  Cpu, 
  Award, 
  Lock, 
  Mail, 
  Github, 
  Linkedin, 
  Instagram, 
  Sparkles, 
  ShieldCheck, 
  Menu, 
  X,
  LogOut,
  LogIn,
  LayoutDashboard,
  Settings,
  Radio,
  Music
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PERSONAL_CONFIG } from '../../config/personalData';

interface TopNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAIModal: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ 
  currentPath, 
  onNavigate, 
  onOpenAIModal 
}) => {
  const { user, profile, role, isOwner, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'About', path: '/about', icon: User },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Media', path: '/media', icon: Radio },
    { name: 'Skills', path: '/skills', icon: Cpu },
    { name: 'Certs', path: '/certificates', icon: Award },
    { name: 'Vault', path: '/vault', icon: Lock },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  if (user || profile) {
    navItems.splice(1, 0, { name: 'Portal', path: '/dashboard', icon: LayoutDashboard });
  }

  if (isOwner()) {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111416]/95 backdrop-blur-md border-b border-[#ffffff10] z-50 px-4 flex items-center justify-between">
        <button
          id="mobile-logo-btn"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full border border-[#E51F2A] flex items-center justify-center group-hover:bg-[#E51F2A]/10 transition-colors">
            <span className="text-sm font-bold text-[#E51F2A] tracking-tighter">AS</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="mobile-ai-trigger-btn"
            onClick={onOpenAIModal}
            aria-label="Open AI Neural Node"
            className="p-2 rounded-lg bg-[#080808] text-[#E51F2A] border border-[#E51F2A]/30 cursor-pointer"
          >
            <Sparkles size={18} />
          </button>
          
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg bg-[#080808] text-white border border-[#ffffff10] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#080808]/95 backdrop-blur-xl z-40 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#A8A1A1] font-mono mb-2">Navigation Nodes</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  id={`mobile-nav-${item.name.toLowerCase()}`}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/40' 
                      : 'text-[#D1D1D1] bg-[#111416] border border-white/5 hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-[#E51F2A]' : 'text-[#A8A1A1]'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#A8A1A1]">
              <span>Identity Tier:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${user ? 'bg-[#E51F2A]/20 text-[#E51F2A]' : 'bg-white/10 text-white'}`}>
                {role}
              </span>
            </div>
            
            {user ? (
              <button
                id="mobile-signout-btn"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#111416] border border-white/10 text-xs text-[#D1D1D1] hover:text-white cursor-pointer"
              >
                <LogOut size={16} /> Sign Out ({profile?.displayName?.split(' ')[0] || 'User'})
              </button>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={() => handleNavClick('/login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#E51F2A] text-xs font-semibold text-white cursor-pointer"
              >
                <LogIn size={16} /> Access Digital Vault
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sleek Top Navigation */}
      <nav 
        aria-label="Top Navigation"
        className="hidden lg:flex fixed top-0 left-0 right-0 h-28 items-start pt-5 justify-between px-10 z-50 select-none bg-gradient-to-b from-[#050505] to-transparent pointer-events-none"
      >
        {/* Left: Logo & Brand (pointer-events-auto) */}
        <div className="flex items-center gap-4 pointer-events-auto cursor-pointer group" onClick={() => onNavigate('/')}>
          <div className="w-12 h-12 rounded-full border border-[#E51F2A] flex items-center justify-center group-hover:bg-[#E51F2A]/10 transition-colors shadow-[0_0_15px_rgba(229,31,42,0.15)]">
            <span className="text-lg font-bold text-[#E51F2A] tracking-tighter">AS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.1em] text-white">AHMMAD SAKIB</span>
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#E51F2A]">DIGITAL WORLD</span>
          </div>
        </div>

        {/* Center: Navigation Pill (pointer-events-auto) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-5 flex items-center px-6 py-2.5 rounded-full bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 pointer-events-auto shadow-2xl transition-all duration-300 hover:bg-[#0a0a0a]/50">
          <div className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  id={`desktop-nav-${item.name.toLowerCase()}`}
                  onClick={() => onNavigate(item.path)}
                  className={`relative px-4 py-2 rounded-full text-[11px] font-mono tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer group hover:-translate-y-[2px] ${
                    isActive ? 'text-[#E51F2A]' : 'text-[#A8A1A1] hover:text-[#E51F2A] hover:drop-shadow-[0_0_8px_rgba(229,31,42,0.5)]'
                  }`}
                >
                  {/* Glowing Red Dot/Line for Active State underneath */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-[2px] bg-[#E51F2A] rounded-full shadow-[0_0_8px_#E51F2A]" />
                  )}
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Controls & User (pointer-events-auto) */}
        <div className="flex items-center gap-5 pointer-events-auto">
          {/* Admin / Control Center Button */}
          {isOwner() && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-5 py-2.5 rounded-full bg-[#111416]/60 backdrop-blur-md border border-[#E51F2A]/30 text-[#E51F2A] text-[10px] font-mono tracking-widest uppercase hover:bg-[#E51F2A]/10 hover:border-[#E51F2A]/60 transition-colors cursor-pointer shadow-[0_0_15px_rgba(229,31,42,0.1)]"
            >
              Control Center
            </button>
          )}

          {/* AI Neural Node Trigger */}
          {!isOwner() && (
            <button
              onClick={onOpenAIModal}
              className="px-5 py-2 rounded-full border border-white/20 text-[#A8A1A1] text-[10px] font-mono tracking-widest uppercase hover:border-[#E51F2A] hover:text-[#E51F2A] transition-colors cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={12} />
              AI Agent
            </button>
          )}

          {/* User Profile / Login */}
          <div className="flex items-center cursor-pointer bg-[#0a0a0a]/40 border border-white/10 rounded-full p-1.5 pr-5 backdrop-blur-xl hover:border-[#E51F2A]/40 transition-colors shadow-lg" onClick={() => user ? onNavigate('/dashboard') : onNavigate('/login')}>
            <div className="w-8 h-8 rounded-full bg-[#181c1f] overflow-hidden flex items-center justify-center mr-3 border border-white/10">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-[#A8A1A1]" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white tracking-wide leading-tight">
                {profile?.displayName?.split(' ')[0] || (user ? 'Authenticated' : 'Guest User')}
              </span>
              <span className="text-[9px] font-mono tracking-[0.1em] text-[#E51F2A] uppercase">
                {role || 'Viewer'}
              </span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
