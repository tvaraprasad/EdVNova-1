import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const DIFF_COLORS = { easy: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function TopicsList() {
    const { board, subject, chapter } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}/${chapter}`).then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, [board, subject, chapter]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
    if (!data) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Chapter not found</p></div>;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="topics-page">
            <section className="py-16 md:py-20 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap" data-testid="breadcrumb">
                        <Link to="/boards" className="hover:text-primary">Boards</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/${board}`} className="hover:text-primary capitalize">{board?.replace('-', ' ')}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/${board}/${subject}`} className="hover:text-primary">{data.subject_name}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{data.name}</span>
                    </nav>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-3">{data.name}</h1>
                    <p className="text-gray-500">{data.topic_count} topics in this chapter</p>
                </div>
            </section>
            <section className="py-16 md:py-20">
                <div className="container-custom max-w-4xl">
                    <div className="space-y-3">
                        {data.topics?.map((topic, idx) => (
                            <Link key={topic.slug} to={`/${board}/${subject}/${chapter}/${topic.slug}`} className="group block" data-testid={`topic-card-${topic.slug}`}>
                                <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">{topic.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {topic.study_time}</span>
                                            <span className={`px-2 py-0.5 text-xs rounded font-medium ${DIFF_COLORS[topic.difficulty] || ''}`}>{topic.difficulty}</span>
                                            {topic.status === 'published' ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="w-3 h-3" /> Published</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-gray-400"><AlertCircle className="w-3 h-3" /> Coming soon</span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
