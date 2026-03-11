import React, { useState, useEffect, useRef } from 'react';
import { Database, Plus, CheckCircle, AlertTriangle, GitBranch, Terminal, Star, GitFork, Lock, Zap } from 'lucide-react';

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

const P = 'var(--os-primary)';

// ─── Mobile detection hook ────────────────────────────────────────────────────
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

function Blink() {
    const [v, setV] = useState(true);
    useEffect(() => { const t = setInterval(() => setV(x => !x), 520); return () => clearInterval(t); }, []);
    return <span style={{ display: 'inline-block', width: 7, height: 12, background: v ? P : 'transparent', verticalAlign: 'middle', marginLeft: 2, transition: 'background 0.08s' }} />;
}

function Bracket({ pos }) {
    const isTop = pos.includes('top'), isLeft = pos.includes('left');
    return <span style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: -1,
        [isLeft ? 'left' : 'right']: -1,
        width: 10, height: 10,
        borderTop: isTop ? `1.5px solid ${P}` : 'none',
        borderBottom: !isTop ? `1.5px solid ${P}` : 'none',
        borderLeft: isLeft ? `1.5px solid ${P}` : 'none',
        borderRight: !isLeft ? `1.5px solid ${P}` : 'none',
    }} />;
}

export default function AddProjectApp() {
    const isMobile = useIsMobile();
    const [url, setUrl] = useState('');
    const [deployedUrl, setDeployedUrl] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [parsed, setParsed] = useState(null);
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const logsRef = useRef(null);

    useEffect(() => { logsRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }); }, [logs]);

    useEffect(() => {
        if (!url.trim()) { setParsed(null); return; }
        try {
            const u = new URL(url);
            const p = u.pathname.split('/').filter(Boolean);
            setParsed(p.length >= 2 ? { owner: p[0], repo: p[1] } : null);
        } catch {
            const p = url.split('/').filter(Boolean);
            setParsed(p.length === 2 ? { owner: p[0], repo: p[1] } : null);
        }
    }, [url]);

    const log = (text, type = 'dim') => setLogs(prev => [...prev, { text, type, id: Math.random() }]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true); setStatus(null); setLogs([]); setStep(1); setProgress(5);
        try {
            let owner, repo;
            try {
                const u = new URL(url); const p = u.pathname.split('/').filter(Boolean);
                if (p.length < 2) throw 0;[owner, repo] = p;
            } catch { const p = url.split('/').filter(Boolean); if (p.length === 2) [owner, repo] = p; else throw new Error("Invalid GitHub URL."); }

            log(`INIT · Resolving  github.com/${owner}/${repo}`);
            setProgress(20); await new Promise(r => setTimeout(r, 360));
            log(`CONN · Handshake  api.github.com`);
            setProgress(38);

            const ghHeaders = {};
            const ghToken = import.meta.env.VITE_GITHUB_TOKEN;
            if (ghToken) ghHeaders['Authorization'] = `token ${ghToken}`;
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders });
            if (!res.ok) {
                if (res.status === 404) throw new Error("Repository not found or is private.");
                if (res.status === 403) throw new Error("GitHub rate limit exceeded.");
                throw new Error("API request failed.");
            }
            const data = await res.json();
            setProgress(58);
            log(`DATA · ${data.stargazers_count}★  ${data.forks_count} forks  lang:${data.language || 'N/A'}`, 'ok');
            setStep(2); await new Promise(r => setTimeout(r, 200));
            log(`AUTH · Requesting admin clearance…`, 'warn');

            const pwd = window.prompt("AUTHENTICATION REQUIRED\nEnter Admin Password:");
            if (pwd !== "Aniket292006") throw new Error("ACCESS DENIED — incorrect credentials.");

            setStep(3); setProgress(80);
            log(`PASS · Identity verified — clearance granted`, 'ok');
            await new Promise(r => setTimeout(r, 280));

            const c = COLORS[Math.floor(Math.random() * COLORS.length)];
            const isDeployed = Boolean(deployedUrl.trim());

            const proj = {
                id: `custom_${Date.now()}_${data.id}`, title: data.name,
                tag: data.stargazers_count || 0, year: new Date(data.updated_at).getFullYear().toString(),
                status: isDeployed ? "DEPLOYED" : (data.archived ? "ARCHIVED" : "ACTIVE"),
                statusColor: data.archived ? "#ff4444" : "#00ff87",
                desc: data.description || "No description provided.",
                tech: data.topics?.length ? data.topics : (data.language ? [data.language] : ["Source"]),
                color: c.color, grad: c.grad, url: data.html_url, deployedUrl: deployedUrl.trim(), isCustom: true
            };

            const hidden = JSON.parse(localStorage.getItem('systemos_hidden_projects') || '[]');
            const isHidden = hidden.includes(data.id.toString());
            let shouldSaveCustom = true;

            if (isHidden) {
                const newHidden = hidden.filter(id => id !== data.id.toString());
                localStorage.setItem('systemos_hidden_projects', JSON.stringify(newHidden));
                if (proj.url.toLowerCase().includes("github.com/ani29hs") && !proj.deployedUrl) {
                    shouldSaveCustom = false;
                }
            }

            const ex = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
            const existingIndex = ex.findIndex(p => p.url === proj.url);

            if (shouldSaveCustom) {
                if (existingIndex !== -1) {
                    if (ex[existingIndex].deployedUrl === proj.deployedUrl) {
                        throw new Error(isHidden ? "Project unhidden. Update skipped since deployed URL matched." : "Project already exists in registry with these details.");
                    }
                    ex[existingIndex] = proj;
                } else {
                    if (proj.url.toLowerCase().includes("github.com/ani29hs") && !proj.deployedUrl && !isHidden) {
                        throw new Error("Project already fetched from GitHub. Provide a Deployment URL to update.");
                    }
                    ex.unshift(proj);
                }
                localStorage.setItem('systemos_custom_projects', JSON.stringify(ex));
            }
            window.dispatchEvent(new Event('systemos_projects_updated'));

            setProgress(100);
            log(`DONE · "${data.name}" injected into registry`, 'ok');
            setStatus({ type: 'success', msg: data.name, repoData: data });
            setUrl(''); setDeployedUrl(''); setStep(4);
        } catch (err) {
            log(`ERR! · ${err.message}`, 'err');
            setStatus({ type: 'error', msg: err.message });
            setStep(0); setProgress(0);
        } finally { setLoading(false); }
    };

    const lc = { dim: 'var(--os-text-muted)', ok: P, warn: '#f59e0b', err: '#f87171' };

    // ─── MOBILE LAYOUT ────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div style={{
                height: '100%', background: 'var(--os-bg)', color: 'var(--os-text)',
                fontFamily: '"Share Tech Mono",monospace',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto', overflowX: 'hidden',
                position: 'relative', WebkitOverflowScrolling: 'touch'
            }}>
                {/* Subtle grid bg */}
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(var(--os-primary) 1px,transparent 1px),linear-gradient(90deg,var(--os-primary) 1px,transparent 1px)`, backgroundSize: '36px 36px', opacity: 0.03 }} />
                <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `radial-gradient(ellipse 80% 40% at 50% 0%,var(--os-primary) 0%,transparent 100%)`, opacity: 0.05 }} />

                <div style={{ position: 'relative', zIndex: 1, padding: '14px 14px 20px', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box' }}>

                    {/* ── TOPBAR (compact) ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid var(--os-border)`, paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 8, letterSpacing: '0.2em', color: P, opacity: 0.8 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: P, display: 'inline-block', boxShadow: `0 0 6px ${P}`, animation: 'glow 2s ease infinite' }} />
                            PKG INJECTOR
                            <Blink />
                        </div>
                        <span style={{ fontSize: 8, letterSpacing: '0.1em', color: 'var(--os-text-muted)', opacity: 0.5 }}>
                            {new Date().toISOString().slice(11, 19)} UTC
                        </span>
                    </div>

                    {/* ── TITLE (compact) ── */}
                    <div>
                        <h1 style={{ fontFamily: '"Bebas Neue",cursive', fontSize: 28, lineHeight: 1, letterSpacing: '0.05em', margin: '0 0 4px', color: 'var(--os-text)' }}>
                            INJECT <span style={{ color: P }}>PROJECT</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: 9, color: 'var(--os-text-secondary)', letterSpacing: '0.05em', lineHeight: 1.5 }}>
                            Sync a GitHub repo into the project registry.
                        </p>
                    </div>

                    {/* ── PROTOCOL STEPS ── */}
                    <div style={{ background: 'var(--os-glass)', border: '1px solid var(--os-border)', padding: '10px 12px', borderRadius: 4 }}>
                        <div style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '0.2em', color: 'var(--os-text-secondary)', marginBottom: 8 }}>PROTOCOL STAGES</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            {[['FETCH', 1], ['AUTH', 2], ['INJECT', 3]].map(([lbl, n], i) => {
                                const done = step > n || step === 4, active = step === n;
                                const col = done ? '#10b981' : active ? P : 'var(--os-text-muted)';
                                return (
                                    <React.Fragment key={lbl}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            background: active ? 'var(--os-hover)' : 'transparent',
                                            border: active ? `1px solid ${P}` : '1px solid transparent',
                                            padding: '3px 7px 3px 5px', borderRadius: 4, transition: 'all 0.3s'
                                        }}>
                                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: col, flexShrink: 0, transition: 'all 0.4s' }}>
                                                {done ? '✓' : `0${n}`}
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '0.1em', color: col, whiteSpace: 'nowrap' }}>{lbl}</span>
                                            {active && loading && <span style={{ color: P, fontSize: 8, animation: 'pulse 0.9s ease infinite' }}>◆</span>}
                                        </div>
                                        {i < 2 && <div style={{ flex: 1, height: 1, background: step > n ? '#10b981' : 'var(--os-border)', margin: '0 6px', transition: 'background 0.5s', minWidth: 8 }} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── INPUT PANEL ── */}
                    <div style={{ background: 'var(--os-glass)', border: '1px solid var(--os-border)', padding: '12px 14px', position: 'relative', borderRadius: 4 }}>
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(p => <Bracket key={p} pos={p} />)}
                        <div style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '0.2em', color: P, opacity: 0.8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Terminal size={9} /> GITHUB TARGET VECTOR
                        </div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {/* URL row — input + button stacked vertically on very small screens */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text" value={url} onChange={e => setUrl(e.target.value)}
                                        placeholder="https://github.com/owner/repo"
                                        required disabled={loading}
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--os-bg)', border: '1px solid var(--os-border)', color: 'var(--os-text)', padding: '9px 12px', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, outline: 'none', letterSpacing: '0.02em', caretColor: P, transition: 'border-color 0.25s', borderRadius: 2 }}
                                        onFocus={e => e.target.style.borderColor = 'var(--os-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--os-border)'}
                                    />
                                    {parsed && (
                                        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 8, color: P, opacity: 0.65, letterSpacing: '0.06em' }}>
                                            <GitBranch size={8} />{parsed.owner}/{parsed.repo}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" disabled={loading}
                                    style={{ padding: '9px 0', background: loading ? 'var(--os-hover)' : P, border: `1px solid ${loading ? 'var(--os-border)' : P}`, color: loading ? 'var(--os-text-muted)' : 'var(--os-bg)', fontWeight: 'bold', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.25s', position: 'relative', overflow: 'hidden', borderRadius: 2, WebkitTapHighlightColor: 'transparent' }}>
                                    {loading && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,var(--os-text-muted),transparent)', opacity: 0.3, animation: 'sweep 1.1s linear infinite' }} />}
                                    <Zap size={12} style={{ animation: loading ? 'pulse 0.8s ease infinite' : 'none' }} />
                                    {loading ? 'SYNCING…' : 'INJECT'}
                                </button>
                            </div>

                            {/* Deployed URL */}
                            <div>
                                <div style={{ fontSize: 8, fontWeight: 'bold', letterSpacing: '0.2em', color: P, opacity: 0.8, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Star size={9} /> DEPLOYED URL (OPTIONAL)
                                </div>
                                <input
                                    type="text" value={deployedUrl} onChange={e => setDeployedUrl(e.target.value)}
                                    placeholder="https://your-app.com"
                                    disabled={loading}
                                    style={{ width: '100%', boxSizing: 'border-box', background: 'var(--os-bg)', border: '1px solid var(--os-border)', color: 'var(--os-text)', padding: '9px 12px', fontFamily: '"Share Tech Mono",monospace', fontSize: 11, outline: 'none', letterSpacing: '0.02em', caretColor: P, transition: 'border-color 0.25s', borderRadius: 2 }}
                                    onFocus={e => e.target.style.borderColor = 'var(--os-primary)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--os-border)'}
                                />
                            </div>
                        </form>

                        {/* Progress bar */}
                        <div style={{ height: 2, background: 'var(--os-border)', marginTop: 10, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: progress === 100 ? '#10b981' : `linear-gradient(90deg,transparent,${P})`, transition: 'width 0.35s ease,background 0.5s ease', boxShadow: `0 0 6px ${P}` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 8, fontWeight: 'bold', letterSpacing: '0.12em', color: 'var(--os-text-muted)' }}>
                            <span>PROGRESS</span><span>{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* ── TRANSMISSION LOG (compact height on mobile) ── */}
                    <div style={{ background: 'var(--os-glass)', border: '1px solid var(--os-border)', padding: '10px 12px', borderRadius: 4, position: 'relative' }}>
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(p => <Bracket key={p} pos={p} />)}
                        <div style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '0.2em', color: 'var(--os-text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Database size={9} /> TRANSMISSION LOG
                        </div>
                        <div ref={logsRef} style={{ height: 100, overflowY: 'auto', scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                            {logs.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, opacity: 0.4, color: 'var(--os-text-muted)' }}>
                                    <Terminal size={18} />
                                    <span style={{ fontSize: 9, fontWeight: 'bold', letterSpacing: '0.18em' }}>AWAITING TRANSMISSION</span>
                                </div>
                            ) : logs.map((l, i) => (
                                <div key={l.id} style={{ display: 'flex', gap: 6, fontSize: 10, lineHeight: 1.7, color: lc[l.type], animation: 'logIn 0.22s ease both', animationDelay: `${i * 35}ms`, letterSpacing: '0.02em' }}>
                                    <span style={{ color: P, opacity: 0.38, flexShrink: 0 }}>›</span>{l.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── STATUS CARD ── */}
                    {status && (
                        <div style={{ background: status.type === 'error' ? 'rgba(248,113,113,0.1)' : 'var(--os-hover)', border: `1px solid ${status.type === 'error' ? 'rgba(248,113,113,0.22)' : 'var(--os-border)'}`, borderLeft: `3px solid ${status.type === 'error' ? '#f87171' : P}`, padding: '12px 14px', animation: 'logIn 0.3s ease both', display: 'flex', flexDirection: 'column', gap: 7, borderRadius: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {status.type === 'error' ? <AlertTriangle size={12} style={{ color: '#f87171' }} /> : <CheckCircle size={12} style={{ color: P }} />}
                                <span style={{ fontSize: 8, letterSpacing: '0.18em', color: status.type === 'error' ? '#f87171' : P }}>
                                    {status.type === 'error' ? 'INJECTION FAILED' : 'PACKAGE SYNCHRONIZED'}
                                </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--os-text-secondary)', letterSpacing: '0.03em', lineHeight: 1.5 }}>
                                {status.type === 'error' ? status.msg : `"${status.msg}" added to project registry.`}
                            </div>
                            {status.type === 'success' && status.repoData && (
                                <div style={{ display: 'flex', gap: 12, paddingTop: 5, borderTop: '1px solid var(--os-border)' }}>
                                    {[[Star, status.repoData.stargazers_count], [GitFork, status.repoData.forks_count], [Lock, status.repoData.private ? 'PRIVATE' : 'PUBLIC']].map(([Icon, val], i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--os-text-muted)' }}>
                                            <Icon size={8} />{val}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--os-border)', fontSize: 7, letterSpacing: '0.18em', color: 'var(--os-text-muted)' }}>
                        <span>TERMINAL NODE // OSv2.1</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'glow 2s ease infinite' }} />
                            CONNECTED
                        </div>
                    </div>
                </div>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');
                    @keyframes logIn { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
                    @keyframes sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
                    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
                    @keyframes glow  { 0%,100%{box-shadow:0 0 4px var(--os-primary)} 50%{box-shadow:0 0 10px var(--os-primary)} }
                    div::-webkit-scrollbar { width:3px }
                    div::-webkit-scrollbar-track { background:transparent }
                    div::-webkit-scrollbar-thumb { background:var(--os-border); border-radius:2px }
                `}</style>
            </div>
        );
    }

    // ─── DESKTOP LAYOUT (100% UNCHANGED) ─────────────────────────────────────
    return (
        <div style={{ height: '100%', background: 'var(--os-bg)', color: 'var(--os-text)', fontFamily: '"Share Tech Mono",monospace', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>

            {/* grid bg */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                backgroundImage: `linear-gradient(var(--os-primary) 1px,transparent 1px),linear-gradient(90deg,var(--os-primary) 1px,transparent 1px)`,
                backgroundSize: '36px 36px', opacity: 0.03
            }} />
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: `radial-gradient(ellipse 80% 40% at 50% 0%,var(--os-primary) 0%,transparent 100%)`, opacity: 0.05
            }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px 36px', display: 'flex', flexDirection: 'column', gap: 18, height: '100%', boxSizing: 'border-box' }}>

                {/* ── TOPBAR ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid var(--os-border)`, paddingBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 9, letterSpacing: '0.28em', color: P, opacity: 0.8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: P, display: 'inline-block', boxShadow: `0 0 8px ${P}`, animation: 'glow 2s ease infinite' }} />
                        SYSTEMOS · PKG INJECTOR · NODE 2.1
                        <Blink />
                    </div>
                    <span style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--os-text-muted)', opacity: 0.5 }}>
                        {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
                    </span>
                </div>

                {/* ── MAIN TWO-COLUMN LAYOUT ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, minHeight: 0 }}>

                    {/* ── LEFT: FORM COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Title + steps */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontFamily: '"Bebas Neue",cursive', fontSize: 'clamp(32px,3.5vw,50px)', lineHeight: 1, letterSpacing: '0.05em', margin: '0 0 7px', color: 'var(--os-text)' }}>
                                    INJECT <span style={{ color: P }}>PROJECT</span> ARCHIVE
                                </h1>
                                <p style={{ margin: 0, fontSize: 10, color: 'var(--os-text-secondary)', letterSpacing: '0.07em', lineHeight: 1.65 }}>
                                    Extract telemetry from the GitHub mainframe and synchronize a new Omega Project Card.
                                </p>
                            </div>
                        </div>

                        {/* Step panel */}
                        <div style={{ background: 'var(--os-glass)', border: '1px solid var(--os-border)', padding: '14px 18px', borderRadius: 4 }}>
                            <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: '0.2em', color: 'var(--os-text-secondary)', marginBottom: 12 }}>PROTOCOL STAGES</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                {[['FETCH', 1], ['AUTH', 2], ['INJECT', 3]].map(([lbl, n], i) => {
                                    const done = step > n || step === 4, active = step === n;
                                    const col = done ? '#10b981' : active ? P : 'var(--os-text-muted)';
                                    return (
                                        <React.Fragment key={lbl}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                background: active ? `var(--os-hover)` : 'transparent',
                                                border: active ? `1px solid ${P}` : `1px solid transparent`,
                                                padding: '4px 10px 4px 6px',
                                                borderRadius: '4px',
                                                transition: 'all 0.3s'
                                            }}>
                                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${col}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: col, flexShrink: 0, background: active ? `var(--os-hover)` : 'transparent', boxShadow: active ? `0 0 10px var(--os-primary-rgb)` : 'none', transition: 'all 0.4s ease' }}>
                                                    {done ? '✓' : `0${n}`}
                                                </div>
                                                <span style={{ fontSize: 10, fontWeight: "bold", letterSpacing: '0.14em', color: col, transition: 'color 0.4s', whiteSpace: 'nowrap' }}>{lbl}</span>
                                                {active && loading && <span style={{ color: P, fontSize: 10, animation: 'pulse 0.9s ease infinite' }}>◆</span>}
                                            </div>
                                            {i < 2 && <div style={{ flex: 1, height: 1, background: step > n ? '#10b981' : 'var(--os-border)', margin: '0 10px', transition: 'background 0.5s', minWidth: 16 }} />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Input panel */}
                        <div style={{ background: 'var(--os-glass)', border: `1px solid var(--os-border)`, padding: '18px 22px', position: 'relative', borderRadius: 4 }}>
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(p => <Bracket key={p} pos={p} />)}
                            <div style={{ fontSize: 9, fontWeight: "bold", letterSpacing: '0.24em', color: P, opacity: 0.8, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Terminal size={10} /> GITHUB TARGET VECTOR
                            </div>
                            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <input
                                            type="text" value={url} onChange={e => setUrl(e.target.value)}
                                            placeholder="https://github.com/owner/repo"
                                            required disabled={loading}
                                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--os-bg)', border: '1px solid var(--os-border)', borderRight: 'none', color: 'var(--os-text)', padding: '11px 16px', fontFamily: '"Share Tech Mono",monospace', fontSize: 12, outline: 'none', letterSpacing: '0.04em', caretColor: P, transition: 'border-color 0.25s' }}
                                            onFocus={e => e.target.style.borderColor = `var(--os-primary)`}
                                            onBlur={e => e.target.style.borderColor = 'var(--os-border)'}
                                        />
                                        {parsed && (
                                            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: P, opacity: 0.65, pointerEvents: 'none', letterSpacing: '0.06em' }}>
                                                <GitBranch size={8} />{parsed.owner}/{parsed.repo}
                                            </div>
                                        )}
                                    </div>
                                    <button type="submit" disabled={loading}
                                        style={{ padding: '0 22px', background: loading ? 'var(--os-hover)' : 'var(--os-primary)', border: `1px solid ${loading ? 'var(--os-border)' : 'var(--os-primary)'}`, color: loading ? 'var(--os-text-muted)' : 'var(--os-bg)', fontWeight: 'bold', fontFamily: '"Share Tech Mono",monospace', fontSize: 12, letterSpacing: '0.22em', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.25s', whiteSpace: 'nowrap', position: 'relative', overflow: 'hidden' }}
                                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.boxShadow = `0 0 22px var(--os-primary) inset`; } }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                                        {loading && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,var(--os-text-muted),transparent)', opacity: 0.3, animation: 'sweep 1.1s linear infinite' }} />}
                                        <Zap size={13} style={{ animation: loading ? 'pulse 0.8s ease infinite' : 'none' }} />
                                        {loading ? 'SYNCING…' : 'INJECT'}
                                    </button>
                                </div>
                                <div>
                                    <div style={{ fontSize: 9, fontWeight: "bold", letterSpacing: '0.24em', color: P, opacity: 0.8, marginBottom: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Star size={10} /> DEPLOYED URL (OPTIONAL)
                                    </div>
                                    <input
                                        type="text" value={deployedUrl} onChange={e => setDeployedUrl(e.target.value)}
                                        placeholder="https://your-app.com"
                                        disabled={loading}
                                        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--os-bg)', border: '1px solid var(--os-border)', color: 'var(--os-text)', padding: '11px 16px', fontFamily: '"Share Tech Mono",monospace', fontSize: 12, outline: 'none', letterSpacing: '0.04em', caretColor: P, transition: 'border-color 0.25s' }}
                                        onFocus={e => e.target.style.borderColor = `var(--os-primary)`}
                                        onBlur={e => e.target.style.borderColor = 'var(--os-border)'}
                                    />
                                </div>
                            </form>
                            <div style={{ height: 2, background: 'var(--os-border)', marginTop: 14, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: progress === 100 ? '#10b981' : `linear-gradient(90deg,transparent,${P})`, transition: 'width 0.35s ease,background 0.5s ease', boxShadow: `0 0 6px ${P}` }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, fontWeight: "bold", letterSpacing: '0.14em', color: 'var(--os-text-muted)' }}>
                                <span>TRANSFER PROGRESS</span><span>{Math.round(progress)}%</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--os-border)', fontSize: 8, letterSpacing: '0.2em', color: 'var(--os-text-muted)', marginTop: 'auto' }}>
                            <span>TERMINAL NODE // OSv2.1</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'glow 2s ease infinite' }} />
                                MAINFRAME CONNECTED
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: OUTPUT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
                        {/* Log panel — always rendered, fills right column */}
                        <div style={{ background: 'var(--os-glass)', border: '1px solid var(--os-border)', padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', borderRadius: 4 }}>
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(p => <Bracket key={p} pos={p} />)}
                            <div style={{ fontSize: 10, fontWeight: "bold", letterSpacing: '0.22em', color: 'var(--os-text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Database size={9} /> TRANSMISSION LOG
                            </div>
                            <div ref={logsRef} style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                {logs.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, opacity: 0.4, color: "var(--os-text-muted)" }}>
                                        <Terminal size={24} />
                                        <span style={{ fontSize: 11, fontWeight: "bold", letterSpacing: '0.2em' }}>AWAITING TRANSMISSION</span>
                                    </div>
                                ) : logs.map((l, i) => (
                                    <div key={l.id} style={{ display: 'flex', gap: 7, fontSize: 11, lineHeight: 1.9, color: lc[l.type], animation: 'logIn 0.22s ease both', animationDelay: `${i * 35}ms`, letterSpacing: '0.04em' }}>
                                        <span style={{ color: P, opacity: 0.38, flexShrink: 0 }}>›</span>{l.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status card — only when there's a result */}
                        {status && (
                            <div style={{ background: status.type === 'error' ? 'rgba(248,113,113,0.1)' : `var(--os-hover)`, border: `1px solid ${status.type === 'error' ? 'rgba(248,113,113,0.22)' : 'var(--os-border)'}`, borderLeft: `3px solid ${status.type === 'error' ? '#f87171' : P}`, padding: '16px 20px', animation: 'logIn 0.3s ease both', display: 'flex', flexDirection: 'column', gap: 9, flexShrink: 0, borderRadius: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                    {status.type === 'error' ? <AlertTriangle size={13} style={{ color: '#f87171' }} /> : <CheckCircle size={13} style={{ color: P }} />}
                                    <span style={{ fontSize: 8, letterSpacing: '0.2em', color: status.type === 'error' ? '#f87171' : P }}>
                                        {status.type === 'error' ? 'INJECTION FAILED' : 'PACKAGE SYNCHRONIZED'}
                                    </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--os-text-secondary)', letterSpacing: '0.04em', lineHeight: 1.55 }}>
                                    {status.type === 'error' ? status.msg : `"${status.msg}" added to project registry.`}
                                </div>
                                {status.type === 'success' && status.repoData && (
                                    <div style={{ display: 'flex', gap: 14, paddingTop: 6, borderTop: '1px solid var(--os-border)' }}>
                                        {[[Star, status.repoData.stargazers_count], [GitFork, status.repoData.forks_count], [Lock, status.repoData.private ? 'PRIVATE' : 'PUBLIC']].map(([Icon, val], i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--os-text-muted)' }}>
                                                <Icon size={8} />{val}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>{/* end two-col grid */}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');
                @keyframes logIn { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
                @keyframes sweep { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
                @keyframes glow  { 0%,100%{box-shadow:0 0 4px var(--os-primary)} 50%{box-shadow:0 0 10px var(--os-primary)} }
                div::-webkit-scrollbar { width:3px }
                div::-webkit-scrollbar-track { background:transparent }
                div::-webkit-scrollbar-thumb { background:var(--os-border); border-radius:2px }
            `}</style>
        </div>
    );
}