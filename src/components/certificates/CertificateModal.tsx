import React from 'react';
import { X, ExternalLink, Download, ShieldCheck, Calendar, Award } from 'lucide-react';
import { CertificateItem } from '../../types';

interface CertificateModalProps {
  cert: CertificateItem | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ cert, onClose }) => {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#080808]/85 backdrop-blur-xl transition-opacity cursor-pointer"
      />

      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#111416] border border-white/15 shadow-[0_0_50px_rgba(229,31,42,0.25)] flex flex-col z-10"
      >
        {/* Certificate Banner Image */}
        <div className="relative h-56 sm:h-64 overflow-hidden bg-[#080808]">
          <img
            src={cert.imageUrl}
            alt={cert.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111416] via-[#111416]/40 to-transparent" />
          
          <button
            id="close-cert-modal-btn"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-[#080808]/80 text-white border border-white/20 hover:bg-[#E51F2A] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-[#E51F2A] text-white text-xs font-mono font-bold uppercase tracking-wider">
              {cert.category}
            </span>
          </div>
        </div>

        {/* Modal Info */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-mono text-[#E51F2A] mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>CRYPTOGRAPHICALLY VERIFIED CREDENTIAL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
              {cert.title}
            </h2>
            <div className="text-sm font-medium text-[#D1D1D1]">
              Issued by <span className="text-white font-semibold">{cert.issuer}</span> • {cert.issueDate}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#A8A1A1] leading-relaxed">
            {cert.description}
          </p>

          <div className="p-4 rounded-xl bg-[#080808] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A8A1A1]">CREDENTIAL ID:</span>
              <span className="text-white font-bold">{cert.credentialId}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A8A1A1]">STATUS:</span>
              <span className="text-[#E51F2A] font-bold">ACTIVE & VALIDATED</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-[#A8A1A1] uppercase mb-2">Validated Competencies</div>
            <div className="flex flex-wrap gap-1.5">
              {cert.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-[#D1D1D1]">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/10">
            {cert.credentialUrl && (
              <a
                id="cert-verify-external-btn"
                href={cert.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E51F2A] hover:bg-[#B5121B] text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(229,31,42,0.4)]"
              >
                <ExternalLink size={16} />
                <span>Verify at Issuer</span>
              </a>
            )}

            <button
              id="cert-download-btn"
              onClick={() => alert(`Certificate file (${cert.credentialId}) verified.`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#181c1f] hover:bg-white/10 text-white border border-white/15 text-sm font-medium transition-all"
            >
              <Download size={16} />
              <span>Download Signed PDF</span>
            </button>

            <button
              id="cert-close-btn"
              onClick={onClose}
              className="ml-auto text-sm text-[#A8A1A1] hover:text-white px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
