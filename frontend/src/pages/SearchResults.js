import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, BookOpen, HelpCircle, FileCheck, GraduationCap, ChevronRight, FileText, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_ICON = {
    topic: { icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    chapter: { icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
    question: { icon: HelpCircle, color: 'bg-amber-50 text-amber-600' },
    past_paper: { icon: FileCheck, color: 'bg-green-50 text-green-600' },
    course: { icon: GraduationCap, color: 'bg-violet-50 text-violet-600' },
};

const CAT_LABELS = { Learn: 'Learn', Practise: 'Practise', Exam: 'Exam', Resources: 'Resources' };

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inputVal, setInputVal] = useState(query);

    useEffect(() => {
        if (!query || query.length < 2) { setResults([]); return; }
        setLoading(true);
        axios.get(`${API_URL}/api/search?q=${encodeURIComponent(query)}&limit=30`)
            .then(r => setResults(r.data.results || []))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputVal.trim()) setSearchParams({ q: inputVal.trim() });
    };

    // Group results by category
    const grouped = {};
    results.forEach(r => {
        const cat = r.category || 'Resources';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(r);
    });

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="search-results-page">
            {/* Search Header */}
            <section className="py-8 bg-white border-b">
                <div className="container-custom max-w-3xl">
                    <form onSubmit={handleSearch} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-accent focus-within:bg-white transition-all">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder="Search topics, courses, past papers..."
                            className="flex-1 bg-transparent outline-none text-base text-primary placeholder:text-gray-400"
                            autoFocus
                            data-testid="search-page-input"
                        />
                        <button type="submit" className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover" data-testid="search-page-btn">Search</button>
                    </form>
                </div>
            </section>

            {/* Results */}
            <section className="py-8 md:py-10">
                <div className="container-custom max-w-3xl">
                    {query && !loading && (
                        <p className="text-sm text-gray-500 mb-6">{results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium text-primary">{query}</span>"</p>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-16"><div className="spinner"></div></div>
                    ) : !query ? (
                        <div className="text-center py-20">
                            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h2 className="font-bold text-primary text-lg mb-2">Search EdVNova</h2>
                            <p className="text-sm text-gray-400 max-w-md mx-auto">Search for topics, subjects, courses, past papers, mark schemes, and more.</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                {['Quadratic Equations', 'IGCSE Chemistry', '0580 Paper 22', 'Photosynthesis', '9701 Mark Scheme'].map(t => (
                                    <button key={t} onClick={() => setSearchParams({ q: t })} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">{t}</button>
                                ))}
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-20">
                            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h2 className="font-bold text-primary text-lg mb-2">No results found</h2>
                            <p className="text-sm text-gray-400">Try a different search term or browse our subjects.</p>
                            <Link to="/learn" className="inline-flex items-center gap-2 mt-4 text-accent text-sm font-medium hover:underline">Browse Subjects <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(grouped).map(([cat, items]) => (
                                <div key={cat} data-testid={`search-category-${cat.toLowerCase()}`}>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{CAT_LABELS[cat] || cat}</h3>
                                    <div className="space-y-2">
                                        {items.map((r, i) => {
                                            const cfg = TYPE_ICON[r.type] || TYPE_ICON.topic;
                                            const Icon = cfg.icon;
                                            return (
                                                <Link
                                                    key={`${r.type}-${r.id}-${i}`}
                                                    to={r.url || '#'}
                                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                                                    data-testid={`result-${r.type}-${i}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-primary text-sm group-hover:text-accent transition-colors">{r.title}</p>
                                                        {r.subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{r.subtitle}</p>}
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase flex-shrink-0 hidden sm:block">{r.type?.replace('_', ' ')}</span>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
