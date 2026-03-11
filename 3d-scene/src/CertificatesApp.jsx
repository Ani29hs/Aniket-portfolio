import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Award, X, ChevronLeft, ChevronRight, Shield, ExternalLink } from 'lucide-react';
import cert1 from './assets/2410993113_Cyber_page-0001.jpg';
import cert2 from './assets/2410993113_page-0001.jpg';
import cert3 from './assets/Cert254114737332_page-0001.jpg';
import cert4 from './assets/Cert767114756848_page-0001.jpg';

/* ─── Static Data ─── */
const CERTIFICATES = [
    {
        id: 1,
        title: "Cybersecurity for Everyone",
        issuer: "University of Maryland",
        platform: "Coursera",
        year: "2026",
        tag: "COMPLETED",
        tagColor: "#10b981",
        desc: "Foundations of cybersecurity, threat mitigation, and privacy protection.",
        color: "#10b981",
        image: cert1
    },
    {
        id: 2,
        title: "Azure Data Fundamentals",
        issuer: "Microsoft",
        platform: "Microsoft Learn",
        year: "2025",
        tag: "COMPLETED",
        tagColor: "#2563eb",
        desc: "Core data concepts and how they are implemented using Microsoft Azure data services.",
        color: "#2563eb",
        image: cert2
    },
    {
        id: 3,
        title: "Azure Fundamentals",
        issuer: "Microsoft",
        platform: "Microsoft Learn",
        year: "2025",
        tag: "COMPLETED",
        tagColor: "#a855f7",
        desc: "Foundational knowledge of cloud services and how those services are provided with Microsoft Azure.",
        color: "#a855f7",
        image: cert3
    },
    {
        id: 4,
        title: "Azure AI Fundamentals",
        issuer: "Microsoft",
        platform: "Microsoft Learn",
        year: "2024",
        tag: "COMPLETED",
        tagColor: "#f59e0b",
        desc: "Machine learning and artificial intelligence concepts and related Microsoft Azure services.",
        color: "#f59e0b",
        image: cert4
    }
];

/* ─── useIsMobile hook ─── */
function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);
    return isMobile;
}

