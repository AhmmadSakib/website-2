import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  FileText, 
  Folder, 
  Layers, 
  Award, 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  ArrowRight,
  ExternalLink,
  Cpu,
  User
} from 'lucide-react';
import { AIMessage, ProjectItem, VaultFileItem, CertificateItem } from '../types';
import { INITIAL_PROJECTS, INITIAL_VAULT_FILES, INITIAL_CERTIFICATES } from '../config/personalData';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import { FilePreviewModal } from '../components/vault/FilePreviewModal';
import { db, collection, onSnapshot } from '../lib/firebase';

interface SakibAIPageProps {
  onNavigate: (path: string) => void;
}

export const SakibAIPage: React.FC<SakibAIPageProps> = ({ onNavigate }) => {
  const { user, profile, role, isOwner, canRead } = useAuth();
  const { hasPermission, logActivity } = usePermissions();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Greetings. I am Sakib AI, operating under Zero-Trust knowledge base protocols. I can summarize documents, explain project architectures, find files, and answer questions based strictly on the resources authorized for your security tier (${role}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Raw knowledge state
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [files, setFiles] = useState<VaultFileItem[]>(INITIAL_VAULT_FILES);
  const [certificates, setCertificates] = useState<CertificateItem[]>(INITIAL_CERTIFICATES);

  // File preview modal for citations
  const [previewFile, setPreviewFile] = useState<VaultFileItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sync projects and files from Firestore (if available)
  useEffect(() => {
    try {
      const unsubP = onSnapshot(
        collection(db, 'projects'),
        (snap) => {
          if (!snap.empty) {
            const list: ProjectItem[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ProjectItem));
            setProjects(list);
          }
        },
        (err) => {
          console.warn('[AI KNOWLEDGE BASE - PROJECTS] Local state fallback active:', err.message);
        }
      );
      const unsubF = onSnapshot(
        collection(db, 'files'),
        (snap) => {
          if (!snap.empty) {
            const list: VaultFileItem[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...d.data() } as VaultFileItem));
            setFiles(list);
          }
        },
        (err) => {
          console.warn('[AI KNOWLEDGE BASE - FILES] Local state fallback active:', err.message);
        }
      );
      return () => {
        unsubP();
        unsubF();
      };
    } catch (e) {
      console.warn('Using local knowledge base state');
    }
  }, []);

  // Compute strictly authorized resources for the current user
  const getAuthorizedContext = () => {
    // 1. Filter authorized projects
    const authorizedProjects = projects.filter((p) => {
      if (isOwner()) return true;
      if (p.visibility === 'PUBLIC') return true;
      return hasPermission(p.id, 'PROJECT', 'READ');
    });

    // 2. Filter authorized files (excluding trash)
    const authorizedFiles = files.filter((f) => {
      if (f.isTrash) return false;
      if (isOwner()) return true;
      if (f.visibility === 'PUBLIC') return true;
      return hasPermission(f.id, 'FILE', 'READ') || canRead(f.visibility, f.ownerId);
    });

    // 3. Filter authorized certificates
    const authorizedCerts = certificates.filter((c) => {
      if (isOwner()) return true;
      if (c.visibility === 'PUBLIC' || !c.visibility) return true;
      return hasPermission(c.id, 'CERTIFICATE', 'READ');
    });

    return {
      userRole: role,
      userEmail: profile?.email || 'guest@digitalworld.internal',
      projects: authorizedProjects.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        technologies: p.technologies || (p as any).tags || [],
        description: p.description,
        longDescription: p.longDescription,
      })),
      files: authorizedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        folderId: f.folderId,
        contentPreview: f.contentPreview,
        tags: f.tags,
      })),
      certificates: authorizedCerts.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        category: c.category,
        skills: c.skills,
        description: c.description,
      })),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const authorizedContext = getAuthorizedContext();
    logActivity('AI_QUERY', profile?.email || 'guest', `QUERY:${query.slice(0, 40)}`, `Evaluated with ${authorizedContext.projects.length} projects and ${authorizedContext.files.length} files.`);

    try {
      const response = await fetch('/api/ai/sakib-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages,
          authorizedContext,
        }),
      });

      const data = await response.json();
      const assistantMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis completed with no further parameters.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI query transmission error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Security perimeter encountered a network error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceClick = (source: { type: string; id: string; title: string }) => {
    if (source.type === 'FILE') {
      const matched = files.find((f) => f.id === source.id || f.name === source.title);
      if (matched) {
        setPreviewFile(matched);
      } else {
        alert(`Source file: ${source.title}`);
      }
    } else if (source.type === 'PROJECT') {
      const matched = projects.find((p) => p.id === source.id || p.title === source.title);
      if (matched) {
        onNavigate(`/projects/${matched.slug}`);
      } else {
        onNavigate('/projects');
      }
    } else if (source.type === 'CERTIFICATE') {
      onNavigate('/certificates');
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: 'new-session-msg',
        sender: 'assistant',
        text: `New conversation initiated under Zero-Trust tier (${role}). How can I assist you with Ahmmad Sakib's knowledge base?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    'Find my projects involving Python',
    'Summarize the 2026 Architecture Whitepaper',
    'What certifications relate to Cloud and AI?',
    'Show videos and 3D animations in the vault',
  ];

  const authCtx = getAuthorizedContext();

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#111416] border border-[#E51F2A]/40 flex items-center justify-center text-[#E51F2A] shadow-[0_0_20px_rgba(229,31,42,0.25)]">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-heading font-black text-white">SAKIB AI</h1>
                <span className="px-2 py-0.5 rounded-full bg-[#E51F2A]/15 border border-[#E51F2A]/30 text-[10px] font-mono text-[#E51F2A] font-bold">
                  GEMINI 3.7
                </span>
              </div>
              <p className="text-xs text-[#A8A1A1]">
                Zero-Trust Contextual Knowledge Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Security Clearance Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111416] border border-white/10 text-xs font-mono">
              <ShieldCheck size={14} className="text-[#E51F2A]" />
              <span className="text-[#A8A1A1]">CLEARANCE:</span>
              <span className="text-white font-bold">{role}</span>
            </div>

            <button
              onClick={handleClearConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181c1f] hover:bg-white/10 border border-white/10 text-xs font-mono text-[#A8A1A1] hover:text-white transition-all cursor-pointer"
              title="Reset Chat Session"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Security Pre-Filtering Diagnostics Bar */}
        <div className="p-3.5 rounded-2xl bg-[#111416]/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A8A1A1]">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-[#E51F2A]" />
            <span>AUTHENTICATED CONTEXT WINDOW:</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Projects: <strong className="text-white">{authCtx.projects.length}</strong></span>
            <span>•</span>
            <span>Vault Files: <strong className="text-white">{authCtx.files.length}</strong></span>
            <span>•</span>
            <span>Certificates: <strong className="text-white">{authCtx.certificates.length}</strong></span>
          </div>
        </div>

        {/* Chat Stream Window */}
        <div className="h-[520px] rounded-3xl bg-[#111416]/90 border border-white/10 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl relative">
          
          <div className="space-y-6 overflow-y-auto pr-2">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isAssistant ? 'items-start' : 'items-end flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold border ${
                      isAssistant
                        ? 'bg-[#080808] border-[#E51F2A]/40 text-[#E51F2A]'
                        : 'bg-[#E51F2A] border-transparent text-white'
                    }`}
                  >
                    {isAssistant ? <Bot size={15} /> : <User size={15} />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-xl space-y-2 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-[#080808]/90 border border-white/10 text-[#F1F1F1]'
                        : 'bg-[#1e2327] text-white border border-white/15'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Source Citations & References */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-white/10 space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-[#E51F2A] font-bold tracking-wider">
                          VERIFIED CITATIONS:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => handleSourceClick(src)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111416] hover:bg-white/10 border border-white/15 text-[11px] font-mono text-white transition-colors cursor-pointer group"
                            >
                              {src.type === 'FILE' && <FileText size={12} className="text-[#E51F2A]" />}
                              {src.type === 'PROJECT' && <Layers size={12} className="text-[#E51F2A]" />}
                              {src.type === 'CERTIFICATE' && <Award size={12} className="text-[#E51F2A]" />}
                              <span className="group-hover:text-[#E51F2A] transition-colors">{src.title}</span>
                              <ExternalLink size={10} className="text-[#A8A1A1]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] font-mono text-[#A8A1A1] text-right pt-1">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing status indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 text-xs font-mono text-[#E51F2A]">
                <div className="w-8 h-8 rounded-xl bg-[#080808] border border-[#E51F2A]/40 flex items-center justify-center">
                  <Bot size={15} className="animate-spin" />
                </div>
                <div className="flex items-center gap-1">
                  <span>Synthesizing authorized intelligence</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
              <span className="text-[#A8A1A1] shrink-0">SUGGESTIONS:</span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1 rounded-lg bg-[#080808] hover:bg-white/10 border border-white/10 text-[#D1D1D1] hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Input Bar */}
        <div className="p-2 rounded-2xl bg-[#111416] border border-white/10 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask Sakib AI about projects, system architecture, files, or credentials..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1 bg-transparent px-4 py-3 text-xs sm:text-sm text-white placeholder-[#A8A1A1]/60 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] disabled:opacity-40 disabled:hover:bg-[#E51F2A] text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <span>Transmit</span>
            <Send size={14} />
          </button>
        </div>

      </div>

      {/* File Preview Modal for Citation clicks */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
