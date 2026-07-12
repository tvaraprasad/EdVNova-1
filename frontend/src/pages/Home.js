import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star, Brain, Award, Target, Phone, Sparkles, FileText, Play, Compass, BookMarked, FlaskConical, Atom, Leaf, Calculator } from 'lucide-react';

export default function Home() {
    const testimonials = [
        {
            quote: "I had a great learning experience with Vara sir! He has a deep understanding of Physics, Chemistry, Math, and Biology, and explains every concept with clarity and patience. His guidance really helped me build strong fundamentals and boosted my confidence for exams.",
            name: "Ishika Dhomse",
            role: "IGCSE Student",
            rating: 5,
            initial: "I"
        },
        {
            quote: "Vara sir tutored my son Pranav in Science and Maths through one-on-one online sessions for a year. He is a patient and dedicated teacher who made concepts easy to understand. Thanks to his personalized approach, my son saw a clear boost in his grades.",
            name: "Venkat",
            role: "Parent",
            rating: 5,
            initial: "V"
        },
        {
            quote: "You were truly a blessing in our children's lives. After a difficult experience with their previous teacher, your entry brought a complete turnaround with your patience, dedication, and personal touch. As a teacher myself, I deeply admire how you connected with them.",
            name: "Pallavi Kumar",
            role: "Parent",
            rating: 5,
            initial: "P"
        },
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">

            {/* ═══ HERO ═══ */}
            <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden" data-testid="hero-section">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="container-custom relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-8" data-testid="hero-badge">
                            <Sparkles className="w-4 h-4" />
                            Premium Learning for Cambridge Students
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-6" data-testid="hero-headline">
                            The Premium Learning Platform for{' '}
                            <span className="text-accent">Cambridge Students</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
                            Master Mathematics and Science through expert coaching, structured resources, premium courses, and academic guidance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link
                                to="/learn"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all duration-200 shadow-lg shadow-primary/20"
                                data-testid="hero-cta-learn"
                            >
                                Start Learning
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-primary font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                data-testid="hero-cta-consult"
                            >
                                Book Consultation
                            </Link>
                        </div>

                        <p className="text-sm text-gray-400">
                            Trusted by students across India, UAE, UK, and Singapore
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ TRUST STRIP ═══ */}
            <section className="py-6 bg-primary" data-testid="trust-strip">
                <div className="container-custom">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8 text-center">
                        {[
                            { num: '340+', label: 'Revision Topics' },
                            { num: '3', label: 'Cambridge Boards' },
                            { num: '4', label: 'Core Subjects' },
                            { num: '95%+', label: 'Success Rate' },
                            { num: 'A*/A', label: 'Average Grade' },
                        ].map((s, i) => (
                            <div key={i} className="py-3">
                                <p className="text-2xl md:text-3xl font-bold text-white">{s.num}</p>
                                <p className="text-white/50 text-xs sm:text-sm mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CHOOSE YOUR PATH ═══ */}
            <section className="py-20 md:py-28 bg-white" data-testid="choose-path-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                            Choose Your Path
                        </h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Whether you need guided learning, practice resources, or academic mentorship — we've got you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Card 1: Guided Learning */}
                        <Link
                            to="/learn"
                            className="group relative p-8 lg:p-10 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                            data-testid="path-coaching"
                        >
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Need Guided Learning?</h3>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Live coaching, mentoring, and structured academic support for IGCSE, AS & A Level students.
                            </p>
                            <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                                Explore Learning <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        {/* Card 2: Notes & Practice */}
                        <Link
                            to="/resources"
                            className="group relative p-8 lg:p-10 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                            data-testid="path-resources"
                        >
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                                <FileText className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Need Notes & Practice Resources?</h3>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Revision notes, worksheets, topic questions, formula sheets, and study guides for every chapter.
                            </p>
                            <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                                Explore Resources <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        {/* Card 3: Beyond Academics */}
                        <Link
                            to="/profile-building"
                            className="group relative p-8 lg:p-10 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
                            data-testid="path-community"
                        >
                            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-violet-100 transition-colors">
                                <Compass className="w-7 h-7 text-violet-600" />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Looking Beyond Academics?</h3>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Profile building, workshops, career guidance, and academic mentorship for university readiness.
                            </p>
                            <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                                Explore Community <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ BOARD SELECTION ═══ */}
            <section className="py-20 md:py-28 bg-slate-50" data-testid="board-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                            Choose Your Curriculum
                        </h2>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Structured learning for IGCSE, AS & A Level students. Select your board to explore subjects, notes, and resources.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { name: 'Cambridge IGCSE', slug: 'igcse', desc: 'Ages 14–16. The world\'s most popular international qualification.', color: 'from-blue-600 to-blue-700' },
                            { name: 'AS Level', slug: 'as-level', desc: 'Ages 16–17. Advanced Subsidiary — the first half of A Level.', color: 'from-indigo-600 to-indigo-700' },
                            { name: 'A Level', slug: 'a-level', desc: 'Ages 17–18. The gold standard pre-university qualification.', color: 'from-violet-600 to-violet-700' },
                        ].map(board => (
                            <Link
                                key={board.slug}
                                to={`/learn/${board.slug}`}
                                className="group relative overflow-hidden rounded-2xl"
                                data-testid={`board-card-${board.slug}`}
                            >
                                <div className={`bg-gradient-to-br ${board.color} p-8 lg:p-10 text-white min-h-[220px] flex flex-col justify-between`}>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-3">{board.name}</h3>
                                        <p className="text-white/70 text-sm leading-relaxed">{board.desc}</p>
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

            {/* ═══ WHY EDVNOVA ═══ */}
            <section className="py-20 md:py-28 bg-white" data-testid="why-different-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                            Why EdVNova is Different
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We don't just prepare students for exams. We build deep understanding that lasts a lifetime.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            { icon: Brain, title: 'Concept-First Learning', desc: 'Every concept taught with clarity and depth. True understanding over memorization.' },
                            { icon: Target, title: 'Structured Systems', desc: 'No random studying. Organized curriculum, clear progression, measurable outcomes.' },
                            { icon: Trophy, title: 'A* Level Performance', desc: 'Teaching methodology designed specifically for top grades. 95%+ achieve A*/A.' },
                            { icon: BookMarked, title: 'Premium Resources', desc: 'Topic-wise revision notes, formulas, worked examples, and examiner tips.' },
                            { icon: Compass, title: 'Personalized Guidance', desc: 'Individual attention, progress tracking, and academic strategy for serious students.' },
                            { icon: GraduationCap, title: 'Long-Term Foundation', desc: 'Preparing students not just for exams but for university and career success.' },
                        ].map((f, i) => (
                            <div key={i} className="p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-5">
                                    <f.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">{f.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-[15px]">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SUBJECTS PREVIEW ═══ */}
            <section className="py-20 md:py-28 bg-slate-50" data-testid="subjects-section">
                <div className="container-custom">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                            Subjects We Cover
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Comprehensive support across all core Cambridge subjects.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Mathematics', icon: Calculator, color: 'bg-blue-50 text-blue-600 border-blue-100', accent: 'text-blue-600', desc: 'Algebra, geometry, calculus, statistics, and more.' },
                            { title: 'Physics', icon: Atom, color: 'bg-violet-50 text-violet-600 border-violet-100', accent: 'text-violet-600', desc: 'Mechanics, waves, electricity, and nuclear physics.' },
                            { title: 'Chemistry', icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', accent: 'text-emerald-600', desc: 'Atomic structure, bonding, organic, and beyond.' },
                            { title: 'Biology', icon: Leaf, color: 'bg-teal-50 text-teal-600 border-teal-100', accent: 'text-teal-600', desc: 'Cell biology, physiology, genetics, and ecology.' },
                        ].map(subj => (
                            <Link
                                key={subj.title}
                                to={`/programs/${subj.title.toLowerCase()}`}
                                className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                                data-testid={`subject-card-${subj.title.toLowerCase()}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${subj.color}`}>
                                    <subj.icon className="w-7 h-7" />
                                </div>
                                <h3 className={`text-xl font-bold text-primary mb-2 group-hover:${subj.accent} transition-colors`}>
                                    {subj.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{subj.desc}</p>
                                <span className="text-accent font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View Programs <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-20 md:py-28 bg-white" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                            What Parents & Students Say
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Real feedback from our students and their families.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {testimonials.map((t, index) => (
                            <div
                                key={index}
                                className="p-8 bg-slate-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300"
                                data-testid={`testimonial-card-${index}`}
                            >
                                <div className="flex gap-1 mb-5">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-[15px]">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {t.initial}
                                    </div>
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

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-24 md:py-32 bg-primary" data-testid="cta-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
                            Start Your Cambridge Learning Journey Today
                        </h2>
                        <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                            Join students who are building clarity, confidence, and results with EdVNova. Book a free consultation or explore our resources.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
                                data-testid="cta-consultation-button"
                            >
                                Book Consultation
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/learn"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
                                data-testid="cta-explore-button"
                            >
                                Start Learning
                            </Link>
                        </div>
                        <p className="text-white/40 text-sm mt-8">
                            Or reach us on <a href="https://wa.me/919652546434" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white underline underline-offset-2">WhatsApp</a> or call <a href="tel:+919652546434" className="text-white/60 hover:text-white underline underline-offset-2">+91 9652546434</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
