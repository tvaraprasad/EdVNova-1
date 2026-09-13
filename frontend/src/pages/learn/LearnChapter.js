import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, FileText, Play, HelpCircle, Download, CheckCircle2, Clock, AlertTriangle, Lightbulb, Bookmark, BookmarkCheck, Lock, Eye, ChevronDown, ChevronLeft, ExternalLink, QrCode, Search, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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

// ── Render rich content (text blocks + inline images) ──
function RichContent({ content }) {
    if (!content) return null;
    // If it's a plain string, render as text
    if (typeof content === 'string') {
        return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">{content}</p>;
    }
    // If it's an array of blocks
    if (Array.isArray(content)) {
        return (
            <div className="space-y-3">
                {content.map((block, i) => {
                    if (block.type === 'text') {
                        return <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">{block.value}</p>;
                    }
                    if (block.type === 'image') {
                        return (
                            <figure key={i} className="my-3">
                                <img src={block.url?.startsWith('/') ? `${API_URL}${block.url}` : block.url} alt={block.caption || ''} className="max-w-full rounded-lg border" />
                                {block.caption && <figcaption className="text-xs text-gray-400 mt-1 text-center">{block.caption}</figcaption>}
                            </figure>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }
    return null;
}

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
                                {c.introduction && <div className="mb-6"><RichContent content={c.introduction} /></div>}
                                {c.sections?.map((s, i) => (
                                    <div key={i} className="mb-6">
                                        <h4 className="text-base font-bold text-primary mb-2">{s.title}</h4>
                                        <RichContent content={s.content} />
                                    </div>
                                ))}
                                {c.definitions?.length > 0 && (
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-5">
                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Key Definitions</p>
                                        {c.definitions.map((d, i) => (
                                            <div key={i} className="mb-2 last:mb-0">
                                                <strong className="text-primary">{d.term}:</strong>{' '}
                                                {typeof d.definition === 'string' ? (
                                                    <span className="text-sm text-gray-700">{d.definition}</span>
                                                ) : (
                                                    <RichContent content={d.definition} />
                                                )}
                                            </div>
                                        ))}
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
        }).catch(err => { console.error('Failed to load bookmarks/completions:', err); });
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
        ...attachments.map(a => ({ ...a, _type: 'asset' })),
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

    const getFileUrl = (item) => item.file_url || item.embed_url || '';
    const getTitle = (item) => item.title || item.original_name || 'Untitled';
    const getType = (item) => item._type === 'worksheet' ? 'Worksheet' : (item.asset_type || 'Document');
    const isDownloadable = (item) => {
        if (item._type === 'worksheet') return item.is_free !== false && (!item.access_level || item.access_level === 'public');
        return (!item.access_level || item.access_level === 'public') && item.file_url;
    };
    const isEmbed = (item) => item.embed_url && !item.file_url;

    return (
        <div className="space-y-3">
            {allDownloads.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isEmbed(item) ? 'bg-red-50' : 'bg-red-50'}`}>
                        {isEmbed(item) ? <Play className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary text-sm truncate">{getTitle(item)}</p>
                        <p className="text-xs text-gray-400">
                            {getType(item)}
                            {item.topic_title && ` · ${item.topic_title}`}
                            {item.description && ` · ${item.description}`}
                        </p>
                    </div>
                    {accessBadge(item.access_level)}
                    {isEmbed(item) ? (
                        <a href={item.embed_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover">
                            <ExternalLink className="w-3 h-3" /> Open
                        </a>
                    ) : isDownloadable(item) ? (
                        <a href={`${API_URL}${getFileUrl(item)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover">
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

                // Fetch learning assets for all topics in this chapter
                const assetPromises = resolvedTopics.map(t =>
                    axios.get(`${API_URL}/api/learning-assets/visible?parent_type=topic&parent_id=${t.id || ''}`).catch(() => ({ data: [] }))
                );
                const assetResults = await Promise.all(assetPromises);
                const allAssets = assetResults.flatMap((r, idx) =>
                    (r.data || []).map(a => ({ ...a, topic_title: resolvedTopics[idx]?.title || '' }))
                );
                setAttachments(allAssets);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [board, subject, chapter]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    if (!chapterData) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Chapter not found</p></div>;

    const publishedCount = topics.filter(t => t.status === 'published').length;
    const completedCount = 0;

    return <CourseWorkspace
        board={board} subject={subject} chapter={chapter}
        chapterData={chapterData} topics={topics} questions={questions}
        videos={videos} worksheets={worksheets} attachments={attachments}
        activeTab={activeTab} setActiveTab={setActiveTab}
        publishedCount={publishedCount} completedCount={completedCount}
        isAuthenticated={isAuthenticated}
    />;
}

// ── Course Workspace Layout (Sidebar + Main) ──
function CourseWorkspace({ board, subject, chapter, chapterData, topics, questions, videos, worksheets, attachments, activeTab, setActiveTab, publishedCount, isAuthenticated }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const navigate = useNavigate();

    // All chapters for this subject (fetch once)
    const [subjectChapters, setSubjectChapters] = useState([]);
    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}`).then(r => setSubjectChapters(r.data.chapters || [])).catch(() => {});
    }, [board, subject]);

    const filteredChapters = sidebarSearch
        ? subjectChapters.filter(c => c.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || c.topics?.some(t => t.title?.toLowerCase().includes(sidebarSearch.toLowerCase())))
        : subjectChapters;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Subject Header */}
            <div className="p-4 border-b border-gray-100">
                <Link to={`/learn/${board}/${subject}`} className="text-xs text-accent hover:underline flex items-center gap-1 mb-2">
                    <ChevronLeft className="w-3 h-3" /> {chapterData?.subject_name}
                </Link>
                <h3 className="font-bold text-primary text-sm leading-snug">{chapterData?.board_name || board?.toUpperCase()} {chapterData?.subject_name}</h3>
            </div>

            {/* Course Search */}
            <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} placeholder="Find a topic..." className="bg-transparent text-xs outline-none flex-1 placeholder:text-gray-400" data-testid="sidebar-search" />
                </div>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto py-2">
                {filteredChapters.map((c) => {
                    const isActive = c.slug === chapter;
                    return (
                        <div key={c.slug}>
                            <button
                                onClick={() => navigate(`/learn/${board}/${subject}/${c.slug}`)}
                                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${isActive ? 'bg-accent/5 text-accent border-l-2 border-accent' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                data-testid={`sidebar-chapter-${c.slug}`}
                            >
                                {c.name}
                            </button>
                            {/* Show topics for active chapter */}
                            {isActive && topics.length > 0 && (
                                <div className="ml-4 border-l border-gray-100 pl-3 py-1 space-y-0.5">
                                    {topics.map((t, idx) => (
                                        <button
                                            key={t.slug}
                                            onClick={() => { setActiveTab('notes'); }}
                                            className="w-full text-left px-2 py-1.5 text-[11px] text-gray-500 hover:text-primary rounded transition-colors flex items-center gap-2"
                                        >
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${t.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{idx + 1}</span>
                                            <span className="truncate">{t.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="learn-chapter-page">
            <div className="flex">
                {/* Desktop Sidebar */}
                {sidebarOpen && (
                    <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border-r border-gray-100 sticky top-16 md:top-20 h-[calc(100vh-5rem)] overflow-hidden" data-testid="course-sidebar">
                        <SidebarContent />
                    </aside>
                )}

                {/* Mobile Sidebar Drawer */}
                {mobileSidebar && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
                        <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl z-10" data-testid="mobile-sidebar">
                            <div className="flex items-center justify-between p-3 border-b">
                                <span className="text-xs font-bold text-gray-500">COURSE OUTLINE</span>
                                <button onClick={() => setMobileSidebar(false)} className="p-1 text-gray-400"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="h-[calc(100%-48px)] overflow-y-auto">
                                <SidebarContent />
                            </div>
                        </aside>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Toolbar: sidebar toggle + breadcrumb */}
                    <div className="bg-white border-b sticky top-16 md:top-20 z-20">
                        <div className="flex items-center gap-3 px-4 md:px-6 py-2.5">
                            <button onClick={() => setMobileSidebar(true)} className="lg:hidden p-1.5 text-gray-400 hover:text-primary rounded" data-testid="mobile-sidebar-toggle">
                                <Menu className="w-5 h-5" />
                            </button>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block p-1.5 text-gray-400 hover:text-primary rounded" data-testid="sidebar-toggle">
                                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                            </button>
                            <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-hidden flex-1 min-w-0">
                                <Link to={`/learn/${board}`} className="hover:text-primary whitespace-nowrap">{board?.toUpperCase()}</Link>
                                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                <Link to={`/learn/${board}/${subject}`} className="hover:text-primary whitespace-nowrap">{chapterData?.subject_name}</Link>
                                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                <span className="text-primary font-medium truncate">{chapterData?.name}</span>
                            </nav>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 overflow-x-auto px-4 md:px-6 pb-2" data-testid="chapter-tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                                    data-testid={`tab-${tab.id}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8 lg:p-10 max-w-4xl">
                        {activeTab === 'overview' && (
                            <div data-testid="tab-content-overview">
                                <h2 className="text-xl font-bold text-primary mb-2">{chapterData?.name}</h2>
                                <p className="text-sm text-gray-500 mb-6">{chapterData?.subject_name} · {topics.length} concepts · {publishedCount} notes · {questions.length} questions</p>

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
                                            {t.status === 'published' && (
                                                <button onClick={() => setActiveTab('notes')} className="text-xs text-accent font-medium hover:underline">View Notes</button>
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
                </main>
            </div>
        </div>
    );
}
