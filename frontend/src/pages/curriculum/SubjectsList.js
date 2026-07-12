import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calculator, Atom, FlaskConical, Leaf } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SUBJECT_ICONS = {
    mathematics: Calculator, physics: Atom, chemistry: FlaskConical, biology: Leaf,
};
const SUBJECT_COLORS = {
    mathematics: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', accent: 'bg-blue-600' },
    physics: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', accent: 'bg-purple-600' },
    chemistry: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', accent: 'bg-green-600' },
    biology: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', accent: 'bg-emerald-600' },
};

export default function SubjectsList() {
    const { board } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLearnRoute = window.location.pathname.startsWith('/learn');
    const prefix = isLearnRoute ? '/learn' : '';

    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards/${board}`).then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, [board]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;
    if (!data) return <div className="min-h-screen pt-20 flex items-center justify-center"><p className="text-gray-500">Board not found</p></div>;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="subjects-page">
            <section className="py-16 md:py-20 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6" data-testid="breadcrumb">
                        <Link to={`${prefix || '/boards'}`} className="hover:text-primary">{isLearnRoute ? 'Learn' : 'Boards'}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{data.name}</span>
                    </nav>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight mb-4">{data.name}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">{data.description}</p>
                </div>
            </section>
            <section className="py-16 md:py-20">
                <div className="container-custom">
                    <h2 className="text-xl font-bold text-primary mb-8">Choose a Subject</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {data.subjects?.map(subj => {
                            const Icon = SUBJECT_ICONS[subj.slug] || Calculator;
                            const colors = SUBJECT_COLORS[subj.slug] || SUBJECT_COLORS.mathematics;
                            return (
                                <Link key={subj.slug} to={`${prefix}/${board}/${subj.slug}`} className="group" data-testid={`subject-card-${subj.slug}`}>
                                    <div className={`rounded-2xl border ${colors.border} p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white`}>
                                        <div className="flex items-start gap-5">
                                            <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-7 h-7 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-primary mb-1">{subj.name}</h3>
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{subj.description}</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-500">{subj.chapter_count} Chapters</span>
                                                    <span className="text-sm text-gray-500">{subj.topic_count} Topics</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 mt-1 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
