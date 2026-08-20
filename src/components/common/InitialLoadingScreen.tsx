import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InitialLoadingScreenProps {
  onComplete: () => void;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING DIGITAL WORLD...');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let current = 12;
    const interval = setInterval(() => {
      // Advance progress smoothly based on readiness
      current += Math.floor(Math.random() * 18) + 8;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setStatusMessage('ACCESS GRANTED • ENTERING VAULT');
        clearInterval(interval);

        // Quick cinematic pause at 100% before smooth fade out
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            onComplete();
          }, 500);
        }, 300);
      } else {
        setProgress(current);
        if (current > 75) {
          setStatusMessage('NEURAL NETWORKS & VAULT ONLINE');
        } else if (current > 45) {
          setStatusMessage('CALIBRATING 3D QUANTUM SYSTEM');
        } else if (current > 25) {
          setStatusMessage('VERIFYING ZERO-TRUST ENCRYPTION');
        }
      }
    }, 90);

    // Fast track when document fonts and assets are loaded
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        current = Math.max(current, 60);
      });
    }

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="initial-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center select-none overflow-hidden"
        >
          {/* Subtle Background Cyber Grid */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
          
          {/* Ambient Center Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-radial from-[#E51F2A]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
            {/* Center Monogram with Geometric Red Core */}
            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
              {/* Outer Rotating Square Wireframe */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-2xl border border-white/10"
              />
              
              {/* Inner Counter-Rotating Crimson Diamond */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-xl border border-[#E51F2A]/40 shadow-[0_0_20px_rgba(229,31,42,0.3)]"
              />

              {/* Pulsing Central Red Geometric Node */}
              <motion.div
                animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-12 h-12 rounded-lg bg-[#E51F2A]/20 backdrop-blur-sm border border-[#E51F2A]"
              />

              {/* AS Monogram */}
              <span className="relative z-10 text-3xl font-heading font-black tracking-tighter text-white">
                AS<span className="text-[#E51F2A]">.</span>
              </span>
            </div>

            {/* Title / Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2 w-full"
            >
              <h1 className="text-sm font-mono tracking-[0.25em] text-white font-bold uppercase">
                {statusMessage}
              </h1>

              {/* Sleek Progress Bar */}
              <div className="w-full h-1 bg-[#111416] rounded-full overflow-hidden border border-white/5 my-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8C0B12] via-[#E51F2A] to-white rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#E51F2A]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Telemetry Readout */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A1A1]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E51F2A] animate-ping" />
                  <span>AHMMAD SAKIB</span>
                </span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Terminal Footprint */}
          <div className="absolute bottom-6 text-[10px] font-mono text-[#A8A1A1]/60 tracking-wider">
            SECURITY PROTOCOL: ZERO-TRUST SECURE ENVIRONMENT
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
