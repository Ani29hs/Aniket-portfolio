import React, { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html, PerspectiveCamera, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SystemOS from './SystemOS';
import './index.css';

// The 3D Terminal model with the projected Html screen menu
function TerminalModel(props) {
  const { scene } = useGLTF('/terminal.glb');

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/terminal.glb');

// A helper component to detect when Suspense finishes loading the 3D model
function ModelReadyReporter({ onLoaded }) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);
  return null;
}

// Controls camera sway and cinematic zoom transitions
function CameraController({ isZooming, setIsLoading }) {
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
        onComplete: () => {
          setIsLoading(true);
        }
      });

      const targetHtmlPos = [2.7, 0.91, 1.25];
      const cameraZOffset = 0.65;

      tl.to(camera.position, {
        x: targetHtmlPos[0],
        y: targetHtmlPos[1] - 0.05,
        z: targetHtmlPos[2] + cameraZOffset,
        duration: 2.0,
        ease: 'power3.inOut'
      }, 0);

      tl.to(lookAtProxy, {
        x: targetHtmlPos[0],
        y: targetHtmlPos[1],
        z: targetHtmlPos[2],
        duration: 2.0,
        ease: 'power3.inOut'
      }, 0);
    }
  }, [isZooming, camera, lookAtProxy, setIsLoading]);

  return null;
}

