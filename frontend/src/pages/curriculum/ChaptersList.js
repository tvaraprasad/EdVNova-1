import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ChaptersList() {
    const { board, subject } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLearnRoute = window.location.pathname.startsWith('/learn');
    const prefix = isLearnRoute ? '/learn' : '';

    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards/${board}/${subject}`).then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, [board, subject]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
    if (!data) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Subject not found</p></div>;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="chapters-page">
            <section className="py-6 md:py-8 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3 flex-wrap" data-testid="breadcrumb">
                        <Link to={`${prefix || '/boards'}`} className="hover:text-primary">{isLearnRoute ? 'Learn' : 'Boards'}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`${prefix}/${board}`} className="hover:text-primary">{data.board_name}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{data.name}</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1">{data.board_name} {data.name}</h1>
                    <p className="text-sm text-gray-500">{data.chapters?.length} chapters &bull; {data.topic_count} topics</p>
                </div>
            </section>
            <section className="py-6 md:py-8">
                <div className="container-custom max-w-4xl">
                    <div className="space-y-3">
                        {data.chapters?.map((ch, idx) => (
                            <Link key={ch.slug} to={`${prefix}/${board}/${subject}/${ch.slug}`} className="group block" data-testid={`chapter-card-${ch.slug}`}>
                                <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-accent transition-colors">{idx + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-primary group-hover:text-accent transition-colors">{ch.name}</h3>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-gray-500">{ch.topic_count} topics</span>
                                            {ch.published_count > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-green-600">
                                                    <CheckCircle2 className="w-3 h-3" /> {ch.published_count} published
                                                </span>
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
