import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Send, Plus, Trash2, MessageSquare, ChevronDown, Sparkles, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-4 py-3">
            <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    );
}

function ChatBubble({ role, content }) {
    const isUser = role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`} data-testid={`chat-${role}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                isUser
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md'
            }`}>
                {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                ) : (
                    <div className="prose prose-sm max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-ul:text-gray-700 prose-ol:text-gray-700">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AIMentor() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [sessions, setSessions] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [board, setBoard] = useState('igcse');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/ai-mentor/sessions`, { withCredentials: true });
            setSessions(res.data);
        } catch {}
    }, []);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    const loadSession = async (sid) => {
        try {
            const res = await axios.get(`${API_URL}/api/ai-mentor/history/${sid}`, { withCredentials: true });
            setMessages(res.data);
            setSessionId(sid);
            setShowSidebar(false);
            if (res.data.length > 0) {
                setBoard(res.data[0].board || 'igcse');
                setSubject(res.data[0].subject || '');
                setTopic(res.data[0].topic || '');
            }
        } catch { toast.error('Failed to load chat'); }
    };

    const startNewChat = () => {
        setMessages([]);
        setSessionId('');
        setShowSidebar(false);
        inputRef.current?.focus();
    };

    const handleSend = async () => {
        if (!input.trim() || sending) return;
        const msg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setSending(true);

        try {
            const res = await axios.post(`${API_URL}/api/ai-mentor/chat`, {
                message: msg,
                session_id: sessionId,
                board, subject, topic,
            }, { withCredentials: true });

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
            if (!sessionId) setSessionId(res.data.session_id);
            fetchSessions();
        } catch (err) {
            const errMsg = err.response?.data?.detail || 'Failed to get response. Please try again.';
            toast.error(errMsg);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const deleteSession = async (sid) => {
        try {
            await axios.delete(`${API_URL}/api/ai-mentor/session/${sid}`, { withCredentials: true });
            if (sessionId === sid) startNewChat();
            fetchSessions();
            toast.success('Chat deleted');
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-white rounded-xl border border-gray-100 overflow-hidden" data-testid="ai-mentor">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-64 border-r border-gray-100 flex-shrink-0 bg-gray-50/50 flex flex-col`}>
                <div className="p-4 border-b border-gray-100">
                    <button onClick={startNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors" data-testid="new-chat-btn">
                        <Plus className="w-4 h-4" /> New Chat
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>
                    ) : (
                        sessions.map(s => (
                            <div key={s.session_id} className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${sessionId === s.session_id ? 'bg-accent/10 text-accent' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <button onClick={() => loadSession(s.session_id)} className="flex-1 text-left min-w-0">
                                    <p className="text-xs font-medium truncate">{s.preview}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.subject && `${s.subject} · `}{s.message_count} msgs</p>
                                </button>
                                <button onClick={() => deleteSession(s.session_id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
                    <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary">EdVNova AI Mentor</p>
                            <p className="text-[10px] text-gray-400">Academic learning assistant</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <select value={board} onChange={e => setBoard(e.target.value)} className="h-8 px-2 text-xs border border-gray-200 rounded-lg bg-white" data-testid="ai-board-select">
                            <option value="igcse">IGCSE</option>
                            <option value="as-level">AS Level</option>
                            <option value="a-level">A Level</option>
                        </select>
                        <select value={subject} onChange={e => setSubject(e.target.value)} className="h-8 px-2 text-xs border border-gray-200 rounded-lg bg-white" data-testid="ai-subject-select">
                            <option value="">Subject</option>
                            <option value="physics">Physics</option>
                            <option value="chemistry">Chemistry</option>
                            <option value="biology">Biology</option>
                            <option value="mathematics">Mathematics</option>
                        </select>
                        <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic..." className="h-8 w-24 px-2 text-xs border border-gray-200 rounded-lg hidden sm:block" />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-accent/40" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Ask EdVNova AI</h3>
                            <p className="text-sm text-gray-400 max-w-sm mb-6">
                                I'm your academic mentor for Cambridge IGCSE, AS & A Level. Ask me about any concept, formula, or exam question.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                                {[
                                    "Explain Ohm's law simply",
                                    "What is osmosis?",
                                    "Solve: 3x + 7 = 22",
                                    "How do ionic bonds form?",
                                ].map(q => (
                                    <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-primary transition-colors">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((m, i) => <ChatBubble key={i} role={m.role} content={m.content} />)}
                            {sending && <TypingIndicator />}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about any topic..."
                            rows={1}
                            className="flex-1 resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            data-testid="ai-input"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="p-3 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-40 transition-all flex-shrink-0"
                            data-testid="ai-send-btn"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        AI Mentor is a learning assistant. Always verify important information with your teacher or textbook.
                    </p>
                </div>
            </div>
        </div>
    );
}
