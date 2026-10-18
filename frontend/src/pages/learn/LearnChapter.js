import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, BookOpen, FileText, Play, HelpCircle, Download, CheckCircle2, Clock, AlertTriangle, Lightbulb, Bookmark, BookmarkCheck, Lock, Eye, ChevronDown, ChevronLeft, ExternalLink, QrCode, Search, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { LessonView } from '../../components/learn/LessonView';
import { CourseOutline } from '../../components/learn/CourseOutline';
import { YouTubeTracker } from '../../components/learn/YouTubeTracker';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'notes', label: 'Concept Notes', icon: FileText },
    { id: 'workbook', label: 'Workbook', icon: HelpCircle },
    { id: 'videos', label: 'Videos', icon: Play },
    { id: 'downloads', label: 'Downloads', icon: Download },
];

// ── Concept Notes: one lesson at a time ──
function NotesPanel({ topics, lessonSlug, lessonProps }) {
    const published = topics.filter(t => t.status === 'published');
    const topic = published.find(t => t.slug === lessonSlug) || published[0];
    if (!topic) {
        return (
            <div className="text-center py-16">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="font-bold text-primary mb-1">Notes Coming Soon</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">Concept notes for this chapter are being prepared.</p>
            </div>
        );
    }
    return <LessonView key={topic.slug} topic={topic} {...lessonProps(topic)} />;
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
function VideosPanel({ videos, isAuthenticated, progress = {}, onProgress }) {
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
                        {ytId && v.status === 'available' && isAuthenticated ? (
                            <YouTubeTracker videoId={v.id} ytId={ytId} title={v.title} startAt={progress[v.id]?.completed ? 0 : progress[v.id]?.position || 0} onProgress={res => onProgress(v, res)} />
                        ) : ytId && v.status === 'available' ? (
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
                                        <span className={`px-1.5 py-0.5 rounded ${v.required ? 'bg-tint text-accent font-semibold' : 'bg-slate-50 text-slate-500'}`} data-testid={`video-required-${v.id}`}>{v.required ? 'Required' : 'Optional'}</span>
                                    </div>
                                    {isAuthenticated && v.status === 'available' && (
                                        <div className="mt-3 flex items-center gap-2 text-xs" data-testid={`video-progress-${v.id}`}>
                                            {progress[v.id]?.completed
                                                ? <span className="inline-flex items-center gap-1 text-emerald-700 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Watched</span>
                                                : <><div className="ev-progress w-28"><span style={{ width: `${progress[v.id]?.watched_percent || 0}%` }} /></div><span className="text-slate-500 tabular-nums">{progress[v.id]?.watched_percent || 0}% watched</span></>}
                                        </div>
                                    )}
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
    const { isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const lessonParam = searchParams.get('lesson');
    const [chapterData, setChapterData] = useState(null);
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [worksheets, setWorksheets] = useState([]);
    const [videos, setVideos] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(lessonParam ? 'notes' : 'overview');
    const [course, setCourse] = useState(null);
    const [videoProgress, setVideoProgress] = useState({});
    const [justCompleted, setJustCompleted] = useState(null);
    const [milestone, setMilestone] = useState(null);

    const loadCourse = useCallback(() => {
        axios.get(`${API_URL}/api/progress/course/${board}/${subject}`, { withCredentials: true }).then(r => setCourse(r.data)).catch(() => {});
    }, [board, subject]);

    useEffect(() => { loadCourse(); }, [loadCourse, isAuthenticated]);

    const dataBoard = chapterData?.board_slug || board;

    useEffect(() => {
        if (!isAuthenticated || !chapterData) { setVideoProgress({}); return; }
        axios.get(`${API_URL}/api/progress/videos/${dataBoard}/${subject}/${chapter}`, { withCredentials: true }).then(r => setVideoProgress(r.data || {})).catch(() => {});
    }, [dataBoard, subject, chapter, isAuthenticated, chapterData]);

    useEffect(() => {
        setLoading(true);
        setJustCompleted(null);
        setMilestone(null);
        if (lessonParam) setActiveTab('notes');
        const fetchAll = async () => {
            try {
                const chRes = await axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}/${chapter}`);
                const src = chRes.data.board_slug || board;
                const [qRes, wRes, vRes] = await Promise.all([
                    axios.get(`${API_URL}/api/questions/browse?board=${src}&subject=${subject}&topic=${chapter}&limit=50`).catch(() => ({ data: { questions: [] } })),
                    axios.get(`${API_URL}/api/worksheets/browse?board=${src}&subject=${subject}&chapter=${chapter}`).catch(() => ({ data: { worksheets: [] } })),
                    axios.get(`${API_URL}/api/videos/chapter/${src}/${subject}/${chapter}`).catch(() => ({ data: [] })),
                ]);
                setChapterData(chRes.data);
                const topicResults = await Promise.all((chRes.data.topics || []).filter(t => t.status === 'published').map(t =>
                    axios.get(`${API_URL}/api/curriculum/boards/${src}/${subject}/${chapter}/${t.slug}`).catch(() => null)
                ));
                const full = Object.fromEntries(topicResults.filter(Boolean).map(r => [r.data.slug, r.data]));
                const resolvedTopics = (chRes.data.topics || []).map(t => full[t.slug] || t);
                setTopics(resolvedTopics);
                setQuestions(qRes.data.questions || []);
                setWorksheets(wRes.data.worksheets || []);
                setVideos(Array.isArray(vRes.data) ? vRes.data : []);
                const assetResults = await Promise.all(resolvedTopics.map(t =>
                    axios.get(`${API_URL}/api/learning-assets/visible?parent_type=topic&parent_id=${t.id || ''}`).catch(() => ({ data: [] }))
                ));
                setAttachments(assetResults.flatMap((r, idx) => (r.data || []).map(a => ({ ...a, topic_title: resolvedTopics[idx]?.title || '' }))));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board, subject, chapter]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    if (!chapterData) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Chapter not found</p></div>;

    return <CourseWorkspace
        board={board} dataBoard={dataBoard} subject={subject} chapter={chapter}
        chapterData={chapterData} topics={topics} questions={questions}
        videos={videos} worksheets={worksheets} attachments={attachments}
        activeTab={activeTab} setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
        course={course} setCourse={setCourse} loadCourse={loadCourse}
        lessonParam={lessonParam} setSearchParams={setSearchParams}
        videoProgress={videoProgress} setVideoProgress={setVideoProgress}
        justCompleted={justCompleted} setJustCompleted={setJustCompleted}
        milestone={milestone} setMilestone={setMilestone}
    />;
}

function statusMap(course) {
    const m = {};
    course?.chapters?.forEach(c => c.topics.forEach(t => { m[`${c.slug}/${t.slug}`] = t.status; }));
    return m;
}

// ── Course Workspace Layout (Sidebar + Main) ──
function CourseWorkspace({ board, dataBoard, subject, chapter, chapterData, topics, questions, videos, worksheets, attachments, activeTab, setActiveTab, isAuthenticated, course, setCourse, loadCourse, lessonParam, setSearchParams, videoProgress, setVideoProgress, justCompleted, setJustCompleted, milestone, setMilestone }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState(false);
    const navigate = useNavigate();

    const statuses = useMemo(() => statusMap(course), [course]);
    const courseTopic = slug => course?.chapters?.find(c => c.slug === chapter)?.topics.find(t => t.slug === slug);
    const published = topics.filter(t => t.status === 'published');
    const seq = useMemo(() => (course?.chapters || []).flatMap(c => c.topics.filter(t => t.available).map(t => ({ chapter: c.slug, topic: t.slug, title: t.title }))), [course]);

    const defaultLesson = (() => {
        if (lessonParam && published.some(t => t.slug === lessonParam)) return lessonParam;
        const lv = course?.last_visited;
        if (lv?.chapter === chapter && published.some(t => t.slug === lv.topic)) return lv.topic;
        return (published.find(t => statuses[`${chapter}/${t.slug}`] !== 'completed') || published[0])?.slug;
    })();
    const activeLesson = activeTab === 'notes' ? defaultLesson : lessonParam;

    const goTo = useCallback((ch, slug) => {
        setMobileSidebar(false);
        setJustCompleted(null);
        setMilestone(null);
        if (ch === chapter) {
            setActiveTab('notes');
            setSearchParams({ lesson: slug }, { replace: false });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate(`/learn/${board}/${subject}/${ch}?lesson=${slug}`);
        }
    }, [chapter, board, subject, navigate, setActiveTab, setSearchParams, setJustCompleted, setMilestone]);

    const setLocalStatus = (slug, status) => setCourse(c => c && ({
        ...c, chapters: c.chapters.map(ch => ch.slug !== chapter ? ch : { ...ch, topics: ch.topics.map(t => t.slug === slug && t.status !== 'completed' ? { ...t, status } : t) }),
        last_visited: { chapter, topic: slug, title: topics.find(t => t.slug === slug)?.title },
    }));

    const onVisit = useCallback(slug => {
        axios.post(`${API_URL}/api/progress/visit`, { board: dataBoard, subject, chapter, topic: slug, view_board: board }, { withCredentials: true })
            .then(() => setLocalStatus(slug, 'in_progress')).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [board, dataBoard, subject, chapter]);

    const onComplete = async slug => {
        const res = await axios.post(`${API_URL}/api/progress/complete`, { board: dataBoard, subject, chapter, topic: slug }, { withCredentials: true });
        setCourse(res.data.course);
        setJustCompleted(res.data.newly_completed ? slug : null);
        setMilestone(res.data.chapter_completed_first_time ? slug : null);
    };

    const onVideoProgress = (v, res) => {
        setVideoProgress(p => ({ ...p, [v.id]: { ...p[v.id], ...res } }));
        if (res.newly_completed) {
            toast.success(res.chapter_completed_first_time ? 'Video watched. Chapter completed. Well done!' : 'Video marked as watched');
            if (v.required) loadCourse();
        }
    };

    const onSubtopic = async (slug, subId) => {
        const res = await axios.post(`${API_URL}/api/progress/subtopic`, { board: dataBoard, subject, chapter, topic: slug, subtopic: subId }, { withCredentials: true });
        setCourse(c => c && ({ ...c, chapters: c.chapters.map(ch => ch.slug !== chapter ? ch : { ...ch, topics: ch.topics.map(t => t.slug === slug ? { ...t, subtopics_completed: res.data.subtopics_completed } : t) }) }));
        if (res.data.lesson_completed) { setJustCompleted(slug); loadCourse(); }
    };

    const lessonProps = topic => {
        const i = seq.findIndex(s => s.chapter === chapter && s.topic === topic.slug);
        const prev = i > 0 ? seq[i - 1] : null;
        const next = i >= 0 && i < seq.length - 1 ? seq[i + 1] : null;
        const idx = published.findIndex(t => t.slug === topic.slug);
        return {
            status: statuses[`${chapter}/${topic.slug}`] || 'not_started',
            position: { index: idx + 1, total: published.length },
            prev, next, onGo: s => goTo(s.chapter, s.topic),
            onVisit, onComplete, isAuthenticated,
            justCompleted: justCompleted === topic.slug, chapterDone: milestone === topic.slug,
            board, subject, chapter,
            journey: {
                subtopics: courseTopic(topic.slug)?.subtopics || topic.subtopics || [],
                subtopicsDone: courseTopic(topic.slug)?.subtopics_completed || [],
                onSubtopic: subId => onSubtopic(topic.slug, subId),
                attachments: attachments.filter(a => a.topic_title === topic.title),
                videoCount: videos.filter(v => v.status === 'available').length,
                questionCount: questions.length,
                onOpenTab: setActiveTab,
            },
        };
    };

    const outline = (
        <CourseOutline course={course} board={board} subject={subject} chapter={chapter} activeLesson={activeLesson}
            onSelect={goTo} isAuthenticated={isAuthenticated} subjectName={chapterData?.subject_name} boardName={course?.board_name} />
    );
    const chProgress = course?.chapters?.find(c => c.slug === chapter);

    return (
        <div className="pt-[60px] md:pt-[72px] min-h-screen bg-background" data-testid="learn-chapter-page">
            <div className="flex">
                {sidebarOpen && (
                    <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border-r border-slate-100 sticky top-[72px] h-[calc(100vh-72px)] overflow-hidden" data-testid="course-sidebar">
                        {outline}
                    </aside>
                )}

                {mobileSidebar && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-navy/40" onClick={() => setMobileSidebar(false)} />
                        <aside className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white shadow-pop z-10 flex flex-col" data-testid="mobile-sidebar">
                            <div className="flex items-center justify-between p-3 border-b">
                                <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">Course outline</span>
                                <button onClick={() => setMobileSidebar(false)} aria-label="Close course outline" className="p-1 text-slate-500" data-testid="mobile-sidebar-close"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="flex-1 min-h-0">{outline}</div>
                        </aside>
                    </div>
                )}

                <main className="flex-1 min-w-0">
                    <div className="bg-white/95 border-b border-slate-100 sticky top-[60px] md:top-[72px] z-20">
                        <div className="flex items-center gap-3 px-4 md:px-6 py-2.5">
                            <button onClick={() => setMobileSidebar(true)} aria-label="Open course outline" className="lg:hidden p-1.5 text-slate-500 hover:text-primary rounded" data-testid="mobile-sidebar-toggle">
                                <Menu className="w-5 h-5" />
                            </button>
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Hide course outline' : 'Show course outline'} className="hidden lg:block p-1.5 text-slate-500 hover:text-primary rounded" data-testid="sidebar-toggle">
                                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                            </button>
                            <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden flex-1 min-w-0" aria-label="Breadcrumb">
                                <Link to={`/learn/${board}`} className="hover:text-primary whitespace-nowrap">{board?.toUpperCase()}</Link>
                                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                <Link to={`/learn/${board}/${subject}`} className="hover:text-primary whitespace-nowrap">{chapterData?.subject_name}</Link>
                                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                <span className="text-primary font-medium truncate">{chapterData?.name}</span>
                            </nav>
                            {isAuthenticated && chProgress?.total > 0 && (
                                <span className="hidden sm:inline text-[11px] text-slate-500 tabular-nums whitespace-nowrap" data-testid="toolbar-chapter-progress">{chProgress.completed} of {chProgress.total} completed</span>
                            )}
                        </div>

                        <div className="flex gap-1 overflow-x-auto px-4 md:px-6" role="tablist" data-testid="chapter-tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-accent' : 'text-slate-500 hover:text-primary'}`}
                                    data-testid={`tab-${tab.id}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                    <span className={`absolute left-2 right-2 -bottom-px h-[2px] rounded-full bg-accent transition-opacity duration-200 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 md:p-8 lg:p-10 max-w-4xl">
                        {activeTab === 'overview' && (
                            <div data-testid="tab-content-overview">
                                <h2 className="text-xl font-bold text-primary mb-2">{chapterData?.name}</h2>
                                <p className="text-sm text-slate-500 mb-6">{chapterData?.subject_name} · {topics.length} concepts · {published.length} lessons available · {questions.length} questions</p>
                                {isAuthenticated && chProgress?.total > 0 && (
                                    <div className="ev-card p-4 mb-5" data-testid="overview-chapter-progress">
                                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2"><span>{chProgress.completed} of {chProgress.total} completed</span><span className="font-semibold text-primary tabular-nums">{chProgress.percent}%</span></div>
                                        <div className="ev-progress"><span style={{ width: `${chProgress.percent}%` }} /></div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {topics.map((t, idx) => {
                                        const st = statuses[`${chapter}/${t.slug}`];
                                        return (
                                            <div key={t.slug} className="ev-card flex items-center gap-4 p-4" data-testid={`overview-topic-${t.slug}`}>
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isAuthenticated && st === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {isAuthenticated && st === 'completed' ? <CheckCircle2 className="w-4 h-4" aria-label="Completed" /> : idx + 1}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-primary text-sm">{t.title}</p>
                                                    <div className="flex items-center gap-3 mt-0.5 text-xs">
                                                        <span className="text-slate-500">{t.study_time}</span>
                                                        {t.status !== 'published' ? <span className="text-slate-400">Coming soon</span>
                                                            : isAuthenticated && st === 'completed' ? <span className="text-emerald-700">Completed</span>
                                                            : isAuthenticated && st === 'in_progress' ? <span className="text-accent">In progress</span>
                                                            : <span className="text-slate-500">Available</span>}
                                                    </div>
                                                </div>
                                                {t.status === 'published' && (
                                                    <button onClick={() => goTo(chapter, t.slug)} className="text-xs text-accent font-semibold hover:underline" data-testid={`open-lesson-${t.slug}`}>
                                                        {isAuthenticated && st === 'completed' ? 'Review lesson' : 'Open lesson'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div data-testid="tab-content-notes">
                                <NotesPanel topics={topics} lessonSlug={defaultLesson} lessonProps={lessonProps} />
                            </div>
                        )}

                        {activeTab === 'workbook' && (
                            <div data-testid="tab-content-workbook">
                                <h2 className="text-xl font-bold text-primary mb-6">Workbook Questions</h2>
                                <WorkbookPanel questions={questions} board={dataBoard} subject={subject} chapter={chapter} isAuth={isAuthenticated} />
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div data-testid="tab-content-videos">
                                <h2 className="text-xl font-bold text-primary mb-6">Video Explanations</h2>
                                <VideosPanel videos={videos} isAuthenticated={isAuthenticated} progress={videoProgress} onProgress={onVideoProgress} />
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
