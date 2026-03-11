import React, { useState, useEffect, useRef, useCallback } from 'react';

const G = 22; // grid size
const CELL = 100 / G;

const rnd = () => ({ x: Math.floor(Math.random() * G), y: Math.floor(Math.random() * G) });
const safeFood = (snake) => { let p; do { p = rnd(); } while (snake.some(s => s.x === p.x && s.y === p.y)); return p; };

const POWERUP_TYPES = {
    shrink: { color: '#f43f5e', glow: '#f43f5e', label: 'SHRINK', symbol: '✂', desc: 'Cuts your tail!' },
    multiplier: { color: '#facc15', glow: '#facc15', label: '2× SCORE', symbol: '★', desc: '2× points for 5s' },
    ghost: { color: '#818cf8', glow: '#a5b4fc', label: 'GHOST', symbol: '◈', desc: 'Pass through walls!' },
};

const LEVELS = [
    { name: 'INIT', speed: 160, color: '#00ff9f' },
    { name: 'SURGE', speed: 130, color: '#00e0ff' },
    { name: 'FLUX', speed: 105, color: '#a78bfa' },
    { name: 'APEX', speed: 82, color: '#f59e0b' },
    { name: 'OMEGA', speed: 60, color: '#ef4444' },
];

function getLevel(score) {
    if (score >= 200) return 4;
    if (score >= 120) return 3;
    if (score >= 60) return 2;
    if (score >= 20) return 1;
    return 0;
}

// ── Floating score pop ────────────────────────────────────────────────────────
function ScorePop({ pops }) {
    return (
        <>
            {pops.map(p => (
                <div key={p.id} style={{ position: 'absolute', left: `${(p.x / G) * 100}%`, top: `${(p.y / G) * 100}%`, pointerEvents: 'none', zIndex: 50, fontFamily: '"Share Tech Mono",monospace', fontSize: 13, fontWeight: 700, color: p.color || '#00ff9f', textShadow: `0 0 8px ${p.color || '#00ff9f'}`, whiteSpace: 'nowrap', animation: 'popFloat 0.9s ease forwards' }}>
                    {p.text}
                </div>
            ))}
        </>
    );
}

// ── Particles ─────────────────────────────────────────────────────────────────
function Particles({ bursts }) {
    return (
        <>
            {bursts.map(b => b.particles.map((p, i) => (
                <div key={`${b.id}-${i}`} style={{ position: 'absolute', left: `${(b.x / G) * 100}%`, top: `${(b.y / G) * 100}%`, width: p.size, height: p.size, borderRadius: '50%', background: p.color, pointerEvents: 'none', zIndex: 40, animation: `particleFly 0.7s ease forwards`, '--tx': `${p.tx}px`, '--ty': `${p.ty}px` }} />
            )))}
        </>
    );
}

