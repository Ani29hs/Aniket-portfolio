import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AboutMeApp from './AboutMeApp';
import ProjectsApp from './ProjectsApp';
import CertificatesApp from './CertificatesApp';
import TerminalApp from './TerminalApp';
import AddProjectApp from './AddProjectApp';
import SnakeApp from './SnakeApp';

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
}

function DesktopBackground({ wallpaper, theme, onContextMenu, className, children }) {
    return (
        <div
            data-theme={theme}
            className={`fixed inset-0 z-[300] overflow-hidden select-none bg-cover bg-center bg-no-repeat transition-all duration-500 ${className || ''}`}
            onContextMenu={onContextMenu}
            style={{
                backgroundColor: 'var(--os-bg)',
                color: 'var(--os-text)',
                fontFamily: 'var(--os-font)',
                ...(wallpaper ? { backgroundImage: `url(${wallpaper})` } : {})
            }}
        >
            {!wallpaper && <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: `radial-gradient(circle at center, rgba(var(--os-primary-rgb), 0.1) 0%, transparent 70%)` }} />}
            <div className="relative z-10 w-full h-full">{children}</div>
        </div>
    );
}

function MobileAppSheet({ id, title, isActive, onClose, children }) {
    const sheetRef = useRef(null);
    useEffect(() => {
        if (!sheetRef.current) return;
        if (isActive) {
            gsap.fromTo(sheetRef.current, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' });
        }
    }, [isActive]);
    const handleClose = () => {
        if (!sheetRef.current) return;
        gsap.to(sheetRef.current, { y: '100%', opacity: 0, duration: 0.28, ease: 'power3.in', onComplete: onClose });
    };
    if (!isActive) return null;
    return (
        <div ref={sheetRef} className="fixed inset-0 z-[500] flex flex-col" style={{ background: 'var(--os-window-bg)', color: 'var(--os-text)', fontFamily: 'var(--os-font)' }}>
            <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 52, background: 'var(--os-header-bg)', borderBottom: '1px solid var(--os-border)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <button onClick={handleClose} className="flex items-center gap-2 px-3 py-2 rounded-lg active:scale-95 transition-transform" style={{ color: 'var(--os-primary)', background: 'var(--os-hover)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    <span className="text-xs font-bold tracking-widest">BACK</span>
                </button>
                <h3 className="text-xs font-bold tracking-[0.2em] truncate max-w-[55%] text-center" style={{ color: 'var(--os-text)' }}>{title}</h3>
                <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-transform hover:bg-red-500/20" style={{ color: 'var(--os-text-secondary)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className={`flex-1 overflow-auto ${['settings', 'projects'].includes(id) ? '' : 'p-4'}`} style={{ background: 'var(--os-content-bg)', color: 'var(--os-content-text)' }}>
                {children}
            </div>
        </div>
    );
}

function MobileHomeScreen({ desktopFiles, renamedLabels, hiddenIcons, onOpenApp, systemApps }) {
    const allApps = [
        ...desktopFiles.filter(f => !hiddenIcons.includes(f.id)).map(f => ({ id: f.id, label: renamedLabels[f.id] || f.label, iconType: f.type })),
        ...systemApps.map(a => ({ id: a.id, label: a.label, iconType: a.iconType }))
    ];
    const seen = new Set();
    const uniqueApps = allApps.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
    const handleTap = (e, id) => { e.preventDefault(); e.stopPropagation(); onOpenApp(id); };
    return (
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="grid grid-cols-4 gap-x-2 gap-y-6">
                {uniqueApps.map(app => (
                    <button key={app.id} onTouchEnd={(e) => handleTap(e, app.id)} onClick={() => onOpenApp(app.id)} className="flex flex-col items-center gap-2 active:scale-90 transition-transform touch-manipulation" style={{ WebkitTapHighlightColor: 'transparent' }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'color-mix(in srgb, var(--os-primary) 12%, var(--os-window-bg))' }}>
                            <AppIcon type={app.iconType} className="w-9 h-9 drop-shadow-md" />
                        </div>
                        <span className="text-[10px] tracking-wider text-center leading-tight line-clamp-2 w-16" style={{ color: 'var(--os-text)' }}>{app.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function MobileDock({ onToggleMenu, isMenuOpen, openApps, activeAppId, onAppTap, onLogout, time }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[600] flex items-center justify-between px-4" style={{ height: 60, background: 'var(--os-glass)', borderTop: '1px solid var(--os-border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
            <button onTouchEnd={(e) => { e.preventDefault(); onToggleMenu(); }} onClick={onToggleMenu} className="w-12 h-12 flex items-center justify-center rounded-xl active:scale-90 transition-all touch-manipulation" style={{ background: isMenuOpen ? 'var(--os-hover)' : 'transparent', color: isMenuOpen ? 'var(--os-primary)' : 'var(--os-text-secondary)', WebkitTapHighlightColor: 'transparent' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
            </button>
            <div className="flex items-center gap-2">
                {openApps.slice(0, 4).map(app => (
                    <button key={app.id} onClick={() => onAppTap(app.id)} className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-90 transition-all relative" style={{ background: activeAppId === app.id ? 'var(--os-hover)' : 'transparent', border: activeAppId === app.id ? '1px solid var(--os-primary)' : '1px solid transparent' }}>
                        <AppIcon type={app.iconType} className="w-6 h-6" />
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'var(--os-primary)' }} />
                    </button>
                ))}
            </div>
            <div className="flex flex-col items-end justify-center">
                <span className="text-[11px] font-bold" style={{ color: 'var(--os-text)' }}>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                <button onClick={onLogout} className="text-[9px] tracking-widest active:scale-90 transition-transform" style={{ color: 'var(--os-text-muted)' }}>LOGOUT</button>
            </div>
        </div>
    );
}

// FIX 1: z-[700] backdrop and z-[720] sheet — both above MobileAppSheet (z-[500])
function MobileStartMenu({ isOpen, onClose, onLaunchApp, onLogout, allApps }) {
    const sheetRef = useRef(null);
    const backdropRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        if (!mounted || !sheetRef.current) return;
        if (isOpen) {
            sheetRef.current.style.pointerEvents = 'auto';
            if (backdropRef.current) { backdropRef.current.style.display = 'block'; gsap.to(backdropRef.current, { opacity: 1, duration: 0.25 }); }
            gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.35, ease: 'power3.out' });
        } else {
            if (backdropRef.current) { gsap.to(backdropRef.current, { opacity: 0, duration: 0.22, onComplete: () => { if (backdropRef.current) backdropRef.current.style.display = 'none'; } }); }
            gsap.to(sheetRef.current, { y: '100%', duration: 0.25, ease: 'power3.in', onComplete: () => { if (sheetRef.current) sheetRef.current.style.pointerEvents = 'none'; } });
        }
    }, [isOpen, mounted]);
    return (
        <>
            {/* Backdrop: z-[700] covers app sheet (z-[500]) */}
            <div ref={backdropRef} className="fixed inset-0 z-[700]" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', opacity: 0, display: 'none' }} onClick={onClose} />
            {/* Sheet: z-[720] slides over everything including app sheet */}
            <div ref={sheetRef} className="fixed left-0 right-0 z-[720] flex flex-col rounded-t-2xl overflow-hidden" style={{ bottom: 0, height: '72vh', background: 'var(--os-menu-bg)', border: '1px solid var(--os-border)', borderBottom: 'none', transform: 'translateY(100%)', pointerEvents: 'none', willChange: 'transform' }}>
                <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="w-10 h-1 rounded-full" style={{ background: 'var(--os-border)' }} /></div>
                <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--os-border)' }}>
                    <h3 className="font-bold tracking-[0.2em] text-sm" style={{ color: 'var(--os-text)' }}>ALL APPS</h3>
                    <button onClick={onLogout} className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-all" style={{ color: 'var(--os-text-secondary)', background: 'var(--os-hover)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    <div className="grid grid-cols-4 gap-x-3 gap-y-6">
                        {allApps.map(app => (
                            <button key={app.id} onClick={() => { onLaunchApp(app.id); onClose(); }} className="flex flex-col items-center gap-2 active:scale-90 transition-transform touch-manipulation">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'color-mix(in srgb, var(--os-primary) 12%, var(--os-window-bg))' }}>
                                    <AppIcon type={app.iconType} className="w-9 h-9 drop-shadow-md" />
                                </div>
                                <span className="text-[10px] tracking-wider text-center leading-tight line-clamp-2 w-16" style={{ color: 'var(--os-text)' }}>{app.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

// FIX 2: data-taskbar="true" added to outer div so handleDesktopContextMenu can exclude it
function Taskbar({ onLogout, isMenuOpen, toggleMenu, openWindows = [], activeWindowId, onWindowClick, onCloseWindow, getAppMetadata, theme, pinnedApps = [], onPinnedAppClick, onUnpinApp, onReorderPinned, taskbarOrder = [] }) {
    const [time, setTime] = useState(new Date());
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, winId: null, isPinned: false, isOpen: false });
    const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
    const [brightness, setBrightness] = useState(80);
    const [volume, setVolume] = useState(65);
    const [toggles, setToggles] = useState({ wifi: true, bluetooth: false, airplane: false, batterySaver: true, nightLight: false, project: false });
    const [dragOverIdx, setDragOverIdx] = useState(-1);
    const dragSrcIdx = useRef(-1);

    useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
    const taskbarCtxRef = useRef(null);
    const actionCenterRef = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (taskbarCtxRef.current && !taskbarCtxRef.current.contains(e.target)) {
                setContextMenu(prev => ({ ...prev, visible: false }));
            }
            if (actionCenterRef.current && !actionCenterRef.current.contains(e.target)) {
                setIsActionCenterOpen(false);
            }
        };
        window.addEventListener('pointerdown', handleClick);
        return () => window.removeEventListener('pointerdown', handleClick);
    }, []);

    const openIds = openWindows.map(w => w.id);
    const visibleIds = new Set([...pinnedApps, ...openIds]);
    const ordered = (taskbarOrder || []).filter(id => visibleIds.has(id));
    const orderedSet = new Set(ordered);
    const newItems = [...visibleIds].filter(id => !orderedSet.has(id));
    const allTaskbarIds = [...ordered, ...newItems];

    return (
        <>
            <div className="fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-300" style={{ backgroundColor: '#000', opacity: 0.65 - (brightness / 100) * 0.65 }} />
            <div className="fixed inset-0 z-[9997] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: toggles.nightLight ? 'rgba(255, 175, 80, 0.25)' : 'transparent', mixBlendMode: 'multiply' }} />
            <div data-taskbar="true" className="absolute bottom-0 left-0 w-full h-12 flex items-center justify-between px-6 z-40 transition-all duration-300" style={{ background: 'var(--os-glass)', borderTop: '1px solid var(--os-border)', boxShadow: '0 -5px 20px rgba(0,0,0,0.8)', fontFamily: 'var(--os-font)' }}>
                <div className="flex items-center h-full">
                    <button onClick={toggleMenu} className="flex items-center justify-center w-12 h-12 transition-colors" style={{ color: isMenuOpen ? 'var(--os-text)' : 'var(--os-text-secondary)', background: isMenuOpen ? 'var(--os-hover)' : 'transparent', borderTop: isMenuOpen ? '2px solid var(--os-primary)' : '2px solid transparent' }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" /></svg>
                    </button>
                    <div className="flex h-full ml-1 items-center">
                        {allTaskbarIds.map((itemId, idx) => {
                            const meta = getAppMetadata(itemId);
                            const win = openWindows.find(w => w.id === itemId);
                            const isOpen = !!win;
                            const isActive = isOpen && activeWindowId === itemId && !win?.isMinimized;
                            const isMinimized = win?.isMinimized;
                            const isPinnedItem = pinnedApps.includes(itemId);
                            const isDragOver = dragOverIdx === idx;
                            return (
                                <div key={itemId} className="relative flex items-center justify-center" draggable
                                    onDragStart={() => { dragSrcIdx.current = idx; }}
                                    onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                                    onDrop={() => { if (dragSrcIdx.current !== idx && onReorderPinned) { const reordered = [...allTaskbarIds]; const [moved] = reordered.splice(dragSrcIdx.current, 1); reordered.splice(idx, 0, moved); onReorderPinned(reordered); } dragSrcIdx.current = -1; setDragOverIdx(-1); }}
                                    onDragEnd={() => { dragSrcIdx.current = -1; setDragOverIdx(-1); }}
                                    style={{ borderLeft: isDragOver ? '2px solid var(--os-primary)' : '2px solid transparent', transition: 'border-color 0.15s' }}>
                                    <button onClick={() => isOpen ? onWindowClick(itemId) : onPinnedAppClick(itemId)}
                                        onContextMenu={(e) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY - 80, winId: itemId, isPinned: isPinnedItem, isOpen }); }}
                                        title={meta?.title || itemId}
                                        className="flex items-center justify-center w-12 h-12 transition-colors"
                                        style={{ color: isActive ? 'var(--os-text)' : isOpen ? 'var(--os-text-secondary)' : 'var(--os-text-muted)', background: isActive ? 'var(--os-hover)' : 'transparent', borderTop: isActive ? '2px solid var(--os-primary)' : '2px solid transparent', cursor: 'grab' }}>
                                        <AppIcon type={meta?.iconType} className="w-6 h-6" />
                                    </button>
                                    {isOpen && !isActive && (<div className="absolute bottom-1 w-1 h-1 rounded-full pointer-events-none" style={{ background: 'var(--os-primary)', opacity: isMinimized ? 0.4 : 0.7 }} />)}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-2 h-full text-xs font-sans tracking-tight" style={{ color: 'var(--os-text)' }}>
                    <button onClick={(e) => { e.stopPropagation(); setIsActionCenterOpen(!isActionCenterOpen); }} className="flex items-center gap-3 h-full px-3 rounded-md transition-colors" style={{ background: isActionCenterOpen ? 'var(--os-hover)' : 'transparent' }} onMouseEnter={(e) => !isActionCenterOpen && (e.currentTarget.style.background = 'var(--os-hover)')} onMouseLeave={(e) => !isActionCenterOpen && (e.currentTarget.style.background = 'transparent')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /></svg>
                    </button>
                    <div className="flex flex-col items-end justify-center px-3 h-10 rounded-md transition-colors hover:bg-black/5 cursor-default leading-tight">
                        <span className="font-semibold">{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        <span>{time.toLocaleDateString()}</span>
                    </div>
                </div>
                {isActionCenterOpen && (
                    <div ref={actionCenterRef} className="absolute right-2 bottom-14 w-[360px] rounded-xl p-4 shadow-2xl z-[500] border backdrop-blur-3xl" style={{ background: 'var(--os-menu-bg)', borderColor: 'var(--os-border)', color: 'var(--os-text)', fontFamily: 'var(--os-font)' }} onPointerDown={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { id: 'wifi', label: 'Wi-Fi', icon: <><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></> },
                                { id: 'bluetooth', label: 'Bluetooth', icon: <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" /> },
                                { id: 'airplane', label: 'Airplane mode', icon: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L2.5 8l6.4 3.9L7 14l-4.5-.5L1 15l4 2 2 4 .5-1.5-.5-4.5 2.1-1.9L16 21.5c.4.2.8-.2.6-.7z" /> },
                                { id: 'batterySaver', label: 'Energy saver', icon: <><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /><polyline points="11 9 9 13 11 13 9 17" /></> },
                                { id: 'nightLight', label: 'Night light', icon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /> },
                                { id: 'project', label: 'Project', icon: <><rect x="3" y="5" width="18" height="14" rx="2" ry="2" /><path d="m14 18-2 3-2-3" /></> }
                            ].map(t => (
                                <div key={t.id} className="flex flex-col items-center gap-1 group">
                                    <button onClick={() => setToggles({ ...toggles, [t.id]: !toggles[t.id] })} className={`w-full aspect-[2/1] rounded flex items-center justify-center transition-all ${toggles[t.id] ? 'shadow-md scale-[1.02]' : 'hover:bg-black/5'} border border-transparent`} style={{ background: toggles[t.id] ? 'var(--os-primary)' : 'rgba(128,128,128,0.1)', color: toggles[t.id] ? (theme === 'terminal' ? '#000' : '#fff') : 'var(--os-text)', borderColor: toggles[t.id] ? 'transparent' : 'var(--os-border)' }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px]">{t.icon}</svg>
                                    </button>
                                    <span className="text-[11px] font-medium tracking-tight text-center truncate w-full">{t.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-5 px-2 mb-4">
                            <div className="flex items-center gap-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] opacity-70"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                                <input type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(e.target.value)} className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" style={{ accentColor: 'var(--os-primary)' }} />
                            </div>
                            <div className="flex items-center gap-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] opacity-70"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" style={{ accentColor: 'var(--os-primary)' }} />
                            </div>
                        </div>
                        <div className="h-px w-full my-3" style={{ background: 'var(--os-border)' }} />
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2 text-xs opacity-70 font-semibold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /></svg>98%</div>
                            <button className="hover:bg-black/10 p-1.5 rounded transition-colors text-[var(--os-text)]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg></button>
                        </div>
                    </div>
                )}

                {contextMenu.visible && (
                    <div ref={taskbarCtxRef} className="fixed z-[500] rounded overflow-hidden py-1 min-w-[180px]" style={{ background: 'var(--os-ctx-bg)', border: '1px solid var(--os-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.9)', fontFamily: 'var(--os-font)', left: Math.min(contextMenu.x, window.innerWidth - 200), top: contextMenu.y }}>
                        {contextMenu.isPinned && (
                            <button className="w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors tracking-wider" style={{ color: 'var(--os-text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--os-hover)'; e.currentTarget.style.color = 'var(--os-text)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--os-text-secondary)'; }} onClick={() => { onUnpinApp(contextMenu.winId); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.143 3.004L14.857 3.004 15.857 9.004 18 11.004 18 13.004 13 13.004 13 21.004 12 22.004 11 21.004 11 13.004 6 13.004 6 11.004 8.143 9.004z" /><line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" /></svg>
                                Unpin from Taskbar
                            </button>
                        )}
                        {contextMenu.isOpen && (
                            <>
                                {contextMenu.isPinned && <div className="my-1 h-px mx-2" style={{ background: 'var(--os-border)' }} />}
                                <button className="w-full text-left px-4 py-2 text-xs flex items-center gap-3 transition-colors tracking-wider" style={{ color: '#ef4444' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--os-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => { onCloseWindow(contextMenu.winId); setContextMenu(prev => ({ ...prev, visible: false })); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    Close window
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function DraggableWindow({ id, title, isMinimized, isMaximized, isActive, zIndex, onFocus, onClose, onMinimize, onMaximize, children }) {
    const windowRef = useRef(null);
    const posRef = useRef({ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 });
    const sizeRef = useRef({ w: 500, h: 400 });
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const isResizingRef = useRef(false);
    const resizeDirRef = useRef('');
    const resizeStartRef = useRef({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 });
    const MIN_W = 320, MIN_H = 200;

    const applyTransform = () => {
        if (!windowRef.current || isMaximized) return;
        const el = windowRef.current;
        el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
        el.style.width = sizeRef.current.w + 'px';
        el.style.height = sizeRef.current.h + 'px';
    };

    const prevMinimized = useRef(isMinimized);
    const prevMaximized = useRef(isMaximized);
    const isInitialMount = useRef(true);

    useGSAP(() => {
        if (isInitialMount.current) { isInitialMount.current = false; return; }
        if (!windowRef.current) return;
        const wasMinimized = prevMinimized.current;
        prevMinimized.current = isMinimized;
        prevMaximized.current = isMaximized;
        const taskbarY = window.innerHeight - 24;
        const taskbarX = window.innerWidth / 2;
        const currentW = isMaximized ? window.innerWidth : sizeRef.current.w;
        if (isMinimized) {
            gsap.to(windowRef.current, { scale: 0, x: taskbarX - currentW / 2, y: taskbarY, autoAlpha: 0, duration: 0.3, ease: "power2.inOut", force3D: true, transformOrigin: "50% 100%" });
        } else if (wasMinimized) {
            gsap.fromTo(windowRef.current, { scale: 0, x: taskbarX - currentW / 2, y: taskbarY, autoAlpha: 0, transformOrigin: "50% 100%" }, { scale: 1, x: isMaximized ? 0 : posRef.current.x, y: isMaximized ? 0 : posRef.current.y, autoAlpha: 1, duration: 0.3, ease: "power2.inOut", force3D: true, onComplete: () => { gsap.set(windowRef.current, { clearProps: "transformOrigin" }); if (isMaximized) gsap.set(windowRef.current, { clearProps: "transform,scale,width,height" }); else applyTransform(); } });
        } else if (isMaximized) {
            gsap.set(windowRef.current, { clearProps: "transform,scale,width,height,transformOrigin" });
            gsap.to(windowRef.current, { autoAlpha: 1, duration: 0.2, force3D: true });
        } else {
            gsap.set(windowRef.current, { x: posRef.current.x, y: posRef.current.y, scale: 1 });
            gsap.to(windowRef.current, { autoAlpha: 1, duration: 0.2, force3D: true });
            applyTransform();
        }
    }, [isMinimized, isMaximized]);

    useGSAP(() => {
        gsap.fromTo(windowRef.current, { scale: 0.95, opacity: 0, x: isMaximized ? 0 : posRef.current.x, y: isMaximized ? 0 : posRef.current.y }, { scale: 1, opacity: 1, duration: 0.15, ease: "power1.out", force3D: true, onComplete: () => { if (isMaximized) gsap.set(windowRef.current, { clearProps: "transform" }); else applyTransform(); } });
    }, []);

    const handlePointerDown = (e) => { onFocus(id); if (isMaximized || isMinimized) return; isDraggingRef.current = true; dragOffsetRef.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y }; e.target.setPointerCapture(e.pointerId); };
    const handlePointerMove = (e) => { if (!isDraggingRef.current) return; posRef.current = { x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y }; if (windowRef.current) windowRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`; };
    const handlePointerUp = (e) => { isDraggingRef.current = false; try { e.target.releasePointerCapture(e.pointerId); } catch { } };

    const handleResizeDown = (dir) => (e) => { e.stopPropagation(); e.preventDefault(); if (isMaximized || isMinimized) return; onFocus(id); isResizingRef.current = true; resizeDirRef.current = dir; resizeStartRef.current = { mx: e.clientX, my: e.clientY, x: posRef.current.x, y: posRef.current.y, w: sizeRef.current.w, h: sizeRef.current.h }; e.target.setPointerCapture(e.pointerId); };
    const handleResizeMove = (e) => { if (!isResizingRef.current) return; const dx = e.clientX - resizeStartRef.current.mx, dy = e.clientY - resizeStartRef.current.my; const dir = resizeDirRef.current; let { x, y, w, h } = resizeStartRef.current; if (dir.includes('e')) w = Math.max(MIN_W, w + dx); if (dir.includes('s')) h = Math.max(MIN_H, h + dy); if (dir.includes('w')) { const newW = Math.max(MIN_W, w - dx); x = x + (w - newW); w = newW; } if (dir.includes('n')) { const newH = Math.max(MIN_H, h - dy); y = y + (h - newH); h = newH; } posRef.current = { x, y }; sizeRef.current = { w, h }; applyTransform(); };
    const handleResizeUp = (e) => { isResizingRef.current = false; try { e.target.releasePointerCapture(e.pointerId); } catch { } };

    const edgeBase = { position: 'absolute', zIndex: 2 };
    const EDGE = 5, CORNER = 10;
    const resizeHandles = isMaximized ? null : (<>
        <div style={{ ...edgeBase, top: 0, left: CORNER, right: CORNER, height: EDGE, cursor: 'n-resize' }} onPointerDown={handleResizeDown('n')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, bottom: 0, left: CORNER, right: CORNER, height: EDGE, cursor: 's-resize' }} onPointerDown={handleResizeDown('s')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, left: 0, top: CORNER, bottom: CORNER, width: EDGE, cursor: 'w-resize' }} onPointerDown={handleResizeDown('w')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, right: 0, top: CORNER, bottom: CORNER, width: EDGE, cursor: 'e-resize' }} onPointerDown={handleResizeDown('e')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, top: 0, left: 0, width: CORNER, height: CORNER, cursor: 'nw-resize' }} onPointerDown={handleResizeDown('nw')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, top: 0, right: 0, width: CORNER, height: CORNER, cursor: 'ne-resize' }} onPointerDown={handleResizeDown('ne')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, bottom: 0, left: 0, width: CORNER, height: CORNER, cursor: 'sw-resize' }} onPointerDown={handleResizeDown('sw')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
        <div style={{ ...edgeBase, bottom: 0, right: 0, width: CORNER, height: CORNER, cursor: 'se-resize' }} onPointerDown={handleResizeDown('se')} onPointerMove={handleResizeMove} onPointerUp={handleResizeUp} />
    </>);

    let windowClasses = `absolute flex flex-col overflow-hidden `;
    if (isMaximized && !isMinimized) windowClasses += `!top-0 !left-0 !w-full !h-[calc(100vh-48px)] !rounded-none `;

    return (
        <div ref={windowRef} className={windowClasses} style={{ zIndex, width: isMaximized ? undefined : sizeRef.current.w, height: isMaximized ? undefined : sizeRef.current.h, background: 'var(--os-window-bg)', border: `1px solid ${isActive ? 'var(--os-border-active)' : 'var(--os-border)'}`, borderRadius: isMaximized ? '0' : 'var(--os-radius)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'var(--os-font)', willChange: 'transform, opacity', backfaceVisibility: 'hidden' }} onPointerDown={() => onFocus(id)}>
            {resizeHandles}
            <div className="h-10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none shrink-0" style={{ background: 'var(--os-header-bg)', borderBottom: '1px solid var(--os-border)' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
                <div className="flex items-center gap-2"><h3 className="font-bold tracking-widest text-xs" style={{ color: 'var(--os-text)' }}>{title.replace('// VIEWING: ', '')}</h3></div>
                <div className="flex gap-1 h-full items-center">
                    <button onClick={onMinimize} className="w-8 h-8 flex flex-col justify-center items-center rounded transition-colors" style={{ color: 'var(--os-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--os-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><div className="w-3 h-[1px]" style={{ background: 'var(--os-text-secondary)' }} /></button>
                    <button onClick={onMaximize} className="w-8 h-8 flex justify-center items-center rounded transition-colors" style={{ color: 'var(--os-text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--os-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{isMaximized ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M4 8h12v12H4z" /><path d="M8 4h12v12" /></svg> : <div className="w-3 h-3" style={{ border: `1px solid var(--os-text-secondary)` }} />}</button>
                    <button onClick={onClose} className="w-8 h-8 flex justify-center items-center hover:bg-red-600 hover:text-white rounded transition-colors" style={{ color: 'var(--os-text-secondary)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>
            <div className={`flex-1 overflow-auto ${['settings', 'projects'].includes(id) ? '' : 'p-6'}`} style={{ background: 'var(--os-content-bg)', color: 'var(--os-content-text)', contain: 'layout style' }}>{children}</div>
        </div>
    );
}

const GRID_PAD = 12, GRID_CELL_W = 90, GRID_CELL_H = 100;

function AppIcon({ type, className = "w-full h-full drop-shadow-md" }) {
    if (type === 'folder' || type === 'projects') return (<svg viewBox="0 0 48 48" className={className}><path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z" /><path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z" /></svg>);
    if (type === 'text' || type === 'about') return (<svg viewBox="0 0 48 48" className={className}><path fill="#90CAF9" d="M40,41H8c-1.1,0-2-0.9-2-2V9c0-1.1,0.9-2,2-2h22l12,12v20C42,40.1,41.1,41,40,41z" /><path fill="#E3F2FD" d="M35.5,5v13h13L35.5,5z" /><g fill="#1565C0"><rect x="14" y="24" width="20" height="2" /><rect x="14" y="28" width="20" height="2" /><rect x="14" y="32" width="14" height="2" /></g></svg>);
    if (type === 'cert' || type === 'certificates') return (<svg viewBox="0 0 48 48" className={className}><path fill="#CE93D8" d="M40,41H8c-1.1,0-2-0.9-2-2V9c0-1.1,0.9-2,2-2h22l12,12v20C42,40.1,41.1,41,40,41z" /><path fill="#F3E5F5" d="M35.5,5v13h13L35.5,5z" /><path fill="#8E24AA" d="M24,19c3.3,0,6,2.7,6,6s-2.7,6-6,6s-6-2.7-6-6S20.7,19,24,19" /><path fill="#AB47BC" d="M29.5,31.7L24,28l-5.5,3.7V39h11V31.7z" /><circle fill="#F3E5F5" cx="24" cy="25" r="3" /></svg>);
    if (type === 'locked' || type === 'classified') return (<svg viewBox="0 0 48 48" className={className}><path fill="#546E7A" d="M40,41H8c-1.1,0-2-0.9-2-2V9c0-1.1,0.9-2,2-2h22l12,12v20C42,40.1,41.1,41,40,41z" /><path fill="#CFD8DC" d="M35.5,5v13h13L35.5,5z" /><path fill="#D32F2F" d="M24,18c-3.3,0-6,2.7-6,6v4h-2v10h16V28h-2v-4C30,20.7,27.3,18,24,18z M27,28h-6v-4c0-1.7,1.3-3,3-3s3,1.3,3,3V28z" /></svg>);
    if (type === 'settings') return (<svg viewBox="0 0 48 48" className={className}><path fill="#78909C" d="M42.2,27.3l-3.3-1.1c-0.2-1.3-0.7-2.5-1.3-3.6l1.8-2.9c0.4-0.6,0.3-1.4-0.2-1.9l-2.8-2.8c-0.5-0.5-1.3-0.6-1.9-0.2l-2.8,1.8c-1.1-0.6-2.3-1.1-3.6-1.3l-1.2-3.3C26.6,11.3,25.9,11,25,11h-4c-0.9,0-1.6,0.3-1.8,1.1l-1.2,3.3C16.8,15.6,15.6,16,14.5,16.7l-2.9-1.8c-0.6-0.4-1.4-0.3-1.9,0.2l-2.8,2.8c-0.5,0.5-0.6,1.4-0.2,1.9l1.8,2.9c-0.6,1.1-1.1,2.4-1.3-3.6L4,27.4C3.2,27.6,3,28.3,3,29.2v4c0,0.9,0.2,1.6,1,1.8l3.3,1.1c0.2,1.3,0.7,2.5,1.3,3.6l-1.8,2.9c-0.4,0.6-0.3,1.4,0.2,1.9l2.8,2.8c0.5,0.5,1.3,0.6,1.9,0.2l2.9-1.8c1.1,0.6,2.3,1.1,3.6,1.3l1.1,3.3C19.5,40.7,20.1,41,21,41h4c0.9,0,1.6-0.3,1.8-1.1l1.1-3.3c1.3-0.2,2.5-0.7,3.6-1.3l2.8,1.8c0.6,0.4,1.4,0.3,1.9-0.2l2.8-2.8c0.5-0.5,0.6-1.4,0.2-1.9l-1.8-2.9c0.6-1.1,1.1-2.4,1.3-3.6l3.3-1.1C44.8,24.6,45,23.9,45,23v-4C45,18.1,44.8,17.4,44.1,17.2z M24,30.5c-3.6,0-6.5-2.9-6.5-6.5S20.4,17.5,24,17.5s6.5,2.9,6.5,6.5S27.6,30.5,24,30.5z" /><circle fill="#CFD8DC" cx="24" cy="24" r="6.5" /></svg>);
    if (type === 'terminal') return (<svg viewBox="0 0 48 48" className={className}><rect x="4" y="8" width="40" height="32" rx="3" fill="#212121" /><path fill="#424242" d="M4 8h40v8H4z" /><circle cx="9" cy="12" r="2" fill="#FF5252" /><circle cx="15" cy="12" r="2" fill="#FFCA28" /><circle cx="21" cy="12" r="2" fill="#9CCC65" /><path fill="none" stroke="#66BB6A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M12 24l6 6-6 6" /><path fill="none" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M22 36h10" /></svg>);
    if (type === 'snake') return (<svg viewBox="0 0 48 48" className={className}><path fill="#4CAF50" d="M38 10H10C6.686 10 4 12.686 4 16v16c0 3.314 2.686 6 6 6h28c3.314 0 6-2.686 6-6V16c0-3.314-2.686-6-6-6z" /><circle cx="14" cy="24" r="5" fill="#1B5E20" /><circle cx="14" cy="19" r="2" fill="#A5D6A7" /><circle cx="14" cy="29" r="2" fill="#A5D6A7" /><circle cx="9" cy="24" r="2" fill="#A5D6A7" /><circle cx="19" cy="24" r="2" fill="#A5D6A7" /><circle cx="34" cy="24" r="6" fill="#1B5E20" /><circle cx="28" cy="20" r="2" fill="#EF5350" /><circle cx="32" cy="16" r="2" fill="#FFCA28" /><circle cx="40" cy="20" r="2" fill="#42A5F5" /><circle cx="36" cy="28" r="2" fill="#AB47BC" /></svg>);
    if (type === 'add_project') return (<svg viewBox="0 0 48 48" className={className}><path fill="#FFA000" d="M40,12H22l-4-4H8c-2.2,0-4,1.8-4,4v8h40v-4C44,13.8,42.2,12,40,12z" /><path fill="#FFCA28" d="M40,12H8c-2.2,0-4,1.8-4,4v20c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z" /><circle cx="36" cy="34" r="10" fill="#4CAF50" /><path fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M36 29v10m-5-5h10" /></svg>);
    if (type === 'skills') return (<svg viewBox="0 0 48 48" className={className}><rect x="4" y="6" width="40" height="36" rx="3" fill="#ECEFF1" /><path fill="#CFD8DC" d="M4 6h40v10H4z" /><circle cx="10" cy="11" r="2" fill="#FF5252" /><circle cx="16" cy="11" r="2" fill="#FFCA28" /><circle cx="22" cy="11" r="2" fill="#9CCC65" /><rect x="10" y="22" width="6" height="16" fill="#F44336" /><rect x="20" y="16" width="6" height="22" fill="#FFC107" /><rect x="30" y="28" width="6" height="10" fill="#4CAF50" /><path fill="none" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 32l8-12 10 4 12-14" /></svg>);
    return (<svg viewBox="0 0 48 48" className={className}><rect x="6" y="6" width="36" height="36" rx="6" fill="#607D8B" /><path stroke="#ECEFF1" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M12 24h24 M24 12v24" /></svg>);
}

function DesktopIcon({ iconType, label, onOpen, position, onDragEnd, onRename, onDelete, onPinToggle, isPinned, size = 'medium' }) {
    const iconRef = useRef(null);
    const renameRef = useRef(null);
    const dragState = useRef({ isDragging: false, startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });
    const [dragging, setDragging] = useState(false);
    const [dragPos, setDragPos] = useState({ x: position.x, y: position.y });
    const [ctxMenu, setCtxMenu] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(label);

    useEffect(() => { if (!dragging) setDragPos({ x: position.x, y: position.y }); }, [position.x, position.y, dragging]);
    useEffect(() => { if (isRenaming && renameRef.current) { renameRef.current.focus(); renameRef.current.select(); } }, [isRenaming]);
    useEffect(() => { if (!ctxMenu) return; const close = () => setCtxMenu(null); window.addEventListener('click', close); return () => window.removeEventListener('click', close); }, [ctxMenu]);

    const handlePointerDown = (e) => { if (isRenaming) return; e.preventDefault(); e.stopPropagation(); iconRef.current?.setPointerCapture(e.pointerId); dragState.current = { isDragging: true, startX: e.clientX, startY: e.clientY, origX: dragPos.x, origY: dragPos.y, hasMoved: false }; setDragging(true); };
    const handlePointerMove = (e) => { if (!dragState.current.isDragging) return; const dx = e.clientX - dragState.current.startX, dy = e.clientY - dragState.current.startY; if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.current.hasMoved = true; setDragPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy }); };
    const handlePointerUp = (e) => { if (!dragState.current.isDragging) return; iconRef.current?.releasePointerCapture(e.pointerId); dragState.current.isDragging = false; setDragging(false); if (dragState.current.hasMoved) { const col = Math.round((dragPos.x - GRID_PAD) / GRID_CELL_W), row = Math.round((dragPos.y - GRID_PAD) / GRID_CELL_H); const maxCols = Math.floor((window.innerWidth - GRID_PAD * 2) / GRID_CELL_W) - 1, maxRows = Math.floor((window.innerHeight - 48 - GRID_PAD * 2) / GRID_CELL_H) - 1; const clampedCol = Math.max(0, Math.min(col, maxCols)), clampedRow = Math.max(0, Math.min(row, maxRows)); const finalX = GRID_PAD + clampedCol * GRID_CELL_W, finalY = GRID_PAD + clampedRow * GRID_CELL_H; setDragPos({ x: finalX, y: finalY }); onDragEnd({ x: finalX, y: finalY }); } };
    const handleDoubleClick = (e) => { e.stopPropagation(); if (!dragState.current.hasMoved && !isRenaming) onOpen(); };
    const handleContextMenu = (e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); };
    const handleRenameSubmit = () => { const trimmed = renameValue.trim(); if (trimmed && trimmed !== label) onRename(trimmed); else setRenameValue(label); setIsRenaming(false); };

    const ctxMenuItems = [
        { label: 'Open', icon: 'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25', action: () => { setCtxMenu(null); onOpen(); } },
        { label: 'Rename', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z', action: () => { setCtxMenu(null); setRenameValue(label); setIsRenaming(true); } },
        { label: isPinned ? 'Unpin from Taskbar' : 'Pin to Taskbar', icon: 'M9.143 3.004L14.857 3.004 15.857 9.004 18 11.004 18 13.004 13 13.004 13 21.004 12 22.004 11 21.004 11 13.004 6 13.004 6 11.004 8.143 9.004z', iconExtra: isPinned ? 'M4 4L20 20' : null, action: () => { setCtxMenu(null); onPinToggle(); } },
        { type: 'divider' },
        { label: 'Delete', icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0', action: () => { setCtxMenu(null); onDelete(); }, danger: true },
    ];

    return (
        <>
            <div ref={iconRef} className="absolute flex flex-col items-center pt-2 gap-1 cursor-pointer group w-[90px] rounded-sm select-none touch-none transition-colors" style={{ left: dragPos.x, top: dragPos.y, zIndex: dragging ? 100 : ctxMenu ? 99 : 5, opacity: dragging ? 0.8 : 1, transition: dragging ? 'none' : 'left 0.2s ease, top 0.2s ease, background 0.1s ease' }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--os-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <div className={`flex items-center justify-center transition-transform group-active:scale-95 drop-shadow-md ${size === 'large' ? 'w-16 h-16' : size === 'small' ? 'w-8 h-8' : 'w-12 h-12'}`}><AppIcon type={iconType} /></div>
                {isRenaming ? (
                    <input ref={renameRef} value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={handleRenameSubmit} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') { setRenameValue(label); setIsRenaming(false); } }} onPointerDown={(e) => e.stopPropagation()} className="text-[10px] tracking-widest text-center leading-tight px-1 rounded w-full outline-none" style={{ color: 'var(--os-text)', background: 'var(--os-content-bg)', border: '1px solid var(--os-primary)' }} />
                ) : (
                    <span className="text-[10px] tracking-widest text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,1)] px-1 rounded" style={{ color: 'var(--os-icon-text)' }}>{label}</span>
                )}
            </div>
            {ctxMenu && (
                <div className="fixed z-[500] rounded overflow-hidden py-1 min-w-[180px]" style={{ left: ctxMenu.x, top: ctxMenu.y, background: 'var(--os-ctx-bg)', border: '1px solid var(--os-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.9)', fontFamily: 'var(--os-font)' }} onClick={(e) => e.stopPropagation()}>
                    {ctxMenuItems.map((item, i) => item.type === 'divider' ? <div key={i} className="my-1 h-px" style={{ background: 'var(--os-border)' }} /> : (
                        <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-2 text-left text-xs tracking-wider transition-colors" style={{ color: item.danger ? '#ef4444' : 'var(--os-text-secondary)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--os-hover)'; if (!item.danger) e.currentTarget.style.color = 'var(--os-text)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = item.danger ? '#ef4444' : 'var(--os-text-secondary)'; }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />{item.iconExtra && <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" strokeLinecap="round" />}</svg>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

function SystemSpecsApp() {
    const isMobile = useIsMobile();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [booted, setBooted] = useState(false);
    const [tick, setTick] = useState(0);
    const [health, setHealth] = useState([
        { label: 'CPU', pct: 23, color: 'var(--os-primary)' },
        { label: 'RAM', pct: 61, color: '#00b8a3' },
        { label: 'NET', pct: 88, color: '#a78bfa' },
        { label: 'GPU', pct: 44, color: '#ffc01e' },
    ]);
    const [counters, setCounters] = useState({ total: 0, easy: 0, medium: 0, hard: 0, rank: 0 });

    useEffect(() => {
        const t = setTimeout(() => setBooted(true), 120);
        const iv = setInterval(() => { setTick(n => n + 1); setHealth(prev => prev.map(h => { const change = Math.floor(Math.random() * 15) - 7; let newPct = h.pct + change; if (newPct > 96) newPct = 85 - Math.random() * 5; if (newPct < 15) newPct = 25 + Math.random() * 5; return { ...h, pct: Math.round(newPct) }; })); }, 1200);
        return () => { clearTimeout(t); clearInterval(iv); };
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try { const res = await fetch('https://leetcode-api-faisalshohag.vercel.app/VRA8ckiHwJ'); const data = await res.json(); if (data.totalQuestions) setStats(data); else setError('Failed to load LeetCode data.'); } catch { setError('Network error loading stats.'); } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        if (!stats) return;
        const targets = { total: stats.totalSolved, easy: stats.easySolved, medium: stats.mediumSolved, hard: stats.hardSolved, rank: stats.ranking };
        const duration = 1400, start = performance.now();
        const animate = (now) => { const p = Math.min((now - start) / duration, 1), e = 1 - Math.pow(1 - p, 3); setCounters({ total: Math.round(e * targets.total), easy: Math.round(e * targets.easy), medium: Math.round(e * targets.medium), hard: Math.round(e * targets.hard), rank: Math.round(e * targets.rank) }); if (p < 1) requestAnimationFrame(animate); };
        requestAnimationFrame(animate);
    }, [stats]);

    const P = 'var(--os-primary)';
    const textBorder = 'color-mix(in srgb, var(--os-text) 12%, transparent)';
    const textMuted = 'color-mix(in srgb, var(--os-text) 50%, transparent)';
    const bgPanel = 'color-mix(in srgb, var(--os-text) 3%, transparent)';

    const Ring = ({ value, max, color, size = 64, stroke = 5 }) => { const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r, pct = max > 0 ? value / max : 0; return (<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={textBorder} strokeWidth={stroke} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.2,0.8,0.2,1)', filter: `drop-shadow(0 0 4px ${color})` }} /></svg>); };
    const SpecRow = ({ label, value, delay = 0 }) => (<div style={{ display: 'flex', flexDirection: 'column', gap: 5, opacity: booted ? 1 : 0, transform: booted ? 'translateX(0)' : 'translateX(-10px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, padding: '10px 14px', background: 'color-mix(in srgb, var(--os-text) 5%, transparent)', borderRadius: '8px', border: `1px solid ${textBorder}` }} className="hover:scale-[1.02] transition-all cursor-default shadow-sm"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 9, letterSpacing: '0.15em', color: textMuted, textTransform: 'uppercase' }}>{label}</span><span style={{ fontSize: 11, color: P, letterSpacing: '0.05em', fontWeight: 'bold' }}>{value}</span></div></div>);
    const DiffCell = ({ label, solved, total, acSub, totalSub, color }) => { const accRate = totalSub ? ((acSub / totalSub) * 100).toFixed(1) : 0; return (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: isMobile ? '12px 8px' : '16px 12px', background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, borderRadius: '12px', flex: 1, position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }} className="group hover:scale-[1.04]"><div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 100%, color-mix(in srgb, ${color} 15%, transparent), transparent 70%)` }} /><div className="relative w-[56px] h-[56px] flex items-center justify-center"><div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-50 pointer-events-none"><Ring value={solved} max={total} color={color} size={56} stroke={4} /><div className="absolute inset-0 flex flex-col items-center justify-center pt-1"><div style={{ fontSize: 18, fontWeight: 'bold', lineHeight: 1, color, filter: `drop-shadow(0 0 6px color-mix(in srgb, ${color} 60%, transparent))` }}>{solved}</div></div></div><div className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 opacity-0 scale-150 group-hover:opacity-100 group-hover:scale-100 pointer-events-none"><div style={{ fontSize: 8, color: textMuted, letterSpacing: '0.1em', marginBottom: 2 }}>ACC. RATE</div><div style={{ fontSize: 15, fontWeight: 'bold', color, filter: `drop-shadow(0 0 6px color-mix(in srgb, ${color} 60%, transparent))` }}>{accRate}%</div></div></div><div style={{ fontSize: 9, color: textMuted, letterSpacing: '0.1em' }} className="transition-opacity duration-300 group-hover:opacity-0">/{total}</div><div style={{ fontSize: 10, letterSpacing: '0.15em', color, opacity: 0.9, textTransform: 'uppercase', fontWeight: 'bold', marginTop: 'auto', zIndex: 10 }}>{label}</div></div>); };
    const MetricTile = ({ label, value, sub, color, delay = 0 }) => (<div style={{ padding: isMobile ? '14px 16px' : '18px 24px', borderRadius: '12px', background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, position: 'relative', overflow: 'hidden', opacity: booted ? 1 : 0, transform: booted ? 'translateY(0)' : 'translateY(12px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="hover:-translate-y-1 cursor-default transition-all duration-300"><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: 0.8 }} /><div style={{ fontSize: 10, letterSpacing: '0.15em', color: textMuted, textTransform: 'uppercase', marginBottom: 10, fontWeight: 'bold' }}>{label}</div><div style={{ fontSize: isMobile ? 26 : 34, fontWeight: 'bold', lineHeight: 1, color, filter: `drop-shadow(0 0 8px color-mix(in srgb, ${color} 50%, transparent))` }}>{value}</div>{sub && <div style={{ fontSize: 10, color: textMuted, marginTop: 8, letterSpacing: '0.05em' }}>{sub}</div>}</div>);
    const SPEC_ROWS = [{ label: 'EDITION', value: 'OS 11 NEURAL', delay: 60 }, { label: 'PROCESSOR', value: 'V8 ENGINE // GSAP', delay: 120 }, { label: 'MEMORY', value: 'QUANTUM DRIVE', delay: 180 }, { label: 'SYSTEM TYPE', value: '64-BIT HYBRID', delay: 240 }, { label: 'BUILD', value: 'REACT 18 // TW', delay: 300 }, { label: 'RENDERER', value: 'THREE.JS', delay: 360 }, { label: 'NETWORK', value: 'GIGABIT SECURE', delay: 420 }, { label: 'SECURITY', value: 'AES-256 VAULT', delay: 480 }];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'var(--os-text)', fontFamily: '"Share Tech Mono", monospace', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${textBorder} 1px,transparent 1px),linear-gradient(90deg,${textBorder} 1px,transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.4 }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${textBorder}`, background: `color-mix(in srgb, var(--os-bg) 70%, transparent)`, flexShrink: 0, position: 'relative', zIndex: 1, backdropFilter: 'blur(12px)', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.25em', color: P, fontWeight: 'bold' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: P, display: 'inline-block', boxShadow: `0 0 10px ${P}`, animation: 'specPulse 2s ease infinite' }} />DIAGNOSTIC TERMINAL</div>
                <div style={{ display: 'flex', gap: isMobile ? 12 : 24, fontSize: 10, color: textMuted, letterSpacing: '0.15em', fontWeight: 'bold' }}><span>UPTIME: {String(Math.floor(tick / 3600)).padStart(2, '0')}:{String(Math.floor((tick % 3600) / 60)).padStart(2, '0')}:{String(tick % 60).padStart(2, '0')}</span><span>STATE: <span style={{ color: '#10b981' }}>ONLINE</span></span></div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '16px' : '28px', position: 'relative', zIndex: 1 }} className="spec-scroll">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 40, alignItems: 'start', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: isMobile ? '16px' : '24px', background: bgPanel, border: `1px solid ${textBorder}`, borderRadius: '16px', opacity: booted ? 1 : 0, transition: 'opacity 0.6s ease', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)' }} className="hover:shadow-[0_8px_30px_color-mix(in_srgb,var(--os-primary)_10%,transparent)] hover:border-[var(--os-primary)] transition-all duration-500">
                            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at left, color-mix(in srgb, var(--os-primary) 12%, transparent), transparent 70%)`, pointerEvents: 'none' }} />
                            <div style={{ width: 48, height: 48, borderRadius: '14px', background: `color-mix(in srgb, var(--os-primary) 15%, transparent)`, border: `1px solid color-mix(in srgb, var(--os-primary) 40%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--os-primary)" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg></div>
                            <div><div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 'bold', letterSpacing: '0.15em', lineHeight: 1 }}>SYS<span style={{ color: P }}>OS</span> 11</div><div style={{ fontSize: 10, color: textMuted, letterSpacing: '0.15em', marginTop: 6, fontWeight: 'bold' }}>NEURAL EDITION · BUILD 2026</div></div>
                        </div>
                        <div style={{ padding: isMobile ? '16px' : '24px', background: bgPanel, borderRadius: '16px', border: `1px solid ${textBorder}`, display: 'flex', flexDirection: 'column', gap: 14, backdropFilter: 'blur(8px)' }}>
                            <div style={{ fontSize: 10, letterSpacing: '0.25em', color: textMuted, fontWeight: 'bold' }}>SYSTEM HEALTH</div>
                            {health.map((h, i) => (<div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: booted ? 1 : 0, transition: `opacity 0.5s ease ${500 + i * 80}ms` }}><span style={{ fontSize: 10, letterSpacing: '0.15em', color: textMuted, width: 36, fontWeight: 'bold' }}>{h.label}</span><div style={{ flex: 1, height: 6, background: textBorder, borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: booted ? `${h.pct}%` : '0%', background: h.color, borderRadius: 3, transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1)`, boxShadow: `0 0 10px color-mix(in srgb, ${h.color} 70%, transparent)` }} /></div><span style={{ fontSize: 11, color: h.color, width: 44, textAlign: 'right', fontWeight: 'bold' }}>{h.pct}%</span></div>))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{SPEC_ROWS.map(r => <SpecRow key={r.label} {...r} />)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${P}, transparent)`, opacity: 0.6 }} /><span style={{ fontSize: 12, letterSpacing: '0.25em', color: P, fontWeight: 'bold' }}>LEETCODE_NEXUS</span><div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${P})`, opacity: 0.6 }} /></div>
                        {loading && (<div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, background: bgPanel, borderRadius: '16px', border: `1px solid ${textBorder}`, backdropFilter: 'blur(8px)' }}><div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid color-mix(in srgb, ${P} 15%, transparent)`, borderTop: `3px solid ${P}`, animation: 'specSpin 0.9s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite' }} /><span style={{ fontSize: 11, letterSpacing: '0.25em', color: textMuted, fontWeight: 'bold', animation: 'specPulse 1.5s infinite alternate' }}>ESTABLISHING CONNECTION...</span></div>)}
                        {error && <div style={{ padding: '24px', background: 'color-mix(in srgb, #ef4444 8%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 25%, transparent)', borderRadius: '16px', fontSize: 12, color: '#ef4444', letterSpacing: '0.1em', fontWeight: 'bold' }}>[ ERR ] {error}</div>}
                        {stats && !loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 20 }}><MetricTile label="GLOBAL RANK" value={`#${counters.rank.toLocaleString()}`} sub="worldwide" color={P} delay={100} /><MetricTile label="TOTAL SOLVED" value={counters.total} sub={`of ${stats.totalQuestions}`} color="#60a5fa" delay={180} /></div>
                                <div style={{ padding: isMobile ? '16px' : '24px', background: bgPanel, border: `1px solid ${textBorder}`, borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 16, backdropFilter: 'blur(8px)' }}>
                                    <div style={{ fontSize: 11, letterSpacing: '0.25em', color: textMuted, fontWeight: 'bold' }}>DIFFICULTY BREAKDOWN</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? 8 : 16 }}>
                                        <DiffCell label="EASY" solved={counters.easy} total={stats.totalEasy} acSub={stats.matchedUserStats?.acSubmissionNum?.find(s => s.difficulty === 'Easy')?.submissions || 0} totalSub={stats.matchedUserStats?.totalSubmissionNum?.find(s => s.difficulty === 'Easy')?.submissions || 0} color="#00b8a3" />
                                        <DiffCell label="MED" solved={counters.medium} total={stats.totalMedium} acSub={stats.matchedUserStats?.acSubmissionNum?.find(s => s.difficulty === 'Medium')?.submissions || 0} totalSub={stats.matchedUserStats?.totalSubmissionNum?.find(s => s.difficulty === 'Medium')?.submissions || 0} color="#ffc01e" />
                                        <DiffCell label="HARD" solved={counters.hard} total={stats.totalHard} acSub={stats.matchedUserStats?.acSubmissionNum?.find(s => s.difficulty === 'Hard')?.submissions || 0} totalSub={stats.matchedUserStats?.totalSubmissionNum?.find(s => s.difficulty === 'Hard')?.submissions || 0} color="#ef4743" />
                                    </div>
                                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>{[{ v: stats.easySolved, t: stats.totalSolved, c: '#00b8a3' }, { v: stats.mediumSolved, t: stats.totalSolved, c: '#ffc01e' }, { v: stats.hardSolved, t: stats.totalSolved, c: '#ef4743' }].map(({ v, t, c }, i) => (<div key={i} style={{ height: '100%', width: `${(v / t) * 100}%`, background: c, transition: 'width 1.5s cubic-bezier(0.2,0.8,0.2,1) 0.5s', boxShadow: `0 0 10px color-mix(in srgb, ${c} 70%, transparent)` }} />))}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 20 }}>
                                    <div style={{ padding: '16px', background: bgPanel, border: `1px solid ${textBorder}`, borderRadius: '16px', backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }} className="hover:scale-[1.03] hover:border-[var(--os-primary)]"><div style={{ fontSize: 10, color: textMuted, letterSpacing: '0.2em', marginBottom: 8, fontWeight: 'bold' }}>ACCEPTANCE RATE</div><div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: P }}>{stats.totalSubmissions?.[0]?.submissions ? ((stats.totalSolved / stats.totalSubmissions[0].submissions) * 100).toFixed(1) : '—'}%</div></div>
                                    <div style={{ padding: '16px', background: bgPanel, border: `1px solid ${textBorder}`, borderRadius: '16px', textAlign: 'right', backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }} className="hover:scale-[1.03] hover:border-[#a78bfa]"><div style={{ fontSize: 10, color: textMuted, letterSpacing: '0.2em', marginBottom: 8, fontWeight: 'bold' }}>CONTRIBUTION</div><div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 'bold', color: '#a78bfa' }}>{stats.contributionPoint} pts</div></div>
                                </div>
                                <a href="https://leetcode.com/u/VRA8ckiHwJ/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px', borderRadius: '12px', border: `1px solid color-mix(in srgb, ${P} 35%, transparent)`, background: `color-mix(in srgb, ${P} 10%, transparent)`, color: P, fontSize: 12, letterSpacing: '0.25em', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.3s ease' }} className="hover:-translate-y-1 active:scale-95 focus:outline-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                    ACCESS FULL PROFILE
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
                @keyframes specPulse { 0%,100%{box-shadow:0 0 6px var(--os-primary), 0 0 12px var(--os-primary)} 50%{box-shadow:0 0 15px var(--os-primary), 0 0 30px var(--os-primary); filter:brightness(1.5);} }
                @keyframes specSpin { to{transform:rotate(360deg)} }
                .spec-scroll::-webkit-scrollbar { width: 6px; }
                .spec-scroll::-webkit-scrollbar-track { background: transparent; }
                .spec-scroll::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--os-text) 12%, transparent); border-radius: 6px; }
            `}</style>
        </div>
    );
}

function StartMenu({ isOpen, onClose, onLaunchApp, onLogout, hiddenIcons = [], onRestoreIcon, desktopFiles = [], renamedLabels = {} }) {
    const menuRef = useRef(null);
    const [search, setSearch] = useState('');
    const apps = SYSTEM_APPS;
    const removedDesktopItems = desktopFiles.filter(f => hiddenIcons.includes(f.id));
    const filteredApps = apps.filter(app => app.label.toLowerCase().includes(search.toLowerCase()));

    useGSAP(() => {
        if (isOpen) { gsap.fromTo(menuRef.current, { y: 30, opacity: 0, scale: 0.95, pointerEvents: 'none' }, { y: 0, opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.2, ease: 'power3.out' }); }
        else { gsap.to(menuRef.current, { y: 30, opacity: 0, scale: 0.95, pointerEvents: 'none', duration: 0.15, ease: 'power3.in' }); }
    }, [isOpen]);

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40" onPointerDown={onClose} />}
            <div ref={menuRef} className="absolute bottom-12 left-4 z-50 flex flex-col overflow-hidden backdrop-blur-3xl shadow-2xl" style={{ width: '420px', height: '580px', background: 'var(--os-menu-bg)', border: '1px solid var(--os-border)', borderRadius: '12px', fontFamily: 'var(--os-font)' }}>
                <div className="p-6 pb-2">
                    <div className="relative">
                        <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--os-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Type here to search" value={search} onChange={e => setSearch(e.target.value)} className="w-full border py-2.5 pl-11 pr-4 text-sm outline-none transition-colors rounded-full" style={{ color: 'var(--os-text)', background: 'color-mix(in srgb, var(--os-bg) 40%, transparent)', borderColor: 'var(--os-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--os-primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--os-border)'} />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--os-border) transparent' }}>
                    <div className="flex items-center justify-between mb-4"><h4 className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--os-text)' }}>Pinned</h4><button className="text-[11px] px-2 py-1 rounded transition-colors" style={{ color: 'var(--os-text-secondary)', background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>All apps {'>'}</button></div>
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2 mb-8">
                        {filteredApps.map(app => (
                            <button key={app.id} onClick={() => onLaunchApp(app.id)} className="flex flex-col items-center gap-2 rounded-lg p-2 transition-all group" onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 5%, transparent)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105" style={{ background: 'transparent', borderColor: 'color-mix(in srgb, var(--os-text) 10%, transparent)', color: 'var(--os-primary)' }}><AppIcon type={app.iconType} className="w-8 h-8 drop-shadow-sm" /></div>
                                <span className="text-[11px] truncate w-full text-center" style={{ color: 'var(--os-text)' }}>{app.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mb-4 mt-2"><h4 className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--os-text)' }}>Recommended</h4><button className="text-[11px] px-2 py-1 rounded transition-colors" style={{ color: 'var(--os-text-secondary)', background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}>More {'>'}</button></div>
                    {removedDesktopItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {removedDesktopItems.map(file => (
                                <button key={file.id} onClick={() => onRestoreIcon(file.id)} className="flex items-center gap-3 p-2 rounded-lg transition-all text-left" onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 5%, transparent)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--os-text) 5%, transparent)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" style={{ color: 'var(--os-primary)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></div>
                                    <div className="flex flex-col overflow-hidden"><span className="text-[12px] truncate" style={{ color: 'var(--os-text)' }}>{renamedLabels[file.id] || file.label}</span><span className="text-[10px] truncate" style={{ color: 'var(--os-text-muted)' }}>Restore to desktop</span></div>
                                </button>
                            ))}
                        </div>
                    ) : (<div className="text-center py-6 text-[12px]" style={{ color: 'var(--os-text-muted)' }}>No recommended items at this time.</div>)}
                </div>
                <div className="px-6 py-4 flex items-center justify-between border-t" style={{ background: 'color-mix(in srgb, var(--os-bg) 20%, transparent)', borderColor: 'var(--os-border)' }}>
                    <div className="flex items-center gap-3 p-1.5 rounded-lg cursor-pointer transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 5%, transparent)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-600 text-white shadow-sm overflow-hidden border" style={{ borderColor: 'var(--os-border)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div>
                        <span className="text-[12px] font-medium" style={{ color: 'var(--os-text)' }}>A_SHARMA</span>
                    </div>
                    <button onClick={onLogout} title="Power Off" className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--os-text)' }} onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--os-text) 10%, transparent)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--os-text)'; }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
}

const OS_THEMES = [
    { id: 'terminal', name: 'Terminal', desc: 'Hacker style', color: '#ffaa44', bg: '#0c0c0b' },
    { id: 'windows-dark', name: 'Win Dark', desc: 'Dark mode', color: '#60cdff', bg: '#1a1a2e' },
    { id: 'windows-light', name: 'Win Light', desc: 'Light mode', color: '#0078d4', bg: '#f3f3f3' },
    { id: 'mac-dark', name: 'macOS Dark', desc: 'Dark mode', color: '#007aff', bg: '#1e1e1e' },
    { id: 'mac-light', name: 'macOS Light', desc: 'Light mode', color: '#007aff', bg: '#ececec' },
    { id: 'kali', name: 'Kali Linux', desc: 'Pen testing', color: '#367bf5', bg: '#1a1a2e' },
];
const WALLPAPERS = [
    { id: 'default', name: 'Terminal Base', url: null },
    { id: 'cyber', name: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=1920&q=80' },
    { id: 'matrix', name: 'The Grid', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&h=1080&fit=crop' },
    { id: 'synth', name: 'Synthwave', url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1920&h=1080&fit=crop' }
];

const SettingsApp = ({ currentWallpaper, onApplyWallpaper, osTheme, onSetTheme }) => {
    const isMobile = useIsMobile();
    const [previewWallpaper, setPreviewWallpaper] = useState(currentWallpaper);
    const [customUploads, setCustomUploads] = useState(() => { const saved = localStorage.getItem('systemos_custom_wallpapers'); return saved ? JSON.parse(saved) : []; });
    const [activeTab, setActiveTab] = useState('themes');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas'); let width = img.width, height = img.height; const maxDim = 1920;
                    if (width > height && width > maxDim) { height *= maxDim / width; width = maxDim; } else if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                    canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    const compressedB64 = canvas.toDataURL('image/jpeg', 0.7);
                    setPreviewWallpaper(compressedB64);
                    setCustomUploads(prev => { const next = [compressedB64, ...prev.filter(url => url !== compressedB64)].slice(0, 4); try { localStorage.setItem('systemos_custom_wallpapers', JSON.stringify(next)); } catch (e) { } return next; });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteCustomUpload = (e, urlToDelete) => { e.stopPropagation(); setCustomUploads(prev => { const next = prev.filter(url => url !== urlToDelete); localStorage.setItem('systemos_custom_wallpapers', JSON.stringify(next)); return next; }); if (previewWallpaper === urlToDelete) setPreviewWallpaper(currentWallpaper); };

    const sidebarItems = [
        { id: 'themes', label: 'Themes', icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' },
        { id: 'background', label: 'Background', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 013 3z' },
    ];

    return (
        <div className="flex h-full" style={{ fontFamily: 'var(--os-font)', color: 'var(--os-text)', flexDirection: isMobile ? 'column' : 'row' }}>
            <div className={isMobile ? 'flex flex-row border-b shrink-0 overflow-x-auto' : 'w-48 shrink-0 flex flex-col py-4 overflow-y-auto'} style={{ borderColor: 'var(--os-border)', background: 'var(--os-header-bg)', ...(isMobile ? {} : { borderRight: '1px solid var(--os-border)' }) }}>
                {!isMobile && <h3 className="font-bold text-sm tracking-[0.15em] px-4 mb-4" style={{ color: 'var(--os-text)' }}>SETTINGS</h3>}
                {sidebarItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 text-left text-xs tracking-wider transition-all ${isMobile ? 'px-5 py-3 border-b-2 shrink-0' : 'px-4 py-3 border-l-4'}`} style={{ color: activeTab === item.id ? 'var(--os-primary)' : 'var(--os-text-secondary)', background: activeTab === item.id ? 'var(--os-hover)' : 'transparent', ...(isMobile ? { borderBottomColor: activeTab === item.id ? 'var(--os-primary)' : 'transparent' } : { borderLeftColor: activeTab === item.id ? 'var(--os-primary)' : 'transparent' }), fontWeight: activeTab === item.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                        {item.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'themes' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--os-border)' }}><h3 className="font-bold text-base tracking-[0.15em]">OS Theme</h3></div>
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto'}`}>
                                {OS_THEMES.map(t => {
                                    const isActive = osTheme === t.id; return (
                                        <button key={t.id} onClick={() => onSetTheme(t.id)} className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all active:scale-95" style={{ background: isActive ? `${t.color}18` : 'transparent', border: isActive ? `2px solid ${t.color}` : '2px solid var(--os-border)', boxShadow: isActive ? `0 0 25px ${t.color}30` : 'none', transform: isActive ? 'scale(1.03)' : 'scale(1)' }}>
                                            <div className="w-full aspect-video rounded overflow-hidden relative" style={{ background: t.bg, border: `1px solid ${t.color}30` }}><div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: t.color + '30' }} /><div className="absolute top-2 left-2 w-4 h-3 rounded-sm" style={{ background: t.color + '50', border: `1px solid ${t.color}40` }} /><div className="absolute top-2 right-2 w-3 h-3 rounded-full" style={{ background: t.color + '40' }} /></div>
                                            <span className="text-[10px] font-bold tracking-wider" style={{ color: isActive ? t.color : 'var(--os-text)' }}>{t.name}</span>
                                            {!isMobile && <span className="text-[9px] tracking-wider" style={{ color: 'var(--os-text-muted)' }}>{t.desc}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'background' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0" style={{ borderBottom: '1px solid var(--os-border)' }}>
                            <h3 className="font-bold text-base tracking-[0.15em]">Background</h3>
                            <button onClick={() => onApplyWallpaper(previewWallpaper)} className="px-4 py-1.5 active:scale-95 transition-all rounded text-xs uppercase tracking-widest" style={{ border: '1px solid var(--os-primary)', background: 'var(--os-hover)', color: 'var(--os-primary)' }}>Apply</button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="w-full max-w-2xl mx-auto mb-6 rounded-lg p-3" style={{ background: 'var(--os-header-bg)', border: '1px solid var(--os-border)' }}>
                                <p className="text-xs mb-3 uppercase tracking-widest pb-2 flex justify-between" style={{ color: 'var(--os-text-secondary)', borderBottom: '1px solid var(--os-border)' }}><span>Preview</span><span style={{ color: 'var(--os-text-muted)' }}>{previewWallpaper ? 'CUSTOM' : 'DEFAULT'}</span></p>
                                <div className="relative w-full rounded overflow-hidden shadow-inner" style={{ aspectRatio: '16/9', border: '1px solid var(--os-border)', background: 'var(--os-bg)' }}>
                                    {previewWallpaper ? <img src={previewWallpaper} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: `radial-gradient(circle at center, rgba(var(--os-primary-rgb), 0.2) 0%, transparent 70%)` }} />}
                                    <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center px-1" style={{ background: 'var(--os-glass)', borderTop: '1px solid var(--os-border)' }}><div className="w-3 h-3" style={{ background: 'var(--os-primary)', opacity: 0.8 }} /></div>
                                </div>
                            </div>
                            <p className="text-xs mb-3 uppercase tracking-widest" style={{ color: 'var(--os-text-muted)' }}>Select Background</p>
                            <div className={`grid gap-3 ${isMobile ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto'}`}>
                                <label className="flex flex-col gap-2 cursor-pointer group transition-all">
                                    <div className="aspect-video w-full rounded border-2 border-dashed flex flex-col items-center justify-center relative transition-colors" style={{ borderColor: 'var(--os-border)', background: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--os-primary)'; e.currentTarget.style.background = 'var(--os-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--os-border)'; e.currentTarget.style.background = 'transparent'; }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" style={{ color: 'var(--os-text-muted)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        {!isMobile && <span className="text-[9px] tracking-[0.2em] text-center mt-1" style={{ color: 'var(--os-text-muted)' }}>UPLOAD</span>}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </div>
                                    <span className="text-[9px] uppercase tracking-widest text-center" style={{ color: 'var(--os-text-secondary)' }}>{isMobile ? 'Upload' : 'Local Upload'}</span>
                                </label>
                                {customUploads.map((customUrl, index) => {
                                    const isSelected = previewWallpaper === customUrl; return (
                                        <div key={`custom-${index}`} onClick={() => setPreviewWallpaper(customUrl)} className="flex flex-col gap-2 cursor-pointer group transition-all">
                                            <div className="aspect-video w-full rounded border-2 transition-all overflow-hidden relative" style={{ borderColor: isSelected ? 'var(--os-primary)' : 'var(--os-border)', transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}>
                                                <img src={customUrl} alt="Custom" className="w-full h-full object-cover" />
                                                <button onClick={(e) => handleDeleteCustomUpload(e, customUrl)} className="absolute top-1 right-1 p-1 bg-black/60 border border-red-500/50 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                            <span className="text-[9px] uppercase tracking-widest text-center" style={{ color: isSelected ? 'var(--os-primary)' : 'var(--os-text-secondary)' }}>Upload_{index + 1}</span>
                                        </div>
                                    );
                                })}
                                {WALLPAPERS.map(wp => {
                                    const isSelected = previewWallpaper === wp.url; return (
                                        <div key={wp.id} onClick={() => setPreviewWallpaper(wp.url)} className="flex flex-col gap-2 cursor-pointer group transition-all">
                                            <div className="aspect-video w-full rounded border-2 transition-all overflow-hidden relative" style={{ borderColor: isSelected ? 'var(--os-primary)' : 'var(--os-border)', transform: isSelected ? 'scale(1.02)' : 'scale(1)' }}>
                                                {wp.url ? <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ background: `radial-gradient(circle at center, rgba(var(--os-primary-rgb), 0.2) 0%, transparent 70%)` }} />}
                                            </div>
                                            <span className="text-[9px] uppercase tracking-widest text-center" style={{ color: isSelected ? 'var(--os-primary)' : 'var(--os-text-secondary)' }}>{wp.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SYSTEM_APPS = [
    { id: 'snake', label: 'Snake Game', iconType: 'snake' },
    { id: 'terminal', label: 'System Terminal', iconType: 'terminal' },
    { id: 'add_project', label: 'Add Project', iconType: 'add_project' },
    { id: 'projects', label: 'View Project', iconType: 'projects' },
    { id: 'settings', label: 'Settings', iconType: 'settings' },
    { id: 'skills', label: 'System Specs', iconType: 'skills' }
];

export default function SystemOS({ onLogout }) {
    const isMobile = useIsMobile();
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    const [openWindows, setOpenWindows] = useState(() => { try { return JSON.parse(sessionStorage.getItem('systemos_open_windows') || '[]'); } catch { return []; } });
    const [activeWindowId, setActiveWindowId] = useState(() => sessionStorage.getItem('systemos_active_window') || null);
    const [nextZIndex, setNextZIndex] = useState(20);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('systemos_wallpaper') || null);
    const [osTheme, setOsTheme] = useState(() => localStorage.getItem('systemos_theme') || 'terminal');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutWarning, setShowLogoutWarning] = useState(false);
    const [mobileActiveApp, setMobileActiveApp] = useState(null);

    const forceLogout = () => { setIsMenuOpen(false); setIsLoggingOut(true); sessionStorage.removeItem('systemos_open_windows'); sessionStorage.removeItem('systemos_active_window'); setOpenWindows([]); setTimeout(() => onLogout(), 2500); };
    const handleLogout = () => { if (isLoggingOut) return; if (openWindows.length > 0 || (isMobile && mobileActiveApp)) { setShowLogoutWarning(true); setIsMenuOpen(false); return; } forceLogout(); };

    useEffect(() => { if (!isLoggingOut) sessionStorage.setItem('systemos_open_windows', JSON.stringify(openWindows)); }, [openWindows, isLoggingOut]);
    useEffect(() => { if (!isLoggingOut) { if (activeWindowId) sessionStorage.setItem('systemos_active_window', activeWindowId); else sessionStorage.removeItem('systemos_active_window'); } }, [activeWindowId, isLoggingOut]);

    const handleSetTheme = (themeId) => { setOsTheme(themeId); localStorage.setItem('systemos_theme', themeId); };

    const getDefaultIconPositions = () => ({ projects: { x: GRID_PAD, y: GRID_PAD }, about: { x: GRID_PAD, y: GRID_PAD + GRID_CELL_H }, certificates: { x: GRID_PAD, y: GRID_PAD + GRID_CELL_H * 2 }, classified: { x: GRID_PAD, y: GRID_PAD + GRID_CELL_H * 3 }, settings: { x: GRID_PAD, y: GRID_PAD + GRID_CELL_H * 4 } });
    const [iconPositions, setIconPositions] = useState(() => { try { const saved = localStorage.getItem('systemos_icon_positions'); return saved ? JSON.parse(saved) : getDefaultIconPositions(); } catch { return getDefaultIconPositions(); } });
    const handleIconDragEnd = (fileId, newPos) => { setIconPositions(prev => { const next = { ...prev, [fileId]: newPos }; try { localStorage.setItem('systemos_icon_positions', JSON.stringify(next)); } catch { } return next; }); };

    const [renamedLabels, setRenamedLabels] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_renamed') || '{}'); } catch { return {}; } });
    const [hiddenIcons, setHiddenIcons] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_hidden') || '[]'); } catch { return []; } });
    const [pinnedApps, setPinnedApps] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_pinned') || '[]'); } catch { return []; } });
    const [taskbarOrder, setTaskbarOrder] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_taskbar_order') || '[]'); } catch { return []; } });

    const handleRenameIcon = (fileId, newLabel) => { setRenamedLabels(prev => { const next = { ...prev, [fileId]: newLabel }; localStorage.setItem('systemos_renamed', JSON.stringify(next)); return next; }); };
    const handleDeleteIcon = (fileId) => { setHiddenIcons(prev => { const next = [...prev, fileId]; localStorage.setItem('systemos_hidden', JSON.stringify(next)); return next; }); };
    const handleRestoreIcon = (fileId) => { setHiddenIcons(prev => { const next = prev.filter(id => id !== fileId); localStorage.setItem('systemos_hidden', JSON.stringify(next)); return next; }); };
    const handleTogglePin = (fileId) => { setPinnedApps(prev => { const next = prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]; localStorage.setItem('systemos_pinned', JSON.stringify(next)); return next; }); };
    const handleReorderTaskbar = (newOrder) => {
        setTaskbarOrder(newOrder);
        try { localStorage.setItem('systemos_taskbarOrder', JSON.stringify(newOrder)); } catch { }
        const newPinned = newOrder.filter(id => pinnedApps.includes(id));
        if (newPinned.length > 0) { setPinnedApps(prev => { const remaining = prev.filter(id => !newOrder.includes(id)); const ordered = newOrder.filter(id => prev.includes(id)); const next = [...ordered, ...remaining]; localStorage.setItem('systemos_pinned', JSON.stringify(next)); return next; }); }
    };

    const [desktopContextMenu, setDesktopContextMenu] = useState({ visible: false, x: 0, y: 0, activeSubMenu: null });
    useEffect(() => { const handleGlobalClick = () => { if (desktopContextMenu.visible) setDesktopContextMenu(prev => ({ ...prev, visible: false, activeSubMenu: null })); }; window.addEventListener('pointerdown', handleGlobalClick); return () => window.removeEventListener('pointerdown', handleGlobalClick); }, [desktopContextMenu.visible]);

    const baseDesktopFiles = [{ id: 'projects', label: 'Projects', type: 'folder' }, { id: 'about', label: 'About_Me', type: 'text' }, { id: 'certificates', label: 'Certificates', type: 'cert' }, { id: 'classified', label: 'Classified.dat', type: 'locked' }, { id: 'settings', label: 'Settings', type: 'settings' }];
    const [desktopFiles, setDesktopFiles] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_desktop_files')) || baseDesktopFiles; } catch { return baseDesktopFiles; } });
    const [viewSettings, setViewSettings] = useState(() => { try { return JSON.parse(localStorage.getItem('systemos_view_settings')) || { size: 'medium', showDesktopIcons: true }; } catch { return { size: 'medium', showDesktopIcons: true }; } });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const updateViewSettings = (updates) => { setViewSettings(prev => { const next = { ...prev, ...updates }; localStorage.setItem('systemos_view_settings', JSON.stringify(next)); return next; }); setDesktopContextMenu(prev => ({ ...prev, visible: false })); };
    const handleRefresh = () => { setIsRefreshing(true); setDesktopContextMenu(prev => ({ ...prev, visible: false })); setTimeout(() => setIsRefreshing(false), 200); };
    const handleUndoDelete = () => { setHiddenIcons(prev => { if (prev.length === 0) return prev; const next = prev.slice(0, -1); localStorage.setItem('systemos_hidden', JSON.stringify(next)); return next; }); setDesktopContextMenu(prev => ({ ...prev, visible: false })); };
    const handleNewFolder = () => {
        const newId = `folder_${Date.now()}`; const newFile = { id: newId, label: 'New Folder', type: 'folder' };
        setDesktopFiles(prev => { const next = [...prev, newFile]; localStorage.setItem('systemos_desktop_files', JSON.stringify(next)); return next; });
        setIconPositions(prev => { const next = { ...prev, [newId]: { x: desktopContextMenu.x + 20, y: desktopContextMenu.y + 20 } }; localStorage.setItem('systemos_icon_positions', JSON.stringify(next)); return next; });
        setDesktopContextMenu(prev => ({ ...prev, visible: false }));
    };

    const getAppMetadata = (id) => { const file = desktopFiles.find(f => f.id === id); if (file) return { title: file.label, iconType: file.type }; const startApp = SYSTEM_APPS.find(a => a.id === id); if (startApp) return { title: startApp.label, iconType: startApp.iconType }; return { title: id, iconType: 'folder' }; };

    const handleFocusWindow = (id) => { setOpenWindows(prev => { const newZ = nextZIndex; setNextZIndex(z => z + 1); return prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w); }); setActiveWindowId(id); };
    const handleCloseWindow = (id) => { setOpenWindows(prev => prev.filter(w => w.id !== id)); if (activeWindowId === id) setActiveWindowId(null); };
    const handleMinimizeWindow = (id) => { setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w)); if (activeWindowId === id) setActiveWindowId(null); };
    const handleMaximizeWindow = (id) => { setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)); handleFocusWindow(id); };
    const handleTaskbarClick = (id) => { setOpenWindows(prev => { const win = prev.find(w => w.id === id); if (!win) return prev; if (win.isMinimized) { handleFocusWindow(id); return prev.map(w => w.id === id ? { ...w, isMinimized: false } : w); } else if (activeWindowId === id) { setActiveWindowId(null); return prev.map(w => w.id === id ? { ...w, isMinimized: true } : w); } else { handleFocusWindow(id); return prev; } }); };

    const handleOpenFile = (fileId) => {
        if (isMobile) { setMobileActiveApp(fileId); setIsMenuOpen(false); return; }
        setOpenWindows(prev => { const exists = prev.find(w => w.id === fileId); const newZ = nextZIndex; setNextZIndex(z => z + 1); if (exists) return prev.map(w => w.id === fileId ? { ...w, isMinimized: false, zIndex: newZ } : w); return [...prev, { id: fileId, isMinimized: false, isMaximized: true, zIndex: newZ }]; });
        setActiveWindowId(fileId);
    };

    const handleSetWallpaper = (url) => { setWallpaper(url); try { if (url) localStorage.setItem('systemos_wallpaper', url); else localStorage.removeItem('systemos_wallpaper'); } catch (e) { console.warn("Wallpaper quota exceeded."); } };

    // FIX 2: Exclude taskbar right-clicks — Taskbar has data-taskbar="true"
    const handleDesktopContextMenu = (e) => {
        e.preventDefault();
        if (isMobile) return;
        if (
            e.target.closest('.react-draggable') ||
            e.target.closest('.desktop-icon') ||
            e.target.closest('.z-\\[9995\\]') ||
            e.target.closest('[data-taskbar="true"]')
        ) return;
        setDesktopContextMenu({ visible: true, x: e.clientX, y: e.clientY, activeSubMenu: null });
    };

    const renderAppContent = (id) => {
        if (id === 'classified') return (<div className="flex flex-col items-center justify-center h-full text-red-600 gap-4 animate-pulse px-4 text-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg><h2 className="text-xl font-bold font-display tracking-[0.2em]">ACCESS DENIED</h2><p className="text-[#ffaa44]/50 font-mono text-sm tracking-widest">ENCRYPTION LEVEL: MAXIMUM</p></div>);
        if (id === 'snake') return <SnakeApp />;
        if (id === 'terminal') return <TerminalApp onLaunchApp={handleOpenFile} />;
        if (id === 'settings') return <SettingsApp currentWallpaper={wallpaper} onApplyWallpaper={handleSetWallpaper} osTheme={osTheme} onSetTheme={handleSetTheme} />;
        if (id === 'skills') return <SystemSpecsApp />;
        if (id === 'about') return <AboutMeApp />;
        if (id === 'certificates') return <CertificatesApp />;
        if (id === 'projects') return <ProjectsApp />;
        if (id === 'add_project') return <AddProjectApp />;
        return <div className="font-mono text-xs tracking-widest leading-relaxed whitespace-pre-wrap p-4"><h1 className="text-2xl font-bold mb-4 text-[#ffaa44]">THE_ARCHIVES</h1>{`Status: ONLINE\n\n[ ZERO FILES FOUND ]`}</div>;
    };

    const mobileAllApps = (() => { const seen = new Set(); return [...desktopFiles.filter(f => !hiddenIcons.includes(f.id)).map(f => ({ id: f.id, label: renamedLabels[f.id] || f.label, iconType: f.type })), ...SYSTEM_APPS.map(a => ({ id: a.id, label: a.label, iconType: a.iconType }))].filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; }); })();
    const mobileOpenAppsMeta = mobileActiveApp ? [{ id: mobileActiveApp, ...getAppMetadata(mobileActiveApp) }] : [];

    return (
        <DesktopBackground wallpaper={wallpaper} theme={osTheme} onContextMenu={handleDesktopContextMenu} className="desktop-bg">

            {/* ═══ MOBILE LAYOUT ═══ */}
            {isMobile && (
                <>
                    <div className="absolute inset-0 flex flex-col" style={{ paddingBottom: 60 }}>
                        <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
                            <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--os-primary)' }}>SYS OS 11</span>
                            <span className="text-xs font-semibold" style={{ color: 'var(--os-text)' }}>{time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                        <MobileHomeScreen desktopFiles={desktopFiles} renamedLabels={renamedLabels} hiddenIcons={hiddenIcons} onOpenApp={handleOpenFile} systemApps={SYSTEM_APPS} />
                    </div>
                    {mobileActiveApp && (
                        <MobileAppSheet id={mobileActiveApp} title={getAppMetadata(mobileActiveApp)?.title?.toUpperCase() || mobileActiveApp} isActive={!!mobileActiveApp} onClose={() => setMobileActiveApp(null)}>
                            {renderAppContent(mobileActiveApp)}
                        </MobileAppSheet>
                    )}
                    <MobileStartMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onLaunchApp={handleOpenFile} onLogout={handleLogout} allApps={mobileAllApps} />
                    <MobileDock onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} isMenuOpen={isMenuOpen} openApps={mobileOpenAppsMeta} activeAppId={mobileActiveApp} onAppTap={(id) => setMobileActiveApp(id)} onLogout={handleLogout} time={time} />
                </>
            )}

            {/* ═══ DESKTOP LAYOUT ═══ */}
            {!isMobile && (
                <>
                    {!isRefreshing && viewSettings.showDesktopIcons && desktopFiles.filter(f => !hiddenIcons.includes(f.id)).map(file => (
                        <DesktopIcon key={file.id} size={viewSettings.size} iconType={file.type} label={renamedLabels[file.id] || file.label} position={iconPositions[file.id] || { x: 20, y: 20 }} onOpen={() => handleOpenFile(file.id)} onDragEnd={(pos) => handleIconDragEnd(file.id, pos)} onRename={(newLabel) => handleRenameIcon(file.id, newLabel)} onDelete={() => handleDeleteIcon(file.id)} onPinToggle={() => handleTogglePin(file.id)} isPinned={pinnedApps.includes(file.id)} />
                    ))}
                    {openWindows.map(win => { const meta = getAppMetadata(win.id); return (<DraggableWindow key={win.id} id={win.id} title={`// VIEWING: ${meta.title.toUpperCase()}`} isMinimized={win.isMinimized} isMaximized={win.isMaximized} isActive={activeWindowId === win.id} zIndex={win.zIndex} onFocus={handleFocusWindow} onClose={() => handleCloseWindow(win.id)} onMinimize={() => handleMinimizeWindow(win.id)} onMaximize={() => handleMaximizeWindow(win.id)}>{renderAppContent(win.id)}</DraggableWindow>); })}
                    <StartMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onLaunchApp={(id) => { handleOpenFile(id); setIsMenuOpen(false); }} onLogout={handleLogout} hiddenIcons={hiddenIcons} onRestoreIcon={(id) => { handleRestoreIcon(id); setIsMenuOpen(false); }} desktopFiles={desktopFiles} renamedLabels={renamedLabels} />
                    <Taskbar isMenuOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} openWindows={openWindows} activeWindowId={activeWindowId} onWindowClick={handleTaskbarClick} onCloseWindow={handleCloseWindow} getAppMetadata={getAppMetadata} theme={osTheme} pinnedApps={pinnedApps} onPinnedAppClick={handleOpenFile} onUnpinApp={handleTogglePin} onReorderPinned={handleReorderTaskbar} taskbarOrder={taskbarOrder} />

                    {desktopContextMenu.visible && (
                        <div className="fixed z-[10000] rounded-lg py-2 shadow-2xl border backdrop-blur-2xl flex flex-col text-[13px]" style={{ background: 'var(--os-ctx-bg)', borderColor: 'var(--os-border)', color: 'var(--os-text)', fontFamily: 'var(--os-font)', left: Math.min(desktopContextMenu.x, window.innerWidth - 300), top: Math.min(desktopContextMenu.y, window.innerHeight - 400), minWidth: '240px' }} onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
                            <div className="relative group px-1" onMouseEnter={() => setDesktopContextMenu(prev => ({ ...prev, activeSubMenu: 'view' }))}>
                                <button className="w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>View</div>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                {desktopContextMenu.activeSubMenu === 'view' && (
                                    <div className="absolute left-full top-0 ml-1 rounded-lg py-2 shadow-2xl border backdrop-blur-2xl flex flex-col min-w-[220px]" style={{ background: 'var(--os-ctx-bg)', borderColor: 'var(--os-border)' }}>
                                        <button onClick={() => updateViewSettings({ size: 'large' })} className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><div className="w-4 flex justify-center">{viewSettings.size === 'large' && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}</div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><rect x="2" y="4" width="20" height="14" rx="2" /></svg> Large icons</button>
                                        <button onClick={() => updateViewSettings({ size: 'medium' })} className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><div className="w-4 flex justify-center">{viewSettings.size === 'medium' && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}</div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><rect x="4" y="6" width="16" height="10" rx="2" /></svg> Medium icons</button>
                                        <button onClick={() => updateViewSettings({ size: 'small' })} className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><div className="w-4 flex justify-center">{viewSettings.size === 'small' && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}</div><div className="w-4 flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" /></div> Small icons</button>
                                        <div className="h-px w-full my-1.5 opacity-50 bg-black/20 dark:bg-white/20" />
                                        <button onClick={() => updateViewSettings({ showDesktopIcons: !viewSettings.showDesktopIcons })} className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><div className="w-4 flex justify-center">{viewSettings.showDesktopIcons && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 opacity-70"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}</div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 16V8M17 16V8" /></svg> Show desktop icons</button>
                                    </div>
                                )}
                            </div>
                            <div className="px-1"><button onClick={handleRefresh} className="w-full text-left px-3 py-1.5 rounded flex items-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" onMouseEnter={() => setDesktopContextMenu(prev => ({ ...prev, activeSubMenu: null }))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Refresh</button></div>
                            <div className="h-px w-full my-1.5 opacity-50 bg-black/20 dark:bg-white/20" />
                            <div className="px-1"><button onClick={handleUndoDelete} className="w-full text-left px-3 py-1.5 rounded flex items-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" onMouseEnter={() => setDesktopContextMenu(prev => ({ ...prev, activeSubMenu: null }))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg> Undo Delete <span className="ml-auto opacity-50 text-[10px]">Ctrl+Z</span></button></div>
                            <div className="relative group px-1" onMouseEnter={() => setDesktopContextMenu(prev => ({ ...prev, activeSubMenu: 'new' }))}>
                                <button className="w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" /></svg>New</div>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </button>
                                {desktopContextMenu.activeSubMenu === 'new' && (
                                    <div className="absolute left-full top-0 ml-1 rounded-lg py-2 shadow-2xl border backdrop-blur-2xl flex flex-col min-w-[200px]" style={{ background: 'var(--os-ctx-bg)', borderColor: 'var(--os-border)' }}>
                                        <button onClick={handleNewFolder} className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> Folder</button>
                                        <button className="w-full text-left px-4 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> Shortcut</button>
                                        <div className="h-px w-full my-1.5 opacity-50 bg-black/20 dark:bg-white/20" />
                                        <button className="w-full text-left px-8 py-1.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Text Document</button>
                                    </div>
                                )}
                            </div>
                            <div className="h-px w-full my-1.5 opacity-50 bg-black/20 dark:bg-white/20" />
                            <div className="px-1"><button className="w-full text-left px-3 py-1.5 rounded flex items-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" onMouseEnter={() => setDesktopContextMenu(prev => ({ ...prev, activeSubMenu: null }))} onClick={() => { handleOpenFile('settings'); setDesktopContextMenu(prev => ({ ...prev, visible: false })); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-70"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg> Personalize</button></div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ SHARED: Logout overlays ═══ */}
            <div className={`absolute inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-1000 ${isLoggingOut ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} style={{ fontFamily: 'var(--os-font)', background: 'var(--os-bg)' }}>
                {isLoggingOut && (
                    <div className="flex flex-col items-center gap-8 transition-opacity duration-300" style={{ color: 'var(--os-text)' }}>
                        <div className="win-dot-container" style={{ color: 'var(--os-primary)' }}><div className="win-dot" /><div className="win-dot" /><div className="win-dot" /><div className="win-dot" /><div className="win-dot" /></div>
                        <h2 className="text-3xl tracking-[0.1em] font-light" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Signing out</h2>
                    </div>
                )}
            </div>

            {showLogoutWarning && (
                <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-8 backdrop-blur" style={{ fontFamily: 'var(--os-font)', background: 'var(--os-bg)', color: 'var(--os-text)' }}>
                    <div className="max-w-md w-full flex flex-col items-center text-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mb-6 text-[#ffaa44]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <h2 className="text-xl font-bold tracking-wider mb-4">Close apps and sign out?</h2>
                        <p className="text-white/60 mb-8 leading-relaxed text-sm">To go back and save your work, tap Cancel.</p>
                        <div className="flex gap-4 w-full text-sm">
                            <button onClick={() => { setShowLogoutWarning(false); forceLogout(); }} className="flex-1 py-3 border rounded transition-colors cursor-pointer active:scale-95" style={{ borderColor: 'var(--os-border)', background: 'var(--os-hover)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,170,68,0.2)'; e.currentTarget.style.borderColor = '#ffaa44'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--os-hover)'; e.currentTarget.style.borderColor = 'var(--os-border)'; }}>Sign out anyway</button>
                            <button onClick={() => setShowLogoutWarning(false)} className="flex-1 py-3 border rounded transition-colors cursor-pointer active:scale-95" style={{ borderColor: 'var(--os-border)', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </DesktopBackground>
    );
}