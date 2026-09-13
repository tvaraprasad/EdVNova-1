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
            <section className="py-8 md:py-10 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" data-testid="breadcrumb">
                        <Link to={`${prefix || '/boards'}`} className="hover:text-primary">{isLearnRoute ? 'Learn' : 'Boards'}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{data.name}</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1">Choose a Subject</h1>
                    <p className="text-sm text-gray-500">{data.name} — {data.subjects?.length} subjects available</p>
                </div>
            </section>
            <section className="py-8 md:py-10">
                <div className="container-custom">
                    <div className="grid sm:grid-cols-2 gap-5">
                        {data.subjects?.map(subj => {
                            const Icon = SUBJECT_ICONS[subj.slug] || Calculator;
                            const colors = SUBJECT_COLORS[subj.slug] || SUBJECT_COLORS.mathematics;
                            return (
                                <Link key={subj.slug} to={`${prefix}/${board}/${subj.slug}`} className="group" data-testid={`subject-card-${subj.slug}`}>
                                    <div className={`rounded-2xl border ${colors.border} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-6 h-6 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-primary mb-0.5">{subj.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-500">{subj.chapter_count} Chapters</span>
                                                    <span className="text-xs text-gray-500">{subj.topic_count} Topics</span>
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
