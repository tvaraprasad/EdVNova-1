import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Clock, FileText, Filter } from 'lucide-react';
import axios from 'axios';
import { Input } from '../../components/ui/input';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const BOARDS = [{ slug: '', label: 'All Boards' }, { slug: 'igcse', label: 'IGCSE' }, { slug: 'as-level', label: 'AS Level' }, { slug: 'a-level', label: 'A Level' }];
const SUBJECTS = [{ slug: '', label: 'All Subjects' }, { slug: 'mathematics', label: 'Mathematics' }, { slug: 'physics', label: 'Physics' }, { slug: 'chemistry', label: 'Chemistry' }, { slug: 'biology', label: 'Biology' }];

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [board, setBoard] = useState(searchParams.get('board') || '');
    const [subject, setSubject] = useState(searchParams.get('subject') || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q || board || subject) {
            setLoading(true);
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (board) params.set('board', board);
            if (subject) params.set('subject', subject);
            axios.get(`${API_URL}/api/curriculum/search?${params}`).then(res => { setResults(res.data); setLoading(false); }).catch(() => setLoading(false));
        }
    }, [searchParams, board, subject]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (board) params.set('board', board);
        if (subject) params.set('subject', subject);
        setSearchParams(params);
    };

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="search-page">
            <section className="py-12 md:py-16 bg-white border-b">
                <div className="container-custom max-w-3xl">
                    <h1 className="text-3xl font-bold text-primary tracking-tight mb-6">Search Topics</h1>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by topic, chapter, or keyword..." className="pl-10 h-12" data-testid="search-input" />
                        </div>
                        <button type="submit" className="px-6 h-12 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="search-btn">Search</button>
                    </form>
                    <div className="flex gap-3 mt-4 flex-wrap">
                        <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-gray-400" />
                            <select value={board} onChange={e => { setBoard(e.target.value); handleSearch(e); }} className="text-sm border rounded-lg px-3 py-1.5">
                                {BOARDS.map(b => <option key={b.slug} value={b.slug}>{b.label}</option>)}
                            </select>
                        </div>
                        <select value={subject} onChange={e => { setSubject(e.target.value); handleSearch(e); }} className="text-sm border rounded-lg px-3 py-1.5">
                            {SUBJECTS.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                        </select>
                    </div>
                </div>
            </section>
            <section className="py-12 md:py-16">
                <div className="container-custom max-w-3xl">
                    {loading ? <div className="text-center py-10"><div className="spinner"></div></div> : (
                        <>
                            {results.length > 0 && <p className="text-sm text-gray-500 mb-6">{results.length} results found</p>}
                            <div className="space-y-3">
                                {results.map(t => (
                                    <Link key={`${t.board_slug}-${t.subject_slug}-${t.chapter_slug}-${t.slug}`} to={`/${t.board_slug}/${t.subject_slug}/${t.chapter_slug}/${t.slug}`} className="block group" data-testid={`search-result-${t.slug}`}>
                                        <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
                                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-accent" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">{t.title}</h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-xs text-gray-400 capitalize">{t.board_title}</span>
                                                    <ChevronRight className="w-3 h-3 text-gray-300" />
                                                    <span className="text-xs text-gray-400">{t.subject_title}</span>
                                                    <ChevronRight className="w-3 h-3 text-gray-300" />
                                                    <span className="text-xs text-gray-400">{t.chapter_title}</span>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {t.study_time}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {results.length === 0 && query && <div className="text-center py-16 text-gray-500"><Search className="w-12 h-12 mx-auto mb-4 text-gray-300" /><p>No topics found for "{query}"</p></div>}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
