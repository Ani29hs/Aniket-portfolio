import React, { useState, useRef, useEffect } from 'react';
import { PROJECTS } from './ProjectsApp';
import { CERTIFICATES } from './CertificatesApp';

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [hasError, setHasError] = useState(false);

    const [projectsContext, setProjectsContext] = useState(() => PROJECTS.map(p => `${p.title}: ${p.desc} (Tech: ${p.tech?.join(', ') || ''})`).join(' | '));
    const [leetCodeContext, setLeetCodeContext] = useState("Loading...");

    useEffect(() => {
        const loadProjects = async () => {
            try {
                let ghData = null;
                const cached = sessionStorage.getItem("omega_os_projects_v2");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.data && parsed.data.length > 0) ghData = parsed.data;
                }
                
                if (!ghData) {
                    const res = await fetch("https://api.github.com/users/ani29hs/repos?sort=updated&per_page=20");
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            ghData = data.filter(r => !r.fork).map(r => ({
                                title: r.name,
                                desc: r.description || "No description provided",
                                tech: r.topics?.length ? r.topics : (r.language ? [r.language] : ["Source"])
                            }));
                        }
                    }
                }
                
                if (ghData && ghData.length > 0) {
                    const customProjects = JSON.parse(localStorage.getItem('systemos_custom_projects') || '[]');
                    const combined = [...customProjects, ...ghData];
                    setProjectsContext(combined.map(p => `${p.title}: ${p.desc} (Tech: ${(p.tech || []).join(', ')})`).join(' | '));
                }
            } catch (e) { console.error("AI Context fetch error:", e); }
        };
        const loadLeetCode = async () => {
            try {
                const res = await fetch('https://leetcode-api-faisalshohag.vercel.app/VRA8ckiHwJ');
                const data = await res.json();
                if (data.totalQuestions) {
                    setLeetCodeContext(`Total Solved: ${data.totalSolved} (Easy: ${data.easySolved}, Medium: ${data.mediumSolved}, Hard: ${data.hardSolved}), Global Rank: #${data.ranking}`);
                }
            } catch (e) { console.error("AI Context LC fetch error:", e); }
        };
        loadProjects();
        loadLeetCode();
    }, []);

    // Build the system prompt
    const systemPrompt = `You are a helpful AI assistant built into Aniket Sharma's portfolio OS. Your goal is to answer questions about Aniket, his projects, skills, and experience. Keep responses concise, professional, and friendly. 
Here is all the data you need to know about Aniket:
- **Projects**: ${projectsContext}
- **Skills**: Languages (Python, C++, Java), Data & ML (NumPy, Pandas, EDA, Scikit-Learn, SQL, Web Scraping, Power BI), Dev Stack (HTML, CSS, JavaScript, React, Django, Flask)
- **Experience**: Computer Engineering student, passionate about Data Science and Web Development.
- **Certificates**: ${CERTIFICATES.map(c => `${c.title} by ${c.issuer}`).join(' | ')}
- **System Specs & LeetCode**: The user has a "System Specs" app/folder on their desktop containing live LeetCode stats. Current stats: ${leetCodeContext}

Answer as the AI assistant representing this portfolio. If asked something unrelated, gently steer the conversation back to Aniket's work.`;

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', content: "Hello! I'm Aniket's AI Assistant. How can I help you explore the portfolio today?" }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);
        setHasError(false);

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen3:8b',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages,
                        { role: 'user', content: userMsg }
                    ],
                    stream: true
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama Error: ${response.status} - ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let assistantMsg = '';
            
            // Add an empty assistant message first, but keep typing indicator on
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.trim());
                
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message?.content) {
                            assistantMsg += parsed.message.content;
                            // Turn off typing indicator ONLY when we receive the first actual text
                            if (assistantMsg.trim().length > 0) setIsTyping(false);
                            
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                newMsgs[newMsgs.length - 1].content = assistantMsg;
                                return newMsgs;
                            });
                        }
                    } catch (e) {
                        // ignore parse errors for partial chunks
                    }
                }
            }
        } catch (error) {
            console.error('Ollama Error:', error);
            setHasError(true);
            setMessages(prev => {
                const newMsgs = [...prev];
                // If the last message was the empty assistant message, overwrite it with error
                if (newMsgs[newMsgs.length - 1].role === 'assistant' && newMsgs[newMsgs.length - 1].content === '') {
                     newMsgs[newMsgs.length - 1].content = "⚠️ Error: Cannot connect to local Qwen model. Please ensure Ollama is running (`ollama run qwen3:8b`) and OLLAMA_ORIGINS=\"*\" is set.";
                     return newMsgs;
                }
                return [...prev, { role: 'assistant', content: "⚠️ Error: Cannot connect to local Qwen model. Please ensure Ollama is running (`ollama run qwen3:8b`) and OLLAMA_ORIGINS=\"*\" is set." }];
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            {/* Chat Window */}
            {isOpen && (
                <div style={{ 
                    width: 380, 
                    height: 500, 
                    background: 'var(--os-glass)', 
                    border: '1px solid var(--os-border)', 
                    borderRadius: '24px', 
                    boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'fadeInUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    fontFamily: '"Outfit", sans-serif'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--os-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'color-mix(in srgb, var(--os-primary) 5%, transparent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--os-primary)', boxShadow: '0 0 10px var(--os-primary)' }} />
                            <span style={{ color: 'var(--os-text)', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.1em', fontSize: 14 }}>SYSTEM.AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--os-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {messages.map((m, i) => {
                            if (!m.content && m.role === 'assistant') return null;
                            return (
                            <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                <div style={{ 
                                    background: m.role === 'user' ? 'var(--os-primary)' : 'var(--os-hover)', 
                                    color: m.role === 'user' ? '#000' : 'var(--os-text)', 
                                    padding: '12px 16px', 
                                    borderRadius: '16px', 
                                    borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                                    borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '16px',
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    border: m.role === 'assistant' ? '1px solid var(--os-border)' : 'none',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {m.content}
                                </div>
                                <div style={{ fontSize: 9, color: 'var(--os-text-muted)', marginTop: 6, textAlign: m.role === 'user' ? 'right' : 'left', fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.05em' }}>
                                    {m.role === 'user' ? 'GUEST' : 'SYSTEM.AI'}
                                </div>
                            </div>
                        )})}
                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'var(--os-hover)', border: '1px solid var(--os-border)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', display: 'flex', gap: 6 }}>
                                <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--os-primary)', animation: 'pulse 1.5s infinite' }} />
                                <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--os-primary)', animation: 'pulse 1.5s infinite 0.2s' }} />
                                <div className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--os-primary)', animation: 'pulse 1.5s infinite 0.4s' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--os-border)' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about Aniket's work..." 
                                style={{ 
                                    width: '100%', 
                                    background: 'var(--os-hover)', 
                                    border: '1px solid var(--os-border)', 
                                    borderRadius: '100px', 
                                    padding: '12px 48px 12px 20px', 
                                    color: 'var(--os-text)', 
                                    fontFamily: '"Outfit", sans-serif',
                                    fontSize: 13,
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--os-primary)'}
                                onBlur={e => e.target.style.borderColor = 'var(--os-border)'}
                            />
                            <button onClick={handleSend} style={{ position: 'absolute', right: 8, width: 32, height: 32, borderRadius: '50%', background: input.trim() ? 'var(--os-primary)' : 'var(--os-hover)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s ease' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#000' : 'var(--os-text-muted)'} strokeWidth="2" style={{ width: 14, height: 14, transform: 'translateX(-1px)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" /></svg>
                            </button>
                        </div>
                    </div>
                    
                    <style>{`
                        @keyframes fadeInUp {
                            from { opacity: 0; transform: translateY(20px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        @keyframes pulse {
                            0%, 100% { opacity: 0.4; transform: scale(0.8); }
                            50% { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}

            {/* FAB */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '32px', 
                    background: 'var(--os-glass)', 
                    border: '1px solid var(--os-border)', 
                    boxShadow: isOpen ? '0 0 0 2px var(--os-primary), 0 20px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.4)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)'
                }}
                onMouseEnter={e => !isOpen && (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => !isOpen && (e.currentTarget.style.transform = 'translateY(0)')}
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--os-text)" strokeWidth="2" style={{ width: 28, height: 28 }}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--os-primary)" strokeWidth="2" style={{ width: 28, height: 28 }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                )}
            </button>
        </div>
    );
}
