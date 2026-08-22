import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { TopNavigation } from './components/layout/TopNavigation';
import { CommandPalette } from './components/common/CommandPalette';
import { CustomCursor } from './components/common/CustomCursor';
import { InitialLoadingScreen } from './components/common/InitialLoadingScreen';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { VaultPage } from './pages/VaultPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AuthPendingPage } from './pages/AuthPendingPage';
import { AuthDeniedPage } from './pages/AuthDeniedPage';
import { AuthSuspendedPage } from './pages/AuthSuspendedPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AdminFilesPage } from './pages/AdminFilesPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import { SakibAIPage } from './pages/SakibAIPage';
import { MediaHubPage } from './pages/MediaHubPage';
import { NeuralNodeModal } from './components/ai/NeuralNodeModal';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { user, profile, loading, role, status } = useAuth();

  // Sync with browser history and handle popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to launch AI Neural Node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAIModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route Guards
  useEffect(() => {
    if (loading) return; // Wait for Auth
    
    // Explicit public portfolio & auth routes
    const isPublic = [
      '/',
      '/about',
      '/projects',
      '/media',
      '/streams',
      '/skills',
      '/certificates',
      '/contact',
      '/vault',
      '/login',
      '/signup',
      '/forgot-password'
    ].some(
      (p) =>
        currentPath === p ||
        currentPath.startsWith('/projects/') ||
        currentPath.startsWith('/media') ||
        currentPath.startsWith('/streams') ||
        currentPath.startsWith('/about') ||
        currentPath.startsWith('/skills') ||
        currentPath.startsWith('/certificates') ||
        currentPath.startsWith('/contact')
    );

    const isAuthPage = currentPath.startsWith('/auth/');
    const isPrivate = !isPublic && !isAuthPage;
    const hasSession = Boolean(user || profile);

    if (!hasSession && isPrivate) {
      navigateTo('/login');
      return;
    }

    if (hasSession && status) {
      if (isPrivate) {
        if (status === 'pending') {
          navigateTo('/auth/pending');
          return;
        }
        if (status === 'denied') {
          navigateTo('/auth/denied');
          return;
        }
        if (status === 'suspended' || status === 'disabled') {
          navigateTo('/auth/suspended');
          return;
        }
      }
    }
  }, [user, profile, loading, status, currentPath]);

  const renderActivePage = () => {
    // Specific Nested Routes
    if (currentPath === '/admin/files') {
      if (!loading && role !== 'OWNER') return <div className="p-10">Access Denied</div>;
      return <AdminFilesPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/admin/projects') {
      if (!loading && role !== 'OWNER') return <div className="p-10">Access Denied</div>;
      return <AdminProjectsPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/admin/media' || currentPath === '/admin/streams') {
      if (!loading && role !== 'OWNER') return <div className="p-10">Access Denied</div>;
      return <AdminMediaPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/vault/ai') {
      return <SakibAIPage onNavigate={navigateTo} />;
    }

    // Top-Level Routes
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigateTo} onOpenAIModal={() => setIsAIModalOpen(true)} />;
    }
    if (currentPath.startsWith('/about')) {
      return <AboutPage />;
    }
    if (currentPath.startsWith('/projects')) {
      const parts = currentPath.split('/');
      const slug = parts[2];
      return <ProjectsPage initialSlug={slug} onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/media') || currentPath.startsWith('/streams')) {
      return <MediaHubPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/skills')) {
      return <SkillsPage />;
    }
    if (currentPath.startsWith('/certificates')) {
      return <CertificatesPage />;
    }
    if (currentPath.startsWith('/vault')) {
      const parts = currentPath.split('/');
      const subfolder = parts[2] || 'all';
      return <VaultPage initialFolderSlug={subfolder} onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/contact')) {
      return <ContactPage />;
    }
    if (currentPath.startsWith('/dashboard')) {
      return <DashboardPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/settings')) {
      return <SettingsPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/signup')) {
      return <SignupPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/forgot-password')) {
      return <ForgotPasswordPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/auth/pending')) {
      return <AuthPendingPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/auth/denied')) {
      return <AuthDeniedPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/auth/suspended')) {
      return <AuthSuspendedPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/login')) {
      return <LoginPage onNavigate={navigateTo} />;
    }
    if (currentPath.startsWith('/admin')) {
      if (!loading && role !== 'OWNER') return <div className="p-10 text-center flex flex-col justify-center items-center h-full"><span className="text-red-500 text-6xl">403</span><br />Access Denied</div>;
      return <AdminPage />;
    }

    // 404
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-24 text-center px-4 space-y-6">
        <h1 className="text-6xl font-heading font-extrabold text-[#E51F2A]">404</h1>
        <p className="text-[#A8A1A1] font-mono text-sm max-w-sm">Lost in the digital world. The requested sector does not exist or has been restricted.</p>
        <button onClick={() => navigateTo('/')} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors cursor-pointer">
          RETURN HOME
        </button>
      </div>
    );
  };

  const isAuthView = ['/login', '/signup', '/forgot-password'].includes(currentPath) || currentPath.startsWith('/auth/');

  return (
    <>
      {isInitialLoading && (
        <InitialLoadingScreen onComplete={() => setIsInitialLoading(false)} />
      )}

      <div className="min-h-screen bg-[#050505] text-white flex overflow-x-hidden selection:bg-[#E51F2A] selection:text-white">
        <CustomCursor />
        <CommandPalette onNavigate={navigateTo} />

        {!isAuthView && (
          <TopNavigation
            currentPath={currentPath}
            onNavigate={navigateTo}
            onOpenAIModal={() => setIsAIModalOpen(true)}
          />
        )}

        <main className={`flex-1 w-full min-h-screen flex flex-col justify-between ${!isAuthView ? 'pl-0 pt-16 lg:pt-24' : 'p-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPath.split('/')[1] || 'home'} 
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>

          {!isAuthView && (
            <footer className="py-6 px-8 border-t border-white/5 bg-[#050505] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8A1A1] font-mono gap-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
                <span>AHMMAD SAKIB • DIGITAL WORLD VAULT</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateTo('/vault/ai')}
                  className="text-[#D1D1D1] hover:text-[#E51F2A] transition-colors cursor-pointer"
                >
                  SAKIB AI ASSISTANT
                </button>
                <span>•</span>
                <span>ZERO-TRUST ARCHITECTURE</span>
                <span>•</span>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="text-[#E51F2A] hover:underline cursor-pointer"
                >
                  NEURAL NODE (CTRL+K)
                </button>
              </div>
            </footer>
          )}
        </main>

        <NeuralNodeModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
        />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <AppContent />
      </PermissionsProvider>
    </AuthProvider>
  );
}
