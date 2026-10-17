import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, Users, GraduationCap, Star, Search, FileText, Sparkles, Brain, PenLine, Compass, Calculator, Atom, FlaskConical, Leaf, FileCheck, HelpCircle, Lightbulb, Beaker, Target } from 'lucide-react';

const ScientificHeroBackground = lazy(() => import('../components/ScientificHeroBackground'));

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
    const [cms, setCms] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [animatedText, setAnimatedText] = useState('');
    const [ppQual, setPpQual] = useState('igcse');
    const [ppSubject, setPpSubject] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const PLACEHOLDERS = ['Search a topic, past paper, question or resource…'];

    useEffect(() => { axios.get(`${API_URL}/api/cms/page/home`).then(r => setCms(r.data)).catch(() => {}); }, []);

    useEffect(() => {
        if (searchQuery) return;
        const phrase = PLACEHOLDERS[placeholderIdx];
        let charIdx = 0; let timeout;
        const typeChar = () => {
            if (charIdx <= phrase.length) { setAnimatedText(phrase.slice(0, charIdx)); charIdx++; timeout = setTimeout(typeChar, 50); }
            else { timeout = setTimeout(() => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length), 2000); }
        };
        typeChar();
        return () => clearTimeout(timeout);
    }, [placeholderIdx, searchQuery]);

    const handleSearch = (e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); };

    const testimonials = cms?.testimonials || { items: [] };

    const PP_SUBJECTS = {
        igcse: [{ code: '0580', name: 'Mathematics' }, { code: '0625', name: 'Physics' }, { code: '0620', name: 'Chemistry' }, { code: '0610', name: 'Biology' }, { code: '0653', name: 'Combined Science' }, { code: '0654', name: 'Co-ordinated Sciences' }],
        'as-level': [{ code: '9709', name: 'Mathematics' }, { code: '9702', name: 'Physics' }, { code: '9701', name: 'Chemistry' }, { code: '9700', name: 'Biology' }],
        'a-level': [{ code: '9709', name: 'Mathematics' }, { code: '9702', name: 'Physics' }, { code: '9701', name: 'Chemistry' }, { code: '9700', name: 'Biology' }],
    };

    return (
        <div className="pt-[60px] md:pt-[72px]" data-testid="home-page">
            {/* ═══ 1. HERO ═══ */}
            <section className="relative py-12 md:py-16 overflow-hidden" data-testid="hero-section">
                {/* Base background */}
                <div className="absolute inset-0 bg-[#f8f9fb]" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #64748b 0.5px, transparent 0)', backgroundSize: '28px 28px' }} />

                {/* 3D Scientific Background — lazy-loaded */}
                <Suspense fallback={null}>
                    <ScientificHeroBackground />
                </Suspense>

                <div className="container-custom relative">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-[11px] font-semibold text-gray-400 tracking-[0.15em] uppercase mb-4" data-testid="hero-badge">
                            Cambridge IGCSE &middot; AS & A Level
                        </p>
                        <h1 className="text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold text-primary tracking-tight leading-[1.12] mb-4" data-testid="hero-headline">
                            Understand. Practise.<br className="hidden sm:inline" /> Master <span className="text-accent">Cambridge.</span>
                        </h1>
                        <p className="text-[15px] text-gray-500 max-w-lg mx-auto mb-6 leading-[1.7]">
                            A smarter way to learn, practise and prepare for Cambridge IGCSE, AS & A Level — with structured learning, targeted practice, past papers and expert academic support.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                            <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 text-sm" data-testid="hero-cta-learn">
                                Explore Learning <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-primary font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200 text-sm" data-testid="hero-cta-papers">
                                Find Past Papers
                            </Link>
                        </div>

                        <div className="max-w-md mx-auto">
                            <p className="text-[11px] text-gray-400 mb-2 font-medium">What are you learning today?</p>
                            <form onSubmit={handleSearch} data-testid="hero-search-form">
                                <div className="flex items-center bg-white border border-gray-200 rounded-xl hover:border-gray-300 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10 transition-all duration-200">
                                    <Search className="w-4 h-4 text-gray-400 ml-3.5 flex-shrink-0" />
                                    <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={searchQuery ? '' : animatedText} className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-primary placeholder:text-gray-400" data-testid="hero-search-input" />
                                    <button type="submit" className="mr-1.5 px-3.5 py-1.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover active:scale-[0.97] transition-all duration-150 text-xs" data-testid="hero-search-btn">Search</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 2. WHAT ARE YOU WORKING ON? ═══ */}
            <section className="py-10 md:py-12 bg-white border-y border-gray-100" data-testid="actions-section">
                <div className="container-custom">
                    <h2 className="text-center text-base font-bold text-primary mb-6">What are you working on?</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        {[
                            { icon: BookOpen, label: 'Learn a concept', href: '/learn', color: 'text-blue-600' },
                            { icon: PenLine, label: 'Practise', href: '/practice', color: 'text-green-600' },
                            { icon: FileCheck, label: 'Find a past paper', href: '/past-papers', color: 'text-violet-600' },
                            { icon: Sparkles, label: 'Get help', href: '/dashboard', color: 'text-amber-600' },
                        ].map((a, i) => (
                            <Link key={i} to={a.href} className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:scale-[0.98] transition-all duration-200" data-testid={`action-${i}`}>
                                <a.icon className={`w-5 h-5 ${a.color}`} />
                                <span className="text-[13px] font-medium text-gray-600 group-hover:text-primary transition-colors duration-200">{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 3. EXPLORE CAMBRIDGE ═══ */}
            <section className="py-10 md:py-12" data-testid="explore-section">
                <div className="container-custom">
                    <h2 className="text-center text-lg font-bold text-primary mb-1.5">Explore Cambridge</h2>
                    <p className="text-center text-[13px] text-gray-500 mb-6">Choose your qualification and start learning.</p>
                    <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {[
                            { name: 'IGCSE', slug: 'igcse', color: 'from-blue-600 to-blue-700' },
                            { name: 'AS Level', slug: 'as-level', color: 'from-indigo-600 to-indigo-700' },
                            { name: 'A Level', slug: 'a-level', color: 'from-violet-600 to-violet-700' },
                        ].map(b => (
                            <Link key={b.slug} to={`/learn/${b.slug}`} className="group" data-testid={`board-card-${b.slug}`}>
                                <div className={`bg-gradient-to-br ${b.color} rounded-xl p-6 text-white flex items-center justify-between`}>
                                    <div>
                                        <p className="text-xs text-white/60 font-medium mb-1">Cambridge</p>
                                        <h3 className="text-lg font-bold">{b.name}</h3>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 4. SUBJECTS ═══ */}
            <section className="py-10 md:py-12 bg-white" data-testid="subjects-section">
                <div className="container-custom">
                    <h2 className="text-center text-lg font-bold text-primary mb-1.5">Subjects</h2>
                    <p className="text-center text-[13px] text-gray-500 mb-6">Cambridge Mathematics and Sciences.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {[
                            { title: 'Mathematics', slug: 'mathematics', icon: Calculator, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                            { title: 'Physics', slug: 'physics', icon: Atom, color: 'bg-violet-50 text-violet-600 border-violet-100' },
                            { title: 'Chemistry', slug: 'chemistry', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            { title: 'Biology', slug: 'biology', icon: Leaf, color: 'bg-teal-50 text-teal-600 border-teal-100' },
                            { title: 'Combined Science', slug: 'combined-science', icon: Beaker, color: 'bg-cyan-50 text-cyan-600 border-cyan-100', code: '0653' },
                            { title: 'Co-ordinated Sciences', slug: 'co-ordinated-sciences', icon: Target, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', code: '0654' },
                        ].map(s => (
                            <Link key={s.slug} to={`/learn/igcse/${s.slug}`} className={`group flex items-center gap-4 p-4 rounded-xl border ${s.color} hover:shadow-md transition-all`} data-testid={`subject-${s.slug}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color.split(' ').slice(0, 2).join(' ')}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary text-sm group-hover:text-accent transition-colors">{s.title}</h3>
                                    {s.code && <p className="text-xs text-gray-400">{s.code}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 5. PAST PAPERS ═══ */}
            <section className="py-10 md:py-12" data-testid="past-papers-section">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-center text-lg font-bold text-primary mb-1.5">Past Papers</h2>
                    <p className="text-center text-[13px] text-gray-500 mb-6">Find the paper you need in seconds.</p>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="grid sm:grid-cols-2 gap-3 mb-5">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Qualification</label>
                                <select value={ppQual} onChange={e => { setPpQual(e.target.value); setPpSubject(''); }} className="w-full h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-qual-select">
                                    <option value="igcse">Cambridge IGCSE</option>
                                    <option value="as-level">Cambridge AS Level</option>
                                    <option value="a-level">Cambridge A Level</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Subject</label>
                                <select value={ppSubject} onChange={e => setPpSubject(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-subject-select">
                                    <option value="">Select subject</option>
                                    {(PP_SUBJECTS[ppQual] || []).map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={ppSubject ? `/past-papers/${ppQual}/${ppSubject}` : '/past-papers'} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm" data-testid="pp-find-btn">
                                <FileCheck className="w-4 h-4" /> Find Past Papers
                            </Link>
                            <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm">
                                Browse all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 6. FREE LEARNING ═══ */}
            <section className="py-10 md:py-12 bg-white" data-testid="free-resources-section">
                <div className="container-custom">
                    <h2 className="text-center text-lg font-bold text-primary mb-1.5">Free Learning Library</h2>
                    <p className="text-center text-[13px] text-gray-500 mb-6">Resources to help you understand, revise and prepare.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: FileText, title: 'Revision Notes', href: '/learn' },
                            { icon: Calculator, title: 'Formula Sheets', href: '/learn' },
                            { icon: Brain, title: 'Practice Questions', href: '/practice' },
                            { icon: FileCheck, title: 'Past Papers', href: '/past-papers' },
                        ].map((r, i) => (
                            <Link key={i} to={r.href} className="group flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all" data-testid={`free-resource-${i}`}>
                                <r.icon className="w-5 h-5 text-accent flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{r.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 7. WHY EDVNOVA ═══ */}
            <section className="py-10 md:py-12" data-testid="why-section">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-center text-lg font-bold text-primary mb-6">Learn. Practise. Master.</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        {[
                            { step: '01', title: 'Learn', desc: 'Understand concepts with structured notes, videos and expert explanations.' },
                            { step: '02', title: 'Practise', desc: 'Apply knowledge with topic questions, past papers and targeted practice.' },
                            { step: '03', title: 'Master', desc: 'Identify weaknesses, track progress and build exam confidence.' },
                        ].map(s => (
                            <div key={s.step}>
                                <p className="text-xs font-bold text-accent tracking-widest mb-2">{s.step}</p>
                                <h3 className="text-lg font-bold text-primary mb-2">{s.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 8. AI MENTOR ═══ */}
            <section className="py-10 md:py-12 bg-white" data-testid="ai-mentor-section">
                <div className="container-custom max-w-2xl text-center">
                    <Sparkles className="w-7 h-7 text-accent mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-primary mb-1.5">EdVNova AI Mentor</h2>
                    <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">Your personal academic mentor. Step-by-step explanations, exam tips and guided practice across all Cambridge subjects.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-colors text-sm" data-testid="ai-mentor-cta">
                        Try AI Mentor <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* ═══ 9. TESTIMONIALS ═══ */}
            {testimonials.items?.length > 0 && (
                <section className="py-10 md:py-12" data-testid="testimonials-section">
                    <div className="container-custom">
                        <h2 className="text-center text-lg font-bold text-primary mb-6">{testimonials.heading || 'What Students & Parents Say'}</h2>
                        <div className="grid md:grid-cols-3 gap-5">
                            {testimonials.items.map((t, i) => (
                                <div key={i} className="p-6 bg-white rounded-xl border border-gray-100" data-testid={`testimonial-${i}`}>
                                    <div className="flex gap-0.5 mb-3">{[...Array(t.rating || 5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                                    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">{t.initial}</div>
                                        <div><p className="font-bold text-primary text-sm">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 10. FINAL CTA ═══ */}
            <section className="py-12 md:py-16 bg-primary" data-testid="cta-section">
                <div className="container-custom max-w-2xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">Start your Cambridge learning journey</h2>
                    <p className="text-white/50 text-sm mb-7 leading-relaxed">Join students building clarity, confidence and results with EdVNova.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm" data-testid="final-cta-primary">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
                            Explore Learning
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
