import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star, Lock, Sparkles, Target, Brain } from 'lucide-react';

export default function Home() {
    const programs = [
        {
            title: 'Mathematics',
            description: 'Master algebra, geometry, and calculus with conceptual clarity.',
            icon: '∑',
            color: 'bg-blue-50 text-blue-600',
            borderColor: 'hover:border-blue-200',
        },
        {
            title: 'Physics',
            description: 'Understand mechanics, waves, and electricity through visualization.',
            icon: '⚡',
            color: 'bg-amber-50 text-amber-600',
            borderColor: 'hover:border-amber-200',
        },
        {
            title: 'Chemistry',
            description: 'Explore chemical reactions and molecular structures.',
            icon: '⚗',
            color: 'bg-emerald-50 text-emerald-600',
            borderColor: 'hover:border-emerald-200',
        },
        {
            title: 'Biology',
            description: 'Study life sciences from cells to ecosystems.',
            icon: '🧬',
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'hover:border-rose-200',
        },
    ];

    const whyEdvnova = [
        {
            title: 'Concept-First Learning',
            description: 'We focus on deep understanding, not memorization. Every concept is taught with clarity.',
            icon: Brain,
        },
        {
            title: 'A* Preparation',
            description: 'Strategic exam preparation with past papers, time management, and scoring techniques.',
            icon: Trophy,
        },
        {
            title: 'Structured Academic System',
            description: 'Systematic curriculum aligned with IGCSE standards and regular assessments.',
            icon: Target,
        },
        {
            title: 'Personalized Attention',
            description: 'Small batch sizes ensure every student gets individual guidance and support.',
            icon: Users,
        },
    ];

    const testimonials = [
        {
            quote: "EdVNova transformed my understanding of Physics. The conceptual approach made complex topics feel intuitive. I went from B to A* in just 6 months.",
            name: "Arjun Mehta",
            grade: "IGCSE Class 10",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
        },
        {
            quote: "The exam strategies taught here are invaluable. My daughter scored A* in Mathematics and Chemistry. The teachers truly care about each student's success.",
            name: "Mrs. Deshmukh",
            grade: "Parent",
            rating: 5,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
        },
        {
            quote: "Best coaching institute in Pune for IGCSE. The conceptual clarity I gained here helped me excel not just in exams but in understanding science deeply.",
            name: "Priya Sharma",
            grade: "IGCSE Class 10",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
        },
    ];

    const lockedResources = [
        { title: 'Complete IGCSE Formula Sheet', type: 'PDF Guide' },
        { title: 'Physics Past Paper Solutions', type: '50+ Papers' },
        { title: 'Chemistry Reaction Guide', type: 'Reference' },
        { title: 'Biology Diagram Collection', type: 'Visual Guide' },
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* Hero Section - Premium */}
            <section className="hero-gradient relative py-20 md:py-28 lg:py-36" data-testid="hero-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <div className="max-w-2xl">
                            <div className="badge-accent mb-6">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Advanced IGCSE Coaching • Pune
                            </div>
                            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tighter font-bold text-primary mb-8 leading-[1.1]">
                                The Most Advanced IGCSE Coaching in Pune
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-10">
                                Master concepts. Think scientifically. Achieve A* results. Join Pune's premier institute where 95% of our students achieve A*/A grades.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/programs"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
                                    data-testid="hero-cta-button"
                                >
                                    Explore Programs
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-primary font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    data-testid="hero-consultation-button"
                                >
                                    Book Free Consultation
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800&q=80"
                                    alt="Student studying"
                                    className="w-full object-cover aspect-[4/3]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="stats-card absolute -bottom-8 -left-8 md:-left-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center">
                                        <Trophy className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-primary">95%</p>
                                        <p className="text-gray-500 font-medium">A*/A Grades</p>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-card absolute -top-4 -right-4 md:-right-8 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">500+</p>
                                        <p className="text-gray-500 text-sm">Students</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="section section-light" data-testid="programs-section">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="badge-accent mx-auto mb-6 w-fit">Our Programs</div>
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-6">
                            Comprehensive IGCSE Courses
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Expert-led programs designed for deep understanding and exam excellence. Choose your subject and start your journey.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {programs.map((program) => (
                            <Link
                                key={program.title}
                                to={`/programs/${program.title.toLowerCase()}`}
                                className={`premium-card p-8 group ${program.borderColor}`}
                                data-testid={`program-card-${program.title.toLowerCase()}`}
                            >
                                <div className={`w-16 h-16 ${program.color} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
                                    {program.icon}
                                </div>
                                <h3 className="font-heading text-xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                                    {program.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {program.description}
                                </p>
                                <div className="flex items-center text-accent font-semibold group-hover:gap-3 gap-2 transition-all">
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why EdVNova Section - Enhanced */}
            <section className="section section-muted" data-testid="features-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="badge-accent mb-6 w-fit">Why EdVNova</div>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-8">
                                A different approach to IGCSE education
                            </h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                We believe in building strong foundations through conceptual understanding, not rote memorization. Our teaching methodology focuses on making complex topics intuitive and applicable.
                            </p>
                            <div className="space-y-5">
                                {['Small batch sizes for personalized attention', 'Regular assessments and progress tracking', 'Parent-teacher communication portal', 'Comprehensive study materials included'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-accent" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {whyEdvnova.map((feature, index) => (
                                <div key={feature.title} className="premium-card p-8">
                                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                                        <feature.icon className="w-7 h-7 text-accent" />
                                    </div>
                                    <h3 className="font-heading text-lg font-semibold text-primary mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Enhanced */}
            <section className="section section-light" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="badge-accent mx-auto mb-6 w-fit">Testimonials</div>
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary">
                            What our students say
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card" data-testid={`testimonial-card-${index}`}>
                                <div className="flex mb-5">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-8 leading-relaxed relative z-10">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={testimonial.image} 
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-primary">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.grade}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resource Lock Preview Section - New */}
            <section className="section section-muted" data-testid="resource-lock-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="badge-accent mb-6 w-fit">Premium Resources</div>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-6">
                                Unlock exclusive study materials
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Get access to our comprehensive library of formula sheets, past papers, concept guides, and video tutorials. Join EdVNova to unlock all resources.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/25"
                                data-testid="unlock-resources-button"
                            >
                                <Lock className="w-5 h-5" />
                                Unlock All Resources
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {lockedResources.map((resource, i) => (
                                <div key={i} className="relative premium-card p-6 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent z-10 flex items-end justify-center pb-6">
                                        <Lock className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="blur-[2px]">
                                        <BookOpen className="w-10 h-10 text-accent/50 mb-4" />
                                        <p className="font-semibold text-primary">{resource.title}</p>
                                        <p className="text-sm text-gray-500">{resource.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Resources Preview Section - Dark */}
            <section className="section section-dark text-white" data-testid="resources-preview-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-semibold tracking-wide text-white/90 mb-6">
                                Study Materials
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-white mb-6">
                                Access premium study materials
                            </h2>
                            <p className="text-white/70 text-lg mb-10 leading-relaxed">
                                Get access to our comprehensive library of study notes, formula sheets, past papers, and video tutorials. Sign up to unlock all resources.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/resources"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
                                    data-testid="resources-preview-button"
                                >
                                    Preview Resources
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
                                >
                                    Sign Up for Full Access
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            {['Mathematics Formula Sheet', 'Physics Concepts Guide', 'Chemistry Reactions', 'Biology Diagrams'].map((item, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/15 transition-colors">
                                    <BookOpen className="w-10 h-10 text-accent mb-4" />
                                    <p className="font-semibold text-white">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section - Premium */}
            <section className="section section-light" data-testid="cta-section">
                <div className="container-custom">
                    <div className="relative bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl p-12 md:p-16 lg:p-20 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                        <div className="relative z-10">
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-white mb-6">
                                Limited Seats. Serious Students Only.
                            </h2>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-10">
                                Join EdVNova today and take the first step towards academic excellence. Book a free consultation to discuss your child's learning goals.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl"
                                    data-testid="cta-consultation-button"
                                >
                                    Book Free Consultation
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/programs"
                                    className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-200"
                                >
                                    View All Programs
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
