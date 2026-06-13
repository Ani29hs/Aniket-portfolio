import { useRef, useState, useEffect, useCallback } from "react";
import { Linkedin, Github, Instagram } from 'lucide-react';

/* ─── Data ─── */
export const PROJECTS = [
    { id: 1, title: "Neural Engine V2", tag: "ML / AI", year: "2024", status: "ACTIVE", statusColor: "#00ff87", desc: "Advanced ML architecture for predictive modeling in zero-gravity environments. Achieves 94% accuracy on non-euclidean datasets.", tech: ["Python", "TensorFlow", "CUDA", "JAX"], color: "#2563eb", grad: "135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%" },
    { id: 2, title: "Quantum Key Dist.", tag: "CRYPTOGRAPHY", year: "2024", status: "CLASSIFIED", statusColor: "#ff4444", desc: "Secure communication via entangled photon states. Unbreakable by any known classical or quantum adversary.", tech: ["C++", "Qiskit", "OpenSSL"], color: "#10b981", grad: "135deg, #022c22 0%, #064e3b 50%, #10b981 100%" },
    { id: 3, title: "Orbital Logistics", tag: "INTERFACE", year: "2023", status: "ACTIVE", statusColor: "#60a5fa", desc: "Real-time dashboard tracking supply chain metrics across 14 planetary colonies with sub-second latency.", tech: ["React", "Three.js", "WebGL", "D3"], color: "#a855f7", grad: "135deg, #2e1065 0%, #6b21a8 50%, #a855f7 100%" },
    { id: 4, title: "Bio-Sync Interface", tag: "BIOTECH", year: "2023", status: "BETA", statusColor: "#fb923c", desc: "Telemetry and health monitoring for augmented operatives. Processes 2M data points per second.", tech: ["Rust", "WebSockets", "Vue"], color: "#f97316", grad: "135deg, #431407 0%, #9a3412 50%, #f97316 100%" },
    { id: 5, title: "Dark Matter Mapper", tag: "ASTROPHYSICS", year: "2023", status: "ACTIVE", statusColor: "#60a5fa", desc: "Maps gravitational lensing signatures across deep-field telescope arrays to infer dark matter distribution.", tech: ["Python", "NumPy", "FITS", "GPU"], color: "#ec4899", grad: "135deg, #500724 0%, #9d174d 50%, #ec4899 100%" },
    { id: 6, title: "Exo-Atmosphere AI", tag: "CLIMATE SYS", year: "2022", status: "ACTIVE", statusColor: "#00ff87", desc: "Generative climate modeling for terraformed worlds. Simulates 1000-year weather cycles in under 4 minutes.", tech: ["Fortran", "Python", "MPI"], color: "#0ea5e9", grad: "135deg, #082f49 0%, #0c4a6e 50%, #0ea5e9 100%" },
    { id: 7, title: "Syn-Cortex OS", tag: "EMBEDDED SYS", year: "2022", status: "CLASSIFIED", statusColor: "#ff4444", desc: "Operating system for synthetic neural substrates. Boots in 11ms. Full POSIX compliance on augmented hardware.", tech: ["C", "Assembly", "LLVM"], color: "#eab308", grad: "135deg, #422006 0%, #713f12 50%, #eab308 100%" },
    { id: 8, title: "Hypernet Protocol", tag: "NETWORKING", year: "2024", status: "ACTIVE", statusColor: "#60a5fa", desc: "Faster-than-light communication emulation layer for interplanetary mesh networks with zero packet loss.", tech: ["Go", "gRPC", "eBPF"], color: "#14b8a6", grad: "135deg, #042f2e 0%, #134e4a 50%, #14b8a6 100%" },
];
const METRICS = [
    { num: "38,215+", label: "Lines of Code", sub: "Across all active repositories", icon: "{ }" },
    { num: "5+", label: "Projects ACTIVE", sub: "In production across 14 systems", icon: "⬡" },
    { num: "99.97%", label: "System Uptime", sub: "Over the last 365 days", icon: "◎" },
    { num: "2.1GB", label: "Data Processed", sub: "Monthly throughput average", icon: "≋" },
    { num: "<4ms", label: "Avg. Latency", sub: "P99 across all live services", icon: "⚡" },
];
const COLORS = [
    { color: "#2563eb", grad: "135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%" },
    { color: "#10b981", grad: "135deg, #022c22 0%, #064e3b 50%, #10b981 100%" },
    { color: "#a855f7", grad: "135deg, #2e1065 0%, #6b21a8 50%, #a855f7 100%" },
    { color: "#f97316", grad: "135deg, #431407 0%, #9a3412 50%, #f97316 100%" },
    { color: "#ec4899", grad: "135deg, #500724 0%, #9d174d 50%, #ec4899 100%" },
    { color: "#0ea5e9", grad: "135deg, #082f49 0%, #0c4a6e 50%, #0ea5e9 100%" },
    { color: "#eab308", grad: "135deg, #422006 0%, #713f12 50%, #eab308 100%" },
    { color: "#14b8a6", grad: "135deg, #042f2e 0%, #134e4a 50%, #14b8a6 100%" },
];
const ACCENT6 = ["#2563eb", "#10b981", "#a855f7", "#f97316", "#ec4899", "#0ea5e9"];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GLOBAL SINGLE RAF LOOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const _cbs = new Set();
let _raf = null;
const _loop = () => { _cbs.forEach(fn => fn()); _raf = requestAnimationFrame(_loop); };
const addRAF = fn => { _cbs.add(fn); if (_cbs.size === 1) _raf = requestAnimationFrame(_loop); };
const removeRAF = fn => { _cbs.delete(fn); if (_cbs.size === 0 && _raf) { cancelAnimationFrame(_raf); _raf = null; } };

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SHARED SCROLL REF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const _scroll = { top: 0 };

/* ─── useIsMobile hook ─── */
function useIsMobile(bp = 768) {
    const [is, setIs] = useState(() => typeof window !== "undefined" && window.innerWidth < bp);
    useEffect(() => {
        const h = () => setIs(window.innerWidth < bp);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, [bp]);
    return is;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CSS — desktop unchanged + mobile additions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const GLOBAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--os-border-active);border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:var(--os-text-muted);}

/* ── Project card hover ── */
.omega-pc {
  will-change: transform;
  transform: scale(1);
  transition: border-color .35s, box-shadow .35s, transform .35s, background .35s;
}
.omega-pc .pc-bg   { transition: opacity .45s; }
.omega-pc:hover .pc-bg { opacity: .15 !important; }
.omega-pc .pc-glow { opacity: 0; transition: opacity .2s; }
.omega-pc:hover .pc-glow { opacity: .15 !important; }
.omega-pc .pc-cta  { opacity:0; transform:translateY(10px); transition: opacity .32s, transform .32s; }
.omega-pc:hover .pc-cta { opacity:1 !important; transform:translateY(0) !important; }
.omega-pc .pc-bot  { opacity: 0; transition: opacity .35s; }
.omega-pc:hover .pc-bot { opacity:1 !important; }
.omega-pc .pc-remove { opacity: 0; transition: opacity .2s; pointer-events: none; }
.omega-pc:hover .pc-remove { opacity: 1 !important; pointer-events: auto; }
.omega-pc:hover { 
  border-color: var(--os-border-active) !important; 
  box-shadow: 0 40px 80px rgba(0,0,0,.4), inset 0 1px 0 var(--os-border-active) !important; 
  transform: translateY(-8px) scale(1.02) !important; 
  background: rgba(25, 30, 28, 0.4) !important; 
}

