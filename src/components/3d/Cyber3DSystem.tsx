import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export type Cyber3DVariant = 'hero' | 'projects' | 'about' | 'vault' | 'admin' | 'minimal';

interface Cyber3DSystemProps {
  variant?: Cyber3DVariant;
  className?: string;
  height?: string | number;
  interactive?: boolean;
}

// Check for reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  return prefersReducedMotion;
};

// Check for mobile device to reduce geometry count and disable heavy shaders
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

// Unified Core 3D Mesh Geometry
function SculptureCore({ 
  variant = 'hero', 
  reducedMotion = false,
  isMobile = false,
  isHovered = false,
  onClickPulse = 0
}: { 
  variant: Cyber3DVariant; 
  reducedMotion: boolean;
  isMobile: boolean;
  isHovered: boolean;
  onClickPulse: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const pulseScaleRef = useRef(1);

  // Floating debris elements (cubes, spheres, rings)
  const miniObjects = useMemo(() => {
    const count = isMobile ? 8 : variant === 'minimal' ? 6 : 18;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.9 + (i % 3) * 0.5;
      const type = i % 4 === 0 ? 'ring' : i % 3 === 0 ? 'sphere' : 'cube';
      const color = i % 3 === 0 ? '#E51F2A' : i % 2 === 0 ? '#080808' : '#F5F5F7';

      return {
        id: i,
        type,
        color,
        pos: [
          Math.cos(angle) * radius,
          ((i % 5) - 2) * 0.55,
          Math.sin(angle) * radius
        ] as [number, number, number],
        size: 0.12 + (i % 3) * 0.07,
        speed: 0.3 + (i % 4) * 0.1,
      };
    });
  }, [isMobile, variant]);

  // Scroll offset tracking for camera response
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY * 0.0008);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    const motionFactor = reducedMotion ? 0.05 : 1;

    // Handle click pulse decay
    if (pulseScaleRef.current > 1.001) {
      pulseScaleRef.current = THREE.MathUtils.lerp(pulseScaleRef.current, 1, 0.08);
    }

    if (groupRef.current) {
      // Rotation + Smooth Parallax + Scroll Offset
      const targetRotY = state.pointer.x * (isHovered ? 0.45 : 0.3);
      const targetRotX = -state.pointer.y * (isHovered ? 0.4 : 0.25) + scrollY;

      groupRef.current.rotation.y += delta * 0.2 * motionFactor;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.06);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -state.pointer.x * 0.15, 0.06);

      // Scale on hover & click
      const targetScale = (isHovered ? 1.06 : 1.0) * pulseScaleRef.current;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.35 * motionFactor;
      coreRef.current.rotation.x += delta * 0.15 * motionFactor;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.25 * motionFactor;
      ringRef.current.rotation.y += delta * 0.3 * motionFactor;
    }

    if (satellitesRef.current) {
      satellitesRef.current.rotation.y -= delta * 0.12 * motionFactor;
    }
  });

  // Watch click pulse trigger
  useEffect(() => {
    if (onClickPulse > 0) {
      pulseScaleRef.current = 1.15;
    }
  }, [onClickPulse]);

  return (
    <group ref={groupRef}>
      {/* 1. PRIMARY OBJECT: Black Geometric Obsidian Block */}
      <mesh position={[0.4, 0.2, 0.2]} scale={[1.25, 1.4, 0.9]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.35}
          metalness={0.92}
        />
      </mesh>

      {/* Wireframe accent cage for primary block */}
      <mesh position={[0.4, 0.2, 0.2]} scale={[1.26, 1.41, 0.91]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#22262a"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 2. SECONDARY OBJECT: Red Illuminated Transparent Cubes */}
      <mesh ref={coreRef} position={[0, 0, 0]} scale={[0.95, 0.95, 0.95]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#E51F2A"
          emissive="#8C0B12"
          emissiveIntensity={isHovered ? 2.8 : 1.8}
          roughness={0.15}
          metalness={0.3}
          transmission={0.7}
          thickness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Secondary small crystalline red facet */}
      <mesh position={[-0.65, -0.4, 0.45]} rotation={[0.4, 0.5, 0]} scale={[0.85, 0.6, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#B5121B"
          transmission={0.65}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 3. ACCENT: Metallic White Surface Pillars */}
      <mesh position={[-0.35, 0.7, -0.4]} rotation={[0, 0.25, 0.15]} scale={[0.3, 1.8, 0.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#F5F5F7"
          roughness={0.12}
          metalness={0.96}
        />
      </mesh>

      {/* Metallic Platinum Node */}
      <mesh position={[0.7, -0.6, -0.3]} scale={[0.45, 0.45, 0.45]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.1}
          metalness={0.98}
        />
      </mesh>

      {/* Orbiting Metallic White Torus Ring */}
      <mesh ref={ringRef} scale={[1.8, 1.8, 1.8]}>
        <torusGeometry args={[1, 0.018, 16, 64]} />
        <meshStandardMaterial
          color="#E51F2A"
          emissive="#65070B"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Internal Crimson Point Light */}
      <pointLight position={[0, 0, 0]} color="#E51F2A" intensity={isHovered ? 14 : 9} distance={6} decay={2} />

      {/* 4. SMALL OBJECTS: Floating Cubes, Spheres & Rings */}
      <group ref={satellitesRef}>
        {miniObjects.map((item) => (
          <Float key={item.id} speed={item.speed} rotationIntensity={1.2} floatIntensity={1.4}>
            <mesh position={item.pos} scale={[item.size, item.size, item.size]}>
              {item.type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
              {item.type === 'sphere' && <sphereGeometry args={[0.7, 12, 12]} />}
              {item.type === 'ring' && <torusGeometry args={[0.8, 0.15, 8, 24]} />}
              
              <meshStandardMaterial
                color={item.color}
                emissive={item.color === '#E51F2A' ? '#8C0B12' : '#000000'}
                emissiveIntensity={item.color === '#E51F2A' ? 1.4 : 0}
                roughness={0.25}
                metalness={0.85}
              />
            </mesh>
          </Float>
        ))}
      </group>
    </group>
  );
}

export const Cyber3DSystem: React.FC<Cyber3DSystemProps> = ({
  variant = 'hero',
  className = '',
  height,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickPulse, setClickPulse] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Lazy pause when outside viewport
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    if (interactive) {
      setClickPulse((prev) => prev + 1);
    }
  };

  const getContainerDimensions = () => {
    if (height) return typeof height === 'number' ? `${height}px` : height;
    switch (variant) {
      case 'hero':
        return 'h-[440px] sm:h-[520px] lg:h-[620px]';
      case 'projects':
      case 'about':
      case 'vault':
      case 'admin':
        return 'h-[260px] sm:h-[320px] lg:h-[380px]';
      case 'minimal':
        return 'h-[140px] w-[140px]';
      default:
        return 'h-[400px]';
    }
  };

  const cameraDistance = variant === 'minimal' ? 4.2 : variant === 'hero' ? 6.2 : 5.2;

  return (
    <div
      ref={containerRef}
      id={`cyber-3d-${variant}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      onClick={handleClick}
      className={`relative w-full flex items-center justify-center cursor-pointer select-none transition-transform duration-300 ${getContainerDimensions()} ${className}`}
    >
      {/* Background Dark Ambient Red Glow */}
      <div 
        className={`absolute inset-0 bg-radial from-[#8C0B12]/15 via-[#080808]/5 to-transparent pointer-events-none blur-3xl transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`} 
      />

      {isVisible && (
        <Canvas
          camera={{ position: [0, 0, cameraDistance], fov: 42 }}
          gl={{ 
            antialias: !isMobile, 
            alpha: true, 
            powerPreference: 'high-performance' 
          }}
          dpr={isMobile ? [1, 1.2] : [1, 1.75]}
        >
          {/* Dark Ambient Lighting */}
          <ambientLight intensity={0.65} color="#111416" />

          {/* Soft White Rim Lighting */}
          <directionalLight position={[6, 8, 6]} intensity={1.4} color="#FFFFFF" />
          <directionalLight position={[-6, -5, -4]} intensity={0.8} color="#D1D1D1" />
          
          {/* Subtle Red Point Lighting */}
          <pointLight position={[3, 3, 4]} color="#E51F2A" intensity={2.8} />
          <pointLight position={[-3, -2, -2]} color="#8C0B12" intensity={1.5} />

          <SculptureCore
            variant={variant}
            reducedMotion={prefersReducedMotion}
            isMobile={isMobile}
            isHovered={isHovered}
            onClickPulse={clickPulse}
          />
        </Canvas>
      )}
    </div>
  );
};
