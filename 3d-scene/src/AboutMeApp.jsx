import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, useGLTF, useAnimations } from '@react-three/drei';
import { MeshoptDecoder } from 'meshoptimizer';

// ── SVG Social Icons ──────────────────────────────────────────────────────────
const GithubIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
);
const LinkedinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
);
const InstagramIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
);

const SOCIAL_LINKS = [
    { label: 'GITHUB',    url: 'https://github.com/Ani29hs',                            Icon: GithubIcon    },
    { label: 'LINKEDIN',  url: 'https://www.linkedin.com/in/aniket-sharma-6a765a380/', Icon: LinkedinIcon  },
    { label: 'INSTAGRAM', url: 'https://www.instagram.com/ani_292006/',                Icon: InstagramIcon },
];

function AvatarModel() {
    const group = useRef();
    const gltf = useGLTF('/waving.glb', undefined, undefined, (loader) => {
        loader.setMeshoptDecoder(MeshoptDecoder);
    });
    const { actions } = useAnimations(gltf.animations, group);
    useEffect(() => {
        const actionNames = Object.keys(actions);
        if (actionNames.length > 0) {
            const firstAction = actions[actionNames[0]];
            firstAction.reset().fadeIn(0.5).play();
            return () => firstAction.fadeOut(0.5);
        }
    }, [actions]);
    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <primitive ref={group} object={gltf.scene} position={[0, -1.5, 0]} scale={[0.9, 0.9, 0.9]} />
        </Float>
    );
}
useGLTF.preload('/waving.glb');