/* ── Mobile project card ── */
@media (max-width: 767px) {
  .omega-pc { transform: none !important; }
  .omega-pc .pc-cta { opacity:1 !important; transform:translateY(0) !important; }
  .omega-pc .pc-remove { opacity:1 !important; pointer-events:auto !important; }
  .omega-pc .pc-bot { opacity:1 !important; }
  .omega-pc .pc-bg { opacity:.1 !important; }
}

/* ── Metric card hover ── */
.omega-mc {
  will-change: transform;
  transition: border-color .35s, box-shadow .35s, transform .35s;
}
.omega-mc:hover { transform: translateY(-4px) !important; border-color: var(--os-border-active) !important; box-shadow: 0 20px 40px rgba(0,0,0,.2) !important; }
.omega-mc .mc-bot { opacity: 0; transition: opacity .35s; }
.omega-mc:hover .mc-bot { opacity:1 !important; }

@media (max-width: 767px) {
  .omega-mc { transform: none !important; }
  .omega-mc .mc-bot { opacity:1 !important; }
}

/* ── Social circle ── */
.omega-sc {
  will-change: transform;
  transition: border-color .28s, background .28s, color .28s, box-shadow .28s, transform .28s;
}
.omega-sc:hover {
  border-color: var(--sc-c) !important;
  background: var(--sc-bg) !important;
  color: var(--sc-c) !important;
  box-shadow: var(--sc-shadow) !important;
  transform: scale(1.1) translateY(-4px) !important;
}

/* ── Mobile vertical card stack ── */
@media (max-width: 767px) {
  .mobile-card-stack {
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    padding: 16px 16px 40px !important;
  }
  .mobile-card-stack > * {
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    flex-shrink: unset !important;
  }
}

@keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.25;transform:scale(.5)} }
@keyframes scrollHint{
  0%  {opacity:0;transform:scaleY(0);transform-origin:top}
  30% {opacity:1;transform:scaleY(1);transform-origin:top}
  70% {opacity:1;transform:scaleY(1);transform-origin:bottom}
  100%{opacity:0;transform:scaleY(0);transform-origin:bottom}
}
`;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HORIZONTAL SCROLL SECTION (desktop) / VERTICAL STACK (mobile)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HorizontalScrollSection({ children, title, accent, sectionId }) {
    const isMobile = useIsMobile();
    const outerRef = useRef(null);
    const trackRef = useRef(null);
    const barRef = useRef(null);
    const textRef = useRef(null);
    const hintRef = useRef(null);
    const childArray = Array.isArray(children) ? children : [children];

    useEffect(() => {
        if (isMobile) return; // no horizontal scroll on mobile

        const scrollEl = document.getElementById("projects-scroll-container");
        if (!scrollEl) return;

        const tick = () => {
            const outer = outerRef.current;
            const track = trackRef.current;
            if (!outer || !track) return;

            const viewH = scrollEl.clientHeight;
            const outerRect = outer.getBoundingClientRect();
            const scrollRect = scrollEl.getBoundingClientRect();
            const scrolled = scrollRect.top - outerRect.top;
            const totalScroll = outer.offsetHeight - viewH;
            const p = Math.max(0, Math.min(1, scrolled / totalScroll));

            const overflowW = track.scrollWidth - scrollEl.clientWidth + 120;
            track.style.transform = `translate3d(${-p * overflowW}px,0,0)`;

            if (barRef.current) barRef.current.style.width = `${p * 100}%`;
            if (textRef.current) textRef.current.textContent = `${Math.round(p * 100)}%`;
            if (hintRef.current) hintRef.current.style.opacity = `${Math.max(0, 1 - p * 14)}`;
        };

        addRAF(tick);
        return () => removeRAF(tick);
    }, [isMobile]);

    /* ── MOBILE: plain vertical stack, no sticky/scroll magic ── */
    if (isMobile) {
        return (
            <div>
                {/* Compact top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(128,128,128,0.1)", background: "var(--os-bg)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 2, height: 20, background: accent, borderRadius: 1 }} />
                        <span style={{ fontFamily: '"Outfit",monospace', fontSize: 9, letterSpacing: "0.2em", color: "var(--os-text)", opacity: 0.6, textTransform: "uppercase" }}>{title}</span>
                    </div>
                </div>
                {/* Vertical card stack */}
                <div className="mobile-card-stack">
                    {children}
                </div>
            </div>
        );
    }

    /* ── DESKTOP: original horizontal sticky scroll ── */
    return (
        <div ref={outerRef} style={{ height: `${childArray.length * 60 + 200}vh`, position: "relative" }}>
            <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "visible", background: "var(--os-bg)", color: "var(--os-text)" }}>

                {/* Top bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 60px", borderBottom: "1px solid var(--os-border)5)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 2, height: 28, background: accent, borderRadius: 1 }} />
                        <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 13, letterSpacing: "0.15em", color: "var(--os-text)", opacity: 0.8, textTransform: "uppercase", fontWeight: 600 }}>{title}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 140, height: 1, background: "var(--os-border-active)", borderRadius: 1, overflow: "hidden" }}>
                            <div ref={barRef} style={{ height: "100%", width: "0%", background: `linear-gradient(90deg, ${accent}88, ${accent})`, borderRadius: 1 }} />
                        </div>
                        <span ref={textRef} style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: "var(--os-text)", opacity: 0.6, letterSpacing: "0.1em", minWidth: 32, fontWeight: 500 }}>0%</span>
                    </div>
                </div>

                {/* Arrow hint */}
                <div ref={hintRef} style={{ position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10, color: "var(--os-text)", opacity: 0.4, letterSpacing: "0.2em", writingMode: "vertical-rl", fontWeight: 500 }}>SCROLL DOWN</div>
                    <div style={{ width: 1, height: 50, background: `linear-gradient(to bottom, ${accent}, transparent)`, animation: "scrollHint 1.8s ease-in-out infinite" }} />
                </div>

                {/* Cards track */}
                <div ref={trackRef} style={{ display: "flex", alignItems: "center", height: "100%", paddingLeft: 60, paddingRight: 60, gap: 20, willChange: "transform", paddingTop: 47, paddingBottom: 70 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROJECT CARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ProjectCard({ project, index, onRemove }) {
    const isMobile = useIsMobile();
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const ptr = useRef({ x: 0, y: 0, inside: false });

    useEffect(() => {
        if (isMobile) return; // no tilt on mobile
        const card = cardRef.current;
        if (!card) return;

        const tick = () => {
            if (!ptr.current.inside) return;
            const r = card.getBoundingClientRect();
            const x = ptr.current.x - r.left;
            const y = ptr.current.y - r.top;
            const tX = ((y - r.height / 2) / (r.height / 2)) * -9;
            const tY = ((x - r.width / 2) / (r.width / 2)) * 9;
            card.style.transform = `perspective(1100px) rotateX(${tX}deg) rotateY(${tY}deg) scale(1.025)`;
            if (glowRef.current) {
                glowRef.current.style.left = `${x}px`;
                glowRef.current.style.top = `${y}px`;
            }
        };

        const onMove = e => { ptr.current.x = e.clientX; ptr.current.y = e.clientY; };
        const onEnter = e => { ptr.current.x = e.clientX; ptr.current.y = e.clientY; ptr.current.inside = true; };
        const onLeave = () => {
            ptr.current.inside = false;
            card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)";
        };

        card.addEventListener("mousemove", onMove, { passive: true });
        card.addEventListener("mouseenter", onEnter, { passive: true });
        card.addEventListener("mouseleave", onLeave, { passive: true });
        addRAF(tick);

        return () => {
            card.removeEventListener("mousemove", onMove);
            card.removeEventListener("mouseenter", onEnter);
            card.removeEventListener("mouseleave", onLeave);
            removeRAF(tick);
        };
    }, [isMobile]);

    const FALLBACK_COLORS = ["#00ff87", "#2563eb", "#8b5cf6", "#f97316", "#eab308", "#06b6d4"];
    const fallbackColor = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    const color = project.color || fallbackColor;
    const grad = project.grad || `${color}, transparent`;
    const pcGs = color + "1a";

    /* ── Mobile card layout ── */
    if (isMobile) {
        return (
            <div
                ref={cardRef}
                className="omega-pc"
                style={{
                    "--pc-c": color, "--pc-gs": pcGs,
                    width: "100%",
                    borderRadius: 24,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid var(--os-border)6)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    background: "var(--os-glass)",
                    color: "var(--os-text)",
                    padding: "24px 20px 20px",
                }}
            >
                {/* Background gradient */}
                <div className="pc-bg" style={{ position: "absolute", inset: 0, background: `linear-gradient(${grad})`, opacity: 0.05, filter: "saturate(1.7)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,12,0.5) 0%, transparent 100%)", pointerEvents: "none" }} />

                {/* Remove button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(project.id.toString()); }}
                    style={{ position: "absolute", top: 12, right: 12, zIndex: 30, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--os-border)5)", border: "1px solid var(--os-border-active)", color: "var(--os-text-muted)", cursor: "pointer", backdropFilter: "blur(10px)" }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>

                {/* Header row */}
                <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: '"Outfit", sans-serif', fontSize: 9, letterSpacing: "0.1em", color, background: color + "10", border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {project.tag}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: project.statusColor, boxShadow: `0 0 6px ${project.statusColor}`, animation: "pulseDot 2s infinite" }} />
                        <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 9, color: project.statusColor, letterSpacing: "0.1em", fontWeight: 600 }}>{project.status}</span>
                    </div>
                </div>

                {/* Title + desc */}
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 9, color: "var(--os-text-muted)", letterSpacing: "0.15em", marginBottom: 6, fontWeight: 500 }}>
                        /{String(index + 1).padStart(2, "0")} OMEGA ARCHIVE · {project.year}
                    </div>
                    <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 26, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--os-text)", marginBottom: 10, fontWeight: 600 }}>
                        {project.title}
                    </h3>
                    <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 12, color: "var(--os-text-secondary)", lineHeight: 1.6, marginBottom: 16, fontWeight: 300 }}>
                        {project.desc}
                    </p>

                    {/* Tech tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                        {project.tech.slice(0, 4).map(t => (
                            <span key={t} style={{ fontFamily: '"Outfit", sans-serif', fontSize: 9, padding: "3px 10px", borderRadius: 20, background: "var(--os-border)3)", border: "1px solid var(--os-border)5)", color: "var(--os-text-secondary)", letterSpacing: "0.05em" }}>{t}</span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div style={{ display: "flex", gap: 14 }}>
                        {project.deployedUrl ? (
                            <>
                                <div className="pc-cta" onClick={(e) => { e.stopPropagation(); window.open(project.deployedUrl, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 16, height: 1, background: color }} />
                                    <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 9, color, letterSpacing: "0.2em", fontWeight: 600 }}>DEPLOYMENT</span>
                                </div>
                                {project.url && (
                                    <div className="pc-cta" onClick={(e) => { e.stopPropagation(); window.open(project.url, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 10, height: 1, background: "var(--os-border-active)" }} />
                                        <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 8, color: "var(--os-text-secondary)", letterSpacing: "0.2em", fontWeight: 600 }}>SOURCE</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="pc-cta" onClick={(e) => { e.stopPropagation(); if (project.url) window.open(project.url, "_blank"); }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 20, height: 1, background: color }} />
                                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 9, color, letterSpacing: "0.2em", fontWeight: 600 }}>VIEW PROJECT</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pc-bot" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
            </div>
        );
    }

    /* ── DESKTOP: original card ── */
    return (
        <div
            ref={cardRef}
            className="omega-pc"
            style={{
                "--pc-c": color, "--pc-gs": pcGs,
                flexShrink: 0, width: 380, height: "65%", maxHeight: 560, minHeight: 460,
                borderRadius: 32, position: "relative", overflow: "hidden", cursor: "pointer",
                border: "1px solid var(--os-border)6)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                background: "var(--os-glass)", color: "var(--os-text)",
            }}
        >
            <div className="pc-bg" style={{ position: "absolute", inset: 0, background: `linear-gradient(${grad})`, opacity: 0.05, filter: "saturate(1.7)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,12,0.5) 0%, transparent 100%)", pointerEvents: "none" }} />
            <div ref={glowRef} className="pc-glow" style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 60%)`, opacity: 0, transform: "translate(-50%,-50%)", pointerEvents: "none", willChange: "transform, opacity" }} />

            <div style={{ position: "absolute", bottom: -10, right: -10, fontFamily: '"Space Grotesk", sans-serif', fontSize: 160, color, opacity: 0.03, lineHeight: 1, userSelect: "none", pointerEvents: "none", fontWeight: 700 }}>
                {String(index + 1).padStart(2, "0")}
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onRemove(project.id.toString()); }}
                className="pc-remove"
                style={{ position: "absolute", top: 16, right: 16, zIndex: 30, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "var(--os-border)5)", border: "1px solid var(--os-border-active)", color: "var(--os-text-muted)", cursor: "pointer", backdropFilter: "blur(10px)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ff4a4a"; e.currentTarget.style.borderColor = "rgba(255,74,74,0.5)"; e.currentTarget.style.background = "rgba(255,74,74,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--os-text-muted)"; e.currentTarget.style.borderColor = "var(--os-border-active)"; e.currentTarget.style.background = "var(--os-border)5)"; }}
                title="Remove Project (Admin)"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <div style={{ position: "absolute", top: 24, left: 28, right: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: '"Outfit", sans-serif', fontSize: 10, letterSpacing: "0.1em", color, background: color + "10", border: `1px solid ${color}30`, padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={color}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    {project.tag} STARS
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: "var(--os-text-muted)", letterSpacing: "0.1em", fontWeight: 500 }}>{project.year}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: project.statusColor, boxShadow: `0 0 8px ${project.statusColor}`, animation: "pulseDot 2s infinite" }} />
                        <span style={{ fontFamily: '"Outfit", sans-serif', fontSize: 9, color: project.statusColor, letterSpacing: "0.1em", fontWeight: 600 }}>{project.status}</span>
                    </div>
                </div>
            </div>

            <div className="pc-body" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 28px" }}>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10, color: "var(--os-text-muted)", letterSpacing: "0.15em", marginBottom: 10, fontWeight: 500 }}>
                    /{String(index + 1).padStart(2, "0")} OMEGA ARCHIVE
                </div>
                <h3 className="pc-ttl" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 32, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--os-text)", marginBottom: 14, fontWeight: 600 }}>
                    {project.title}
                </h3>
                <p style={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: "var(--os-text-secondary)", lineHeight: 1.6, marginBottom: 24, fontWeight: 300 }}>
                    {project.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, height: 24, overflow: "hidden" }}>
                    {project.tech.slice(0, 4).map(t => (
                        <span key={t} style={{ fontFamily: '"Outfit", sans-serif', fontSize: 10, padding: "4px 12px", borderRadius: 20, background: "var(--os-border)3)", border: "1px solid var(--os-border)5)", color: "var(--os-text-secondary)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{t}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    {project.deployedUrl ? (
                        <>
                            <div className="pc-cta" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => { e.stopPropagation(); window.open(project.deployedUrl, "_blank"); }}>
                                <div style={{ width: 24, height: 1, background: color }} />
                                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10, color, letterSpacing: "0.2em", whiteSpace: "nowrap", fontWeight: 600 }}>VIEW DEPLOYMENT</span>
                            </div>
                            {project.url && (
                                <div className="pc-cta" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => { e.stopPropagation(); window.open(project.url, "_blank"); }}>
                                    <div style={{ width: 14, height: 1, background: "var(--os-border-active)" }} />
                                    <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 9, color: "var(--os-text-secondary)", letterSpacing: "0.2em", whiteSpace: "nowrap", fontWeight: 600 }}>SOURCE CODE</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="pc-cta" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => { e.stopPropagation(); if (project.url) window.open(project.url, "_blank"); }}>
                            <div style={{ width: 32, height: 1, background: color }} />
                            <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10, color, letterSpacing: "0.2em", whiteSpace: "nowrap", fontWeight: 600 }}>VIEW PROJECT</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="pc-bot" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   METRIC CARD — zero useState, pure CSS hover
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MetricCard({ metric, index }) {
    const isMobile = useIsMobile();
    const accent = ACCENT6[index % ACCENT6.length];
    const mcGs = accent + "15";
    const mc77 = accent + "77";

    if (isMobile) {
        return (
            <div
                className="omega-mc"
                style={{
                    "--mc-c": accent, "--mc-gs": mcGs, "--mc-c77": mc77,
                    width: "100%",
                    borderRadius: 24,
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid var(--os-border)6)",
                    background: "var(--os-glass)",
                    color: "var(--os-text)",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "20px",
                }}
            >
                <div style={{ flexShrink: 0 }}>
                    <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: 24, color: accent, opacity: 0.9, lineHeight: 1, marginBottom: 8 }}>{metric.icon}</div>
                    <div style={{ width: 30, height: 2, background: accent, borderRadius: 2 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mc-num" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 32, lineHeight: 1, color: "var(--os-text)", letterSpacing: "-0.02em", fontWeight: 700, marginBottom: 4 }}>
                        {metric.num}
                    </div>
                    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 13, color: accent, letterSpacing: "0.05em", marginBottom: 6, fontWeight: 600 }}>
                        {metric.label}
                    </div>
                    <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: 11, color: "var(--os-text-secondary)", lineHeight: 1.5, fontWeight: 300 }}>{metric.sub}</div>
                </div>
                <div className="mc-bot" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            </div>
        );
    }

    return (
        <div
            className="omega-mc"
            style={{
                "--mc-c": accent, "--mc-gs": mcGs, "--mc-c77": mc77,
                flexShrink: 0, width: 400, height: "65%", maxHeight: 560, minHeight: 460,
                borderRadius: 32, position: "relative", overflow: "hidden", cursor: "default",
                border: "1px solid var(--os-border)6)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                background: "var(--os-glass)", color: "var(--os-text)",
                display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 44px",
            }}
        >
            <div style={{ position: "absolute", bottom: -30, right: -20, fontFamily: '"Space Grotesk", sans-serif', fontSize: 220, color: accent, opacity: 0.03, lineHeight: 1, userSelect: "none", pointerEvents: "none", fontWeight: 700 }}>
                {String(index + 1).padStart(2, "0")}
            </div>

            <div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: 32, color: accent, opacity: 0.9, marginBottom: 24, lineHeight: 1 }}>{metric.icon}</div>
                <div style={{ width: 50, height: 3, background: accent, borderRadius: 2, marginBottom: 36 }} />
                <div className="mc-num" style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: "clamp(64px,7vw,88px)", lineHeight: 1, color: "var(--os-text)", letterSpacing: "-0.02em", fontWeight: 700 }}>
                    {metric.num}
                </div>
                <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 24, color: accent, letterSpacing: "0.05em", marginTop: 16, lineHeight: 1, fontWeight: 600 }}>
                    {metric.label}
                </div>
            </div>

            <div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: 13, color: "var(--os-text-muted)", lineHeight: 1.7, marginBottom: 32, fontWeight: 300 }}>{metric.sub}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 10, color: "var(--os-border-active)", letterSpacing: "0.15em", fontWeight: 500 }}>METRIC_{String(index + 1).padStart(3, "0")}</div>
                    <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${accent}55)` }} />
                </div>
            </div>

            <div className="mc-bot" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div className="mc-side" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, transparent, ${accent}33, transparent)` }} />
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Hero({ repoCount }) {
    const isMobile = useIsMobile();
    const contentRef = useRef(null);
    const timeRef = useRef(null);
    const charsRef = useRef(null);
    const orb0 = useRef(null);
    const orb1 = useRef(null);
    const orb2 = useRef(null);
    const ORB_SPEED = [0.08, 0.05, 0.12];

    useEffect(() => {
        const scrollEl = document.getElementById("projects-scroll-container");
        if (!scrollEl) return;

        const tick = () => {
            // Parallax disabled for performance
            // const sy = window.scrollY || 0;
            // if (contentRef.current) contentRef.current.style.transform = `translate3d(0,${sy * -0.04}px,0)`;
        };
        addRAF(tick);

        const clockId = setInterval(() => {
            if (timeRef.current) timeRef.current.textContent = new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC";
        }, 1000);

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const target = "PROJECT ARCHIVE";
        let iter = 0;
        const scrambleId = setInterval(() => {
            if (!charsRef.current) return;
            charsRef.current.textContent = target.split("").map((c, i) => {
                if (c === " ") return " ";
                if (i < iter) return target[i];
                return letters[Math.floor(Math.random() * letters.length)];
            }).join("");
            if (iter >= target.length) clearInterval(scrambleId);
            iter += 0.5;
        }, 40);

        return () => {
            removeRAF(tick);
            clearInterval(clockId);
            clearInterval(scrambleId);
        };
    }, []);

    return (
        <div style={{
            height: isMobile ? "auto" : "100vh",
            minHeight: isMobile ? "unset" : "100vh",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: isMobile ? "flex-start" : "flex-end",
            padding: isMobile ? "56px 16px 36px" : "0 60px 60px"
        }}>
            {/* Orbs */}
            <div ref={orb0} style={{ position: "absolute", width: isMobile ? 400 : 800, height: isMobile ? 400 : 800, left: "10%", top: "30%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, #1e40af 0%, transparent 60%)", opacity: 0.12, pointerEvents: "none", willChange: "transform" }} />
            <div ref={orb1} style={{ position: "absolute", width: isMobile ? 300 : 600, height: isMobile ? 300 : 600, left: "70%", top: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, #6d28d9 0%, transparent 60%)", opacity: 0.12, pointerEvents: "none", willChange: "transform" }} />
            <div ref={orb2} style={{ position: "absolute", width: isMobile ? 250 : 500, height: isMobile ? 250 : 500, left: "40%", top: "80%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, #065f46 0%, transparent 60%)", opacity: 0.12, pointerEvents: "none", willChange: "transform" }} />

            {/* Grid lines */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--os-border)15) 1px, transparent 1px), linear-gradient(90deg, var(--os-border)15) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />

            {/* Top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: isMobile ? "14px 16px" : "22px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(128,128,128,0.1)", fontFamily: '"Outfit",monospace', fontSize: isMobile ? 8 : 9, color: "var(--os-text)", opacity: 0.6, letterSpacing: "0.22em" }}>
                <span>OMEGA.SYS v2.0.4</span>
                {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff87", boxShadow: "0 0 8px #00ff87", animation: "pulseDot 2s infinite" }} />
                        <span style={{ color: "#00ff87", opacity: 1 }}>ALL SYSTEMS NOMINAL</span>
                    </div>
                )}
                <span ref={timeRef}>00:00:00 UTC</span>
            </div>

            {/* Hero content */}
            <div ref={contentRef} style={{ position: "relative", zIndex: 2, willChange: isMobile ? "auto" : "transform" }}>
                <div style={{ fontFamily: '"Outfit",monospace', fontSize: isMobile ? 8 : 10, letterSpacing: isMobile ? "0.25em" : "0.4em", color: "#2563eb", marginBottom: isMobile ? 12 : 20, display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
                    <span style={{ display: "inline-block", width: isMobile ? 16 : 28, height: 1, background: "#2563eb" }} />
                    {isMobile ? "CLASSIFIED ARCHIVE" : "CLASSIFIED DEVELOPMENT ARCHIVE — OMEGA CLEARANCE"}
                    <span style={{ display: "inline-block", width: isMobile ? 16 : 28, height: 1, background: "#2563eb" }} />
                </div>
                <h1 style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? "clamp(56px,16vw,88px)" : "clamp(72px,13vw,160px)", lineHeight: 0.88, letterSpacing: "0.01em", margin: isMobile ? "0 0 20px" : "0 0 32px" }}>
                    <span ref={charsRef} style={{ display: "block", color: "var(--os-text)", letterSpacing: "0.03em" }}>PROJECT ARCHIVE</span>
                    <span style={{ display: "block", WebkitTextStroke: "1px var(--os-text)", color: "transparent", opacity: 0.2, fontSize: "0.7em" }}>2024 — 2026</span>
                </h1>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 24 }}>
                    <p style={{ fontFamily: '"DM Sans",sans-serif', fontSize: isMobile ? 12 : 14, color: "var(--os-text)", opacity: 0.6, lineHeight: 1.9, maxWidth: 500, margin: 0 }}>
                        {isMobile
                            ? "Bleeding-edge systems and classified interfaces. Scroll to explore."
                            : "Bleeding-edge systems, classified interfaces, and deployed orbital infrastructure. Scroll to explore two years of engineering beyond physical constraints."
                        }
                    </p>
                    <div style={{ display: "flex", gap: isMobile ? 20 : 36, alignItems: "flex-end" }}>
                        {[[repoCount || "5+", "PROJECTS"], ["38K", "LINES"], ["99.97%", "UPTIME"]].map(([n, l]) => (
                            <div key={l} style={{ textAlign: "right" }}>
                                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 26 : 38, color: "var(--os-text)", lineHeight: 1 }}>{n}</div>
                                <div style={{ fontFamily: '"Outfit",monospace', fontSize: isMobile ? 7 : 8, color: "var(--os-text)", opacity: 0.4, letterSpacing: "0.25em", marginTop: 4 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator — hidden on mobile to save space */}
            {!isMobile && (
                <div style={{ position: "absolute", right: 60, bottom: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2 }}>
                    <div style={{ fontFamily: '"Outfit",monospace', fontSize: 8, color: "var(--os-text)", opacity: 0.4, letterSpacing: "0.25em", writingMode: "vertical-rl" }}>SCROLL</div>
                    <div style={{ width: 1, height: 70, background: "linear-gradient(to bottom, rgba(37,99,235,0.6), transparent)", animation: "scrollHint 2s ease-in-out infinite" }} />
                </div>
            )}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.35), transparent)" }} />
        </div>
    );
}

