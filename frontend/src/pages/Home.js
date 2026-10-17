import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, Users, GraduationCap, Star, Search, FileText, Sparkles, Brain, PenLine, Compass, Calculator, Atom, FlaskConical, Leaf, FileCheck, HelpCircle, Lightbulb, Beaker, Target } from 'lucide-react';

import { CrystalHero, StaticCrystal } from '../components/CrystalHero';

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
            <section className="relative overflow-hidden bg-[#07182E]" data-testid="hero-section">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 70% 90% at 78% 50%, #102B4B 0%, rgba(16,43,75,0.45) 45%, transparent 75%), linear-gradient(180deg, #07182E 0%, #0A1F3A 100%)' }} />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4C8DFF]/30 to-transparent" aria-hidden="true" />
                <div className="lg:hidden absolute -top-12 -right-20 sm:-right-10 w-[230px] sm:w-[300px] opacity-50 pointer-events-none" aria-hidden="true">
                    <StaticCrystal className="w-full" />
                </div>

                <div className="container-custom relative">
                    <div className="grid lg:grid-cols-[1.1fr_1fr] items-center gap-6 lg:gap-4 py-14 sm:py-16 lg:py-0 lg:min-h-[600px]">
                        <div className="max-w-[620px] relative z-10">
                            <p className="text-[11px] font-semibold text-[#C5D5E8] tracking-[0.2em] uppercase mb-5 flex items-center gap-3" data-testid="hero-badge">
                                <span className="h-px w-8 bg-[#4C8DFF]" aria-hidden="true" />
                                Cambridge IGCSE &middot; AS &amp; A Level
                            </p>
                            <h1 className="text-[2.4rem] sm:text-5xl lg:text-[3.3rem] xl:text-[3.6rem] font-bold text-white tracking-tight leading-[1.06] mb-5" data-testid="hero-headline">
                                Understand. Practise.<br /> Master <span className="text-[#7FB0FF]">Cambridge.</span>
                            </h1>
                            <p className="text-[15px] sm:text-base text-[#C5D5E8] max-w-md mb-8 leading-[1.7]" data-testid="hero-subtext">
                                Explore Cambridge IGCSE, AS and A Level Mathematics and Sciences through clear lessons, targeted practice and past papers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 mb-9">
                                <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] active:scale-[0.98] transition-[background-color,transform] duration-200 shadow-[0_8px_30px_-8px_rgba(37,99,235,0.7)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07182E]" data-testid="hero-cta-learn">
                                    Explore Learning <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/[0.06] hover:border-white/40 active:scale-[0.98] transition-[background-color,border-color,transform] duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB0FF]" data-testid="hero-cta-papers">
                                    Find Past Papers
                                </Link>
                            </div>

                            <div className="max-w-md">
                                <p className="text-[11px] text-[#C5D5E8]/80 mb-2 font-medium tracking-wide">What are you learning today?</p>
                                <form onSubmit={handleSearch} data-testid="hero-search-form">
                                    <div className="flex items-center bg-white/[0.97] border border-white/10 rounded-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] focus-within:ring-2 focus-within:ring-[#4C8DFF]/60 transition-shadow duration-200">
                                        <Search className="w-4 h-4 text-gray-400 ml-3.5 flex-shrink-0" />
                                        <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={searchQuery ? '' : animatedText} aria-label="Search topics, past papers, questions or resources" className="flex-1 min-w-0 px-3 py-3 text-sm bg-transparent outline-none text-primary placeholder:text-gray-400" data-testid="hero-search-input" />
                                        <button type="submit" className="mr-1.5 px-4 py-2 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1D4ED8] active:scale-[0.97] transition-[background-color,transform] duration-150 text-xs" data-testid="hero-search-btn">Search</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="hidden lg:block relative">
                            <CrystalHero />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 2. WHAT ARE YOU WORKING ON? ═══ */}
            <section className="py-12 md:py-14 bg-white border-b border-slate-100" data-testid="actions-section">
                <div className="container-custom">
                    <h2 className="text-[15px] font-semibold text-primary mb-5">What are you working on?</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { icon: BookOpen, label: 'Learn a concept', href: '/learn' },
                            { icon: PenLine, label: 'Practise', href: '/practice' },
                            { icon: FileCheck, label: 'Find a past paper', href: '/past-papers' },
                            { icon: Sparkles, label: 'Get help', href: '/dashboard' },
                        ].map((a, i) => (
                            <Link key={i} to={a.href} className="group ev-card ev-card-link flex items-center gap-3 px-4 py-3.5" data-testid={`action-${i}`}>
                                <span className="ev-icon-tile w-9 h-9 flex-shrink-0"><a.icon className="w-[18px] h-[18px]" /></span>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors duration-200">{a.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 3. EXPLORE CAMBRIDGE ═══ */}
            <section className="py-14 md:py-20 bg-soft" data-testid="explore-section">
                <div className="container-custom">
                    <div>
                        <p className="ev-eyebrow mb-2">Qualifications</p>
                        <h2 className="ev-section-title mb-2">Explore Cambridge</h2>
                        <p className="text-[15px] text-slate-500 mb-8">Choose your qualification and start learning.</p>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { name: 'IGCSE', slug: 'igcse', desc: 'International GCSE, typically studied from ages 14 to 16.' },
                                { name: 'AS Level', slug: 'as-level', desc: 'The first stage of the Cambridge International A Level.' },
                                { name: 'A Level', slug: 'a-level', desc: 'The full advanced qualification for university entry.' },
                            ].map(b => (
                                <Link key={b.slug} to={`/learn/${b.slug}`} className="group ev-card ev-card-link relative overflow-hidden p-6 flex flex-col min-h-[168px]" data-testid={`board-card-${b.slug}`}>
                                    <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-navy via-accent to-electric opacity-80" aria-hidden="true" />
                                    <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-500 mb-1.5">Cambridge</p>
                                    <h3 className="text-xl font-bold text-primary mb-2">{b.name}</h3>
                                    <p className="text-[13px] text-slate-500 leading-relaxed mb-5">{b.desc}</p>
                                    <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
                                        Browse subjects <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 4. SUBJECTS ═══ */}
            <section className="py-14 md:py-20 bg-white" data-testid="subjects-section">
                <div className="container-custom">
                    <div>
                        <p className="ev-eyebrow mb-2">IGCSE subjects</p>
                        <h2 className="ev-section-title mb-2">Subjects</h2>
                        <p className="text-[15px] text-slate-500 mb-8">Cambridge Mathematics and Sciences.</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { title: 'Mathematics', slug: 'mathematics', icon: Calculator, code: '0580' },
                                { title: 'Physics', slug: 'physics', icon: Atom, code: '0625' },
                                { title: 'Chemistry', slug: 'chemistry', icon: FlaskConical, code: '0620' },
                                { title: 'Biology', slug: 'biology', icon: Leaf, code: '0610' },
                                { title: 'Combined Science', slug: 'combined-science', icon: Beaker, code: '0653' },
                                { title: 'Co-ordinated Sciences', slug: 'co-ordinated-sciences', icon: Target, code: '0654' },
                            ].map(s => (
                                <Link key={s.slug} to={`/learn/igcse/${s.slug}`} className="group ev-card ev-card-link flex items-center gap-4 p-4" data-testid={`subject-${s.slug}`}>
                                    <span className="ev-icon-tile flex-shrink-0"><s.icon className="w-5 h-5" /></span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-primary text-sm">{s.title}</h3>
                                        <p className="text-xs text-slate-500 tabular-nums">{s.code}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-0.5 transition-[color,transform] duration-200" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 5. PAST PAPERS ═══ */}
            <section className="py-14 md:py-20 bg-soft" data-testid="past-papers-section">
                <div className="container-custom">
                    <p className="ev-eyebrow mb-2">Exam preparation</p>
                    <h2 className="ev-section-title mb-2">Past Papers</h2>
                    <p className="text-[15px] text-slate-500 mb-8">Find the paper you need in seconds.</p>
                    <div className="ev-card p-6 md:p-7 max-w-3xl">
                        <div className="grid sm:grid-cols-2 gap-3 mb-5">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Qualification</label>
                                <select value={ppQual} onChange={e => { setPpQual(e.target.value); setPpSubject(''); }} className="ev-select" data-testid="pp-qual-select">
                                    <option value="igcse">Cambridge IGCSE</option>
                                    <option value="as-level">Cambridge AS Level</option>
                                    <option value="a-level">Cambridge A Level</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Subject</label>
                                <select value={ppSubject} onChange={e => setPpSubject(e.target.value)} className="ev-select" data-testid="pp-subject-select">
                                    <option value="">Select subject</option>
                                    {(PP_SUBJECTS[ppQual] || []).map(s => <option key={s.code} value={s.code} label={`${s.name} (${s.code})`}>{`${s.name} (${s.code})`}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={ppSubject ? `/past-papers/${ppQual}/${ppSubject}` : '/past-papers'} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm" data-testid="pp-find-btn">
                                <FileCheck className="w-4 h-4" /> Find Past Papers
                            </Link>
                            <Link to="/past-papers" className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 text-primary font-medium rounded-xl hover:bg-soft hover:border-slate-300 transition-colors text-sm" data-testid="pp-browse-all">
                                Browse all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ 6. FREE LEARNING ═══ */}
            <section className="py-14 md:py-20 bg-white" data-testid="free-resources-section">
                <div className="container-custom">
                    <p className="ev-eyebrow mb-2">Free resources</p>
                    <h2 className="ev-section-title mb-2">Free Learning Library</h2>
                    <p className="text-[15px] text-slate-500 mb-8">Resources to help you understand, revise and prepare.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { icon: FileText, title: 'Revision Notes', href: '/learn' },
                            { icon: Calculator, title: 'Formula Sheets', href: '/learn' },
                            { icon: Brain, title: 'Practice Questions', href: '/practice' },
                            { icon: FileCheck, title: 'Past Papers', href: '/past-papers' },
                        ].map((r, i) => (
                            <Link key={i} to={r.href} className="group ev-card ev-card-link flex items-center gap-3 p-4" data-testid={`free-resource-${i}`}>
                                <span className="ev-icon-tile w-9 h-9 flex-shrink-0"><r.icon className="w-[18px] h-[18px]" /></span>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{r.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 7. WHY EDVNOVA ═══ */}
            <section className="py-14 md:py-20 bg-soft" data-testid="why-section">
                <div className="container-custom">
                    <p className="ev-eyebrow mb-2">How it works</p>
                    <h2 className="ev-section-title mb-8">Learn. Practise. Master.</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { step: '01', title: 'Learn', desc: 'Understand concepts with structured notes, videos and expert explanations.' },
                            { step: '02', title: 'Practise', desc: 'Apply knowledge with topic questions, past papers and targeted practice.' },
                            { step: '03', title: 'Master', desc: 'Identify weaknesses, track progress and build exam confidence.' },
                        ].map(s => (
                            <div key={s.step} className="ev-card p-6" data-testid={`why-step-${s.step}`}>
                                <p className="text-xs font-semibold text-accent tracking-[0.2em] tabular-nums mb-4">{s.step}</p>
                                <h3 className="text-lg font-bold text-primary mb-1.5">{s.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ 8. AI MENTOR ═══ */}
            <section className="py-14 md:py-16 bg-white" data-testid="ai-mentor-section">
                <div className="container-custom">
                    <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 60% 120% at 100% 0%, rgba(76,141,255,0.22), transparent 60%)' }} />
                        <div className="relative flex-1">
                            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7FB0FF] mb-3 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> AI Mentor</p>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">EdVNova AI Mentor</h2>
                            <p className="text-[15px] text-[#C5D5E8] leading-relaxed max-w-lg">Your personal academic mentor. Step-by-step explanations, exam tips and guided practice across all Cambridge subjects.</p>
                        </div>
                        <Link to="/login" className="relative self-start md:self-center inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-tint transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-navy" data-testid="ai-mentor-cta">
                            Try AI Mentor <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ 9. TESTIMONIALS ═══ */}
            {testimonials.items?.length > 0 && (
                <section className="py-14 md:py-20 bg-soft" data-testid="testimonials-section">
                    <div className="container-custom">
                        <div>
                        <p className="ev-eyebrow mb-2">Testimonials</p>
                        <h2 className="ev-section-title mb-2">{testimonials.heading || 'What Students & Parents Say'}</h2>
                        {testimonials.subheading && <p className="text-[15px] text-slate-500 mb-8">{testimonials.subheading}</p>}
                        <div className={`grid md:grid-cols-3 gap-4 ${testimonials.subheading ? '' : 'mt-8'}`}>
                            {testimonials.items.map((t, i) => (
                                <figure key={i} className="ev-card p-6 flex flex-col" data-testid={`testimonial-${i}`}>
                                    <span className="text-4xl leading-none font-serif text-accent/30 select-none mb-2" aria-hidden="true">&ldquo;</span>
                                    <blockquote className="text-slate-600 text-[14px] leading-[1.75] mb-6">{t.quote}</blockquote>
                                    <figcaption className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-100">
                                        <div className="w-9 h-9 bg-tint text-accent rounded-full flex items-center justify-center font-semibold text-sm" aria-hidden="true">{t.initial}</div>
                                        <div className="flex-1 min-w-0"><p className="font-semibold text-primary text-sm">{t.name}</p><p className="text-xs text-slate-500">{t.role}</p></div>
                                        {t.rating > 0 && <div className="flex gap-0.5" aria-label={`Rated ${t.rating} out of 5`}>{[...Array(t.rating)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" aria-hidden="true" />)}</div>}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ 10. FINAL CTA ═══ */}
            <section className="relative overflow-hidden py-16 md:py-20 bg-navy" data-testid="cta-section">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 55% 100% at 50% 0%, #102B4B 0%, transparent 70%)' }} />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4C8DFF]/40 to-transparent" aria-hidden="true" />
                <div className="container-custom max-w-2xl text-center relative">
                    <h2 className="text-2xl sm:text-[2rem] font-bold text-white tracking-tight mb-3">Start your Cambridge learning journey</h2>
                    <p className="text-[#C5D5E8] text-[15px] mb-8 leading-relaxed">Join students building clarity, confidence and results with EdVNova.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1D4ED8] transition-colors text-sm shadow-[0_8px_30px_-8px_rgba(37,99,235,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-navy" data-testid="final-cta-primary">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/learn" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/[0.06] hover:border-white/40 transition-colors text-sm" data-testid="final-cta-secondary">
                            Explore Learning
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
