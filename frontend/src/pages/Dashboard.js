import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Target, ArrowRight, Play, FileText, HelpCircle, Calendar, Sparkles, CheckCircle2, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContinueLearning } from '../components/ContinueLearning';
import AIMentor from '../components/AIMentor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function QuickActionCard({ icon: Icon, title, description, href, color, testId }) {
    return (
        <Link to={href} className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all" data-testid={testId}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-primary text-sm mb-1 group-hover:text-accent transition-colors">{title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
        </Link>
    );
}

function SubjectCard({ name, icon, color, chapters, published, board, slug }) {
    return (
        <Link to={`/learn/${board}/${slug}`} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all" data-testid={`subject-${slug}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <span className="text-lg">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-sm">{name}</p>
                <p className="text-xs text-gray-400">{chapters} chapters · {published} notes available</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
        </Link>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [recentTopics, setRecentTopics] = useState([]);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'mentor' ? 'mentor' : 'overview');
    const mentorContext = searchParams.get('tab') === 'mentor' && searchParams.get('topic')
        ? { board: searchParams.get('board') || 'igcse', subject: searchParams.get('subject') || '', topic: searchParams.get('topic') } : null;
    const [loading, setLoading] = useState(true);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/courses/user/enrollments`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/api/curriculum/boards/igcse`).catch(() => ({ data: { subjects: [] } })),
                ]);
                setEnrollments(enrollRes.data);
                setSubjects(subjectsRes.data.subjects || []);

                // Get some published topics for "Continue Learning"
                if (user?.role === 'admin') {
                    const topicRes = await axios.get(`${API_URL}/api/curriculum/admin/topics?status=published&limit=5&page=1`, { withCredentials: true }).catch(() => ({ data: { topics: [] } }));
                    setRecentTopics(topicRes.data.topics || []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.role]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    }

    const SUBJECT_VISUALS = {
        mathematics: { icon: '∑', color: 'bg-blue-50 text-blue-600' },
        physics: { icon: '⚛', color: 'bg-violet-50 text-violet-600' },
        chemistry: { icon: '⚗', color: 'bg-green-50 text-green-600' },
        biology: { icon: '🧬', color: 'bg-emerald-50 text-emerald-600' },
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'mentor', label: 'AI Mentor' },
    ];

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="student-dashboard">
            <div className="container-custom py-8 md:py-12">
                {/* Welcome + Next Step */}
                <div className="mb-10">
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary mb-1">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="text-gray-500">What would you like to work on today?</p>
                </div>

                {/* Quick Actions — "What should I do next?" */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10" data-testid="quick-actions">
                    <QuickActionCard
                        icon={BookOpen} title="Learn" description="Study concepts with structured notes and explanations"
                        href="/learn" color="bg-blue-50 text-blue-600" testId="action-learn"
                    />
                    <QuickActionCard
                        icon={HelpCircle} title="Practise" description="Attempt questions and test your understanding"
                        href="/practice" color="bg-amber-50 text-amber-600" testId="action-practise"
                    />
                    <QuickActionCard
                        icon={FileText} title="Past Papers" description="Browse Cambridge papers, mark schemes, and reports"
                        href="/exam/past-papers" color="bg-green-50 text-green-600" testId="action-papers"
                    />
                    <QuickActionCard
                        icon={Sparkles} title="AI Mentor" description="Ask questions and get guided explanations"
                        href="#" color="bg-violet-50 text-violet-600" testId="action-mentor"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-50'}`} data-testid={`dash-tab-${t.id}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <ContinueLearning />

                            {/* Recently published (admin) */}
                            {recentTopics.length > 0 && (
                                <div data-testid="recent-topics">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-primary text-base">Recently published</h2>
                                        <Link to="/learn" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">Browse All <ArrowRight className="w-3 h-3" /></Link>
                                    </div>
                                    <div className="space-y-2">
                                        {recentTopics.slice(0, 3).map(t => (
                                            <Link key={t.id} to={`/learn/${t.board_slug}/${t.subject_slug}/${t.chapter_slug}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
                                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="w-5 h-5 text-accent" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-primary text-sm group-hover:text-accent transition-colors">{t.title}</p>
                                                    <p className="text-xs text-gray-400">{t.subject_slug?.replace(/\b\w/g, c => c.toUpperCase())} · {t.chapter_title}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-accent transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subjects */}
                            <div data-testid="your-subjects">
                                <h2 className="font-bold text-primary text-base mb-4">Your Subjects</h2>
                                <div className="space-y-2">
                                    {subjects.map(s => {
                                        const vis = SUBJECT_VISUALS[s.slug] || { icon: '📚', color: 'bg-gray-50 text-gray-600' };
                                        return (
                                            <SubjectCard
                                                key={s.slug}
                                                name={s.name}
                                                icon={vis.icon}
                                                color={vis.color}
                                                chapters={s.chapter_count}
                                                published={s.topic_count}
                                                board="igcse"
                                                slug={s.slug}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* My Courses */}
                            {enrollments.length > 0 && (
                                <div>
                                    <h2 className="font-bold text-primary text-base mb-4">My Courses</h2>
                                    <div className="space-y-2">
                                        {enrollments.map((e, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-indigo-600" /></div>
                                                <div className="flex-1"><p className="font-medium text-primary text-sm">{e.course_title}</p><p className="text-xs text-gray-400">Enrolled {new Date(e.enrolled_at).toLocaleDateString()}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="p-5 bg-white rounded-xl border border-gray-100" data-testid="quick-stats">
                                <h3 className="font-bold text-primary text-sm mb-4">Your Learning</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Subjects</span>
                                        <span className="text-sm font-bold text-primary">{subjects.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Courses Enrolled</span>
                                        <span className="text-sm font-bold text-primary">{enrollments.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Topics Available</span>
                                        <span className="text-sm font-bold text-primary">{subjects.reduce((s, sub) => s + sub.topic_count, 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Explore More */}
                            <div className="p-5 bg-white rounded-xl border border-gray-100">
                                <h3 className="font-bold text-primary text-sm mb-4">Explore</h3>
                                <div className="space-y-2">
                                    <Link to="/exam/past-papers" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Past Paper Library</span>
                                    </Link>
                                    <Link to="/practice" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        <HelpCircle className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Practice Questions</span>
                                    </Link>
                                    <Link to="/workshops" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Workshops</span>
                                    </Link>
                                    <Link to="/programs" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Play className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">Live Courses</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mentor' && (
                    <div className="max-w-3xl">
                        <AIMentor initialContext={mentorContext} />
                    </div>
                )}
            </div>
        </div>
    );
}