/* ─── Divider ─── */
function Divider({ num, title, accent, count, countLabel }) {
    const isMobile = useIsMobile();
    return (
        <div style={{ padding: isMobile ? "36px 16px 24px" : "64px 60px 48px", display: "flex", alignItems: "center", gap: isMobile ? 12 : 20, background: "var(--os-bg)", color: "var(--os-text)" }}>
            <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: '"Outfit",monospace', fontSize: 9, letterSpacing: "0.3em", color: "var(--os-text)", opacity: 0.4, marginBottom: 4 }}>SECTION {num}</div>
                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 24 : 36, color: "var(--os-text)", lineHeight: 1 }}>{title}</div>
            </div>
            <div style={{ width: 3, height: 36, background: accent, borderRadius: 2, flexShrink: 0, marginLeft: 8 }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accent}44, transparent)` }} />
            <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 20 : 28, color: accent, lineHeight: 1 }}>{count}</div>
                <div style={{ fontFamily: '"Outfit",monospace', fontSize: 8, color: "var(--os-text)", opacity: 0.4, letterSpacing: "0.2em" }}>{countLabel}</div>
            </div>
        </div>
    );
}

/* ─── Social Circle ─── */
function SocialCircle({ href, Icon, color, label }) {
    const bg = color + "18";
    const shadow = `0 0 18px ${color}55, inset 0 0 14px ${color}22`;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label}
            className="omega-sc"
            style={{
                "--sc-c": color, "--sc-bg": bg, "--sc-shadow": shadow,
                position: "relative", width: 64, height: 64, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", cursor: "pointer",
                border: "2px solid rgba(128,128,128,0.25)",
                background: "transparent", color: "var(--os-text)",
            }}
        >
            <span className="sc-ring" style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1px dashed ${color}80` }} />
            <Icon size={26} strokeWidth={1.5} />
        </a>
    );
}

