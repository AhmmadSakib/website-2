import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on devices with fine pointer (desktop)
    const hasTouch = window.matchMedia('(pointer: coarse)').matches;
    if (hasTouch) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer') ||
          target.getAttribute('role') === 'button')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden hidden md:block">
      {/* Outer Ring & Crosshair */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-[#E51F2A]/60 flex items-center justify-center pointer-events-none"
        animate={{
          x: mousePosition.x - (isHovered ? 24 : 14),
          y: mousePosition.y - (isHovered ? 24 : 14),
          width: isHovered ? 48 : 28,
          height: isHovered ? 48 : 28,
          scale: isClicked ? 0.8 : 1,
          backgroundColor: isHovered ? 'rgba(229, 31, 42, 0.12)' : 'rgba(229, 31, 42, 0.03)',
          borderColor: isHovered ? '#E51F2A' : 'rgba(229, 31, 42, 0.5)',
        }}
        transition={{
          type: 'spring',
          damping: 28,
          stiffness: 350,
          mass: 0.2,
        }}
      >
        {/* Subtle Cyber Target Notches */}
        <div className="absolute w-[1px] h-2 bg-[#E51F2A]/70 top-0 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[1px] h-2 bg-[#E51F2A]/70 bottom-0 left-1/2 -translate-x-1/2" />
        <div className="absolute h-[1px] w-2 bg-[#E51F2A]/70 left-0 top-1/2 -translate-y-1/2" />
        <div className="absolute h-[1px] w-2 bg-[#E51F2A]/70 right-0 top-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Center Laser Point */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-white pointer-events-none shadow-[0_0_8px_#E51F2A]"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          scale: isClicked ? 1.5 : isHovered ? 0.6 : 1,
          backgroundColor: isHovered ? '#E51F2A' : '#FFFFFF',
        }}
        transition={{
          type: 'spring',
          damping: 40,
          stiffness: 800,
        }}
      />
    </div>
  );
};