// ── Mobile D-Pad ──────────────────────────────────────────────────────────────
function DPad({ onDir }) {
    const btn = (label, dir) => (
        <button onPointerDown={() => onDir(dir)}
            style={{ width: 44, height: 44, background: 'rgba(0,255,159,0.08)', border: '1px solid rgba(0,255,159,0.25)', borderRadius: 8, color: '#00ff9f', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', cursor: 'pointer', transition: 'background 0.1s', WebkitTapHighlightColor: 'transparent' }}
            onPointerEnter={e => e.currentTarget.style.background = 'rgba(0,255,159,0.2)'}
            onPointerLeave={e => e.currentTarget.style.background = 'rgba(0,255,159,0.08)'}
        >{label}</button>
    );
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '44px 44px 44px', gridTemplateRows: '44px 44px 44px', gap: 4, marginTop: 12 }}>
            <div />{btn('▲', 'up')}<div />
            {btn('◄', 'left')}<div style={{ width: 44, height: 44, background: 'rgba(0,255,159,0.04)', borderRadius: 8, border: '1px solid rgba(0,255,159,0.1)' }} />{btn('►', 'right')}
            <div />{btn('▼', 'down')}<div />
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SnakeApp() {
    const [phase, setPhase] = useState('splash'); // splash | playing | dead | win
    const [snake, setSnake] = useState([{ x: 11, y: 11 }, { x: 10, y: 11 }]);
    const [food, setFood] = useState({ x: 16, y: 11 });
    const [powerup, setPowerup] = useState(null);    // { x, y, type, expires }
    const [dir, setDir] = useState({ x: 1, y: 0 });
    const [pendingDir, setPendingDir] = useState(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [combo, setCombo] = useState(0);
    const [comboTimer, setComboTimer] = useState(null);
    const [activePU, setActivePU] = useState(null); // { type, expires }
    const [pops, setPops] = useState([]);
    const [bursts, setBursts] = useState([]);
    const [shake, setShake] = useState(false);
    const [ghost, setGhost] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        try { return parseInt(localStorage.getItem('snk_hs') || '0', 10); } catch { return 0; }
    });

    const rafRef = useRef();
    const lastRef = useRef(0);
    const dirRef = useRef({ x: 1, y: 0 });
    const snakeRef = useRef(snake);
    const foodRef = useRef(food);
    const puRef = useRef(powerup);
    const activePURef = useRef(activePU);
    const scoreRef = useRef(0);
    const ghostRef = useRef(false);
    const isTouchDevice = 'ontouchstart' in window;

    useEffect(() => { snakeRef.current = snake; }, [snake]);
    useEffect(() => { foodRef.current = food; }, [food]);
    useEffect(() => { puRef.current = powerup; }, [powerup]);
    useEffect(() => { activePURef.current = activePU; }, [activePU]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { ghostRef.current = ghost; }, [ghost]);

    const level = getLevel(score);
    const lvlData = LEVELS[level];

    const spawnPop = (x, y, text, color) => setPops(p => [...p, { id: Date.now() + Math.random(), x, y, text, color }]);
    const spawnBurst = (x, y, color) => {
        const particles = Array.from({ length: 10 }, () => ({ size: 3 + Math.random() * 4, color, tx: (Math.random() - 0.5) * 60, ty: (Math.random() - 0.5) * 60 }));
        setBursts(b => [...b, { id: Date.now() + Math.random(), x, y, particles }]);
        setTimeout(() => setBursts(b => b.slice(1)), 800);
    };

    // Clean pops
    useEffect(() => {
        if (pops.length === 0) return;
        const t = setTimeout(() => setPops(p => p.slice(1)), 900);
        return () => clearTimeout(t);
    }, [pops]);

    // Input
    const handleDir = useCallback((d) => {
        const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        const nd = map[d];
        const cd = dirRef.current;
        if (nd.x === -cd.x && nd.y === 0) return;
        if (nd.y === -cd.y && nd.x === 0) return;
        dirRef.current = nd;
        setDir(nd);
    }, []);

    const handleKey = useCallback((e) => {
        if ([' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
        if (e.key === ' ' || e.key === 'Escape') {
            if (phase === 'playing') setPhase('paused');
            else if (phase === 'paused') setPhase('playing');
            return;
        }
        const kmap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
        if (kmap[e.key]) handleDir(kmap[e.key]);
    }, [phase, handleDir]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    // Swipe support
    const touchStartRef = useRef(null);
    const handleTouchStart = (e) => { touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const handleTouchEnd = (e) => {
        if (!touchStartRef.current) return;
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        if (Math.abs(dx) > Math.abs(dy)) handleDir(dx > 0 ? 'right' : 'left');
        else handleDir(dy > 0 ? 'down' : 'up');
    };

    // Spawn power-up randomly
    const maybeSpawnPU = (currentSnake) => {
        if (puRef.current) return;
        if (Math.random() > 0.25) return;
        const types = Object.keys(POWERUP_TYPES);
        const type = types[Math.floor(Math.random() * types.length)];
        let pos;
        do { pos = rnd(); } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
        const pu = { ...pos, type, expires: Date.now() + 6000 };
        setPowerup(pu);
        setTimeout(() => setPowerup(p => p === pu ? null : p), 6000);
    };

    // Game loop
    const tick = useCallback((time) => {
        if (phase !== 'playing') { rafRef.current = requestAnimationFrame(tick); return; }
        const speed = LEVELS[getLevel(scoreRef.current)].speed;
        if (time - lastRef.current < speed) { rafRef.current = requestAnimationFrame(tick); return; }
        lastRef.current = time;

        setSnake(prev => {
            const head = prev[0];
            let nx = head.x + dirRef.current.x;
            let ny = head.y + dirRef.current.y;

            // Wall collision or wrap (ghost mode)
            if (ghostRef.current) {
                nx = (nx + G) % G; ny = (ny + G) % G;
            } else {
                if (nx < 0 || nx >= G || ny < 0 || ny >= G) {
                    setTimeout(() => handleDeath(), 0); return prev;
                }
            }

            // Self collision
            if (prev.some(s => s.x === nx && s.y === ny)) {
                setTimeout(() => handleDeath(), 0); return prev;
            }

            const newHead = { x: nx, y: ny };
            let newSnake = [newHead, ...prev];
            let ate = false;

            // Eat food
            if (nx === foodRef.current.x && ny === foodRef.current.y) {
                ate = true;
                const aPU = activePURef.current;
                const mult = aPU?.type === 'multiplier' ? 2 : 1;
                const comboBonus = 0; // handled below
                const pts = 10 * mult;
                setScore(s => { const ns = s + pts; if (ns > highScore) { setHighScore(ns); localStorage.setItem('snk_hs', ns.toString()); } return ns; });
                setCombo(c => { const nc = c + 1; return nc; });
                spawnPop(nx, ny, `+${pts}${mult > 1 ? '×2' : ''}`, mult > 1 ? '#facc15' : '#00ff9f');
                spawnBurst(nx, ny, mult > 1 ? '#facc15' : '#00ff9f');
                let nf; do { nf = rnd(); } while (newSnake.some(s => s.x === nf.x && s.y === nf.y));
                foodRef.current = nf;
                setFood(nf);
                maybeSpawnPU(newSnake);
            } else {
                newSnake.pop();
            }

            // Pick up power-up
            const pu = puRef.current;
            if (pu && nx === pu.x && ny === pu.y) {
                const pdata = POWERUP_TYPES[pu.type];
                spawnPop(nx, ny, pdata.label, pdata.color);
                spawnBurst(nx, ny, pdata.color);
                setPowerup(null);
                if (pu.type === 'shrink') {
                    newSnake = newSnake.slice(0, Math.max(2, newSnake.length - 4));
                } else if (pu.type === 'multiplier') {
                    setActivePU({ type: 'multiplier', expires: Date.now() + 5000 });
                    activePURef.current = { type: 'multiplier', expires: Date.now() + 5000 };
                    setTimeout(() => { setActivePU(null); activePURef.current = null; }, 5000);
                } else if (pu.type === 'ghost') {
                    setGhost(true); ghostRef.current = true;
                    setActivePU({ type: 'ghost', expires: Date.now() + 5000 });
                    activePURef.current = { type: 'ghost', expires: Date.now() + 5000 };
                    setTimeout(() => { setGhost(false); ghostRef.current = false; setActivePU(null); activePURef.current = null; }, 5000);
                }
            }

            return newSnake;
        });

        rafRef.current = requestAnimationFrame(tick);
    }, [phase]);

    const handleDeath = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLives(l => {
            if (l - 1 <= 0) { setPhase('dead'); return 0; }
            return l - 1;
        });
        setSnake([{ x: 11, y: 11 }, { x: 10, y: 11 }]);
        dirRef.current = { x: 1, y: 0 };
        setDir({ x: 1, y: 0 });
    };

    useEffect(() => {
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [tick]);

    const startGame = () => {
        setSnake([{ x: 11, y: 11 }, { x: 10, y: 11 }]);
        setFood({ x: 16, y: 11 });
        dirRef.current = { x: 1, y: 0 };
        setDir({ x: 1, y: 0 });
        setScore(0); setLives(3); setCombo(0); setPowerup(null); setActivePU(null); setGhost(false);
        ghostRef.current = false;
        setPops([]); setBursts([]);
        setPhase('playing');
    };

    // Active PU timer bar
    const [puProgress, setPuProgress] = useState(1);
    useEffect(() => {
        if (!activePU) { setPuProgress(1); return; }
        const total = 5000;
        const iv = setInterval(() => {
            const left = activePU.expires - Date.now();
            setPuProgress(Math.max(0, left / total));
        }, 50);
        return () => clearInterval(iv);
    }, [activePU]);

    const levelColor = lvlData.color;

    return (
        <div style={{ width: '100%', height: '100%', background: '#050a0e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Share Tech Mono", monospace', overflow: 'hidden', position: 'relative', userSelect: 'none' }}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

            {/* CRT scanlines overlay */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)', backgroundSize: '100% 4px' }} />
            {/* Radial vignette */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)' }} />

            {/* ── SPLASH ── */}
            {phase === 'splash' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'fadeIn 0.6s ease both' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, letterSpacing: '0.4em', color: levelColor, opacity: 0.7, marginBottom: 8 }}>SYSTEMOS ARCADE</div>
                        <h1 style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 'clamp(52px,10vw,88px)', letterSpacing: '0.12em', color: '#fff', margin: 0, textShadow: `0 0 30px ${levelColor}80, 0 0 60px ${levelColor}30`, lineHeight: 1 }}>
                            SER<span style={{ color: levelColor }}>P</span>ENT
                        </h1>
                        <div style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>v2.0 // NEON EDITION</div>
                    </div>

                    {/* Animated snake preview */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} style={{ width: i === 0 ? 16 : 12, height: i === 0 ? 16 : 12, borderRadius: i === 0 ? 4 : 3, background: i === 0 ? levelColor : `rgba(0,255,159,${0.7 - i * 0.08})`, boxShadow: i === 0 ? `0 0 12px ${levelColor}` : 'none', animation: `snakeBob 1s ease ${i * 0.08}s infinite alternate` }} />
                        ))}
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 10px #f43f5e', marginLeft: 20, animation: 'foodPulse 0.8s ease infinite alternate' }} />
                    </div>

                    {/* Stats if returning */}
                    {highScore > 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em' }}>BEST: <span style={{ color: levelColor }}>{highScore}</span></div>}

                    {/* Power-up legend */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {Object.entries(POWERUP_TYPES).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: `1px solid ${v.color}30`, borderRadius: 20, background: `${v.color}10`, fontSize: 10, color: v.color, letterSpacing: '0.1em' }}>
                                <span style={{ fontSize: 14 }}>{v.symbol}</span> {v.label}
                            </div>
                        ))}
                    </div>

                    <button onClick={startGame} style={{ padding: '14px 48px', background: `${levelColor}18`, border: `1.5px solid ${levelColor}`, color: levelColor, fontFamily: '"Share Tech Mono",monospace', fontSize: 13, letterSpacing: '0.3em', cursor: 'pointer', borderRadius: 4, transition: 'all 0.25s', boxShadow: `0 0 24px ${levelColor}20` }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${levelColor}35`; e.currentTarget.style.boxShadow = `0 0 36px ${levelColor}40`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${levelColor}18`; e.currentTarget.style.boxShadow = `0 0 24px ${levelColor}20`; }}>
                        ▶ INITIATE
                    </button>

                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', textAlign: 'center', lineHeight: 1.9 }}>
                        ARROWS / WASD TO MOVE  ·  SPACE TO PAUSE{isTouchDevice ? '  ·  SWIPE OR D-PAD' : ''}
                    </div>
                </div>
            )}

            {/* ── GAME ── */}
            {(phase === 'playing' || phase === 'paused' || phase === 'dead') && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', padding: '16px' }}>

                    {/* Inner wrapper enforcing max width and controlling full height distribution */}
                    <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, justifyContent: 'center' }}>

                        {/* HUD */}
                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {/* Score + level */}
                            <div>
                                <div style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>SCORE</div>
                                <div style={{ fontSize: 26, color: levelColor, lineHeight: 1, textShadow: `0 0 12px ${levelColor}80` }}>{score}</div>
                                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: levelColor, opacity: 0.7, marginTop: 2 }}>{lvlData.name}</div>
                            </div>

                            {/* Lives */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i < lives ? levelColor : 'rgba(255,255,255,0.1)', boxShadow: i < lives ? `0 0 6px ${levelColor}` : 'none', transition: 'all 0.3s ease' }} />
                                ))}
                            </div>

                            {/* High score + combo */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>BEST</div>
                                <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>{highScore}</div>
                                {combo >= 2 && <div style={{ fontSize: 9, color: '#facc15', letterSpacing: '0.15em', marginTop: 2, animation: 'popFloat 0.3s ease' }}>×{combo} COMBO</div>}
                            </div>
                        </div>

                        {/* Active power-up bar */}
                        {activePU && (
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <div style={{ fontSize: 9, letterSpacing: '0.12em', color: POWERUP_TYPES[activePU.type].color, flexShrink: 0 }}>
                                    {POWERUP_TYPES[activePU.type].symbol} {POWERUP_TYPES[activePU.type].label}
                                </div>
                                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${puProgress * 100}%`, background: POWERUP_TYPES[activePU.type].color, boxShadow: `0 0 6px ${POWERUP_TYPES[activePU.type].color}`, transition: 'width 0.05s linear', borderRadius: 2 }} />
                                </div>
                            </div>
                        )}

                        {/* Board Container allowing vertical constraint */}
                        <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
                            {/* Board Aspect Ratio Square */}
                            <div style={{ width: '100%', maxHeight: '100%', aspectRatio: '1/1', position: 'relative', border: `1.5px solid ${levelColor}60`, borderRadius: 6, overflow: 'hidden', background: '#030608', boxShadow: `0 0 30px ${levelColor}20, inset 0 0 60px rgba(0,0,0,0.6)`, animation: shake ? 'shake 0.5s ease' : 'none', transition: 'box-shadow 0.5s ease' }}>

                                {/* Grid lines */}
                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    {Array.from({ length: G + 1 }).map((_, i) => (
                                        <React.Fragment key={i}>
                                            <line x1={`${(i / G) * 100}%`} y1="0" x2={`${(i / G) * 100}%`} y2="100%" stroke={levelColor} strokeWidth="0.5" />
                                            <line x1="0" y1={`${(i / G) * 100}%`} x2="100%" y2={`${(i / G) * 100}%`} stroke={levelColor} strokeWidth="0.5" />
                                        </React.Fragment>
                                    ))}
                                </svg>

                                {/* Snake */}
                                {snake.map((seg, i) => {
                                    const isHead = i === 0;
                                    const opacity = isHead ? 1 : Math.max(0.2, 1 - (i / snake.length) * 0.75);
                                    const sc = ghost ? '#818cf8' : levelColor;
                                    return (
                                        <div key={i} style={{ position: 'absolute', width: `${CELL * 0.88}%`, height: `${CELL * 0.88}%`, left: `${seg.x * CELL + CELL * 0.06}%`, top: `${seg.y * CELL + CELL * 0.06}%`, borderRadius: isHead ? 4 : 3, background: isHead ? sc : `${sc}`, opacity, boxShadow: isHead ? `0 0 10px ${sc}, 0 0 20px ${sc}60` : 'none', zIndex: isHead ? 10 : 5, transition: 'left 0.05s, top 0.05s' }} />
                                    );
                                })}

                                {/* Food */}
                                <div style={{ position: 'absolute', width: `${CELL * 0.7}%`, height: `${CELL * 0.7}%`, left: `${food.x * CELL + CELL * 0.15}%`, top: `${food.y * CELL + CELL * 0.15}%`, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 12px #f43f5e, 0 0 24px #f43f5e60', zIndex: 8, animation: 'foodPulse 0.7s ease infinite alternate' }} />

                                {/* Power-up */}
                                {powerup && (() => {
                                    const pd = POWERUP_TYPES[powerup.type];
                                    return (
                                        <div style={{ position: 'absolute', width: `${CELL * 0.85}%`, height: `${CELL * 0.85}%`, left: `${powerup.x * CELL + CELL * 0.075}%`, top: `${powerup.y * CELL + CELL * 0.075}%`, borderRadius: 4, border: `1.5px solid ${pd.color}`, background: `${pd.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${Math.max(8, CELL * 0.6)}px`, zIndex: 9, boxShadow: `0 0 10px ${pd.color}80`, animation: 'puSpin 1.5s linear infinite' }}>
                                            {pd.symbol}
                                        </div>
                                    );
                                })()}

                                {/* Score pops */}
                                <ScorePop pops={pops} />
                                <Particles bursts={bursts} />

                                {/* Overlays */}
                                {phase === 'paused' && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,6,8,0.88)', backdropFilter: 'blur(4px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, animation: 'fadeIn 0.2s ease' }}>
                                        <div style={{ fontFamily: '"Bebas Neue",cursive', fontSize: 40, letterSpacing: '0.15em', color: levelColor, textShadow: `0 0 20px ${levelColor}` }}>PAUSED</div>
                                        <button onClick={() => setPhase('playing')} style={{ padding: '10px 32px', background: `${levelColor}18`, border: `1px solid ${levelColor}`, color: levelColor, fontFamily: '"Share Tech Mono",monospace', fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 3 }}>RESUME</button>
                                        <button onClick={() => { setPhase('splash'); }} style={{ padding: '8px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', fontFamily: '"Share Tech Mono",monospace', fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 3 }}>QUIT</button>
                                    </div>
                                )}

                                {phase === 'dead' && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,6,8,0.92)', backdropFilter: 'blur(6px)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ fontFamily: '"Bebas Neue",cursive', fontSize: 38, letterSpacing: '0.12em', color: '#f43f5e', textShadow: '0 0 20px #f43f5e' }}>TERMINATED</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>FINAL SCORE</div>
                                        <div style={{ fontFamily: '"Bebas Neue",cursive', fontSize: 56, color: '#fff', lineHeight: 1, textShadow: `0 0 20px ${levelColor}` }}>{score}</div>
                                        {score >= highScore && score > 0 && <div style={{ fontSize: 10, color: '#facc15', letterSpacing: '0.3em', animation: 'popFloat 0.5s ease' }}>★ NEW HIGH SCORE</div>}
                                        <button onClick={startGame} style={{ marginTop: 8, padding: '12px 36px', background: 'rgba(0,255,159,0.12)', border: '1.5px solid #00ff9f', color: '#00ff9f', fontFamily: '"Share Tech Mono",monospace', fontSize: 12, letterSpacing: '0.25em', cursor: 'pointer', borderRadius: 4, boxShadow: '0 0 20px rgba(0,255,159,0.15)' }}>↻ REBOOT</button>
                                        <button onClick={() => setPhase('splash')} style={{ padding: '8px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontFamily: '"Share Tech Mono",monospace', fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 3 }}>MENU</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile D-Pad */}
                        {isTouchDevice && phase === 'playing' && <DPad onDir={handleDir} />}

                        {/* Footer hints */}
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.18em', display: 'flex', gap: 16 }}>
                            <span>ARROWS / WASD</span>
                            <span>SPACE = PAUSE</span>
                            <span style={{ color: levelColor, opacity: 0.6 }}>LVL {level + 1}/5</span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');
                @keyframes fadeIn    { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
                @keyframes popFloat  { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-32px)} }
                @keyframes foodPulse { from{transform:scale(0.85);opacity:0.8} to{transform:scale(1.15);opacity:1} }
                @keyframes puSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes snakeBob  { from{transform:translateY(0)} to{transform:translateY(-5px)} }
                @keyframes shake     { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
                @keyframes particleFly { to{transform:translate(var(--tx),var(--ty));opacity:0} }
            `}</style>
        </div>
    );
}