/* ─── Canvas Captcha ─── */
function Captcha({ onValid }) {
    const canvasRef = useRef(null);
    const [text, setText] = useState("");
    const [ans, setAns] = useState("");
    const [ok, setOk] = useState(null);

    const generate = useCallback(() => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        const t = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        setText(t); setAns(""); setOk(null); onValid(false);
    }, [onValid]);

    useEffect(() => { generate(); }, [generate]);

    useEffect(() => {
        if (!canvasRef.current || !text) return;
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, 150, 50);
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
            ctx.beginPath(); ctx.arc(Math.random() * 150, Math.random() * 50, Math.random() * 2, 0, Math.PI * 2); ctx.fill();
        }
        for (let i = 0; i < 6; i++) {
            ctx.beginPath(); ctx.moveTo(Math.random() * 150, Math.random() * 50); ctx.lineTo(Math.random() * 150, Math.random() * 50);
            ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.4})`; ctx.lineWidth = Math.random() * 2; ctx.stroke();
        }
        ctx.font = 'bold 24px "Outfit",monospace';
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.save(); ctx.translate(75, 25); ctx.rotate((Math.random() * 10 - 5) * Math.PI / 180); ctx.fillText(text, 0, 0); ctx.restore();
    }, [text]);

    const handleChange = e => {
        const v = e.target.value; setAns(v);
        const valid = v === text;
        setOk(valid); onValid(valid);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: '"Outfit",monospace', fontSize: 10, color: "var(--os-text)", opacity: 0.5, letterSpacing: "0.2em" }}>VERIFY HUMANITY</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div onClick={generate} title="Click to refresh" style={{ position: "relative", width: 150, height: 50, borderRadius: 6, overflow: "hidden", border: `1px solid ${ok === false ? "#ef4444" : ok ? "#22c55e" : "rgba(128,128,128,0.2)"}`, background: "#111", cursor: "pointer" }}>
                    <canvas ref={canvasRef} width={150} height={50} style={{ display: "block" }} />
                    <div style={{ position: "absolute", top: 4, right: 4, fontFamily: '"Outfit",monospace', fontSize: 8, color: "var(--os-text-muted)" }}>↻</div>
                </div>
                <input value={ans} onChange={handleChange} placeholder="Type Code..."
                    style={{ width: 100, height: 50, padding: "0 12px", background: "rgba(0,0,0,0.4)", border: `1px solid ${ok === false ? "#ef4444" : ok ? "#22c55e" : "rgba(128,128,128,0.2)"}`, borderRadius: 6, color: "var(--os-text)", fontFamily: '"Outfit",monospace', fontSize: 14, outline: "none", textAlign: "center" }}
                />
            </div>
        </div>
    );
}

/* ─── Footer ─── */
function Footer() {
    const isMobile = useIsMobile();
    const [captchaOk, setCaptchaOk] = useState(false);
    const [focused, setFocused] = useState(null);

    const handleSubmit = e => {
        if (!captchaOk) { e.preventDefault(); alert("Incorrect captcha signature. Please verify and try again."); }
    };

    const inp = name => ({
        width: "100%", padding: "16px 20px", background: "rgba(0,0,0,0.4)",
        border: `1px solid ${focused === name ? "var(--os-primary, #2563eb)" : "rgba(128,128,128,0.2)"}`,
        borderRadius: 8, color: "var(--os-text)", fontFamily: '"Outfit",monospace', fontSize: isMobile ? 14 : 16,
        outline: "none", marginBottom: 16,
        boxShadow: focused === name ? "inset 0 0 20px rgba(37,99,235,0.15), 0 0 20px rgba(37,99,235,0.1)" : "inset 0 2px 10px rgba(0,0,0,0.2)",
        transition: "border-color .3s, box-shadow .3s",
    });

    return (
        <div style={{ padding: isMobile ? "52px 16px 40px" : "80px 20px 60px", background: "var(--os-bg)", color: "var(--os-text)", borderTop: "1px solid rgba(128,128,128,0.1)", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 400, background: "var(--os-primary, #2563eb)", filter: "blur(180px)", opacity: 0.08, pointerEvents: "none", animation: "pulseDot 6s infinite" }} />

            <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40, userSelect: "none", position: "relative", zIndex: 2 }}>
                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? "clamp(48px,14vw,72px)" : "clamp(60px,10vw,100px)", lineHeight: 0.9, color: "var(--os-text)", letterSpacing: "0.05em", marginBottom: 16, textShadow: "0 0 40px var(--os-border-active)" }}>CONTACT ME</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 1, background: "rgba(128,128,128,0.4)" }} />
                    <span style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 13 : 16, color: "var(--os-text)", opacity: 0.6, letterSpacing: "0.2em" }}>SECURE UPLINK</span>
                    <div style={{ width: 40, height: 1, background: "rgba(128,128,128,0.4)" }} />
                </div>
                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 16 : 22, color: "var(--os-text)", opacity: 0.8, letterSpacing: "0.06em" }}>I'LL BE GLAD TO ANSWER YOUR QUESTIONS!</div>
            </div>

            <div style={{
                width: "100%",
                maxWidth: isMobile ? "100%" : 640,
                padding: isMobile ? "24px 20px 32px" : "40px 40px 50px",
                marginBottom: isMobile ? 48 : 80,
                position: "relative", zIndex: 2,
                background: "var(--os-border)2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--os-border)5)", borderRadius: 16,
                boxShadow: "0 30px 60px rgba(0,0,0,0.3), inset 0 1px 0 var(--os-border-active)",
                animation: isMobile ? "none" : "floatBox 6s ease-in-out infinite"
            }}>
                <form action="https://formsubmit.co/aniketsharma3113+portfolio@gmail.com" method="POST" onSubmit={handleSubmit}>
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_next" value={typeof window !== "undefined" ? window.location.href : ""} />
                    <input type="text" name="_honey" style={{ display: "none" }} />
                    <input type="text" name="name" placeholder="Name" required style={inp("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} />
                    <input type="email" name="email" placeholder="Email address" required style={inp("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} />
                    <input type="text" name="subject" placeholder="Subject" required style={inp("subject")} onFocus={() => setFocused("subject")} onBlur={() => setFocused(null)} />
                    <textarea name="message" placeholder="Your message" required rows={isMobile ? 4 : 5}
                        style={{ ...inp("msg"), resize: "vertical" }}
                        onFocus={() => setFocused("msg")} onBlur={() => setFocused(null)} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "center" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 20 : 24, marginTop: 12 }}>
                        <Captcha onValid={setCaptchaOk} />
                        <button type="submit"
                            onMouseEnter={e => { e.currentTarget.style.background = "var(--os-primary, #2563eb)"; e.currentTarget.style.color = "var(--os-text)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(37,99,235,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "var(--os-text)"; e.currentTarget.style.color = "var(--os-bg)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                            style={{ fontFamily: '"Space Grotesk",cursive', fontSize: 24, letterSpacing: "0.05em", padding: "12px 40px", borderRadius: 6, cursor: "pointer", border: "none", background: "var(--os-text)", color: "var(--os-bg)", transition: "background .3s, box-shadow .3s, transform .2s", width: isMobile ? "100%" : "auto" }}>
                            Send Message
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ textAlign: "center", width: "100%", marginBottom: isMobile ? 40 : 60 }}>
                <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: isMobile ? 28 : 36, letterSpacing: "0.05em", color: "var(--os-text)", marginBottom: 24 }}>I AM SOCIAL</div>
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
                    <SocialCircle href="https://www.linkedin.com/in/aniket-sharma-6a765a380/" Icon={Linkedin} color="#0A66C2" label="LinkedIn" />
                    <SocialCircle href="https://github.com/ani29hs" Icon={Github} color="#e0e0e0" label="GitHub" />
                    <SocialCircle href="https://www.instagram.com/ani_292006/" Icon={Instagram} color="#E1306C" label="Instagram" />
                </div>
            </div>

            <div style={{ width: "100%", maxWidth: 1000, display: "flex", justifyContent: "center", alignItems: "center", gap: isMobile ? 10 : 24, paddingTop: 40, borderTop: "1px solid rgba(128,128,128,0.1)", flexWrap: "wrap" }}>
                {(isMobile
                    ? ["[ SYS: ONLINE ]", "[ UPLINK: STABLE ]"]
                    : ["[ SYS: ONLINE ]", "[ UPLINK: STABLE ]", "[ THREAT: NOMINAL ]"]
                ).map(s => (
                    <span key={s} style={{ fontFamily: '"Outfit",monospace', fontSize: 9, color: "var(--os-text)", opacity: 0.4, letterSpacing: "0.18em" }}>{s}</span>
                ))}
            </div>
        </div>
    );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function App() {
    const [ghProjects, setGhProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hiddenProjects, setHiddenProjects] = useState(() => {
        try { return JSON.parse(localStorage.getItem('systemos_hidden_projects') || '[]'); }
        catch { return []; }
    });

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletePwd, setDeletePwd] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const handleRemoveProject = (id) => {
        setDeleteTarget(id);
        setDeletePwd('');
        setDeleteError('');
    };

    const confirmDelete = () => {
        if (deletePwd !== "Aniket292006") {
            setDeleteError('ACCESS DENIED');
            return;
        }
        const id = deleteTarget;
        const customProjects = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
        const customIndex = customProjects.findIndex(p => p.id === id);

        if (customIndex !== -1) {
            customProjects.splice(customIndex, 1);
            localStorage.setItem('systemos_custom_projects', JSON.stringify(customProjects));
            setGhProjects(prev => prev.filter(p => p.id !== id));
        } else {
            setHiddenProjects(prev => {
                const next = [...prev, id];
                localStorage.setItem('systemos_hidden_projects', JSON.stringify(next));
                return next;
            });
        }
        setDeleteTarget(null);
        setDeletePwd('');
    };

    // Single passive scroll listener
    useEffect(() => {
        const scrollEl = document.getElementById("projects-scroll-container");
        if (!scrollEl) return;
        const onScroll = () => { _scroll.top = scrollEl.scrollTop; };
        scrollEl.addEventListener("scroll", onScroll, { passive: true });
        return () => scrollEl.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const customProjects = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
        const GITHUB_USERNAME = "Aniket-shirke";
        const CACHE_KEY = "omega_os_projects_v2";
        const CACHE_TTL = 1000 * 60 * 60; // 10 minutes

        // Try sessionStorage cache first
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TTL && Array.isArray(cachedData) && cachedData.length > 0) {
                    const customUrls = new Set(customProjects.map(p => p.url).filter(Boolean));
                    const filteredMapped = cachedData.filter(m => !customUrls.has(m.url));
                    setGhProjects(filteredMapped.length ? [...customProjects, ...filteredMapped] : [...customProjects, ...cachedData]);
                    setLoading(false);
                    console.log('[ProjectsApp] Loaded from cache');
                    return;
                }
            }
        } catch (e) { /* cache read failed, proceed with fetch */ }

        const ghHeaders = {};
        const ghToken = import.meta.env.VITE_GITHUB_TOKEN;
        if (ghToken) ghHeaders['Authorization'] = `token ${ghToken}`;

        fetch("https://api.github.com/users/ani29hs/repos?sort=updated&per_page=20", { headers: ghHeaders })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) {
                        console.error('[ProjectsApp] GitHub API rate limit exceeded (403). Add VITE_GITHUB_TOKEN to .env to increase limit from 60 to 5000 req/hr.');
                    } else {
                        console.error(`[ProjectsApp] GitHub API returned HTTP ${res.status}`);
                    }
                    throw new Error(`GitHub API error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                let mapped = [];
                if (Array.isArray(data)) {
                    mapped = data.filter(r => !r.fork).map((r, i) => {
                        const c = COLORS[i % COLORS.length];
                        return {
                            id: r.id.toString(),
                            title: r.name,
                            tag: r.stargazers_count || 0,
                            year: new Date(r.updated_at).getFullYear().toString(),
                            status: r.archived ? "ARCHIVED" : "ACTIVE",
                            statusColor: r.archived ? "#ff4444" : "#00ff87",
                            desc: r.description || "No description provided for this repository.",
                            tech: r.topics?.length ? r.topics : (r.language ? [r.language] : ["Source"]),
                            deployedUrl: r.homepage || null,
                            url: r.html_url,
                            color: c.color,
                            grad: c.grad,
                        };
                    });

                    // Cache successful response
                    try {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: mapped, timestamp: Date.now() }));
                    } catch (e) { /* sessionStorage full, ignore */ }
                } else {
                    console.warn('[ProjectsApp] GitHub API returned non-array (likely rate-limited). Using fallback projects.');
                    mapped = [...PROJECTS];
                }

                const customUrls = new Set(customProjects.map(p => p.url).filter(Boolean));
                const filteredMapped = mapped.filter(m => !customUrls.has(m.url));
                setGhProjects(filteredMapped.length ? [...customProjects, ...filteredMapped] : [...customProjects, ...PROJECTS]);
                setLoading(false);
            })
            .catch((err) => {
                console.error('[ProjectsApp] Failed to fetch GitHub repos:', err.message);

                // Try to use cached data even if expired
                try {
                    const cached = sessionStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const { data: cachedData } = JSON.parse(cached);
                        if (Array.isArray(cachedData) && cachedData.length > 0) {
                            const customUrls = new Set(customProjects.map(p => p.url).filter(Boolean));
                            const filteredMapped = cachedData.filter(m => !customUrls.has(m.url));
                            setGhProjects(filteredMapped.length ? [...customProjects, ...filteredMapped] : [...customProjects, ...cachedData]);
                            setLoading(false);
                            console.log('[ProjectsApp] Using expired cache as fallback');
                            return;
                        }
                    }
                } catch (e) { /* cache read failed */ }

                const customUrls = new Set(customProjects.map(p => p.url).filter(Boolean));
                const filteredProjects = PROJECTS.filter(p => !customUrls.has(p.url));
                setGhProjects([...customProjects, ...filteredProjects]);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleSync = () => {
            const customProjects = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
            setGhProjects(prev => {
                const customUrls = new Set(customProjects.map(p => p.url).filter(Boolean));
                const nonCustom = prev.filter(p => !p.isCustom && !customUrls.has(p.url));
                return [...customProjects, ...nonCustom];
            });
            try {
                const updatedHidden = JSON.parse(localStorage.getItem('systemos_hidden_projects') || '[]');
                setHiddenProjects(updatedHidden);
            } catch (e) { }
        };
        window.addEventListener('systemos_projects_updated', handleSync);
        return () => window.removeEventListener('systemos_projects_updated', handleSync);
    }, []);

    const visibleProjects = ghProjects.filter(p => !hiddenProjects.includes(p.id.toString()));

    return (
        <>
            <style>{GLOBAL_CSS}</style>

            {/* Noise overlay removed for performance */}
            {/* Scanlines */}
            <div style={{ position: "fixed", inset: 0, zIndex: 9996, pointerEvents: "none" }} />

            <div id="projects-scroll-container"
                style={{
                    background: "transparent", height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative",
                    willChange: "scroll-position", WebkitOverflowScrolling: "touch"
                }}>

                <Hero repoCount={loading ? "..." : visibleProjects.length} />

                <Divider num="01" title="ACTIVE PROJECTS" accent="#2563eb" count={loading ? "..." : visibleProjects.length} countLabel="ACTIVE" />
                <HorizontalScrollSection title="ACTIVE PROJECTS — SCROLL TO EXPLORE" accent="#2563eb" sectionId="projects">
                    {loading ? (
                        <div style={{ flexShrink: 0, width: 360, height: "calc(100vh - 150px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontFamily: '"Outfit",monospace', fontSize: 12, color: "var(--os-text)", letterSpacing: "0.2em", opacity: 0.5 }}>[ FETCHING GITHUB DATA... ]</div>
                        </div>
                    ) : (
                        visibleProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onRemove={handleRemoveProject} />)
                    )}
                    <div style={{ flexShrink: 0, width: 260, height: "calc(100vh - 150px)", borderRadius: 20, border: "1px dashed rgba(128,128,128,0.2)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: 32 }}>
                        <div style={{ fontFamily: '"Space Grotesk",cursive', fontSize: 72, color: "var(--os-text)", opacity: 0.2, lineHeight: 1 }}>+5</div>
                        <div style={{ fontFamily: '"Outfit",monospace', fontSize: 9, color: "var(--os-text)", opacity: 0.5, letterSpacing: "0.2em", textAlign: "center", lineHeight: 2 }}>MORE PROJECTS<br />CLASSIFIED</div>
                        <div style={{ width: 24, height: 1, background: "rgba(128,128,128,0.3)" }} />
                        <div style={{ fontFamily: '"Outfit",monospace', fontSize: 9, color: "var(--os-primary, #2563eb)", letterSpacing: "0.2em", opacity: 0.8 }}>REQUEST ACCESS →</div>
                    </div>
                </HorizontalScrollSection>

                <Divider num="02" title="SYSTEM METRICS" accent="#10b981" count="38k+" countLabel="LINES OF CODE" />
                <HorizontalScrollSection title="SYSTEM METRICS — SCROLL TO EXPLORE" accent="#10b981" sectionId="metrics">
                    {METRICS.map((m, i) => <MetricCard key={m.label} metric={m} index={i} />)}
                </HorizontalScrollSection>

                <Footer />
            </div>

            {/* ── DELETE PASSWORD MODAL ── */}
            {deleteTarget && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setDeleteTarget(null)}>
                    <div style={{ background: 'var(--os-bg, #0a0a0a)', border: '1px solid var(--os-border, #333)', borderRadius: 8, padding: '24px 28px', maxWidth: 340, width: '90%', fontFamily: '"Outfit",monospace' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--os-primary, #f97316)', marginBottom: 16, fontWeight: 'bold' }}>
                            🔒 ADMIN AUTHENTICATION
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--os-text, var(--os-text))', marginBottom: 12, opacity: 0.7 }}>
                            Enter admin password to delete this project:
                        </div>
                        <input
                            type="password"
                            value={deletePwd}
                            onChange={e => { setDeletePwd(e.target.value); setDeleteError(''); }}
                            placeholder="Password"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && confirmDelete()}
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--os-border)5)', border: `1px solid ${deleteError ? '#f87171' : 'var(--os-border, #333)'}`, color: 'var(--os-text, var(--os-text))', padding: '10px 14px', fontFamily: '"Outfit",monospace', fontSize: 12, outline: 'none', borderRadius: 4, caretColor: 'var(--os-primary, #f97316)' }}
                        />
                        {deleteError && (
                            <div style={{ fontSize: 10, color: '#f87171', marginTop: 8, letterSpacing: '0.1em' }}>
                                ⚠ {deleteError}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            <button onClick={() => setDeleteTarget(null)}
                                style={{ flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid var(--os-border, #333)', color: 'var(--os-text, var(--os-text))', fontFamily: '"Outfit",monospace', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', borderRadius: 4 }}>
                                CANCEL
                            </button>
                            <button onClick={confirmDelete}
                                style={{ flex: 1, padding: '8px 0', background: '#dc2626', border: '1px solid #dc2626', color: 'var(--os-text)', fontFamily: '"Outfit",monospace', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold' }}>
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
