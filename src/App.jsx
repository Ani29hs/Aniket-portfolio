import React, { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { MeshoptDecoder } from 'meshoptimizer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SystemOS from './SystemOS';
import './index.css';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  TYPEWRITER HOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ROLES = [
  'Full-Stack Developer',
  'AI / ML Enthusiast',
  'Creative Coder',
  'Problem Solver',
];

function useTypewriter(words, typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;
    if (!isDeleting) {
      if (text.length < currentWord.length) {
        timeout = setTimeout(() => setText(currentWord.slice(0, text.length + 1)), typingSpeed);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), deletingSpeed);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  3D COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TerminalModel(props) {
  const { scene } = useGLTF('/terminal.glb', undefined, undefined, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/terminal.glb');

function ModelReadyReporter({ onLoaded }) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);
  return null;
}

function CameraController({ isZooming, onZoomComplete }) {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  const lookAtProxy = useRef({ x: 0, y: 0.6, z: 0 }).current;

  useFrame((state) => {
    if (!isZooming) {
      const targetX = state.pointer.x * 0.5;
      const targetY = 1.5 + state.pointer.y * 0.2;

      state.camera.position.lerp(vec.set(targetX, targetY, 9), 0.05);

      lookAtProxy.x += (0 - lookAtProxy.x) * 0.05;
      lookAtProxy.y += (0.6 - lookAtProxy.y) * 0.05;
      lookAtProxy.z += (0 - lookAtProxy.z) * 0.05;
      state.camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z);
    } else {
      state.camera.lookAt(lookAtProxy.x, lookAtProxy.y, lookAtProxy.z);
    }
  });

  useEffect(() => {
    if (isZooming) {
      const tl = gsap.timeline({
        onComplete: onZoomComplete
      });

      const targetHtmlPos = [2.7, 0.91, 1.25];
      const cameraZOffset = 0.65;

      tl.to(camera.position, {
        x: targetHtmlPos[0],
        y: targetHtmlPos[1] - 0.05,
        z: targetHtmlPos[2] + cameraZOffset,
        duration: 1.5, // Sped up zoom slightly
        ease: 'power3.inOut'
      }, 0);

      tl.to(lookAtProxy, {
        x: targetHtmlPos[0],
        y: targetHtmlPos[1],
        z: targetHtmlPos[2],
        duration: 1.5,
        ease: 'power3.inOut'
      }, 0);
    }
  }, [isZooming, camera, lookAtProxy, onZoomComplete]);

  return null;
}

// Custom interactive particles that act like flowing water, reacting gently to the mouse
function InteractiveSparks() {
  const groupRef = useRef();
  
  // Keep track of a heavily dampened mouse position for smooth reactions
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // 1. Slow, flowing water base movement (very subtle sine waves)
      const flowX = Math.sin(time * 0.2) * 0.1;
      const flowY = Math.cos(time * 0.15) * 0.1;

      // 2. Ultra-smooth mouse tracking (high dampening)
      mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.pointer.x, 0.01);
      mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.pointer.y, 0.01);

      // 3. Combine flow + very small mouse reaction
      const targetX = flowX + (mouse.current.x * 0.2);
      const targetY = flowY + (mouse.current.y * 0.2);

      // Apply final position smoothly
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
      
      // Ensure absolutely no rotation happens
      groupRef.current.rotation.set(0, 0, 0);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lowered speed and noise for a calm, static water feel */}
      <Sparkles count={50} scale={15} size={2.5} speed={0.1} noise={0.2} opacity={0.3} color="#00ff87" />
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UI OVERLAYS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MainMenu({ onDiveIn, isLoaded }) {
  const container = useRef(null);
  const hasAnimated = useRef(false);
  const [showContent, setShowContent] = useState(false);
  const typedRole = useTypewriter(ROLES, 70, 35, 2200);

  useEffect(() => {
    if (isLoaded) { setShowContent(true); return; }
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useGSAP(() => {
    if (!showContent || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    tl.fromTo('.gsap-main-title',
      { y: 30, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out', stagger: 0.15 }
    );
    tl.fromTo('.gsap-role',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 },
      '-=0.6'
    );
    tl.fromTo('.gsap-cta',
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.4'
    );
  }, { scope: container, dependencies: [showContent] });

  return (
    <div ref={container} className="absolute inset-0 z-10 flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-24 pointer-events-none text-white overflow-hidden">
      
      {/* Background vignette to ensure text readability against 3D scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

      <div className="relative z-20 max-w-3xl flex flex-col gap-6 md:gap-8">
        
        {/* Status indicator */}
        <div className="gsap-main-title opacity-0 flex items-center gap-3 mx-auto md:mx-0 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm w-fit">
          <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse shadow-[0_0_10px_#00ff87]" />
          <span className="text-xs font-mono tracking-widest text-white/70 uppercase">System Online</span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span className="gsap-main-title block opacity-0 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Aniket
          </span>
          <span className="gsap-main-title block opacity-0 mt-[-0.05em]" style={{
            background: 'linear-gradient(135deg, #00ff87 0%, #00b8ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(0,255,135,0.3))'
          }}>
            Sharma
          </span>
        </h1>

        {/* Typewriter Role */}
        <div className="gsap-role opacity-0 flex items-center justify-center md:justify-start gap-1 h-8 md:h-10 mt-2">
          <span className="text-lg md:text-2xl font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {typedRole}
          </span>
          <span className="inline-block w-[2px] h-5 md:h-7 ml-1 typewriter-cursor" style={{ background: '#00ff87' }} />
        </div>

        <p className="gsap-role opacity-0 text-sm md:text-base max-w-lg text-white/50 font-display leading-relaxed mx-auto md:mx-0">
          Crafting elegant digital experiences through clean code, intelligent systems, and a passion for innovation.
        </p>

        {/* CTA Button */}
        <div className="mt-4 pointer-events-auto flex justify-center md:justify-start">
          <button
            onClick={onDiveIn}
            className="gsap-cta opacity-0 group relative px-8 py-4 bg-white/5 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 hover:border-[#00ff87]/50 cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff87]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative flex items-center gap-3">
              <span className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-white group-hover:text-[#00ff87] transition-colors">
                Initialize Sequence
              </span>
              <svg className="w-5 h-5 text-white/50 group-hover:text-[#00ff87] group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function OptionsPanel({ isOpen, onClose, settings, setSettings }) {
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Display');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useGSAP(() => {
    if (isOpen) {
      gsap.to(panelRef.current, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.to(panelRef.current, { x: '-100%', duration: 0.5, ease: 'power3.in' });
    }
  }, { scope: panelRef, dependencies: [isOpen] });

  const defaultSettings = {
    scanlineOpacity: 0,
    aberration: 0
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const restoreDefaults = () => {
    setSettings(defaultSettings);
  };

  const tabs = ['Display'];

  const SliderControl = ({ label, value, min, max, onChange, unit = '' }) => (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm tracking-[0.2em] text-white/70">{label}</span>
        <span className="text-sm font-bold text-[#00ff87] tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#00ff87] cursor-pointer h-1"
      />
    </div>
  );

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[60] hidden md:flex -translate-x-full will-change-transform text-white font-mono"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="w-80 flex flex-col justify-between p-10" style={{ borderRight: '1px solid rgba(0,255,135,0.1)' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00ff87" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065 2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <h2 className="text-lg tracking-[0.3em] text-[#00ff87]">SETTINGS</h2>
          </div>
          <div className="flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 rounded-lg tracking-[0.15em] text-sm transition-all duration-200 pointer-events-auto cursor-pointer ${activeTab === tab
                  ? 'text-white bg-[#00ff87]/10 border-l-2 border-[#00ff87]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/3 border-l-2 border-transparent'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={restoreDefaults}
            className="text-left text-xs tracking-[0.2em] text-white/30 hover:text-[#00ff87] transition-colors pointer-events-auto cursor-pointer py-2"
          >
            RESTORE DEFAULTS
          </button>
          <button
            onClick={onClose}
            className="text-left text-xs tracking-[0.2em] text-white/30 hover:text-white transition-colors pointer-events-auto cursor-pointer py-2 flex items-center gap-2"
          >
            <span className="text-[10px] px-1.5 py-0.5 border border-white/20 rounded text-white/40">ESC</span>
            <span>BACK</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-16 flex flex-col justify-center pointer-events-auto">
        <div className="max-w-lg">
          <h3 className="text-xs tracking-[0.4em] text-[#00ff87]/50 mb-8 uppercase">{activeTab} Settings</h3>

          {activeTab === 'Display' && (
            <div className="flex flex-col gap-8">
              <SliderControl label="CRT SCANLINE OPACITY" value={settings.scanlineOpacity} min={0} max={100} onChange={(v) => updateSetting('scanlineOpacity', v)} unit="%" />
              <SliderControl label="CHROMATIC ABERRATION" value={settings.aberration} min={0} max={20} onChange={(v) => updateSetting('aberration', v)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  APP COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [isGameStarted, setIsGameStarted] = useState(() => {
    return sessionStorage.getItem('systemos_session') === 'true';
  });

  const [isZooming, setIsZooming] = useState(false);

  const [settings, setSettings] = useState({
    scanlineOpacity: 0,
    aberration: 0
  });

  // Directly start the system when the zoom animation finishes
  const handleZoomComplete = () => {
    setIsGameStarted(true);
    sessionStorage.setItem('systemos_session', 'true');
  };

  return (
    <div
      className={`relative w-screen h-screen bg-[#050403] overflow-hidden font-display select-none ${isGameStarted ? '' : 'force-gpu-raster'}`}
      style={{
        backgroundImage: 'radial-gradient(circle at center, #1a2a22 0%, #050403 60%, #000 100%)',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.95)',
        filter: (!isGameStarted && settings.aberration > 0) ? `drop-shadow(${settings.aberration}px 0 0 rgba(255,0,0,0.6)) drop-shadow(-${settings.aberration}px 0 0 rgba(0,255,255,0.6))` : 'none'
      }}
    >
      {/* CRT Scanline Layer */}
      {!isGameStarted && (
        <div
          className="fixed inset-0 z-[55] pointer-events-none mix-blend-overlay"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
            opacity: settings.scanlineOpacity / 100
          }}
        />
      )}

      <OptionsPanel
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* 3D Canvas */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out hidden md:block ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isGameStarted ? '!hidden' : ''}`}>
        <Canvas 
          frameloop={isGameStarted ? 'never' : 'always'}
          dpr={1} // AGGRESSIVE OPTIMIZATION: Hardcoded to 1x resolution to fix lag
          gl={{ powerPreference: "high-performance", antialias: false }} // AGGRESSIVE OPTIMIZATION
          performance={{ min: 0.5 }}
        >
          {/* FOG REMOVED for optimization */}
          <CameraController isZooming={isZooming} onZoomComplete={handleZoomComplete} />

          {/* Mouse-reactive animated background particles */}
          <InteractiveSparks />

          <PerspectiveCamera
            makeDefault
            position={[0, 1.5, 9]}
            fov={45}
          />

          <ambientLight intensity={3} />
          <directionalLight position={[0, 10, 10]} intensity={1.5} />

          <Suspense fallback={null}>
            <TerminalModel position={[2.5, -0.65, 0]} scale={[0.12, 0.12, 0.12]} rotation={[0, -Math.PI / 2, 0]} />
            <ModelReadyReporter onLoaded={() => setIsLoaded(true)} />
          </Suspense>

          {/* HTML Overlay on the 3D screen */}
          <Html
            transform
            position={[2.7, 0.91, 1.14]}
            rotation={[-0.1, 0, 0]}
            scale={0.23}
            className="pointer-events-auto z-50"
          >
            <div className={`bg-[#020503]/90 w-[440px] h-[340px] p-8 flex flex-col justify-center gap-6 rounded border border-[#00ff87]/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_0_60px_rgba(0,255,135,0.05)] transition-all duration-500 backdrop-blur-md`}>
              {(!isZooming && !isGameStarted) && (
                <div className="flex flex-col items-center gap-2 w-full font-mono uppercase tracking-widest bg-transparent">
                  <div className="w-full flex items-center gap-2 mb-6 pb-3" style={{ borderBottom: '1px solid rgba(0,255,135,0.2)' }}>
                    <div className="w-2 h-2 rounded-full bg-[#00ff87] animate-pulse shadow-[0_0_10px_#00ff87]"></div>
                    <span className="text-[10px] tracking-[0.4em] text-[#00ff87]/80">SYSTEM READY</span>
                  </div>

                  {[{
                    label: 'Explore',
                    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
                    desc: 'Enter the system',
                    action: () => { setIsOptionsOpen(false); setIsZooming(true); }
                  }, {
                    label: 'Settings',
                    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065 2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                    desc: 'Configure options',
                    action: () => setIsOptionsOpen(true)
                  }].filter(item => item.label !== 'Settings' || window.innerWidth >= 768).map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-5 px-6 py-5 text-left transition-all duration-300 cursor-pointer pointer-events-auto group rounded-lg border border-transparent hover:border-[#00ff87]/20"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,255,135,0.05)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'inset 3px 0 0 #00ff87'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 shrink-0 group-hover:text-[#00ff87] group-hover:drop-shadow-[0_0_8px_rgba(0,255,135,0.5)] transition-all">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-[0.2em] group-hover:text-[#00ff87] group-hover:drop-shadow-[0_0_8px_rgba(0,255,135,0.3)] transition-all">{item.label}</span>
                        <span className="text-[10px] tracking-[0.15em] text-white/30 normal-case group-hover:text-white/50 transition-all">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Html>
        </Canvas>
      </div>

      <div className={`transition-opacity duration-1000 ${(isZooming || isGameStarted) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <MainMenu
          isLoaded={window.innerWidth < 768 ? true : isLoaded}
          onDiveIn={() => {
            setIsOptionsOpen(false);
            if (window.innerWidth < 768) {
              handleZoomComplete();
            } else {
              setIsZooming(true);
            }
          }}
        />
      </div>

      {isGameStarted && <SystemOS onLogout={() => {
        setIsGameStarted(false);
        setIsZooming(false);
        sessionStorage.removeItem('systemos_session');
      }} />}

    </div>
  );
}

export default App;