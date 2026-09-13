import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, ChevronDown, ChevronRight, Bookmark, BookmarkCheck, CheckCircle, Circle, FileText, Calculator, Atom, FlaskConical, Leaf, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SUBJECTS = [
    { value: 'physics', label: 'Physics', icon: Atom, color: 'bg-violet-50 text-violet-600' },
    { value: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600' },
    { value: 'biology', label: 'Biology', icon: Leaf, color: 'bg-teal-50 text-teal-600' },
    { value: 'mathematics', label: 'Mathematics', icon: Calculator, color: 'bg-blue-50 text-blue-600' },
];

function QuestionCard({ q, bookmarked, completed, onBookmark, onComplete, isAuth }) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showMarkScheme, setShowMarkScheme] = useState(false);

    const diffColors = { easy: 'bg-green-50 text-green-700', medium: 'bg-amber-50 text-amber-700', hard: 'bg-red-50 text-red-700' };
    const typeColors = { mcq: 'bg-blue-50 text-blue-700', structured: 'bg-indigo-50 text-indigo-700', theory: 'bg-purple-50 text-purple-700' };

    return (
        <div className={`bg-white rounded-xl border ${completed ? 'border-green-200 bg-green-50/20' : 'border-gray-100'} hover:shadow-md transition-all duration-200`} data-testid={`question-card-${q.id}`}>
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${diffColors[q.difficulty] || 'bg-gray-100'}`}>
                            {q.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${typeColors[q.paper_type] || 'bg-gray-100'}`}>
                            {q.paper_type}
                        </span>
                        {q.marks > 0 && <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-600">{q.marks} marks</span>}
                        {q.board && <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600">{q.board}</span>}
                    </div>
                    {isAuth && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => onComplete(q.id)} className={`p-1.5 rounded-lg transition-colors ${completed ? 'text-green-600 bg-green-50' : 'text-gray-300 hover:text-green-500 hover:bg-green-50'}`} title={completed ? 'Mark incomplete' : 'Mark complete'} data-testid={`complete-${q.id}`}>
                                {completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <button onClick={() => onBookmark(q.id)} className={`p-1.5 rounded-lg transition-colors ${bookmarked ? 'text-accent bg-accent/10' : 'text-gray-300 hover:text-accent hover:bg-accent/5'}`} title={bookmarked ? 'Remove bookmark' : 'Bookmark'} data-testid={`bookmark-${q.id}`}>
                                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{q.topic} {q.year && `· ${q.year}`} {q.paper_number && `· ${q.paper_number}`}</p>
            </div>

            {/* Question */}
            <div className="px-5 pb-4">
                <div className="text-[15px] text-primary leading-relaxed whitespace-pre-wrap">{q.question_text}</div>
                {q.question_image_url && (
                    <img src={q.question_image_url.startsWith('/') ? `${API_URL}${q.question_image_url}` : q.question_image_url} alt="Question diagram" className="mt-3 max-w-full rounded-lg border" />
                )}
            </div>

            {/* Answer & Mark Scheme Accordions */}
            <div className="border-t border-gray-100">
                {q.answer && (
                    <div>
                        <button onClick={() => setShowAnswer(!showAnswer)} className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" data-testid={`show-answer-${q.id}`}>
                            <span>Answer</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showAnswer ? 'rotate-180' : ''}`} />
                        </button>
                        {showAnswer && (
                            <div className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-green-50/30 border-t border-green-100">
                                {q.answer}
                            </div>
                        )}
                    </div>
                )}
                {q.mark_scheme && (
                    <div className="border-t border-gray-100">
                        <button onClick={() => setShowMarkScheme(!showMarkScheme)} className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" data-testid={`show-ms-${q.id}`}>
                            <span>Mark Scheme</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMarkScheme ? 'rotate-180' : ''}`} />
                        </button>
                        {showMarkScheme && (
                            <div className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-blue-50/30 border-t border-blue-100">
                                {q.mark_scheme}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PracticeQuestions() {
    const { isAuthenticated } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [subject, setSubject] = useState('');
    const [board, setBoard] = useState('');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [paperType, setPaperType] = useState('');
    const [topics, setTopics] = useState([]);
    const [bookmarks, setBookmarks] = useState(new Set());
    const [completions, setCompletions] = useState(new Set());

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (subject) params.set('subject', subject);
            if (board) params.set('board', board);
            if (topic) params.set('topic', topic);
            if (difficulty) params.set('difficulty', difficulty);
            if (paperType) params.set('paper_type', paperType);
            params.set('page', page);
            params.set('limit', 20);
            const res = await axios.get(`${API_URL}/api/questions/browse?${params}`);
            setQuestions(res.data.questions);
            setTotal(res.data.total);
        } catch (err) { console.error('Failed to fetch questions:', err); } finally { setLoading(false); }
    }, [subject, board, topic, difficulty, paperType, page]);

    const fetchTopics = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (subject) params.set('subject', subject);
            if (board) params.set('board', board);
            const res = await axios.get(`${API_URL}/api/questions/topics?${params}`);
            setTopics(res.data);
        } catch (err) { console.error('Failed to fetch topics:', err); }
    }, [subject, board]);

    const fetchUserData = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const [bRes, cRes] = await Promise.all([
                axios.get(`${API_URL}/api/questions/user/bookmarks`, { withCredentials: true }),
                axios.get(`${API_URL}/api/questions/user/completions`, { withCredentials: true }),
            ]);
            setBookmarks(new Set(bRes.data.map(b => b.question_id)));
            setCompletions(new Set(cRes.data.map(c => c.question_id)));
        } catch (err) { console.error('Failed to fetch user data:', err); }
    }, [isAuthenticated]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
    useEffect(() => { fetchTopics(); }, [fetchTopics]);
    useEffect(() => { fetchUserData(); }, [fetchUserData]);

    const handleBookmark = async (qId) => {
        if (!isAuthenticated) { toast.error('Sign in to bookmark questions'); return; }
        try {
            const res = await axios.post(`${API_URL}/api/questions/bookmark/${qId}`, {}, { withCredentials: true });
            setBookmarks(prev => { const s = new Set(prev); res.data.bookmarked ? s.add(qId) : s.delete(qId); return s; });
        } catch { toast.error('Failed to bookmark'); }
    };

    const handleComplete = async (qId) => {
        if (!isAuthenticated) { toast.error('Sign in to track progress'); return; }
        try {
            const res = await axios.post(`${API_URL}/api/questions/complete/${qId}`, {}, { withCredentials: true });
            setCompletions(prev => { const s = new Set(prev); res.data.completed ? s.add(qId) : s.delete(qId); return s; });
        } catch { toast.error('Failed to update'); }
    };

    const totalPages = Math.ceil(total / 20);

    return (
        <div className="pt-16 md:pt-20" data-testid="practice-page">
            {/* Hero */}
            <section className="py-14 md:py-18 bg-gradient-to-b from-slate-50 to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700 mb-5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> Practice Questions
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-4">
                            Exam-Style Practice Questions
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                            Topic-wise structured and MCQ questions for IGCSE, AS & A Level. Practice with answers and mark schemes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="py-6 bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
                <div className="container-custom">
                    <div className="flex flex-wrap gap-3 items-center" data-testid="practice-filters">
                        {/* Subject pills */}
                        <div className="flex gap-2 flex-wrap">
                            {SUBJECTS.map(s => (
                                <button key={s.value} onClick={() => { setSubject(subject === s.value ? '' : s.value); setTopic(''); setPage(1); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${subject === s.value ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                                    data-testid={`filter-subject-${s.value}`}
                                >
                                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-gray-200 hidden md:block" />

                        <select value={board} onChange={e => { setBoard(e.target.value); setPage(1); }} className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" data-testid="filter-board">
                            <option value="">All Boards</option>
                            <option value="igcse">IGCSE</option>
                            <option value="as-level">AS Level</option>
                            <option value="a-level">A Level</option>
                        </select>

                        {topics.length > 0 && (
                            <select value={topic} onChange={e => { setTopic(e.target.value); setPage(1); }} className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" data-testid="filter-topic">
                                <option value="">All Topics</option>
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        )}

                        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" data-testid="filter-difficulty">
                            <option value="">All Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>

                        <select value={paperType} onChange={e => { setPaperType(e.target.value); setPage(1); }} className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm" data-testid="filter-paper-type">
                            <option value="">All Types</option>
                            <option value="mcq">MCQ</option>
                            <option value="structured">Structured</option>
                            <option value="theory">Theory</option>
                        </select>

                        <span className="ml-auto text-sm text-gray-400">{total} question{total !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </section>

            {/* Questions */}
            <section className="py-10 bg-white">
                <div className="container-custom max-w-4xl">
                    {loading ? (
                        <div className="flex flex-col items-center py-16"><div className="spinner mb-3"></div><p className="text-gray-400 text-sm">Loading questions...</p></div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <h3 className="font-bold text-primary mb-1">No questions found</h3>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or check back later.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, i) => (
                                <QuestionCard key={q.id} q={q} bookmarked={bookmarks.has(q.id)} completed={completions.has(q.id)} onBookmark={handleBookmark} onComplete={handleComplete} isAuth={isAuthenticated} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8">
                            <p className="text-sm text-gray-400">Page {page} of {totalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
