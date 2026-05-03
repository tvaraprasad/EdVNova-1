import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Play, FileText, File, CheckCircle, ChevronDown, ChevronRight, Video, Download } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function CourseContent() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState({});
    const [activeLesson, setActiveLesson] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/content/course/${courseId}`, { withCredentials: true });
                setCourse(res.data);
                if (res.data.modules?.length > 0) {
                    setExpandedModules({ [res.data.modules[0].id]: true });
                }
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        };
        fetchContent();
    }, [courseId]);

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const openLesson = async (lesson) => {
        if (!lesson.video_url && !lesson.pdf_url && !lesson.worksheet_url) {
            if (!course.is_enrolled && !lesson.is_preview) {
                toast.error('Enroll in this course to access lessons');
                return;
            }
            toast.info('No content available for this lesson yet');
            return;
        }
        if (!course.is_enrolled && !lesson.is_preview) {
            toast.error('Enroll in this course to access this lesson');
            return;
        }
        setActiveLesson(lesson);
    };

    const trackDownload = async (lesson, fileUrl, type) => {
        try {
            await axios.post(`${API_URL}/api/downloads/track`, {
                resource_type: 'lesson', resource_id: lesson.id,
                resource_title: lesson.title, file_url: fileUrl
            }, { withCredentials: true });
        } catch { /* silent */ }
        window.open(`${API_URL}${fileUrl}`, '_blank');
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
    if (!course) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Course not found</p></div>;

    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="course-content-page">
            <div className="container-custom py-8 md:py-12">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar - Module/Lesson List */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="premium-card p-6 sticky top-24">
                            <h2 className="font-bold text-primary text-lg mb-1">{course.title}</h2>
                            <p className="text-sm text-gray-500 mb-4">{course.modules?.length || 0} modules · {totalLessons} lessons</p>
                            {!course.is_enrolled && (
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4">
                                    <p className="text-sm text-amber-700 font-medium">Enroll to unlock all lessons</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                {course.modules?.map((mod) => (
                                    <div key={mod.id}>
                                        <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left" data-testid={`module-toggle-${mod.id}`}>
                                            <span className="font-medium text-primary text-sm">{mod.title}</span>
                                            {expandedModules[mod.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                        </button>
                                        {expandedModules[mod.id] && (
                                            <div className="ml-3 space-y-0.5 mb-2">
                                                {mod.lessons?.map((lesson) => {
                                                    const accessible = course.is_enrolled || lesson.is_preview;
                                                    return (
                                                        <button key={lesson.id} onClick={() => openLesson(lesson)}
                                                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-sm transition-colors ${activeLesson?.id === lesson.id ? 'bg-accent/10 text-accent' : accessible ? 'hover:bg-gray-50 text-gray-700' : 'text-gray-400 cursor-not-allowed'}`}
                                                            data-testid={`lesson-btn-${lesson.id}`}
                                                        >
                                                            {accessible ? (
                                                                lesson.has_video ? <Play className="w-3.5 h-3.5 flex-shrink-0" /> : <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                                            ) : (
                                                                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                                            )}
                                                            <span className="flex-1 truncate">{lesson.title}</span>
                                                            {lesson.is_preview && <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded font-medium">Free</span>}
                                                            {lesson.duration && <span className="text-xs text-gray-400">{lesson.duration}</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        {activeLesson ? (
                            <div data-testid="lesson-viewer">
                                <h2 className="text-2xl font-bold text-primary mb-2">{activeLesson.title}</h2>
                                {activeLesson.description && <p className="text-gray-600 mb-6">{activeLesson.description}</p>}

                                {/* Video Player */}
                                {activeLesson.video_url && (
                                    <div className="mb-6">
                                        {activeLesson.video_type === 'youtube' && getYouTubeEmbedUrl(activeLesson.video_url) ? (
                                            <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                                <iframe
                                                    src={getYouTubeEmbedUrl(activeLesson.video_url)}
                                                    title={activeLesson.title}
                                                    className="w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        ) : activeLesson.video_url.startsWith('/api/uploads') ? (
                                            <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                                <video controls className="w-full h-full" src={`${API_URL}${activeLesson.video_url}`} />
                                            </div>
                                        ) : (
                                            <a href={activeLesson.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                <Video className="w-6 h-6 text-accent" />
                                                <span className="font-medium text-primary">Watch Video (External Link)</span>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Materials */}
                                {(activeLesson.pdf_url || activeLesson.worksheet_url) && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-primary">Materials</h3>
                                        {activeLesson.pdf_url && (
                                            <button onClick={() => trackDownload(activeLesson, activeLesson.pdf_url, 'pdf')} className="w-full flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow text-left" data-testid="download-pdf-btn">
                                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-500" /></div>
                                                <div className="flex-1"><p className="font-medium text-primary">Lesson PDF</p><p className="text-xs text-gray-400">Click to download</p></div>
                                                <Download className="w-5 h-5 text-gray-400" />
                                            </button>
                                        )}
                                        {activeLesson.worksheet_url && (
                                            <button onClick={() => trackDownload(activeLesson, activeLesson.worksheet_url, 'worksheet')} className="w-full flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-sm transition-shadow text-left" data-testid="download-worksheet-btn">
                                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><File className="w-5 h-5 text-green-500" /></div>
                                                <div className="flex-1"><p className="font-medium text-primary">Worksheet</p><p className="text-xs text-gray-400">Click to download</p></div>
                                                <Download className="w-5 h-5 text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Play className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">Select a lesson to start</h3>
                                <p className="text-gray-500 max-w-sm">Choose a lesson from the sidebar to view videos, download PDFs, and access worksheets.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
