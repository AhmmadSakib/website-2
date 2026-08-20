import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, ShieldCheck, Terminal } from 'lucide-react';
import { PERSONAL_CONFIG } from '../../config/personalData';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface NeuralNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NeuralNodeModal: React.FC<NeuralNodeModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: `Hello! I am Ahmmad Sakib's Neural Node AI Assistant. You can ask me about Ahmmad's full-stack architecture, 3D WebGL projects, credentials, or digital vault security model.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const suggestions = [
    "Tell me about Ahmmad's 3D projects",
    "What is the vault zero-trust model?",
    "What tech stack does Ahmmad specialize in?",
    "How can I contact or hire Ahmmad?"
  ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: `You are Ahmmad Sakib's official portfolio AI representative. Ahmmad is a Lead Full-Stack Engineer, Spatial 3D Designer, and Cloud Architect with 5+ years of experience based in ${PERSONAL_CONFIG.location}. He builds modern, fast, and secure digital experiences with React, TypeScript, Three.js, WebGL, Node.js, and Google Cloud / Firebase. Answer concisely, professionally, and warmly.`
        })
      });

      if (!res.ok) throw new Error('API dispatch interrupted');
      const data = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "Ahmmad Sakib specializes in building cutting-edge full-stack applications with React, Three.js, and cloud services.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      // Intelligent fallback response
      setTimeout(() => {
        let reply = "Ahmmad Sakib specializes in high-performance full-stack web applications, spatial 3D interactive interfaces with Three.js/React Three Fiber, and zero-trust cloud architectures. You can reach out directly at ahmmadsakib18524@gmail.com!";
        if (textToSend.toLowerCase().includes('vault')) {
          reply = "The Digital Vault features an enterprise-grade role-based access control (RBAC) hierarchy with OWNER, TRUSTED, and LIMITED authorization tiers, backed by cryptographic signature verification and partitioned cloud storage.";
        } else if (textToSend.toLowerCase().includes('3d') || textToSend.toLowerCase().includes('project')) {
          reply = "Ahmmad's flagship projects include the Spatial 3D Neural Interface, Cyberpunk Digital Vault, and Autonomous AI Vision platform—all engineered with real-time WebGL shaders and strict TypeScript.";
        }

        const fallbackMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fallbackMsg]);
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080808]/85 backdrop-blur-xl cursor-pointer"
      />

      {/* Chat Window */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl h-[620px] max-h-[90vh] rounded-3xl bg-[#111416] border border-white/15 shadow-[0_0_60px_rgba(229,31,42,0.25)] flex flex-col z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#080808]/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E51F2A]/15 border border-[#E51F2A]/30 text-[#E51F2A] flex items-center justify-center shadow-[0_0_15px_rgba(229,31,42,0.3)]">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-heading font-bold text-white">Neural Node AI</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#E51F2A]/15 text-[#E51F2A] border border-[#E51F2A]/30">
                  Gemini 2.5 Active
                </span>
              </div>
              <p className="text-xs text-[#A8A1A1]">Ahmmad Sakib's Digital Cognitive Representative</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full bg-[#111416] text-[#A8A1A1] hover:text-white border border-white/10 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#E51F2A] text-white shadow-[0_0_20px_rgba(229,31,42,0.3)] rounded-br-sm'
                    : 'bg-[#080808] border border-white/10 text-[#F1F1F1] rounded-bl-sm'
                }`}
              >
                <p>{m.text}</p>
                <span className={`block text-[10px] mt-1.5 font-mono ${m.sender === 'user' ? 'text-white/70 text-right' : 'text-[#A8A1A1]'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#181c1f] border border-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-[#A8A1A1] text-xs font-mono">
              <div className="w-8 h-8 rounded-lg bg-[#080808] border border-white/10 text-[#E51F2A] flex items-center justify-center shrink-0">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <span>Processing neural query...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-[#080808]/60 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-[11px] px-3 py-1 rounded-full bg-[#111416] hover:bg-[#E51F2A]/20 text-[#D1D1D1] hover:text-white border border-white/10 shrink-0 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#080808] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about Ahmmad's architecture, projects, or credentials..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-[#111416] border border-white/10 text-white placeholder-[#A8A1A1]/50 text-xs sm:text-sm focus:outline-none focus:border-[#E51F2A]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(229,31,42,0.3)] cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
