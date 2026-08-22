import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder, Video, Github, AppWindow, ArrowRight, X, LayoutDashboard, Database, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, INITIAL_MEDIA_LINKS } from '../../config/personalData';
import { AnimatePresence, motion } from 'motion/react';

interface CommandPaletteProps {
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { user, isOwner } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    onNavigate(path);
  };

  const getResults = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    
    const results = [];

    // Search Pages
    const pages = [
      { name: 'Home', path: '/', icon: AppWindow },
      { name: 'About', path: '/about', icon: Folder },
      { name: 'Projects', path: '/projects', icon: Github },
      { name: 'Media Hub', path: '/media', icon: Video },
      { name: 'Vault', path: '/vault', icon: Lock },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];
    
    if (isOwner()) {
      pages.push({ name: 'Admin Control Center', path: '/admin', icon: Database });
    }

    pages.forEach((p) => {
      if (p.name.toLowerCase().includes(q)) {
        results.push({ ...p, type: 'Page' });
      }
    });

    // Search Projects
    INITIAL_PROJECTS.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        results.push({ name: p.title, path: `/projects/${p.slug}`, icon: Github, type: 'Project' });
      }
    });

    // Search Media
    INITIAL_MEDIA_LINKS.forEach((m) => {
      if (m.title.toLowerCase().includes(q)) {
        results.push({ name: m.title, path: `/media?search=${encodeURIComponent(m.title)}`, icon: Video, type: 'Media' });
      }
    });

    return results;
  };

  const results = getResults();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-[90%] max-w-xl bg-[#111416] border border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-[#E51F2A]/10"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search size={18} className="text-[#E51F2A]" />
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, media, files, and pages..."
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm font-mono focus:outline-none"
              />
              <button onClick={() => setIsOpen(false)} className="text-[#A8A1A1] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {searchQuery && results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm font-mono text-[#A8A1A1]">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-2">
                  {results.map((res, i) => {
                    const Icon = res.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSelect(res.path)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#E51F2A]/10 text-left transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className="text-[#A8A1A1] group-hover:text-[#E51F2A]" />
                          <div>
                            <div className="text-sm font-mono text-white">{res.name}</div>
                            <div className="text-[10px] text-[#A8A1A1] font-mono uppercase tracking-wider">{res.type}</div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white/20 group-hover:text-[#E51F2A] transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 bg-black border-t border-white/5 text-[10px] font-mono text-[#A8A1A1] flex items-center justify-between">
              <span>Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white/10 rounded">K</kbd> to open</span>
              <span>DIGITAL WORLD SEARCH</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
