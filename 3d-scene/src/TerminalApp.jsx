import React, { useState, useRef, useEffect } from 'react';

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

export default function TerminalApp({ onLaunchApp }) {
    const [history, setHistory] = useState([
        { type: 'system', content: 'OS Terminal v2.1.0' },
        { type: 'system', content: 'Establishing secure connection to centralized mainframe... OK.' },
        { type: 'system', content: 'Type "help" for a list of available commands.' }
    ]);
    const [input, setInput] = useState('');
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Keep focus on input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleCommand = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                const nextIdx = historyIndex + 1;
                setHistoryIndex(nextIdx);
                setInput(commandHistory[commandHistory.length - 1 - nextIdx]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const prevIdx = historyIndex - 1;
                setHistoryIndex(prevIdx);
                setInput(commandHistory[commandHistory.length - 1 - prevIdx]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Enter') {
            const cmd = input.trim().toLowerCase();
            setInput('');
            setHistoryIndex(-1);
            if (cmd) {
                setCommandHistory(prev => [...prev, input.trim()]);
            }
            setHistory(prev => [...prev, { type: 'input', content: `asharma@system:~# ${input}` }]);

            if (!cmd) return;

            const args = cmd.split(' ');
            const baseCmd = args[0];

            let output = [];

            switch (baseCmd) {
                case 'help':
                    output.push('Available commands:');
                    output.push('  help       - Show this help message');
                    output.push('  ls         - List all available applications');
                    output.push('  open <app> - Launch an application by ID (e.g., open projects)');
                    output.push('  add_project <url> - Inject a new GitHub project (Admin Only)');
                    output.push('  clear      - Clear terminal output');
                    output.push('  whoami     - Display current user privileges');
                    output.push('  date       - Display system date and time');
                    output.push('  reboot     - Restart the system connection');
                    break;
                case 'ls':
                    output.push('Available Applications [App ID]:');
                    output.push('  projects      - Projects Portfolio');
                    output.push('  about         - About Me Information');
                    output.push('  certificates  - Certification Registry');
                    output.push('  settings      - System Settings');
                    output.push('  skills        - System Specifications');
                    output.push('  snake         - Snake Game');
                    output.push('  classified    - Classified Data Vault');
                    break;
                case 'open':
                    if (args.length > 1) {
                        const appId = args[1];
                        const validApps = ['projects', 'about', 'certificates', 'settings', 'skills', 'snake', 'classified', 'add_project', 'view_project', 'terminal'];
                        if (validApps.includes(appId)) {
                            output.push(`Executing sequence... Launching application: [${appId}]`);
                            setTimeout(() => onLaunchApp(appId), 400);
                        } else {
                            output.push(`Error: Application ID '${appId}' not found. Type 'ls' for a list of apps.`);
                        }
                    } else {
                        output.push('Usage: open <app_id>');
                    }
                    break;
                case 'add_project':
                    if (args.length > 1) {
                        const url = args[1];
                        const confirmed = window.confirm("AUTHENTICATION REQUIRED.\nConfirm admin access to add project?");

                        if (confirmed) {
                            output.push('Credentials accepted. Establishing uplink to GitHub mainframe...');

                            // Async fetching handling within the sync switch statement
                            // Use an IIFE so we don't have to make handleCommand fully async, avoiding weird UI states
                            (async () => {
                                try {
                                    let owner, repo;
                                    try {
                                        const urlObj = new URL(url);
                                        const parts = urlObj.pathname.split('/').filter(Boolean);
                                        if (parts.length < 2) throw new Error();
                                        owner = parts[0];
                                        repo = parts[1];
                                    } catch (err) {
                                        const parts = url.split('/').filter(Boolean);
                                        if (parts.length === 2) { owner = parts[0]; repo = parts[1]; }
                                        else throw new Error("Invalid format. Use: add_project https://github.com/owner/repo");
                                    }

                                    const ghHeaders = {};
                                    const ghToken = import.meta.env.VITE_GITHUB_TOKEN;
                                    if (ghToken) ghHeaders['Authorization'] = `token ${ghToken}`;
                                    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders });
                                    if (!res.ok) throw new Error(`API Error: ${res.status}`);
                                    const data = await res.json();

                                    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
                                    const newProject = {
                                        id: `custom_${Date.now()}_${data.id}`,
                                        title: data.name,
                                        tag: data.stargazers_count || 0,
                                        year: new Date(data.updated_at).getFullYear().toString(),
                                        status: data.archived ? "ARCHIVED" : "ACTIVE",
                                        statusColor: data.archived ? "#ff4444" : "#00ff87",
                                        desc: data.description || "No description provided for this repository.",
                                        tech: data.topics?.length ? data.topics : (data.language ? [data.language] : ["Source"]),
                                        color: c.color, grad: c.grad, url: data.homepage || data.html_url,
                                        isCustom: true
                                    };

                                    const existing = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
                                    if (existing.some(p => p.url === newProject.url)) {
                                        setHistory(prev => [...prev, { type: 'output', content: `Error: Project '${data.name}' already exists in archive.` }]);
                                        return;
                                    }

                                    existing.unshift(newProject);
                                    localStorage.setItem('systemos_custom_projects', JSON.stringify(existing));
                                    window.dispatchEvent(new Event('systemos_projects_updated'));

                                    setHistory(prev => [...prev, { type: 'output', content: `Success: Injected project '${data.name}' into archive.` }]);
                                } catch (e) {
                                    setHistory(prev => [...prev, { type: 'output', content: `Error during transmission: ${e.message}` }]);
                                }
                            })();
                        } else {
                            if (pwd !== null) {
                                output.push('Error: ACCESS DENIED. Incorrect password.');
                            }
                        }
                    } else {
                        output.push('Usage: add_project <github_url>');
                    }
                    break;
                case 'clear':
                    setHistory([]);
                    return;
                case 'whoami':
                    output.push('User: asharma');
                    output.push('Role: SYS_ADMIN');
                    output.push('Access Level: ROOT');
                    break;
                case 'date':
                    output.push(new Date().toString());
                    break;
                case 'reboot':
                    output.push('Initiating system reboot request...');
                    setTimeout(() => window.location.reload(), 1500);
                    break;
                case 'sudo':
                    output.push('Nice try. This incident will be reported to the administrator.');
                    break;
                default:
                    output.push(`Command not found: ${baseCmd}. Type 'help' for available commands.`);
            }

            if (output.length > 0) {
                setHistory(prev => [...prev, ...output.map(text => ({ type: 'output', content: text }))]);
            }
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-[#050505] p-5 font-mono text-sm overflow-hidden"
            style={{ color: 'var(--os-primary)' }}
            onClick={() => inputRef.current?.focus()}
        >
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--os-primary) transparent' }}>
                {history.map((record, index) => (
                    <div key={index} className={`mb-1 tracking-wider ${record.type === 'input' ? 'opacity-70 mt-2 text-white' : 'opacity-100'} ${record.content.startsWith('Error') ? 'text-red-500' : ''}`}>
                        {record.content.replace(/ /g, '\u00A0')}
                    </div>
                ))}

                <div className="flex items-center mt-3 group">
                    <span className="mr-3 opacity-70 whitespace-nowrap text-white">asharma@system:~#</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        className="flex-1 bg-transparent outline-none border-none text-[var(--os-primary)] caret-[var(--os-primary)] font-bold tracking-widest"
                        spellCheck={false}
                        autoComplete="off"
                        autoFocus
                    />
                </div>
                <div ref={bottomRef} />
            </div>

            <div className="mt-auto pt-4 border-t opacity-30 text-[10px] tracking-[0.3em] flex justify-between uppercase" style={{ borderColor: 'var(--os-primary)' }}>
                <span>Secure Terminal</span>
                <span>Type HELP for commands</span>
            </div>
        </div>
    );
}