/* ─── Certificate Card ─── */
function CertificateCard({ cert, index, onClick }) {
    const [hover, setHover] = useState(false);
    const [shimmerPos, setShimmerPos] = useState({ x: 50, y: 50 });
    const cardRef = useRef(null);
    const isMobile = useIsMobile();

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setShimmerPos({ x, y });
    };

    const { color } = cert;

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => !isMobile && setHover(true)}
            onMouseLeave={() => !isMobile && setHover(false)}
            onMouseMove={handleMouseMove}
            onClick={() => onClick(cert)}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                position: "relative",
                borderRadius: isMobile ? 14 : 20,
                padding: isMobile ? "20px" : "28px",
                background: "var(--os-glass)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${hover ? color + '40' : 'var(--os-border)'}`,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                transform: hover ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
                boxShadow: hover
                    ? `0 24px 48px -12px ${color}40, 0 0 0 1px ${color}20, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? 14 : 20,
                height: "100%",
                userSelect: "none",
                WebkitUserSelect: "none",
                animationDelay: `${index * 80}ms`,
                animationFillMode: "both",
                animation: "cardEntrance 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both",
            }}
        >
            {/* Mouse-tracked radial shimmer */}
            <div style={{
                position: "absolute",
                inset: 0,
                opacity: hover ? 0.06 : 0,
                transition: "opacity 0.3s ease",
                background: `radial-gradient(circle at ${shimmerPos.x}% ${shimmerPos.y}%, ${color}, transparent 60%)`,
                pointerEvents: "none",
                zIndex: 0
            }} />

            {/* Top gradient wash */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 100,
                background: `linear-gradient(180deg, ${color}20, transparent)`,
                opacity: hover ? 1 : 0.5,
                transition: "opacity 0.4s ease",
                pointerEvents: "none",
                zIndex: 0
            }} />

            {/* Thumbnail strip */}
            <div style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                height: isMobile ? 100 : 120,
                background: "#fff",
                border: `1px solid ${color}20`,
                flexShrink: 0,
                zIndex: 1,
                transition: "box-shadow 0.4s ease",
                boxShadow: hover ? `0 8px 24px -6px ${color}50` : "none"
            }}
                onContextMenu={(e) => e.preventDefault()}
            >
                <img
                    src={cert.image}
                    alt={cert.title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top center",
                        pointerEvents: "none",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        display: "block",
                        transform: hover ? "scale(1.04)" : "scale(1)",
                        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        filter: "saturate(0.95)"
                    }}
                    draggable={false}
                />
                {/* Frosted overlay */}
                <div style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    height: 40,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.4))",
                    pointerEvents: "none"
                }} />
                {/* "VIEW" badge on hover — desktop only */}
                {!isMobile && (
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: `translate(-50%, -50%) scale(${hover ? 1 : 0.7})`,
                        opacity: hover ? 1 : 0,
                        transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        background: "rgba(0,0,0,0.7)",
                        backdropFilter: "blur(4px)",
                        border: `1px solid ${color}50`,
                        borderRadius: 20,
                        padding: "6px 14px",
                        color: color,
                        fontFamily: '"Share Tech Mono",monospace',
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                    }}>
                        <ExternalLink size={10} />
                        VIEW CERT
                    </div>
                )}
                {/* Mobile: always-visible tap hint */}
                {isMobile && (
                    <div style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(4px)",
                        border: `1px solid ${color}50`,
                        borderRadius: 20,
                        padding: "5px 12px",
                        color: color,
                        fontFamily: '"Share Tech Mono",monospace',
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 5
                    }}>
                        <ExternalLink size={9} />
                        TAP TO VIEW
                    </div>
                )}
            </div>

            {/* Top row: Icon & Tag */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
                <div style={{
                    width: isMobile ? 38 : 44,
                    height: isMobile ? 38 : 44,
                    borderRadius: 11,
                    background: `${color}18`,
                    border: `1px solid ${color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: color,
                    transition: "all 0.4s ease",
                    transform: hover ? "rotate(-4deg) scale(1.08)" : "rotate(0) scale(1)"
                }}>
                    <Award size={isMobile ? 17 : 20} strokeWidth={1.5} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                    <span style={{
                        fontFamily: '"Share Tech Mono",monospace',
                        fontSize: 10,
                        color: "var(--os-text)",
                        opacity: 0.35,
                        letterSpacing: "0.15em"
                    }}>{cert.year}</span>
                    <span style={{
                        fontFamily: '"Share Tech Mono",monospace',
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        color: cert.tagColor,
                        background: `${cert.tagColor}18`,
                        padding: "3px 8px",
                        borderRadius: 4,
                        border: `1px solid ${cert.tagColor}35`
                    }}>
                        ✓ {cert.tag}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div style={{ zIndex: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <div style={{
                    fontFamily: '"Share Tech Mono",monospace',
                    fontSize: 10,
                    color: color,
                    opacity: 0.8,
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                    textTransform: "uppercase"
                }}>
                    {cert.issuer}
                    {cert.platform !== cert.issuer && (
                        <span style={{ opacity: 0.5, color: "var(--os-text)" }}> · {cert.platform}</span>
                    )}
                </div>
                <h3 style={{
                    fontFamily: '"Bebas Neue",cursive',
                    fontSize: isMobile ? 22 : 28,
                    lineHeight: 1.1,
                    color: "var(--os-text)",
                    letterSpacing: "0.03em",
                    margin: "0 0 10px 0"
                }}>
                    {cert.title}
                </h3>
                <p style={{
                    fontFamily: '"DM Sans",sans-serif',
                    fontSize: isMobile ? 12 : 13,
                    color: "var(--os-text-secondary)",
                    lineHeight: 1.65,
                    margin: 0,
                    opacity: 0.75
                }}>
                    {cert.desc}
                </p>
            </div>

            {/* Bottom accent line — grows on hover */}
            <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${color}, ${color}00)`,
                width: hover ? "100%" : "25%",
                transition: "width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                opacity: 0.9,
                zIndex: 2
            }} />
        </div>
    );
}

/* ─── Secure Fullscreen Viewer ─── */
function SecureViewer({ cert, certs, onClose, onNavigate }) {
    const [isBlackedOut, setIsBlackedOut] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const isMobile = useIsMobile();
    const touchStartX = useRef(null);
    const currentIndex = certs.findIndex(c => c.id === cert?.id);

    const blackout = useCallback(() => setIsBlackedOut(true), []);
    const unBlackout = useCallback(() => setTimeout(() => setIsBlackedOut(false), 500), []);

    useEffect(() => {
        setImgLoaded(false);
    }, [cert?.id]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNavigate(1);
            if (e.key === 'ArrowLeft') onNavigate(-1);
            if (
                e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey) ||
                (e.ctrlKey && e.key === 'p')
            ) {
                setIsBlackedOut(true);
                setTimeout(() => setIsBlackedOut(false), 3000);
            }
        };

        const handleVisChange = () => {
            if (document.hidden) blackout();
            else unBlackout();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('visibilitychange', handleVisChange);
        window.addEventListener('blur', blackout);
        window.addEventListener('focus', unBlackout);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisChange);
            window.removeEventListener('blur', blackout);
            window.removeEventListener('focus', unBlackout);
        };
    }, [onClose, onNavigate, blackout, unBlackout]);

    /* ── Swipe handlers (mobile only) ── */
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) onNavigate(delta < 0 ? 1 : -1);
        touchStartX.current = null;
    };

    if (!cert) return null;

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.96)',
                backdropFilter: 'blur(24px)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '60px 16px 24px' : '40px 60px',
                animation: 'fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
        >
            {/* Close */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: isMobile ? 16 : 24,
                    right: isMobile ? 16 : 24,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    width: isMobile ? 40 : 44,
                    height: isMobile ? 40 : 44,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
                <X size={isMobile ? 16 : 18} />
            </button>

            {/* Header info */}
            <div style={{
                textAlign: 'center',
                marginBottom: isMobile ? 16 : 28,
                animation: 'slideDown 0.4s ease both',
                padding: isMobile ? '0 40px' : 0
            }}>
                <div style={{
                    fontFamily: '"Share Tech Mono",monospace',
                    fontSize: isMobile ? 9 : 10,
                    color: cert.color,
                    letterSpacing: '0.25em',
                    marginBottom: 8,
                    opacity: 0.85
                }}>
                    {cert.issuer.toUpperCase()} · {cert.year}
                </div>
                <div style={{
                    fontFamily: '"Bebas Neue",cursive',
                    fontSize: isMobile ? 'clamp(22px, 6vw, 32px)' : 'clamp(28px, 4vw, 52px)',
                    color: '#fff',
                    letterSpacing: '0.04em',
                    lineHeight: 1
                }}>
                    {cert.title}
                </div>
            </div>

            {/* Nav + Image Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 10 : 20,
                width: '100%',
                justifyContent: 'center'
            }}>
                {/* Prev button — hidden on mobile (swipe instead) */}
                {!isMobile && (
                    <button
                        onClick={() => onNavigate(-1)}
                        disabled={currentIndex === 0}
                        style={{
                            background: currentIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : '#fff',
                            width: 44, height: 44,
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: currentIndex === 0 ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                        }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {/* Secure image container */}
                <div
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                        position: 'relative',
                        maxWidth: isMobile ? '100%' : '78vw',
                        width: isMobile ? '100%' : 'auto',
                        maxHeight: isMobile ? '52vh' : '62vh',
                        display: 'inline-flex',
                        boxShadow: `0 0 100px -20px ${cert.color}70, 0 0 0 1px rgba(255,255,255,0.08)`,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: isBlackedOut ? '#000' : '#fff',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'box-shadow 0.4s ease',
                        animation: 'zoomIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both'
                    }}
                >
                    <img
                        src={cert.image}
                        alt={cert.title}
                        onLoad={() => setImgLoaded(true)}
                        style={{
                            maxWidth: '100%',
                            maxHeight: isMobile ? '52vh' : '62vh',
                            objectFit: 'contain',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            pointerEvents: 'none',
                            display: 'block',
                            opacity: isBlackedOut ? 0 : imgLoaded ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                        }}
                        draggable={false}
                    />

                    {/* Loading shimmer */}
                    {!imgLoaded && !isBlackedOut && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmerLoad 1.2s ease infinite',
                            minWidth: isMobile ? 200 : 300,
                            minHeight: isMobile ? 140 : 200
                        }} />
                    )}

                    {/* Blackout overlay */}
                    {isBlackedOut && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            color: '#ff3333',
                            background: '#000',
                            fontFamily: '"Share Tech Mono",monospace',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', padding: 20,
                            animation: 'fadeIn 0.2s ease',
                            zIndex: 10,
                            minWidth: isMobile ? 200 : 300,
                            minHeight: isMobile ? 140 : 200
                        }}>
                            <Shield size={isMobile ? 24 : 32} style={{ marginBottom: 12, opacity: 0.8 }} />
                            <div style={{ fontSize: 'clamp(10px, 2vw, 16px)', fontWeight: 'bold', letterSpacing: '0.12em' }}>
                                SECURITY PROTOCOL ENGAGED
                            </div>
                            <div style={{ fontSize: 'clamp(9px, 1.5vw, 13px)', color: '#ffaa44', marginTop: 10, opacity: 0.85 }}>
                                UNAUTHORIZED CAPTURE DETECTED
                            </div>
                        </div>
                    )}

                    {/* Click shield */}
                    {!isBlackedOut && (
                        <div style={{ position: 'absolute', inset: 0, cursor: 'default', zIndex: 3 }} />
                    )}
                </div>

                {/* Next button — hidden on mobile */}
                {!isMobile && (
                    <button
                        onClick={() => onNavigate(1)}
                        disabled={currentIndex === certs.length - 1}
                        style={{
                            background: currentIndex === certs.length - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: currentIndex === certs.length - 1 ? 'rgba(255,255,255,0.2)' : '#fff',
                            width: 44, height: 44,
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: currentIndex === certs.length - 1 ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                        }}
                    >
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>

            {/* Mobile swipe hint */}
            {isMobile && (
                <div style={{
                    marginTop: 12,
                    fontFamily: '"Share Tech Mono",monospace',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    letterSpacing: '0.18em'
                }}>
                    ← SWIPE TO NAVIGATE →
                </div>
            )}

            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: 8, marginTop: isMobile ? 12 : 28 }}>
                {certs.map((c, i) => (
                    <button
                        key={c.id}
                        onClick={() => onNavigate(i - currentIndex)}
                        style={{
                            width: i === currentIndex ? 24 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: i === currentIndex ? cert.color : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            padding: 0
                        }}
                    />
                ))}
            </div>

            {/* Footer — hidden on mobile to save space */}
            {!isMobile && (
                <div style={{
                    marginTop: 20,
                    fontFamily: '"Share Tech Mono",monospace',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Shield size={10} />
                    SECURE DOCUMENT VIEWER · ← → TO NAVIGATE · ESC TO CLOSE
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes cardEntrance {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes shimmerLoad {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
            `}</style>
        </div>
    );
}


