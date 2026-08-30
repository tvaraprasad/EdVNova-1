import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star, Brain, Award, Target, Sparkles, FileText, Compass, BookMarked, FlaskConical, Atom, Leaf, Calculator, Search } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = { Brain, Target, Trophy, BookMarked, Compass, GraduationCap };
const COLOR_MAP = { blue: { bg: 'bg-blue-50', hover: 'hover:border-blue-200 hover:shadow-blue-500/5', icon: 'text-blue-600' }, emerald: { bg: 'bg-emerald-50', hover: 'hover:border-emerald-200 hover:shadow-emerald-500/5', icon: 'text-emerald-600' }, violet: { bg: 'bg-violet-50', hover: 'hover:border-violet-200 hover:shadow-violet-500/5', icon: 'text-violet-600' } };
const PATH_ICONS = [Users, FileText, Compass];

export default function Home() {
    const [cms, setCms] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [animatedText, setAnimatedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const PLACEHOLDERS = [
        'Search for a topic…',
        'Search for a subject…',
        'Search for a course…',
        'Search for a past paper…',
        'Search for revision notes…',
        'Search for a mark scheme…',
    ];

    useEffect(() => {
        axios.get(`${API_URL}/api/cms/page/home`).then(r => setCms(r.data)).catch(() => {});
    }, []);

    // Animated placeholder cycling
    useEffect(() => {
        if (searchQuery) return; // Don't animate when user is typing
        const phrase = PLACEHOLDERS[placeholderIdx];
        let charIdx = 0;
        let timeout;
        setIsTyping(true);

        const typeChar = () => {
            if (charIdx <= phrase.length) {
                setAnimatedText(phrase.slice(0, charIdx));
                charIdx++;
                timeout = setTimeout(typeChar, 50);
            } else {
                setIsTyping(false);
                timeout = setTimeout(() => {
                    setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
                }, 2000);
            }
        };
        typeChar();
        return () => clearTimeout(timeout);
    }, [placeholderIdx, searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Fallback to hardcoded if CMS not loaded yet
    const hero = cms?.hero || { badge: "Premium Learning for Cambridge Students", heading: "The Premium Learning Platform for Cambridge Students", heading_accent: "Cambridge Students", subheading: "Master Mathematics and Science through expert coaching, structured resources, premium courses, and academic guidance.", cta_primary: { text: "Start Learning", link: "/learn" }, cta_secondary: { text: "Book Consultation", link: "/contact" }, trust_line: "Trusted by students across India, UAE, UK, and Singapore" };
    const trustStrip = cms?.trust_strip || { items: [{ value: "340+", label: "Revision Topics" }, { value: "3", label: "Cambridge Boards" }, { value: "4", label: "Core Subjects" }, { value: "95%+", label: "Success Rate" }, { value: "A*/A", label: "Average Grade" }] };
    const choosePath = cms?.choose_path || { heading: "Choose Your Path", subheading: "Whether you need guided learning, practice resources, or academic mentorship — we've got you covered.", cards: [] };
    const boards = cms?.boards || { heading: "Choose Your Curriculum", subheading: "Structured learning for IGCSE, AS & A Level students.", cards: [] };
    const whyDiff = cms?.why_different || { heading: "Why EdVNova is Different", subheading: "We don't just prepare students for exams. We build deep understanding that lasts a lifetime.", features: [] };
    const testimonials = cms?.testimonials || { heading: "What Parents & Students Say", subheading: "Real feedback from our students and their families.", items: [] };
    const finalCta = cms?.final_cta || { heading: "Start Your Cambridge Learning Journey Today", subheading: "Join students who are building clarity, confidence, and results with EdVNova.", cta_primary: { text: "Book Consultation", link: "/contact" }, cta_secondary: { text: "Start Learning", link: "/learn" } };

    // Highlight accent word in heading
    const renderHeading = () => {
        const accent = hero.heading_accent || '';
        if (!accent || !hero.heading.includes(accent)) return hero.heading;
        const parts = hero.heading.split(accent);
        return <>{parts[0]}<span className="text-accent">{accent}</span>{parts[1]}</>;
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* HERO — Search First */}
            <section className="relative py-20 md:py-28 lg:py-36 overflow-hidden" data-testid="hero-section">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="container-custom relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-5" data-testid="hero-headline">
                            What do you want to <span className="text-accent">learn today</span>?
                        </h1>
                        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-10">
                            Cambridge IGCSE · AS & A Level · IB — Mathematics, Physics, Chemistry, Biology
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8" data-testid="hero-search-form">
                            <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg shadow-gray-200/50 hover:border-gray-300 focus-within:border-accent focus-within:shadow-accent/10 transition-all duration-200">
                                <Search className="w-5 h-5 text-gray-400 ml-5 flex-shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchQuery ? '' : animatedText}
                                    className="flex-1 px-4 py-4 sm:py-5 text-base sm:text-lg bg-transparent outline-none text-primary placeholder:text-gray-400"
                                    data-testid="hero-search-input"
                                />
                                <button type="submit" className="mr-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm sm:text-base" data-testid="hero-search-btn">
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Quick Links */}
                        <div className="flex flex-wrap justify-center gap-2 text-sm" data-testid="hero-quick-links">
                            <span className="text-gray-400">Popular:</span>
                            {['Quadratic Equations', 'Electrolysis', 'Newton Laws', 'Photosynthesis'].map(t => (
                                <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="text-accent hover:underline">{t}</Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST STRIP */}
            <section className="py-6 bg-primary" data-testid="trust-strip">
                <div className="container-custom">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 text-center">
                        {(trustStrip.items || []).map((s, i) => (
                            <div key={i} className="py-3">
                                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                                <p className="text-white/50 text-xs sm:text-sm mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHOOSE YOUR PATH */}
            <section className="py-20 md:py-28 bg-white" data-testid="choose-path-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">{choosePath.heading}</h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">{choosePath.subheading}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {(choosePath.cards || []).map((card, i) => {
                            const colors = COLOR_MAP[card.color] || COLOR_MAP.blue;
                            const Icon = PATH_ICONS[i] || Users;
                            return (
                                <Link key={i} to={card.link || '#'} className={`group relative p-8 lg:p-10 bg-white rounded-2xl border border-gray-100 ${colors.hover} hover:shadow-xl transition-all duration-300`} data-testid={`path-card-${i}`}>
                                    <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
                                        <Icon className={`w-7 h-7 ${colors.icon}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">{card.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-6">{card.description}</p>
                                    <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                                        {card.cta} <ArrowRight className="w-4 h-4" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BOARD SELECTION */}
            <section className="py-20 md:py-28 bg-slate-50" data-testid="board-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">{boards.heading}</h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">{boards.subheading}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {(boards.cards || []).map(board => (
                            <Link key={board.slug} to={`/learn/${board.slug}`} className="group relative overflow-hidden rounded-2xl" data-testid={`board-card-${board.slug}`}>
                                <div className={`bg-gradient-to-br ${board.color || 'from-blue-600 to-blue-700'} p-8 lg:p-10 text-white min-h-[220px] flex flex-col justify-between`}>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-3">{board.name}</h3>
                                        <p className="text-white/70 text-sm leading-relaxed">{board.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium mt-6 group-hover:text-white group-hover:gap-3 transition-all">
                                        Explore Subjects <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY EDVNOVA */}
            <section className="py-20 md:py-28 bg-white" data-testid="why-different-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">{whyDiff.heading}</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">{whyDiff.subheading}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {(whyDiff.features || []).map((f, i) => {
                            const icons = [Brain, Target, Trophy, BookMarked, Compass, GraduationCap];
                            const Icon = icons[i % icons.length];
                            return (
                                <div key={i} className="p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-5">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-[15px]">{f.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SUBJECTS */}
            <section className="py-20 md:py-28 bg-slate-50" data-testid="subjects-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">Subjects We Cover</h2>
                        <p className="text-gray-600 text-lg">Comprehensive support across all core Cambridge subjects.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Mathematics', icon: Calculator, color: 'bg-blue-50 text-blue-600 border-blue-100', desc: 'Algebra, geometry, calculus, statistics, and more.' },
                            { title: 'Physics', icon: Atom, color: 'bg-violet-50 text-violet-600 border-violet-100', desc: 'Mechanics, waves, electricity, and nuclear physics.' },
                            { title: 'Chemistry', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', desc: 'Atomic structure, bonding, organic, and beyond.' },
                            { title: 'Biology', icon: Leaf, color: 'bg-teal-50 text-teal-600 border-teal-100', desc: 'Cell biology, physiology, genetics, and ecology.' },
                        ].map(subj => (
                            <Link key={subj.title} to={`/programs/${subj.title.toLowerCase()}`} className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300" data-testid={`subject-card-${subj.title.toLowerCase()}`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${subj.color}`}>
                                    <subj.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">{subj.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{subj.desc}</p>
                                <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">View Programs <ArrowRight className="w-4 h-4" /></span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-20 md:py-28 bg-white" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">{testimonials.heading}</h2>
                        <p className="text-gray-600 text-lg">{testimonials.subheading}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {(testimonials.items || []).map((t, i) => (
                            <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300" data-testid={`testimonial-card-${i}`}>
                                <div className="flex gap-1 mb-5">
                                    {[...Array(t.rating || 5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">&ldquo;{t.quote}&rdquo;</p>
                                <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">{t.initial}</div>
                                    <div>
                                        <p className="font-bold text-primary text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 md:py-32 bg-primary" data-testid="cta-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">{finalCta.heading}</h2>
                        <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">{finalCta.subheading}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={finalCta.cta_primary?.link || '/contact'} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200" data-testid="cta-consultation-button">
                                {finalCta.cta_primary?.text || 'Book Consultation'} <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to={finalCta.cta_secondary?.link || '/learn'} className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200" data-testid="cta-explore-button">
                                {finalCta.cta_secondary?.text || 'Start Learning'}
                            </Link>
                        </div>
                        {finalCta.whatsapp && (
                            <p className="text-white/40 text-sm mt-8">
                                Or reach us on <a href={finalCta.whatsapp} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white underline underline-offset-2">WhatsApp</a>
                                {finalCta.phone && <> or call <a href={`tel:${finalCta.phone}`} className="text-white/60 hover:text-white underline underline-offset-2">{finalCta.phone}</a></>}
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
