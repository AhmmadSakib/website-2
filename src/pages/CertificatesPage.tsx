import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  ExternalLink, 
  Download, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { INITIAL_CERTIFICATES } from '../config/personalData';
import { CertificateItem } from '../types';
import { CertificateModal } from '../components/certificates/CertificateModal';
import { Cyber3DSystem } from '../components/3d/Cyber3DSystem';
import { db, collection, onSnapshot } from '../lib/firebase';

export const CertificatesPage: React.FC = () => {
  const [certs, setCerts] = useState<CertificateItem[]>(INITIAL_CERTIFICATES);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'certificates'),
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: CertificateItem[] = [];
            snapshot.forEach((doc) => {
              fetched.push({ id: doc.id, ...doc.data() } as CertificateItem);
            });
            setCerts(fetched);
          }
        },
        (err) => {
          console.warn('Using local certificates database:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore fallback for certificates');
    }
  }, []);

  const categories = ['All', 'Cloud & AI', 'Frontend', 'Backend', 'Cybersecurity'];

  const filteredCerts = certs.filter((cert) => {
    const matchesCategory = activeCategory === 'All' || cert.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-[#F1F1F1] pb-24 px-4 sm:px-8 lg:px-12 pt-8 lg:pt-12 relative overflow-hidden">
      
      {/* Ambient Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E51F2A]/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#E51F2A]/5 rounded-full blur-[160px] pointer-events-none z-0" />
      
      <div className="w-full max-w-7xl relative z-10 mx-auto space-y-12">
        
        {/* Header */}
        <div className="relative pb-8 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111416] border border-[#E51F2A]/30 text-[#E51F2A] text-xs font-mono uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A]" />
              VERIFIED CREDENTIALS
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-[-0.035em]">
              Certifications & <span className="text-[#E51F2A]">Honors</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A8A1A1]">
              Industry-recognized certifications in Cloud Architecture, AI systems, Container Orchestration, and Security.
            </p>
          </div>

          <div className="shrink-0 hidden sm:block w-32 h-32">
            <Cyber3DSystem variant="minimal" height={120} />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111416]/70 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cert-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E51F2A] text-white shadow-[0_0_15px_rgba(229,31,42,0.4)]'
                      : 'bg-[#181c1f] text-[#D1D1D1] border border-white/5 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A1A1]" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080808] border border-white/10 text-xs sm:text-sm text-white placeholder-[#A8A1A1]/60 focus:outline-none focus:border-[#E51F2A]"
            />
          </div>

        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              id={`cert-card-${cert.id}`}
              onClick={() => setSelectedCert(cert)}
              className="group relative rounded-2xl bg-[#111416]/90 border border-white/10 hover:border-[#E51F2A]/60 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_30px_rgba(229,31,42,0.2)] cursor-pointer flex flex-col justify-between"
            >
              {/* Preview Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-[#080808]">
                <img
                  src={cert.imageUrl}
                  alt={cert.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111416] via-[#111416]/40 to-transparent" />
                
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#080808]/85 backdrop-blur-sm border border-white/10 text-[11px] font-mono text-[#E51F2A]">
                  {cert.category}
                </div>

                <div className="absolute top-3 right-3 p-1.5 rounded-full bg-[#080808]/80 text-[#E51F2A]">
                  <ShieldCheck size={16} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-[#A8A1A1] font-mono mb-1">
                    {cert.issuer} • {cert.issueDate}
                  </div>

                  <h3 className="text-lg font-heading font-bold text-white group-hover:text-[#E51F2A] transition-colors mb-2">
                    {cert.title}
                  </h3>

                  <p className="text-xs text-[#A8A1A1] line-clamp-2 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div>
                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {cert.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#D1D1D1]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="font-mono text-[#A8A1A1]">{cert.credentialId}</span>
                    <span className="text-[#E51F2A] font-semibold group-hover:underline">
                      Verify Credential &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <CertificateModal
        cert={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
};
