import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen, FileText, Play, HelpCircle, Download, CheckCircle2, Clock, AlertTriangle, Lightbulb, Bookmark, BookmarkCheck, Lock, Eye, ChevronDown, ExternalLink, QrCode } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'notes', label: 'Concept Notes', icon: FileText },
    { id: 'workbook', label: 'Workbook', icon: HelpCircle },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'downloads', label: 'Downloads', icon: Download },
];

// ── Topic Notes Panel ──
function NotesPanel({ topics, board, subject, chapter }) {
    const [expanded, setExpanded] = useState(null);

    const publishedTopics = topics.filter(t => t.status === 'published');
    const draftTopics = topics.filter(t => t.status !== 'published');

    if (publishedTopics.length === 0) {
        return (
            <div className="text-center py-16">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-primary mb-1">Notes Coming Soon</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">Our educators are preparing detailed concept notes for this chapter.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {publishedTopics.map((topic) => {
                const c = topic.content || {};
                const isOpen = expanded === topic.slug;
                return (
                    <div key={topic.slug} className="border border-gray-100 rounded-xl overflow-hidden bg-white" data-testid={`note-${topic.slug}`}>
                        <button onClick={() => setExpanded(isOpen ? null : topic.slug)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left">
                            <div className="w-8 h-8 bg-accent/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-primary text-sm">{topic.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{topic.study_time} · {topic.difficulty}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <div className="px-5 pb-6 border-t border-gray-50 pt-4">
                                {c.introduction && <p className="text-gray-700 leading-relaxed mb-6">{c.introduction}</p>}
                                {c.sections?.map((s, i) => (
                                    <div key={i} className="mb-6">
                                        <h4 className="text-base font-bold text-primary mb-2">{s.title}</h4>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">{s.content}</p>
                                    </div>
                                ))}
                                {c.definitions?.length > 0 && (
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-5">
                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Key Definitions</p>
                                        {c.definitions.map((d, i) => <p key={i} className="text-sm text-gray-700 mb-1.5"><strong className="text-primary">{d.term}:</strong> {d.definition}</p>)}
                                    </div>
                                )}
                                {c.formulas?.length > 0 && (
                                    <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl mb-5">
                                        <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">Formulas</p>
                                        {c.formulas.map((f, i) => (
                                            <div key={i} className="flex items-baseline gap-3 mb-2">
                                                <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border text-violet-700">{f.formula}</code>
                                                <span className="text-sm text-gray-600">{f.name} — {f.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {c.worked_examples?.length > 0 && (
                                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl mb-5">
                                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">Worked Examples</p>
                                        {c.worked_examples.map((w, i) => (
                                            <div key={i} className="mb-4 last:mb-0">
                                                <p className="text-sm font-medium text-primary mb-1">Q: {w.question}</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">A: {w.solution}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(c.examiner_tips?.length > 0 || c.common_mistakes?.length > 0) && (
                                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                                        {c.examiner_tips?.length > 0 && (
                                            <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                                                <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Examiner Tips</p>
                                                <ul className="space-y-1">{c.examiner_tips.map((t, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><Lightbulb className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />{t}</li>)}</ul>
                                            </div>
                                        )}
                                        {c.common_mistakes?.length > 0 && (
                                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Common Mistakes</p>
                                                <ul className="space-y-1">{c.common_mistakes.map((m, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />{m}</li>)}</ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {c.summary?.length > 0 && (
                                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Summary</p>
                                        <ul className="space-y-1">{c.summary.map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                                    </div>
                                )}
                                <div className="flex justify-end mt-4">
                                    <Link to={`/${board}/${subject}/${chapter}/${topic.slug}`} className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
                                        Full Topic Page <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {draftTopics.length > 0 && (
                <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Coming Soon</p>
                    <div className="space-y-2">
                        {draftTopics.map(t => (
                            <div key={t.slug} className="flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-xl text-gray-400">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm">{t.title}</span>
                                <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full">Coming Soon</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Workbook Panel ──
function WorkbookPanel({ questions, board, subject, chapter, isAuth }) {
    const [showAnswer, setShowAnswer] = useState({});
    const [showMS, setShowMS] = useState({});
    const [bookmarks, setBookmarks] = useState(new Set());
    const [completions, setCompletions] = useState(new Set());

    useEffect(() => {
        if (!isAuth) return;
        Promise.all([
            axios.get(`${API_URL}/api/questions/user/bookmarks`, { withCredentials: true }),
            axios.get(`${API_URL}/api/questions/user/completions`, { withCredentials: true }),
        ]).then(([b, c]) => {
            setBookmarks(new Set(b.data.map(x => x.question_id)));
            setCompletions(new Set(c.data.map(x => x.question_id)));
        }).catch(() => {});
    }, [isAuth]);

    const toggleBookmark = async (id) => {
        if (!isAuth) { toast.error('Sign in to bookmark'); return; }
        const res = await axios.post(`${API_URL}/api/questions/bookmark/${id}`, {}, { withCredentials: true });
        setBookmarks(prev => { const s = new Set(prev); res.data.bookmarked ? s.add(id) : s.delete(id); return s; });
    };
    const toggleComplete = async (id) => {
        if (!isAuth) { toast.error('Sign in to track progress'); return; }
        const res = await axios.post(`${API_URL}/api/questions/complete/${id}`, {}, { withCredentials: true });
        setCompletions(prev => { const s = new Set(prev); res.data.completed ? s.add(id) : s.delete(id); return s; });
    };

    if (questions.length === 0) {
        return (
            <div className="text-center py-16">
                <HelpCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-primary mb-1">Workbook Coming Soon</h3>
                <p className="text-sm text-gray-400">Practice questions for this chapter are being prepared.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {questions.map((q, idx) => {
                const qid = q.id;
                const diffColors = { easy: 'bg-green-50 text-green-700', medium: 'bg-amber-50 text-amber-700', hard: 'bg-red-50 text-red-700' };
                return (
                    <div key={qid} className={`border rounded-xl overflow-hidden bg-white ${completions.has(qid) ? 'border-green-200' : 'border-gray-100'}`} data-testid={`workbook-q-${qid}`}>
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                                    {q.question_id && <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{q.question_id}</span>}
                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${diffColors[q.difficulty] || 'bg-gray-100'}`}>{q.difficulty}</span>
                                    {q.marks > 0 && <span className="text-[10px] text-gray-400">[{q.marks} marks]</span>}
                                </div>
                                {isAuth && (
                                    <div className="flex gap-1">
                                        <button onClick={() => toggleComplete(qid)} className={`p-1 rounded ${completions.has(qid) ? 'text-green-600' : 'text-gray-300 hover:text-green-500'}`}>
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => toggleBookmark(qid)} className={`p-1 rounded ${bookmarks.has(qid) ? 'text-accent' : 'text-gray-300 hover:text-accent'}`}>
                                            {bookmarks.has(qid) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-[15px] text-primary leading-relaxed whitespace-pre-wrap">{q.question_text}</p>
                            {q.question_image_url && <img src={q.question_image_url.startsWith('/') ? `${API_URL}${q.question_image_url}` : q.question_image_url} alt="" className="mt-3 max-w-full rounded-lg border" />}
                        </div>
                        <div className="border-t border-gray-100">
                            {q.answer && (
                                <>
                                    <button onClick={() => setShowAnswer(p => ({...p, [qid]: !p[qid]}))} className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                        <span>Answer</span><ChevronDown className={`w-4 h-4 transition-transform ${showAnswer[qid] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showAnswer[qid] && <div className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-wrap bg-green-50/30 border-t border-green-100">{q.answer}</div>}
                                </>
                            )}
                            {q.mark_scheme && (
                                <div className="border-t border-gray-100">
                                    <button onClick={() => setShowMS(p => ({...p, [qid]: !p[qid]}))} className="w-full flex items-center justify-between px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                        <span>Mark Scheme</span><ChevronDown className={`w-4 h-4 transition-transform ${showMS[qid] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showMS[qid] && <div className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-wrap bg-blue-50/30 border-t border-blue-100">{q.mark_scheme}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Videos Panel ──
function VideosPanel({ videos }) {
    if (!videos || videos.length === 0) {
        return (
            <div className="text-center py-16">
                <Play className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-primary mb-1">Video Explanations Coming Soon</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">Video walkthroughs for every question and concept are being recorded.</p>
                <span className="inline-block mt-4 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full">Coming Soon</span>
            </div>
        );
    }

    const extractYtId = (url) => {
        if (!url) return null;
        const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
    };

    const statusBadge = (status) => {
        const styles = { available: 'bg-green-50 text-green-700', coming_soon: 'bg-amber-50 text-amber-700', premium: 'bg-violet-50 text-violet-700', locked: 'bg-gray-100 text-gray-600', draft: 'bg-slate-100 text-slate-600' };
        return styles[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="space-y-4">
            {videos.map(v => {
                const ytId = extractYtId(v.youtube_url);
                return (
                    <div key={v.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden" data-testid={`video-${v.id}`}>
                        {ytId && v.status === 'available' ? (
                            <div className="aspect-video">
                                <iframe src={`https://www.youtube.com/embed/${ytId}`} title={v.title} className="w-full h-full" allowFullScreen />
                            </div>
                        ) : ytId ? (
                            <div className="relative">
                                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.title} className="w-full aspect-video object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>
                                        {v.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ) : null}
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="font-semibold text-primary text-sm">{v.title}</h4>
                                    {v.description && <p className="text-xs text-gray-500 mt-1">{v.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        {v.question_id && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{v.question_id}</span>}
                                        {v.duration && <span>{v.duration}</span>}
                                        {v.difficulty && <span className="capitalize">{v.difficulty}</span>}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${statusBadge(v.status)}`}>
                                    {v.status?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Downloads Panel ──
function DownloadsPanel({ worksheets, attachments }) {
    const allDownloads = [
        ...worksheets.map(w => ({ ...w, _type: 'worksheet' })),
        ...attachments.filter(a => a.file_url && ['pdf', 'ppt', 'worksheet', 'document', 'notes'].includes(a.attachment_type)).map(a => ({ ...a, _type: 'attachment' })),
    ];

    if (allDownloads.length === 0) {
        return (
            <div className="text-center py-16">
                <Download className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-primary mb-1">Downloads Coming Soon</h3>
                <p className="text-sm text-gray-400">PDF worksheets and resources for this chapter will be available here.</p>
            </div>
        );
    }

    const accessBadge = (level) => {
        if (!level || level === 'public') return null;
        const styles = { registered: 'bg-blue-50 text-blue-700', premium: 'bg-violet-50 text-violet-700', school: 'bg-indigo-50 text-indigo-700' };
        return <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${styles[level] || 'bg-gray-100 text-gray-600'}`}>{level}</span>;
    };

    return (
        <div className="space-y-3">
            {allDownloads.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary text-sm truncate">{item.title || item.original_name}</p>
                        <p className="text-xs text-gray-400">
                            {item._type === 'attachment' ? item.attachment_type : 'Worksheet'}
                            {item.topic_title && ` · ${item.topic_title}`}
                            {item.description && ` · ${item.description}`}
                        </p>
                    </div>
                    {accessBadge(item.access_level)}
                    {(item.is_free !== false && (!item.access_level || item.access_level === 'public')) ? (
                        <a href={`${API_URL}${item.file_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover">
                            <Download className="w-3 h-3" /> Download
                        </a>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" /> {item.access_level || 'Premium'}</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// ═══ MAIN CHAPTER PAGE ═══
export default function LearnChapter() {
    const { board, subject, chapter } = useParams();
    const { user, isAuthenticated } = useAuth();
    const [chapterData, setChapterData] = useState(null);
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [worksheets, setWorksheets] = useState([]);
    const [videos, setVideos] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        setLoading(true);
        const fetchAll = async () => {
            try {
                const [chRes, qRes, wRes, vRes] = await Promise.all([
                    axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}/${chapter}`),
                    axios.get(`${API_URL}/api/questions/browse?board=${board}&subject=${subject}&topic=${chapter}&limit=50`).catch(() => ({ data: { questions: [] } })),
                    axios.get(`${API_URL}/api/worksheets/browse?board=${board}&subject=${subject}&chapter=${chapter}`).catch(() => ({ data: { worksheets: [] } })),
                    axios.get(`${API_URL}/api/videos/chapter/${board}/${subject}/${chapter}`).catch(() => ({ data: [] })),
                ]);
                setChapterData(chRes.data);
                const topicPromises = (chRes.data.topics || []).map(t =>
                    axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}/${chapter}/${t.slug}`).catch(() => null)
                );
                const topicResults = await Promise.all(topicPromises);
                const resolvedTopics = topicResults.filter(Boolean).map(r => r.data);
                setTopics(resolvedTopics);
                setQuestions(qRes.data.questions || []);
                setWorksheets(wRes.data.worksheets || []);
                setVideos(Array.isArray(vRes.data) ? vRes.data : []);

                // Fetch attachments for all topics in this chapter
                const attachPromises = resolvedTopics.map(t =>
                    axios.get(`${API_URL}/api/attachments/topic/${t.id || ''}/visible`).catch(() => ({ data: [] }))
                );
                const attachResults = await Promise.all(attachPromises);
                const allAttachments = attachResults.flatMap((r, idx) =>
                    (r.data || []).map(a => ({ ...a, topic_title: resolvedTopics[idx]?.title || '' }))
                );
                setAttachments(allAttachments);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [board, subject, chapter]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    if (!chapterData) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Chapter not found</p></div>;

    const publishedCount = topics.filter(t => t.status === 'published').length;
    const completedCount = 0; // Future: track per chapter

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="learn-chapter-page">
            {/* Hero */}
            <section className="py-10 md:py-14 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap" data-testid="chapter-breadcrumb">
                        <Link to="/learn" className="hover:text-primary">Learn</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/learn/${board}`} className="hover:text-primary capitalize">{board?.replace('-', ' ')}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/learn/${board}/${subject}`} className="hover:text-primary">{chapterData.subject_name}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{chapterData.name}</span>
                    </nav>

                    <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3" data-testid="chapter-title">{chapterData.name}</h1>
                    <p className="text-gray-600 mb-4">{chapterData.subject_name} · {chapterData.board_name || board}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{topics.length} concepts</span>
                        <span>{publishedCount} published</span>
                        <span>{questions.length} questions</span>
                        {videos.length > 0 && <span>{videos.length} videos</span>}
                        {worksheets.length > 0 && <span>{worksheets.length} downloads</span>}
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="bg-white border-b sticky top-16 md:top-20 z-30">
                <div className="container-custom">
                    <div className="flex gap-1 overflow-x-auto py-2" data-testid="chapter-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                    activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                                }`}
                                data-testid={`tab-${tab.id}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tab Content */}
            <section className="py-10 md:py-14">
                <div className="container-custom max-w-4xl">
                    {activeTab === 'overview' && (
                        <div data-testid="tab-content-overview">
                            <h2 className="text-xl font-bold text-primary mb-6">Chapter Overview</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                                    <p className="text-2xl font-bold text-primary">{topics.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Concepts</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                                    <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
                                    <p className="text-xs text-gray-500 mt-1">Notes Available</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Practice Questions</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 text-center">
                                    <p className="text-2xl font-bold text-amber-600">{worksheets.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Downloads</p>
                                </div>
                            </div>

                            <h3 className="text-base font-bold text-primary mb-4">Topics in this Chapter</h3>
                            <div className="space-y-2">
                                {topics.map((t, idx) => (
                                    <div key={t.slug} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                                        <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-primary text-sm">{t.title}</p>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-gray-400">{t.study_time}</span>
                                                <span className={`text-xs ${t.status === 'published' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {t.status === 'published' ? 'Available' : 'Coming Soon'}
                                                </span>
                                            </div>
                                        </div>
                                        {t.status === 'published' ? (
                                            <button onClick={() => setActiveTab('notes')} className="text-xs text-accent font-medium hover:underline">View Notes</button>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">Coming Soon</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div data-testid="tab-content-notes">
                            <h2 className="text-xl font-bold text-primary mb-6">Concept Notes</h2>
                            <NotesPanel topics={topics} board={board} subject={subject} chapter={chapter} />
                        </div>
                    )}

                    {activeTab === 'workbook' && (
                        <div data-testid="tab-content-workbook">
                            <h2 className="text-xl font-bold text-primary mb-6">Workbook Questions</h2>
                            <WorkbookPanel questions={questions} board={board} subject={subject} chapter={chapter} isAuth={isAuthenticated} />
                        </div>
                    )}

                    {activeTab === 'videos' && (
                        <div data-testid="tab-content-videos">
                            <h2 className="text-xl font-bold text-primary mb-6">Video Explanations</h2>
                            <VideosPanel videos={videos} />
                        </div>
                    )}

                    {activeTab === 'downloads' && (
                        <div data-testid="tab-content-downloads">
                            <h2 className="text-xl font-bold text-primary mb-6">Downloads</h2>
                            <DownloadsPanel worksheets={worksheets} attachments={attachments} />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