/* ─── Main App Component ─── */
export default function CertificatesApp() {
    const [selectedCert, setSelectedCert] = useState(null);
    const isMobile = useIsMobile();
    const currentIndex = CERTIFICATES.findIndex(c => c.id === selectedCert?.id);

    const handleNavigate = useCallback((direction) => {
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < CERTIFICATES.length) {
            setSelectedCert(CERTIFICATES[nextIndex]);
        }
    }, [currentIndex]);

    return (
        <div style={{
            height: "100%",
            background: "var(--os-bg)",
            color: "var(--os-text)",
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative"
        }}>

            {/* Header */}
            <div style={{
                padding: isMobile ? "32px 20px 12px" : "56px 60px 16px",
                position: "relative"
            }}>
                {/* Scanline accent */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "100%",
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
                    pointerEvents: "none",
                    zIndex: 0
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{
                        fontFamily: '"Share Tech Mono",monospace',
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        color: "var(--os-text)",
                        opacity: 0.35,
                        marginBottom: 10
                    }}>
                        CREDENTIAL REGISTRY · {CERTIFICATES.length} RECORDS FOUND
                    </div>
                    <h1 style={{
                        fontFamily: '"Bebas Neue",cursive',
                        fontSize: isMobile ? "clamp(36px, 10vw, 52px)" : "clamp(48px, 6vw, 72px)",
                        lineHeight: 1,
                        letterSpacing: "0.02em",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 20
                    }}>
                        CERTIFICATIONS
                        <div style={{
                            height: 2,
                            flexGrow: 1,
                            background: "linear-gradient(90deg, var(--os-text) 0%, transparent 100%)",
                            opacity: 0.08
                        }} />
                    </h1>
                </div>
            </div>

            {/* Grid */}
            <div style={{
                padding: isMobile ? "20px 16px 60px" : "36px 60px 80px",
                display: "grid",
                gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fill, minmax(320px, 1fr))",
                gap: isMobile ? 14 : 20
            }}>
                {CERTIFICATES.map((cert, i) => (
                    <CertificateCard
                        key={cert.id}
                        cert={cert}
                        index={i}
                        onClick={setSelectedCert}
                    />
                ))}
            </div>

            {/* Lightbox */}
            {selectedCert && (
                <SecureViewer
                    cert={selectedCert}
                    certs={CERTIFICATES}
                    onClose={() => setSelectedCert(null)}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
}