// ── Animated number counter ───────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1200, decimals = 2 }) {
    const [val, setVal] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(eased * target);
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [started, target, duration]);

    return <span ref={ref}>{val.toFixed(decimals)}</span>;
}

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); observer.disconnect(); } }, { threshold: 0.12 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return (
        <div ref={ref} className={className} style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'translateY(0)' : 'translateY(28px)',
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.2,0.8,0.2,1) ${delay}ms`
        }}>
            {children}
        </div>
    );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionLabel({ children }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--os-primary)', boxShadow: '0 0 8px var(--os-primary)', animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.3em', color: 'var(--os-primary)', textTransform: 'uppercase', opacity: 0.9 }}>{children}</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, color-mix(in srgb, var(--os-primary) 30%, transparent), transparent)' }} />
        </div>
    );
}

// ── Skill chip ────────────────────────────────────────────────────────────────
function SkillChip({ label, index }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: '5px 12px',
                border: `1px solid ${hov ? 'var(--os-primary)' : 'var(--os-border)'}`,
                borderRadius: 20,
                fontSize: 11,
                fontFamily: 'inherit',
                color: hov ? 'var(--os-primary)' : 'var(--os-text)',
                background: hov ? 'color-mix(in srgb, var(--os-primary) 8%, transparent)' : 'color-mix(in srgb, var(--os-bg) 40%, transparent)',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'default', whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.25s ease',
                transform: hov ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hov ? '0 4px 16px color-mix(in srgb, var(--os-primary) 20%, transparent)' : 'none',
                animationDelay: `${index * 50}ms`,
                animation: 'chipPop 0.4s cubic-bezier(0.2,0.8,0.2,1) both',
            }}
        >
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--os-primary)', opacity: hov ? 1 : 0.5, flexShrink: 0 }} />
            {label}
        </div>
    );
}

// ── Mission item ──────────────────────────────────────────────────────────────
function MissionItem({ text, index }) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '12px 16px',
                background: hov ? 'color-mix(in srgb, var(--os-primary) 5%, transparent)' : 'color-mix(in srgb, var(--os-bg) 40%, transparent)',
                border: `1px solid ${hov ? 'color-mix(in srgb, var(--os-primary) 40%, transparent)' : 'var(--os-border)'}`,
                borderRadius: 10,
                transition: 'all 0.3s ease',
                cursor: 'default',
                animationDelay: `${index * 100}ms`,
                animation: 'slideInLeft 0.5s cubic-bezier(0.2,0.8,0.2,1) both',
                transform: hov ? 'translateX(4px)' : 'translateX(0)',
            }}
        >
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid var(--os-primary)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontSize: 9, color: 'var(--os-primary)', fontFamily: '"Share Tech Mono", monospace' }}>
                {String(index + 1).padStart(2, '0')}
            </div>
            <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--os-text-secondary)' }}>{text}</span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AboutMeApp() {
    const containerRef = useRef(null);
    const rightColRef  = useRef(null);
    const [isCompact, setIsCompact]           = useState(false);
    const [isModelHovered, setIsModelHovered] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection]   = useState(0);

    const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
    const SECTIONS = ['About', 'Skills', 'Mission', 'Goal', 'Beyond'];

    useEffect(() => {
        let timeoutId;
        const observer = new ResizeObserver(entries => {
            const [entry] = entries;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const w = entry.contentRect.width;
                if (w > 0 && w < 550) setIsCompact(true);
                else if (w >= 550)    setIsCompact(false);
            }, 50);
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => { clearTimeout(timeoutId); observer.disconnect(); };
    }, []);

    useEffect(() => {
        const el = rightColRef.current;
        if (!el) return;
        const onScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = el;
            const max = scrollHeight - clientHeight;
            setScrollProgress(max > 0 ? scrollTop / max : 0);
            // detect active section
            sectionRefs.forEach((ref, i) => {
                if (ref.current) {
                    const top = ref.current.offsetTop - 60;
                    if (scrollTop >= top) setActiveSection(i);
                }
            });
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToSection = (i) => {
        if (sectionRefs[i].current && rightColRef.current) {
            rightColRef.current.scrollTo({ top: sectionRefs[i].current.offsetTop - 24, behavior: 'smooth' });
        }
    };

    const skillGroups = [
        { icon: '⟨/⟩', title: 'Languages',  skills: ['Python', 'C++', 'Java'] },
        { icon: '⛁',   title: 'Data & ML',   skills: ['NumPy', 'Pandas', 'EDA', 'Scikit-Learn', 'SQL', 'Web Scraping', 'Power BI'] },
        { icon: '⚡',   title: 'Dev Stack',   skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Django', 'Flask'] },
    ];

    return (
        <div ref={containerRef} className="w-full h-full flex flex-col md:flex-row overflow-hidden" style={{ background: 'var(--os-content-bg)', color: 'var(--os-text)' }}>

            {/* ══ LEFT COLUMN (unchanged) ══ */}
            <div className={`border-b md:border-b-0 md:border-r border-[var(--os-border)] relative flex flex-col items-center justify-center overflow-hidden group min-h-[200px] md:min-h-0 ${isCompact ? 'md:w-1/4 p-3' : 'md:w-1/3 p-6'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--os-primary)] opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none" />
                {isCompact ? (
                    <div className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 mt-auto mb-auto rounded-full overflow-hidden p-[2px] backdrop-blur-md flex-shrink-0" style={{ border: '2px solid var(--os-primary)', boxShadow: '0 0 20px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,170,68,0.2)' }}>
                        <div className="w-full h-full rounded-full bg-[var(--os-bg)]/80 flex items-center justify-center font-display text-2xl sm:text-3xl text-[var(--os-primary)] relative border border-[var(--os-border)]">
                            <span className="absolute animate-[ping_3s_infinite] opacity-20 text-3xl sm:text-4xl">AS</span>
                            AS
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-8 left-8 z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-[2px] backdrop-blur-md" style={{ border: '2px solid var(--os-primary)', boxShadow: '0 0 15px rgba(0,0,0,0.5), inset 0 0 15px rgba(255,170,68,0.2)' }}>
                            <div className="w-full h-full rounded-full bg-[var(--os-bg)]/80 flex items-center justify-center font-display text-xl sm:text-2xl text-[var(--os-primary)] relative border border-[var(--os-border)]">
                                <span className="absolute animate-[ping_3s_infinite] opacity-20 text-2xl sm:text-3xl">AS</span>
                                AS
                            </div>
                        </div>
                        <div className="absolute top-6 right-2 z-20 pointer-events-none" style={{ opacity: isModelHovered ? 1 : 0, transform: isModelHovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.3s ease-out, transform 0.3s ease-out' }}>
                            <div className="relative bg-[var(--os-bg)]/90 backdrop-blur-md border border-[var(--os-primary)]/40 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg max-w-[140px] sm:max-w-[160px]">
                                <p className="text-[10px] sm:text-[11px] leading-relaxed text-[var(--os-text)]" style={{ fontFamily: 'var(--os-font)' }}>Hi there fella! 👋 Excited to read about me?</p>
                                <div className="absolute top-4 -left-1.5 w-3 h-3 rotate-45 bg-[var(--os-bg)]/90 border-l border-b border-[var(--os-primary)]/40" />
                            </div>
                        </div>
                        <div className="relative w-full flex-1 min-h-0 z-0 opacity-90" style={{ minHeight: '160px' }} onMouseEnter={() => setIsModelHovered(true)} onMouseLeave={() => setIsModelHovered(false)}>
                            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                                <ambientLight intensity={1.5} />
                                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                                <directionalLight position={[-10, -10, -5]} intensity={1} color="var(--os-primary)" />
                                <AvatarModel />
                            </Canvas>
                        </div>
                        <div className="relative z-10 text-center space-y-1 mt-2">
                            <h2 className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.15em] uppercase text-[var(--os-text)]">Aniket Sharma</h2>
                            <p className="text-[9px] sm:text-xs font-mono tracking-widest text-[var(--os-primary)] opacity-80 uppercase">CSE - AI &amp; ML Student</p>
                        </div>
                        <div className="relative z-10 flex gap-1.5 sm:gap-3 mt-4 sm:mt-6 flex-wrap justify-center">
                            {SOCIAL_LINKS.map(({ label, url, Icon }) => (
                                <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
                                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest border border-[var(--os-border)] rounded hover:bg-[var(--os-hover)] hover:border-[var(--os-primary)] transition-all cursor-pointer"
                                    style={{ color: 'var(--os-text)' }}>
                                    <span style={{ color: 'var(--os-primary)', flexShrink: 0, display: 'flex' }}><Icon /></span>
                                    <span className="hidden sm:inline">{label}</span>
                                </a>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ══ RIGHT COLUMN ══ */}
            <div className={`${isCompact ? 'md:w-3/4' : 'md:w-2/3'} flex-1 flex flex-col overflow-hidden`} style={{ position: 'relative' }}>

                {/* Scroll progress bar */}
                <div style={{ height: 2, background: 'var(--os-border)', flexShrink: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, left: 0, width: `${scrollProgress * 100}%`, background: 'var(--os-primary)', boxShadow: '0 0 8px var(--os-primary)', transition: 'width 0.08s linear' }} />
                </div>

                {/* Floating section nav dots */}
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20 }}>
                    {SECTIONS.map((s, i) => (
                        <button key={s} onClick={() => scrollToSection(i)} title={s} style={{ width: i === activeSection ? 20 : 6, height: 6, borderRadius: 3, border: 'none', background: i === activeSection ? 'var(--os-primary)' : 'color-mix(in srgb, var(--os-text) 25%, transparent)', cursor: 'pointer', padding: 0, transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)', boxShadow: i === activeSection ? '0 0 8px var(--os-primary)' : 'none' }} />
                    ))}
                </div>

                {/* Scrollable content */}
                <div ref={rightColRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 44px 48px 28px', scrollbarWidth: 'thin', backgroundImage: 'linear-gradient(color-mix(in srgb, var(--os-text) 2%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--os-text) 2%, transparent) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 32 }}>

                        {/* ── ABOUT ── */}
                        <section ref={sectionRefs[0]}>
                            <Reveal>
                                <SectionLabel>About Me</SectionLabel>
                            </Reveal>

                            <Reveal delay={80}>
                                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--os-text-secondary)', marginBottom: 20 }}>
                                    Hi, I'm <strong style={{ color: 'var(--os-text)', fontWeight: 600 }}>Aniket Sharma</strong>, a 19-year-old B.Tech student specializing in <strong style={{ color: 'var(--os-primary)' }}>CSE - AI &amp; ML</strong> at Chitkara University, Rajpura. Originally from Hamirpur, Himachal Pradesh. Currently in my 4th semester — here's my academic record:
                                </p>
                            </Reveal>

                            {/* GPA cards */}
                            <Reveal delay={160}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {[['1st Semester', 9.43], ['2nd Semester', 9.30]].map(([sem, gpa]) => (
                                        <div key={sem} style={{ padding: '18px 20px', background: 'color-mix(in srgb, var(--os-bg) 50%, transparent)', border: '1px solid var(--os-border)', borderRadius: 14, backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s', cursor: 'default' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--os-primary)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--os-border)'}
                                        >
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--os-primary), transparent)', opacity: 0.6 }} />
                                            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 9, letterSpacing: '0.2em', color: 'var(--os-text-secondary)', textTransform: 'uppercase' }}>{sem}</span>
                                            <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 36, lineHeight: 1, color: 'var(--os-primary)', fontWeight: 700 }}>
                                                <AnimatedNumber target={gpa} />
                                            </span>
                                            <span style={{ fontSize: 9, color: 'var(--os-text-secondary)', letterSpacing: '0.1em', opacity: 0.6 }}>SGPA</span>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>

                            <Reveal delay={240}>
                                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--os-text-secondary)', marginTop: 16 }}>
                                    I'm deeply passionate about transforming data into meaningful insights and building intelligent systems.
                                </p>
                            </Reveal>
                        </section>

                        {/* ── SKILLS ── */}
                        <section ref={sectionRefs[1]}>
                            <Reveal>
                                <SectionLabel>Technical_Arsenal</SectionLabel>
                            </Reveal>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {skillGroups.map((group, gi) => (
                                    <Reveal key={group.title} delay={gi * 100}>
                                        <div style={{ padding: '16px 20px', background: 'color-mix(in srgb, var(--os-bg) 40%, transparent)', border: '1px solid var(--os-border)', borderRadius: 14, backdropFilter: 'blur(8px)', transition: 'border-color 0.3s, box-shadow 0.3s', cursor: 'default' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--os-primary) 50%, transparent)'; e.currentTarget.style.boxShadow = '0 0 24px color-mix(in srgb, var(--os-primary) 10%, transparent)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--os-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <span style={{ color: 'var(--os-primary)', fontSize: 14 }}>{group.icon}</span>
                                                <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: 10, letterSpacing: '0.2em', color: 'var(--os-text)', textTransform: 'uppercase', opacity: 0.8 }}>{group.title}</span>
                                            </div>
                                            {/* Horizontal scroll chip row */}
                                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                                                {group.skills.map((skill, si) => (
                                                    <SkillChip key={skill} label={skill} index={si} />
                                                ))}
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </section>

                        {/* ── MISSION ── */}
                        <section ref={sectionRefs[2]}>
                            <Reveal>
                                <SectionLabel>Current_Mission</SectionLabel>
                            </Reveal>
                            <Reveal delay={60}>
                                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--os-text-secondary)', marginBottom: 14 }}>
                                    Currently learning to build ML models from scratch and work on end-to-end pipelines. Upcoming projects focused on:
                                </p>
                            </Reveal>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {['Custom ML model building', 'Real-world dataset implementation', 'Model evaluation & optimization'].map((item, i) => (
                                    <Reveal key={item} delay={i * 80}>
                                        <MissionItem text={item} index={i} />
                                    </Reveal>
                                ))}
                            </div>
                        </section>

                        {/* ── GOAL ── */}
                        <section ref={sectionRefs[3]}>
                            <Reveal>
                                <SectionLabel>Career_Goal</SectionLabel>
                            </Reveal>
                            <Reveal delay={80}>
                                <div style={{ position: 'relative', padding: '24px 28px', borderLeft: '3px solid var(--os-primary)', background: 'color-mix(in srgb, var(--os-primary) 6%, transparent)', borderRadius: '0 14px 14px 0', overflow: 'hidden' }}>
                                    {/* shimmer sweep */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--os-primary) 6%, transparent) 50%, transparent 60%)', animation: 'shimmer 4s ease infinite', backgroundSize: '200% 100%' }} />
                                    <div style={{ position: 'absolute', top: 10, left: 20, fontSize: 48, color: 'var(--os-primary)', opacity: 0.12, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>"</div>
                                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--os-text)', fontStyle: 'italic', position: 'relative', zIndex: 1, margin: 0 }}>
                                        My ultimate goal is to become a capable and impactful <strong style={{ color: 'var(--os-primary)', fontStyle: 'normal' }}>Data Scientist</strong> who builds intelligent solutions that solve real-world problems.
                                    </p>
                                </div>
                            </Reveal>
                        </section>

                        {/* ── BEYOND CODE ── */}
                        <section ref={sectionRefs[4]}>
                            <Reveal>
                                <SectionLabel>Beyond_Code</SectionLabel>
                            </Reveal>
                            <Reveal delay={60}>
                                <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--os-text-secondary)', marginBottom: 14 }}>When I'm not coding, you'll find me:</p>
                            </Reveal>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {[['🏏', 'Playing cricket'], ['📚', 'Reading books'], ['🚀', 'Exploring new tech']].map(([emoji, label], i) => (
                                    <Reveal key={label} delay={i * 80}>
                                        <div
                                            style={{ padding: '10px 18px', border: '1px solid var(--os-border)', borderRadius: 24, fontSize: 13, color: 'var(--os-text)', background: 'color-mix(in srgb, var(--os-bg) 40%, transparent)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'default', transition: 'all 0.3s ease', backdropFilter: 'blur(4px)' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--os-primary)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--os-primary) 8%, transparent)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px color-mix(in srgb, var(--os-primary) 15%, transparent)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--os-border)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--os-bg) 40%, transparent)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <span style={{ fontSize: 18 }}>{emoji}</span>
                                            <span>{label}</span>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                @keyframes chipPop { from{opacity:0;transform:scale(0.85) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
                @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
                div::-webkit-scrollbar { width:3px; height:3px }
                div::-webkit-scrollbar-track { background:transparent }
                div::-webkit-scrollbar-thumb { background:color-mix(in srgb,var(--os-primary) 30%,transparent); border-radius:2px }
            `}</style>
        </div>
    );
}