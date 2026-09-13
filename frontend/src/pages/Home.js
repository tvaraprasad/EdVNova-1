import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, Users, GraduationCap, Star, Search, FileText, Sparkles, Brain, PenLine, Compass, Calculator, Atom, FlaskConical, Leaf, FileCheck, HelpCircle } from 'lucide-react';

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

    const PLACEHOLDERS = ['Search for a topic…', 'Search for a subject…', 'Search for a past paper…', 'Search for revision notes…', 'Search for a mark scheme…'];

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
    const finalCta = cms?.final_cta || {};

    const PP_SUBJECTS = {
        igcse: [{ code: '0580', name: 'Mathematics' }, { code: '0625', name: 'Physics' }, { code: '0620', name: 'Chemistry' }, { code: '0610', name: 'Biology' }],
        'as-level': [{ code: '9709', name: 'Mathematics' }, { code: '9702', name: 'Physics' }, { code: '9701', name: 'Chemistry' }, { code: '9700', name: 'Biology' }],
        'a-level': [{ code: '9709', name: 'Mathematics' }, { code: '9702', name: 'Physics' }, { code: '9701', name: 'Chemistry' }, { code: '9700', name: 'Biology' }],
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* ═══ 1. HERO ═══ */}
            <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden" data-testid="hero-section">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="container-custom relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/10 rounded-full text-sm font-medium text-accent mb-8" data-testid="hero-badge">
                            IGCSE &bull; AS & A Level
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-6" data-testid="hero-headline">
                            The Premium Learning Platform for <span className="text-accent">Cambridge Students</span>
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-5 leading-relaxed">
                            Learn, practise and prepare with expert teaching, structured courses, powerful resources, past papers and personalised academic support.
                        </p>
                        <p className="text-sm text-gray-400 mb-10">Mathematics &bull; Physics &bull; Chemistry &bull; Biology</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                            <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all shadow-lg shadow-primary/20" data-testid="hero-cta-learn">
                                Explore Learning <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-primary font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all" data-testid="hero-cta-papers">
                                Browse Past Papers
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto" data-testid="hero-search-form">
                            <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 focus-within:border-accent transition-all">
                                <Search className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0" />
                                <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={searchQuery ? '' : animatedText} className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-primary placeholder:text-gray-400" data-testid="hero-search-input" />
                                <button type="submit" className="mr-1.5 px-4 py-1.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors text-sm" data-testid="hero-search-btn">Search</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* ═══ 2. FOUR LEARNING PATHS ═══ */}
            <section className="py-16 md:py-24 bg-white" data-testid="paths-section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">How can EdVNova help you?</h2>
                        <p className="text-gray-500 max-w-lg mx-auto">Four ways to learn, practise and succeed with Cambridge qualifications.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: Users, title: 'Learn with an Expert', desc: 'Live teaching, mentoring and exam-focused guidance.', cta: 'Explore Programs', href: '/programs', color: 'bg-blue-50 text-blue-600' },
                            { icon: BookOpen, title: 'Learn at Your Own Pace', desc: 'Structured courses designed around the Cambridge curriculum.', cta: 'Explore Courses', href: '/learn', color: 'bg-violet-50 text-violet-600' },
                            { icon: PenLine, title: 'Practise & Prepare', desc: 'Topic practice, past papers, mark schemes and exam preparation.', cta: 'Start Practising', href: '/practice', color: 'bg-green-50 text-green-600' },
                            { icon: Compass, title: 'Build Your Future', desc: 'Profile building, academic guidance, workshops and opportunities.', cta: 'Explore More', href: '/career-guidance', color: 'bg-amber-50 text-amber-600' },
                        ].map((p, i) => (
                            <Link key={i} to={p.href} className="group p-7 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300" data-testid={`path-card-${i}`}>
                                <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                                    <p.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">{p.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-5">{p.desc}</p>
                                <span className="inline-flex items-center gap-1.5 text-accent font-semibold text-sm group-hover:gap-2.5 transition-all">{p.cta} <ArrowRight className="w-4 h-4" /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 3. EXPLORE CAMBRIDGE ═══ */}
            <section className="py-16 md:py-24 bg-slate-50" data-testid="explore-section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">Explore Cambridge</h2>
                        <p className="text-gray-500">Choose your qualification and start learning immediately.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                            { name: 'Cambridge IGCSE', slug: 'igcse', desc: 'The world\'s most popular international qualification for 14–16 year olds.', color: 'from-blue-600 to-blue-700' },
                            { name: 'Cambridge AS Level', slug: 'as-level', desc: 'Advanced Subsidiary — ideal preparation for A Level and university.', color: 'from-indigo-600 to-indigo-700' },
                            { name: 'Cambridge A Level', slug: 'a-level', desc: 'The gold standard qualification for university admissions worldwide.', color: 'from-violet-600 to-violet-700' },
                        ].map(b => (
                            <Link key={b.slug} to={`/learn/${b.slug}`} className="group relative overflow-hidden rounded-2xl" data-testid={`board-card-${b.slug}`}>
                                <div className={`bg-gradient-to-br ${b.color} p-8 lg:p-9 text-white min-h-[200px] flex flex-col justify-between`}>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{b.name}</h3>
                                        <p className="text-white/70 text-sm leading-relaxed">{b.desc}</p>
                                    </div>
                                    <span className="flex items-center gap-2 text-white/80 text-sm font-medium mt-5 group-hover:text-white group-hover:gap-3 transition-all">Explore Subjects <ArrowRight className="w-4 h-4" /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 4. PAST PAPERS FINDER ═══ */}
            <section className="py-16 md:py-24 bg-white" data-testid="past-papers-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">Past Papers</h2>
                            <p className="text-gray-500">Find the paper you need in seconds.</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Qualification</label>
                                    <select value={ppQual} onChange={e => { setPpQual(e.target.value); setPpSubject(''); }} className="w-full h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-qual-select">
                                        <option value="igcse">Cambridge IGCSE</option>
                                        <option value="as-level">Cambridge AS Level</option>
                                        <option value="a-level">Cambridge A Level</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subject</label>
                                    <select value={ppSubject} onChange={e => setPpSubject(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-subject-select">
                                        <option value="">Select subject</option>
                                        {(PP_SUBJECTS[ppQual] || []).map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link to={ppSubject ? `/past-papers/${ppQual}/${ppSubject}` : '/past-papers'} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors" data-testid="pp-find-btn">
                                    <FileCheck className="w-5 h-5" /> Find Past Papers
                                </Link>
                                <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-primary font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                                    Browse all past papers <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 5. FREE LEARNING ═══ */}
            <section className="py-16 md:py-24 bg-slate-50" data-testid="free-resources-section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">Free Learning Library</h2>
                        <p className="text-gray-500 max-w-lg mx-auto">High-quality resources to help you understand, revise and prepare — completely free.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: FileText, title: 'Revision Notes', desc: 'Concise topic summaries aligned to the Cambridge syllabus.', href: '/learn' },
                            { icon: Calculator, title: 'Formula Sheets', desc: 'Key formulas and equations for quick reference.', href: '/learn' },
                            { icon: Brain, title: 'Practice Questions', desc: 'Free questions to test your understanding.', href: '/practice' },
                            { icon: FileCheck, title: 'Past Papers', desc: 'Access Cambridge past papers and mark schemes.', href: '/past-papers' },
                        ].map((r, i) => (
                            <Link key={i} to={r.href} className="group p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all" data-testid={`free-resource-${i}`}>
                                <r.icon className="w-8 h-8 text-accent mb-4" />
                                <h3 className="font-bold text-primary text-sm mb-1.5">{r.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/learn" className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:gap-3 transition-all">Explore Free Resources <ArrowRight className="w-4 h-4" /></Link>
                    </div>
                </div>
            </section>

            {/* ═══ 6. SUBJECTS ═══ */}
            <section className="py-16 md:py-24 bg-white" data-testid="subjects-section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">Subjects We Cover</h2>
                        <p className="text-gray-500">Comprehensive support across all core Cambridge subjects.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { title: 'Mathematics', icon: Calculator, color: 'bg-blue-50 text-blue-600', desc: 'Algebra, geometry, calculus, statistics.' },
                            { title: 'Physics', icon: Atom, color: 'bg-violet-50 text-violet-600', desc: 'Mechanics, waves, electricity, nuclear.' },
                            { title: 'Chemistry', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600', desc: 'Atomic structure, bonding, organic.' },
                            { title: 'Biology', icon: Leaf, color: 'bg-teal-50 text-teal-600', desc: 'Cell biology, physiology, genetics.' },
                        ].map(s => (
                            <Link key={s.title} to={`/learn/igcse/${s.title.toLowerCase()}`} className="group bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all" data-testid={`subject-card-${s.title.toLowerCase()}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}><s.icon className="w-6 h-6" /></div>
                                <h3 className="text-lg font-bold text-primary mb-1.5">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                                <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Start Learning <ArrowRight className="w-4 h-4" /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 7. AI MENTOR ═══ */}
            <section className="py-16 md:py-24 bg-slate-50" data-testid="ai-mentor-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-7 h-7 text-accent" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">EdVNova AI Mentor</h2>
                        <p className="text-gray-500 max-w-lg mx-auto mb-8 leading-relaxed">Your personal academic mentor inside EdVNova. Get step-by-step explanations, exam tips and guided practice across all Cambridge subjects.</p>
                        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-colors shadow-sm" data-testid="ai-mentor-cta">
                            Try AI Mentor <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ 8. TESTIMONIALS ═══ */}
            {testimonials.items?.length > 0 && (
                <section className="py-16 md:py-24 bg-white" data-testid="testimonials-section">
                    <div className="container-custom">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">{testimonials.heading || 'What Students & Parents Say'}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {testimonials.items.map((t, i) => (
                                <div key={i} className="p-7 bg-slate-50 rounded-2xl border border-gray-100" data-testid={`testimonial-card-${i}`}>
                                    <div className="flex gap-1 mb-4">{[...Array(t.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
                                    <p className="text-gray-600 leading-relaxed text-sm mb-5">&ldquo;{t.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">{t.initial}</div>
                                        <div><p className="font-bold text-primary text-sm">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 9. FINAL CTA ═══ */}
            <section className="py-20 md:py-28 bg-primary" data-testid="cta-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">Start Your Cambridge Learning Journey</h2>
                        <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">Join students who are building clarity, confidence and results with EdVNova.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all" data-testid="final-cta-primary">
                                Get Started Free <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all" data-testid="final-cta-secondary">
                                Explore Learning
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
