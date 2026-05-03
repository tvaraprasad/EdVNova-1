import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Clock, BookOpen, Bookmark, BookmarkCheck, ChevronLeft, CheckCircle2, AlertTriangle, Lightbulb, ListChecks, FlaskConical, Calculator, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function TopicPage() {
    const { board, subject, chapter, topic: topicSlug } = useParams();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookmarked, setBookmarked] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [activeToc, setActiveToc] = useState('');
    const topicPath = `${board}/${subject}/${chapter}/${topicSlug}`;

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}/${chapter}/${topicSlug}`)
            .then(res => { setData(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [board, subject, chapter, topicSlug]);

    useEffect(() => {
        if (!user) return;
        axios.get(`${API_URL}/api/curriculum/user/bookmarks`, { withCredentials: true })
            .then(res => { if (res.data.some(b => b.topic_path === topicPath)) setBookmarked(true); }).catch(() => {});
        axios.get(`${API_URL}/api/curriculum/user/progress`, { withCredentials: true })
            .then(res => { if (res.data.some(p => p.topic_path === topicPath)) setCompleted(true); }).catch(() => {});
    }, [user, topicPath]);

    const toggleBookmark = useCallback(async () => {
        if (!user) { toast.error('Login to bookmark'); return; }
        try {
            const res = await axios.post(`${API_URL}/api/curriculum/user/bookmark`, { topic_path: topicPath, topic_title: data?.title, board_slug: board, subject_slug: subject }, { withCredentials: true });
            setBookmarked(res.data.bookmarked);
            toast.success(res.data.bookmarked ? 'Bookmarked' : 'Bookmark removed');
        } catch { toast.error('Failed'); }
    }, [user, topicPath, data, board, subject]);

    const toggleComplete = useCallback(async () => {
        if (!user) { toast.error('Login to track progress'); return; }
        try {
            const res = await axios.post(`${API_URL}/api/curriculum/user/progress`, { topic_path: topicPath, board_slug: board, subject_slug: subject }, { withCredentials: true });
            setCompleted(res.data.completed);
            toast.success(res.data.completed ? 'Marked complete' : 'Unmarked');
        } catch { toast.error('Failed'); }
    }, [user, topicPath, board, subject]);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('[data-toc-id]');
            let current = '';
            sections.forEach(section => {
                if (section.getBoundingClientRect().top < 150) current = section.getAttribute('data-toc-id');
            });
            setActiveToc(current);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
    if (!data) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Topic not found</p></div>;

    const c = data.content || {};
    const tocItems = [];
    if (c.introduction) tocItems.push({ id: 'introduction', label: 'Introduction' });
    c.sections?.forEach((s, i) => tocItems.push({ id: `section-${i}`, label: s.title }));
    if (c.definitions?.length) tocItems.push({ id: 'definitions', label: 'Key Definitions' });
    if (c.formulas?.length) tocItems.push({ id: 'formulas', label: 'Formulas' });
    if (c.worked_examples?.length) tocItems.push({ id: 'worked-examples', label: 'Worked Examples' });
    if (c.common_mistakes?.length) tocItems.push({ id: 'common-mistakes', label: 'Common Mistakes' });
    if (c.examiner_tips?.length) tocItems.push({ id: 'examiner-tips', label: 'Examiner Tips' });
    if (c.summary?.length) tocItems.push({ id: 'summary', label: 'Summary' });

    const hasContent = c.introduction || c.sections?.length || c.definitions?.length;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="topic-page">
            {/* Breadcrumb + Hero */}
            <section className="py-10 md:py-14 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap" data-testid="topic-breadcrumb">
                        <Link to="/boards" className="hover:text-primary">Boards</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/${board}`} className="hover:text-primary capitalize">{board?.replace('-', ' ')}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/${board}/${subject}`} className="hover:text-primary capitalize">{data.subject_title}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/${board}/${subject}/${chapter}`} className="hover:text-primary">{data.chapter_title}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{data.title}</span>
                    </nav>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3" data-testid="topic-title">{data.title}</h1>
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Clock className="w-4 h-4" /> {data.study_time}</span>
                                <span className="flex items-center gap-1.5 text-sm text-gray-500"><BookOpen className="w-4 h-4" /> {data.chapter_title}</span>
                                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${data.difficulty === 'easy' ? 'bg-green-100 text-green-700' : data.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{data.difficulty}</span>
                                {data.updated_at && <span className="text-xs text-gray-400">Updated {new Date(data.updated_at).toLocaleDateString()}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={toggleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${bookmarked ? 'bg-accent/10 text-accent border-accent/20' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} data-testid="bookmark-btn">
                                {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                {bookmarked ? 'Saved' : 'Save'}
                            </button>
                            <button onClick={toggleComplete} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${completed ? 'bg-green-50 text-green-700 border-green-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} data-testid="complete-btn">
                                <CheckCircle2 className="w-4 h-4" /> {completed ? 'Completed' : 'Mark Complete'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 md:py-16">
                <div className="container-custom">
                    {!hasContent ? (
                        <div className="max-w-2xl mx-auto text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6"><BookOpen className="w-10 h-10 text-gray-300" /></div>
                            <h2 className="text-2xl font-bold text-primary mb-3">Content Coming Soon</h2>
                            <p className="text-gray-500">Our expert educators are preparing revision notes for this topic. Check back soon.</p>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-4 gap-10">
                            {/* Sticky TOC */}
                            {tocItems.length > 0 && (
                                <aside className="hidden lg:block lg:col-span-1">
                                    <nav className="sticky top-24 premium-card p-5" data-testid="topic-toc">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
                                        <ul className="space-y-1">
                                            {tocItems.map(item => (
                                                <li key={item.id}>
                                                    <a href={`#${item.id}`} className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${activeToc === item.id ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>{item.label}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </aside>
                            )}

                            {/* Content Area */}
                            <div className={`${tocItems.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4 max-w-3xl'}`}>
                                <article className="prose-custom">
                                    {/* Introduction */}
                                    {c.introduction && (
                                        <div id="introduction" data-toc-id="introduction" className="mb-10">
                                            <p className="text-gray-700 text-lg leading-relaxed">{c.introduction}</p>
                                        </div>
                                    )}

                                    {/* Sections */}
                                    {c.sections?.map((section, idx) => (
                                        <div key={idx} id={`section-${idx}`} data-toc-id={`section-${idx}`} className="mb-10">
                                            <h2 className="text-2xl font-bold text-primary mb-4">{section.title}</h2>
                                            {section.content.split('\n\n').map((para, pi) => (
                                                <p key={pi} className="text-gray-700 leading-relaxed mb-3">{para}</p>
                                            ))}
                                        </div>
                                    ))}

                                    {/* Definitions */}
                                    {c.definitions?.length > 0 && (
                                        <div id="definitions" data-toc-id="definitions" className="mb-10 rounded-xl border-l-4 border-blue-500 bg-blue-50/50 p-6" data-testid="definitions-box">
                                            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Key Definitions</h3>
                                            <div className="space-y-3">
                                                {c.definitions.map((d, i) => (
                                                    <div key={i}>
                                                        <dt className="font-semibold text-blue-900">{d.term}</dt>
                                                        <dd className="text-blue-800/80 text-sm mt-0.5">{d.definition}</dd>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Formulas */}
                                    {c.formulas?.length > 0 && (
                                        <div id="formulas" data-toc-id="formulas" className="mb-10 rounded-xl border-l-4 border-purple-500 bg-purple-50/50 p-6" data-testid="formulas-box">
                                            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2"><Calculator className="w-5 h-5" /> Formulas</h3>
                                            <div className="space-y-4">
                                                {c.formulas.map((f, i) => (
                                                    <div key={i} className="bg-white rounded-lg p-4 border border-purple-100">
                                                        <p className="font-semibold text-purple-900 text-sm mb-1">{f.name}</p>
                                                        <p className="font-mono text-lg text-purple-700 mb-1">{f.formula}</p>
                                                        <p className="text-sm text-purple-600/70">{f.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Worked Examples */}
                                    {c.worked_examples?.length > 0 && (
                                        <div id="worked-examples" data-toc-id="worked-examples" className="mb-10 rounded-xl border-l-4 border-green-500 bg-green-50/50 p-6" data-testid="examples-box">
                                            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2"><FlaskConical className="w-5 h-5" /> Worked Examples</h3>
                                            {c.worked_examples.map((ex, i) => (
                                                <div key={i} className="bg-white rounded-lg p-5 border border-green-100 mb-3 last:mb-0">
                                                    <p className="font-semibold text-green-900 mb-3">Q: {ex.question}</p>
                                                    <div className="bg-green-50 rounded-lg p-4">
                                                        {ex.solution.split('\n').map((line, li) => (
                                                            <p key={li} className="text-green-800 font-mono text-sm">{line}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Common Mistakes */}
                                    {c.common_mistakes?.length > 0 && (
                                        <div id="common-mistakes" data-toc-id="common-mistakes" className="mb-10 rounded-xl border-l-4 border-amber-500 bg-amber-50/50 p-6" data-testid="mistakes-box">
                                            <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Common Mistakes</h3>
                                            <ul className="space-y-2">
                                                {c.common_mistakes.map((m, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-amber-800"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />{m}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Examiner Tips */}
                                    {c.examiner_tips?.length > 0 && (
                                        <div id="examiner-tips" data-toc-id="examiner-tips" className="mb-10 rounded-xl border-l-4 border-accent bg-accent/5 p-6" data-testid="tips-box">
                                            <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Examiner Tips</h3>
                                            <ul className="space-y-2">
                                                {c.examiner_tips.map((t, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-gray-700"><Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />{t}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {c.summary?.length > 0 && (
                                        <div id="summary" data-toc-id="summary" className="mb-10 rounded-xl border-l-4 border-gray-400 bg-gray-50 p-6" data-testid="summary-box">
                                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5" /> Summary</h3>
                                            <ul className="space-y-2">
                                                {c.summary.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-gray-700"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </article>

                                {/* Related Topics */}
                                {data.related_topics?.length > 0 && (
                                    <div className="mt-12 pt-8 border-t">
                                        <h3 className="text-lg font-bold text-primary mb-4">Related Topics</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.related_topics.map(rt => (
                                                <Link key={rt.slug} to={`/${board}/${subject}/${chapter}/${rt.slug}`} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-accent/10 hover:text-accent transition-colors">{rt.title}</Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Prev / Next Navigation */}
                                <div className="mt-12 pt-8 border-t grid grid-cols-2 gap-4" data-testid="prev-next-nav">
                                    {data.prev_topic ? (
                                        <Link to={`/${board}/${subject}/${chapter}/${data.prev_topic.slug}`} className="flex items-center gap-3 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow">
                                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                                            <div><p className="text-xs text-gray-400">Previous</p><p className="font-medium text-primary text-sm">{data.prev_topic.title}</p></div>
                                        </Link>
                                    ) : <div />}
                                    {data.next_topic && (
                                        <Link to={`/${board}/${subject}/${chapter}/${data.next_topic.slug}`} className="flex items-center justify-end gap-3 p-4 bg-white border rounded-xl hover:shadow-md transition-shadow text-right">
                                            <div><p className="text-xs text-gray-400">Next</p><p className="font-medium text-primary text-sm">{data.next_topic.title}</p></div>
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