function LoadingScreen({ onComplete }) {
  const barRef = useRef(null);
  const textRef = useRef(null);
  const imgRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useGSAP(() => {
    gsap.to('.gsap-typewriter-char', {
      opacity: 1,
      duration: 0.05,
      stagger: 0.05,
      ease: 'steps(1)'
    });

    gsap.to(barRef.current, {
      width: '100%',
      duration: 8,
      ease: 'power1.inOut',
      onUpdate: function () {
        setProgress(Math.round(this.progress() * 100));
      },
      onComplete: onComplete
    });

    gsap.to(textRef.current, {
      opacity: 'random(0.4, 0.9)',
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'none',
      repeatRefresh: true
    });

    gsap.to(imgRef.current, { opacity: 1, duration: 2 });

    gsap.to('.gsap-warrior-text', {
      opacity: 1,
      y: 0,
      duration: 1.5,
      stagger: 0.5,
      ease: 'power2.out',
      delay: 0.5
    });
  });

  return (
    <div className="fixed inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center pointer-events-auto">
      <div
        ref={imgRef}
        className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black"
      >
        <img src="/loading-bg.jpg" alt="Starting System" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
      </div>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[210] mix-blend-screen text-center px-4"
        style={{ textShadow: "0px 4px 20px rgba(0,0,0,0.9)" }}
      >
        <h2 className="gsap-warrior-text opacity-0 text-3xl md:text-5xl lg:text-6xl text-[#ffaa44] mb-4 tracking-[0.2em] font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
          A WARRIOR'S PORTFOLIO
        </h2>
        <p className="gsap-warrior-text opacity-0 text-lg md:text-xl lg:text-2xl text-white/90 mb-2 font-mono tracking-widest uppercase">
          Forged in Code. Built with Power.
        </p>
        <p className="gsap-warrior-text opacity-0 text-md md:text-lg lg:text-xl text-[#ffaa44]/70 font-display tracking-[0.3em] uppercase">
          Ready for journey
        </p>
      </div>

      <div className="absolute bottom-24 w-[90%] md:w-4/5 max-w-3xl flex flex-col gap-6">
        <div className="flex justify-between items-end w-full px-2">
          <div
            ref={textRef}
            className="text-[#ffaa44] font-mono tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm drop-shadow-[0_0_8px_rgba(255,170,68,0.8)]"
          >
            {"INITIALIZING SYSTEM ARCHIVES...".split('').map((char, index) => (
              <span key={index} className="gsap-typewriter-char opacity-0">{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </div>
          <div className="text-[#ffaa44] font-mono tracking-widest text-sm md:text-base font-bold drop-shadow-[0_0_8px_rgba(255,170,68,0.8)]">
            {progress}%
          </div>
        </div>

        <div className="w-full h-1 bg-gray-900 rounded overflow-hidden relative border border-[#ffaa44]/10">
          <div ref={barRef} className="h-full bg-[#ffaa44] w-0 shadow-[0_0_15px_#ffaa44]" />
        </div>
      </div>
    </div>
  );
}

function GamePage({ onBack }) {
  return (
    <div className="fixed inset-0 z-[300] pointer-events-auto flex flex-col items-center justify-center font-display text-white"
      style={{ background: 'linear-gradient(to bottom, #111, #000)' }}>
      <h1 className="text-4xl text-[#ffaa44] tracking-widest mb-12 drop-shadow-[0_0_15px_rgba(255,170,68,0.6)]" style={{ fontFamily: "'Cinzel', serif" }}>ARCHIVES LOADED</h1>
      <button
        onClick={onBack}
        className="px-8 py-3 border border-[#ffaa44]/50 text-[#ffaa44] hover:bg-[#ffaa44]/10 hover:border-[#ffaa44] transition-all duration-300 font-mono tracking-[0.2em] cursor-pointer"
      >
        [ ESC ] BACK TO MENU
      </button>
    </div>
  );
}

function RE7MainMenu({ onDiveIn, isLoaded }) {
  const container = useRef(null);
  const hasAnimated = useRef(false);
  const [showContent, setShowContent] = useState(false);

  // Show content after 1.5s max, even if 3D model hasn't loaded yet
  useEffect(() => {
    if (isLoaded) { setShowContent(true); return; }
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useGSAP(() => {
    if (!showContent || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    tl.fromTo('.gsap-accent-line',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.8, ease: 'power3.out' }
    );

    tl.fromTo('.gsap-main-title',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.15 },
      '-=0.4'
    );

    tl.to('.gsap-seven, .gsap-subtitle',
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.2 },
      '-=0.6'
    );

    tl.fromTo('.gsap-cta',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    );

  }, { scope: container, dependencies: [showContent] });

  return (
    <div ref={container} className="absolute inset-0 z-10 flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-24 pointer-events-none text-white overflow-hidden">

      <div className="gsap-accent-line absolute hidden md:block left-24 top-[38%] w-20 h-[2px] origin-left" style={{ background: 'linear-gradient(90deg, #ffaa44, transparent)' }} />

      <div className="relative z-20 max-w-3xl">
        <p className="gsap-seven opacity-0 text-xs md:text-sm tracking-[0.5em] uppercase mb-4 font-mono translate-y-4" style={{ color: '#ffaa44', textShadow: '0 0 20px rgba(255,170,68,0.4)' }}>
          — Portfolio Terminal v2.0
        </p>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl tracking-widest leading-tight"
          style={{ fontFamily: "'Cinzel', serif", textShadow: "0px 4px 30px rgba(0,0,0,0.9)" }}
        >
          <span className="gsap-main-title opacity-0 block" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #ffaa44 50%, #ff6600 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            UNCOVER THE
          </span>
          <span className="gsap-main-title opacity-0 block mt-1" style={{ background: 'linear-gradient(135deg, #ffaa44 0%, #ffffff 60%, #ffcc88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ULTIMATE PORTFOLIO
          </span>
        </h1>

        <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
          <div className="h-[1px] w-8 md:w-12 hidden md:block" style={{ background: 'linear-gradient(90deg, #ffaa44, transparent)' }} />
          <span className="gsap-seven opacity-0 text-xl md:text-2xl font-bold tracking-[0.2em] translate-y-4 relative" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff', textShadow: '0 0 30px rgba(255,170,68,0.6)' }}>
            ANIKET SHARMA
          </span>
        </div>

        <p className="gsap-subtitle opacity-0 mt-4 text-sm md:text-base tracking-[0.25em] font-mono translate-y-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          · FULL-STACK DEVELOPER   ·  AI ENTHUSIAST
        </p>

        <div className="mt-10 pointer-events-auto flex justify-center md:justify-start">
          <button
            onClick={onDiveIn}
            className="gsap-cta opacity-0 group flex items-center gap-4 px-8 py-3 border transition-all duration-500 cursor-pointer relative overflow-hidden"
            style={{
              borderColor: 'rgba(255,170,68,0.4)',
              background: 'rgba(255,170,68,0.05)',
              fontFamily: "'Space Grotesk', sans-serif"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ffaa44'; e.currentTarget.style.background = 'rgba(255,170,68,0.15)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,170,68,0.3), inset 0 0 30px rgba(255,170,68,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,170,68,0.4)'; e.currentTarget.style.background = 'rgba(255,170,68,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span className="text-[#ffaa44] text-sm md:text-base tracking-[0.3em] uppercase font-semibold group-hover:text-white transition-colors duration-300">ACCESS ARCHIVES</span>
            <svg className="w-5 h-5 text-[#ffaa44] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,170,68,0.1), transparent)' }} />
          </button>
        </div>
      </div>

    </div>
  )
}

// RE7 Settings Options Panel – desktop only
function OptionsPanel({ isOpen, onClose, settings, setSettings }) {
  const panelRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Audio');

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
    masterVolume: 100,
    bgmVolume: 30,
    sfxEnabled: true,
    currentTrack: '/ambient-bg.mp3',
    scanlineOpacity: 0,
    aberration: 0
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const restoreDefaults = () => {
    setSettings(defaultSettings);
  };

  const tabs = ['Audio', 'Display'];

  const SliderControl = ({ label, value, min, max, onChange, unit = '' }) => (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-sm tracking-[0.2em] text-white/70">{label}</span>
        <span className="text-sm font-bold text-[#ffaa44] tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#ffaa44] cursor-pointer h-1"
      />
    </div>
  );

  return (
    // ── FIX: hidden on mobile, only flex on md+ ──
    <div
      ref={panelRef}
      className="fixed inset-0 z-[60] hidden md:flex -translate-x-full will-change-transform text-white font-mono"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
    >
      {/* Sidebar */}
      <div className="w-80 flex flex-col justify-between p-10" style={{ borderRight: '1px solid rgba(255,170,68,0.1)' }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffaa44" strokeWidth="1.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-1.065 2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <h2 className="text-lg tracking-[0.3em] text-[#ffaa44]">SETTINGS</h2>
          </div>
          <div className="flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-4 py-3 rounded-lg tracking-[0.15em] text-sm transition-all duration-200 pointer-events-auto cursor-pointer ${activeTab === tab
                  ? 'text-white bg-[#ffaa44]/10 border-l-2 border-[#ffaa44]'
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
            className="text-left text-xs tracking-[0.2em] text-white/30 hover:text-[#ffaa44] transition-colors pointer-events-auto cursor-pointer py-2"
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

      {/* Content Area */}
      <div className="flex-1 p-16 flex flex-col justify-center pointer-events-auto">
        <div className="max-w-lg">
          <h3 className="text-xs tracking-[0.4em] text-[#ffaa44]/50 mb-8 uppercase">{activeTab} Settings</h3>

          {activeTab === 'Audio' && (
            <div className="flex flex-col gap-8">
              <SliderControl label="MASTER VOLUME" value={settings.masterVolume} min={0} max={100} onChange={(v) => updateSetting('masterVolume', v)} unit="%" />
              <SliderControl label="BGM VOLUME" value={settings.bgmVolume} min={0} max={100} onChange={(v) => updateSetting('bgmVolume', v)} unit="%" />

              <div className="flex justify-between items-center">
                <span className="text-sm tracking-[0.2em] text-white/70">SFX ENABLED</span>
                <button
                  onClick={() => updateSetting('sfxEnabled', !settings.sfxEnabled)}
                  className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all duration-300 ${settings.sfxEnabled ? 'bg-[#ffaa44]/30 justify-end' : 'bg-white/10 justify-start'}`}
                  style={{ border: `1px solid ${settings.sfxEnabled ? '#ffaa44' : 'rgba(255,255,255,0.15)'}` }}
                >
                  <div className={`w-4 h-4 rounded-full transition-all duration-300 ${settings.sfxEnabled ? 'bg-[#ffaa44] shadow-[0_0_8px_rgba(255,170,68,0.5)]' : 'bg-white/30'}`} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm tracking-[0.2em] text-white/70">BACKGROUND TRACK</span>
                <select
                  value={settings.currentTrack}
                  onChange={(e) => updateSetting('currentTrack', e.target.value)}
                  className="bg-white/5 border border-white/10 text-white/80 px-4 py-3 rounded-lg outline-none cursor-pointer text-sm tracking-wide hover:border-[#ffaa44]/30 transition-colors"
                >
                  <option value="/ambient-bg.mp3" className="bg-[#050403] text-[#ffaa44]">Deep Ambient Drone</option>
                  <option value="/Resident Evil Village Safe Room Theme Soundtrack (Full Version).mp3" className="bg-[#050403] text-[#ffaa44]"> Safe Room Theme</option>
                </select>
              </div>
            </div>
          )}

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

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [isGameStarted, setIsGameStarted] = useState(() => {
    return sessionStorage.getItem('systemos_session') === 'true';
  });

  const [isZooming, setIsZooming] = useState(() => {
    return sessionStorage.getItem('systemos_session') === 'true';
  });

  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    masterVolume: 100,
    bgmVolume: 30,
    sfxEnabled: true,
    currentTrack: '/ambient-bg.mp3',
    scanlineOpacity: 0,
    aberration: 0
  });

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(settings.currentTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0;

      audioRef.current.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
      }, false);
    } else if (audioRef.current.src && !audioRef.current.src.endsWith(settings.currentTrack)) {
      const wasPlaying = isPlaying && !audioRef.current.paused;
      audioRef.current.src = settings.currentTrack;
      if (wasPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    }
  }, [settings.currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const targetVolume = (settings.masterVolume / 100) * (settings.bgmVolume / 100);
      gsap.to(audioRef.current, { volume: isMuted ? 0 : targetVolume, duration: 0.5 });
    }
  }, [settings.bgmVolume, settings.masterVolume, isMuted, isPlaying]);

  const handleInteraction = () => {
    if (isZooming || isLoading || isGameStarted) return;
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        const targetVolume = (settings.masterVolume / 100) * (settings.bgmVolume / 100);
        gsap.to(audioRef.current, { volume: isMuted ? 0 : targetVolume, duration: 3 });
      }).catch((err) => console.log("Audio autoplay was blocked:", err));
    }
  };

  useEffect(() => {
    if (isGameStarted && audioRef.current && isPlaying) {
      gsap.to(audioRef.current, {
        volume: 0, duration: 1.5, onComplete: () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);
        }
      });
    }
  }, [isGameStarted]);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      const targetVolume = (settings.masterVolume / 100) * (settings.bgmVolume / 100);
      gsap.to(audioRef.current, { volume: newMuteState ? 0 : targetVolume, duration: 0.5 });
    }
  };

  return (
    <div
      onClick={handleInteraction}
      className={`relative w-screen h-screen bg-[#050403] overflow-hidden font-display select-none ${isGameStarted ? '' : 'force-gpu-raster'}`}
      style={{
        backgroundImage: 'radial-gradient(circle at center, #2a1f1a 0%, #050403 60%, #000 100%)',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.95)',
        filter: (!isGameStarted && settings.aberration > 0) ? `drop-shadow(${settings.aberration}px 0 0 rgba(255,0,0,0.6)) drop-shadow(-${settings.aberration}px 0 0 rgba(0,255,255,0.6))` : 'none'
      }}
    >
      {/* CRT Scanline Layer – desktop only perf concern, fine to keep as-is */}
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

      {/* OptionsPanel: hidden on mobile via className (see component) */}
      <OptionsPanel
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* 3D Canvas – desktop only */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out hidden md:block ${isLoaded ? 'opacity-100' : 'opacity-0'} ${isGameStarted ? '!hidden' : ''}`}>
        <Canvas frameloop={isGameStarted ? 'never' : 'always'}>
          <fog attach="fog" args={['#050403', 5, 30]} />
          <CameraController isZooming={isZooming} setIsLoading={setIsLoading} />

          <Sparkles count={150} scale={12} size={1.5} speed={0.2} opacity={0.15} color="#ffaa44" />

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

          <Html
            transform
            position={[2.7, 0.91, 1.14]}
            rotation={[-0.1, 0, 0]}
            scale={0.23}
            className="pointer-events-auto z-50"
          >
            <div className={`bg-[#050403]/95 w-[440px] h-[340px] p-8 flex flex-col justify-center gap-6 rounded border border-[#ffaa44]/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_0_60px_rgba(255,170,68,0.05)] transition-all duration-500`}>
              {(!isZooming && !isLoading && !isGameStarted) && (
                <div className="flex flex-col items-center gap-2 w-full font-mono uppercase tracking-widest bg-transparent">
                  <div className="w-full flex items-center gap-2 mb-6 pb-3" style={{ borderBottom: '1px solid rgba(255,170,68,0.15)' }}>
                    <div className="w-2 h-2 rounded-full bg-[#ffaa44] animate-pulse"></div>
                    <span className="text-[10px] tracking-[0.4em] text-[#ffaa44]/60">TERMINAL READY</span>
                  </div>

                  {/* ── FIX: Settings button filtered out on mobile ── */}
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
                      className="w-full flex items-center gap-5 px-6 py-5 text-left transition-all duration-300 cursor-pointer pointer-events-auto group rounded-lg"
                      style={{ color: 'rgba(255,170,68,0.8)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,170,68,0.06)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = 'inset 3px 0 0 #ffaa44'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,170,68,0.8)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(255,170,68,0.8)] transition-all">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-[0.2em] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all">{item.label}</span>
                        <span className="text-[10px] tracking-[0.15em] text-white/25 normal-case group-hover:text-white/40 transition-all">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Html>
        </Canvas>
      </div>

      <div className={`transition-opacity duration-1000 ${(isZooming || isLoading || isGameStarted) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <RE7MainMenu
          isLoaded={window.innerWidth < 768 ? true : isLoaded}
          onDiveIn={() => {
            setIsOptionsOpen(false);
            if (window.innerWidth < 768) {
              setIsLoading(true);
            } else {
              setIsZooming(true);
            }
          }}
        />
      </div>

      {isLoading && <LoadingScreen onComplete={() => {
        setIsLoading(false);
        setIsGameStarted(true);
        sessionStorage.setItem('systemos_session', 'true');
        if (audioRef.current && isPlaying) {
          gsap.to(audioRef.current, {
            volume: 0, duration: 2, onComplete: () => {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              setIsPlaying(false);
            }
          });
        }
      }} />}

      {isGameStarted && <SystemOS onLogout={() => {
        setIsGameStarted(false);
        setIsZooming(false);
        sessionStorage.removeItem('systemos_session');
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            const targetVolume = (settings.masterVolume / 100) * (settings.bgmVolume / 100);
            gsap.to(audioRef.current, { volume: isMuted ? 0 : targetVolume, duration: 3 });
          }).catch(() => { });
        }
      }} />}

      {/* Audio Toggle – desktop only (hidden md:block already) */}
      <div
        onClick={toggleMute}
        className={`hidden md:block absolute top-8 right-12 z-[100] text-[#ffaa44] drop-shadow-[0_0_8px_rgba(255,170,68,0.8)] cursor-pointer hover:text-white hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] transition-all duration-300 p-2 ${(isZooming || isLoading || isGameStarted) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        )}
      </div>

    </div>
  );
}

export default App;