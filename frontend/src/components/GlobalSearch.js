import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, HelpCircle, BookOpen, GraduationCap, ShoppingBag, FileCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_CONFIG = {
    topic: { icon: BookOpen, color: 'text-blue-600 bg-blue-50', label: 'Topic' },
    chapter: { icon: BookOpen, color: 'text-indigo-600 bg-indigo-50', label: 'Chapter' },
    question: { icon: HelpCircle, color: 'text-amber-600 bg-amber-50', label: 'Question' },
    past_paper: { icon: FileCheck, color: 'text-green-600 bg-green-50', label: 'Past Paper' },
    course: { icon: GraduationCap, color: 'text-violet-600 bg-violet-50', label: 'Course' },
};

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!query || query.length < 2) { setResults([]); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(query)}&limit=15`);
                setResults(res.data.results || []);
            } catch (e) { setResults([]); }
            finally { setLoading(false); }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSelect = (result) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        if (result.url) navigate(result.url);
    };

    if (!open) {
        return (
            <button
                onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid="global-search-trigger"
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline text-[10px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)} data-testid="global-search-overlay">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()} data-testid="global-search-modal">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search topics, questions, past papers, courses..."
                        className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                        data-testid="global-search-input"
                    />
                    {query && <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
                    <button onClick={() => setOpen(false)} className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">ESC</button>
                </div>

                {loading && <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>}

                {!loading && results.length > 0 && (
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {results.map((r, i) => {
                            const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.topic;
                            const Icon = cfg.icon;
                            return (
                                <button
                                    key={`${r.type}-${r.id}-${i}`}
                                    onClick={() => handleSelect(r)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                    data-testid={`search-result-${r.type}-${i}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-primary truncate">{r.title}</p>
                                        {r.subtitle && <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>}
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400 uppercase flex-shrink-0">{cfg.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!loading && query.length >= 2 && results.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">No results for "{query}"</div>
                )}

                {!query && (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                        <p>Search across topics, questions, past papers, and courses</p>
                        <p className="text-xs mt-1">Try: "quadratic equations", "0580", "photosynthesis"</p>
                    </div>
                )}
            </div>
        </div>
    , document.body);
}
