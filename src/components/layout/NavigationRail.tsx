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

interface NavigationRailProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAIModal: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ 
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
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-2xl font-bold text-[#E51F2A] tracking-tighter">AS</span>
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

      {/* Desktop Sleek Interface Vertical Navigation Rail */}
      <nav 
        aria-label="Sidebar Navigation"
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[90px] bg-[#111416] border-r border-[#ffffff10] flex-col items-center py-8 z-50 select-none"
      >
        {/* Top AS Logo */}
        <div className="mb-10">
          <button
            id="desktop-logo-btn"
            onClick={() => onNavigate('/')}
            className="text-2xl font-bold text-[#E51F2A] tracking-tighter hover:opacity-80 transition-opacity cursor-pointer block"
            title="Ahmmad Sakib — Home"
          >
            AS
          </button>
        </div>

        {/* Center Navigation Icons Stack */}
        <div className="flex-1 flex flex-col space-y-8 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                id={`rail-nav-${item.name.toLowerCase()}`}
                onClick={() => onNavigate(item.path)}
                className={`group cursor-pointer relative flex flex-col items-center justify-center p-2 transition-colors ${
                  isActive ? 'text-[#E51F2A]' : 'text-[#A8A1A1] hover:text-[#E51F2A]'
                }`}
                title={item.name}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <div className="absolute -left-4 w-1 h-6 bg-[#E51F2A] rounded-full shadow-[0_0_10px_#E51F2A]" />
                )}
                
                <Icon size={24} className="transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-mono tracking-tight mt-1 opacity-70">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom System Controls & Social Links */}
        <div className="mt-auto flex flex-col space-y-6 items-center">
          {/* AI Assistant Node Trigger */}
          <button
            id="rail-ai-node-btn"
            onClick={onOpenAIModal}
            className="text-[#E51F2A] hover:opacity-80 transition-opacity cursor-pointer p-1"
            title="AI Neural Assistant (Ctrl+K)"
          >
            <Sparkles size={20} />
          </button>

          {/* Social Icons with Sleek 40% Opacity */}
          <div className="flex flex-col space-y-5 opacity-40 hover:opacity-100 transition-opacity items-center">
            <a
              id="rail-github-link"
              href={PERSONAL_CONFIG.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E51F2A] transition-colors"
              title="GitHub"
            >
              <Github size={18} />
            </a>

            <a
              id="rail-linkedin-link"
              href={PERSONAL_CONFIG.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E51F2A] transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>

            <a
              id="rail-instagram-link"
              href={PERSONAL_CONFIG.instagram}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E51F2A] transition-colors"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>

          {/* Auth indicator dot */}
          <button
            id="rail-auth-status-btn"
            onClick={() => onNavigate('/login')}
            className={`w-2.5 h-2.5 rounded-full border transition-all cursor-pointer ${
              user 
                ? 'bg-[#E51F2A] border-[#E51F2A] shadow-[0_0_8px_#E51F2A]' 
                : 'bg-[#080808] border-white/30 hover:border-white'
            }`}
            title={user ? `Tier: ${role}` : 'Login'}
          />
        </div>
      </nav>
    </>
  );
};
