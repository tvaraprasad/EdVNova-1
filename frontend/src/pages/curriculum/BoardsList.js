import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BOARD_COLORS = { igcse: 'from-blue-600 to-blue-700', 'as-level': 'from-purple-600 to-purple-700', 'a-level': 'from-emerald-600 to-emerald-700' };

export default function BoardsList() {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const isLearnRoute = window.location.pathname.startsWith('/learn');
    const prefix = isLearnRoute ? '/learn' : '';

    useEffect(() => {
        axios.get(`${API_URL}/api/curriculum/boards`).then(res => { setBoards(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="boards-page">
            <section className="py-20 md:py-28 bg-white">
                <div className="container-custom text-center">
                    <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">Choose Your Board</p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-4">
                        Learn
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">Master every topic through structured lessons, videos and practice.</p>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
                        Select your examination board to access structured revision notes, worked examples, and exam tips across Mathematics, Physics, Chemistry and Biology.
                    </p>
                    <Link to="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors text-sm" data-testid="search-link">
                        <Search className="w-4 h-4" /> Search all topics
                    </Link>
                </div>
            </section>
            <section className="py-16 md:py-24">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-8">
                        {boards.map(board => (
                            <Link key={board.slug} to={`${prefix}/${board.slug}`} className="group" data-testid={`board-card-${board.slug}`}>
                                <div className={`bg-gradient-to-br ${BOARD_COLORS[board.slug] || 'from-gray-600 to-gray-700'} rounded-2xl p-8 text-white transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1`}>
                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                        <BookOpen className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3">{board.name}</h2>
                                    <p className="text-white/80 text-sm leading-relaxed mb-6">{board.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                        <div className="flex gap-6">
                                            <div><p className="text-2xl font-bold">{board.subject_count}</p><p className="text-xs text-white/60">Subjects</p></div>
                                            <div><p className="text-2xl font-bold">{board.topic_count}</p><p className="text-xs text-white/60">Topics</p></div>
                                        </div>
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
