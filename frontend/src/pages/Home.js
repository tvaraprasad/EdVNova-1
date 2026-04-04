import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star, Lock, Sparkles, Target, Brain, Award, MapPin, Phone, Clock, Zap } from 'lucide-react';

export default function Home() {
    const programs = [
        {
            title: 'Mathematics',
            description: 'Master algebra, geometry, and calculus with conceptual clarity and problem-solving mastery.',
            icon: '∑',
            color: 'bg-blue-50 text-blue-600',
            borderColor: 'hover:border-blue-200',
        },
        {
            title: 'Physics',
            description: 'Understand mechanics, waves, and electricity through visualization and real-world applications.',
            icon: '⚡',
            color: 'bg-amber-50 text-amber-600',
            borderColor: 'hover:border-amber-200',
        },
        {
            title: 'Chemistry',
            description: 'Explore chemical reactions and molecular structures with clarity and depth.',
            icon: '⚗',
            color: 'bg-emerald-50 text-emerald-600',
            borderColor: 'hover:border-emerald-200',
        },
        {
            title: 'Biology',
            description: 'Study life sciences from cells to ecosystems with visual learning techniques.',
            icon: '🧬',
            color: 'bg-rose-50 text-rose-600',
            borderColor: 'hover:border-rose-200',
        },
    ];

    const whyDifferent = [
        {
            title: 'Concept-First Learning',
            description: 'We build deep understanding before formulas. Every concept is taught with "why" before "how" — creating foundations that last.',
            icon: Brain,
        },
        {
            title: 'A* Grade Focus',
            description: 'Our teaching methodology is designed specifically for top grades. 95%+ of our students achieve A*/A in their IGCSE exams.',
            icon: Trophy,
        },
        {
            title: 'Structured Academic System',
            description: 'Systematic 10-month curriculum with 67+ chapters, regular assessments, mock tests, and comprehensive study materials.',
            icon: Target,
        },
        {
            title: 'Personalized Attention',
            description: 'Small batch sizes ensure every student gets individual guidance. Dedicated doubt-clearing sessions and parent updates.',
            icon: Users,
        },
    ];

    const builtForSerious = [
        {
            title: 'Deep Understanding',
            description: 'Not just exam prep — we build genuine scientific thinking and analytical skills that serve students for life.',
        },
        {
            title: 'Long-Term Academic Growth',
            description: 'Our students don\'t just pass exams. They develop the foundation for success in A-Levels, IB, and university.',
        },
        {
            title: 'University Preparation',
            description: 'We prepare students for top global universities with strong fundamentals and profile-building guidance.',
        },
    ];

    // Real testimonials from EdVNova website
    const testimonials = [
        {
            quote: "I had a great learning experience with Vara sir! He has a deep understanding of Physics, Chemistry, Math, and Biology, and explains every concept with clarity and patience. His guidance really helped me build strong fundamentals and boosted my confidence for exams. I'm truly grateful for his support and highly recommend him to any student aiming for academic success.",
            name: "Ishika Dhomse",
            role: "IGCSE Student",
            rating: 5,
            initial: "I"
        },
        {
            quote: "Vara sir tutored my son Pranav in Science and Maths (Year 9) through one-on-one online sessions for a year. He is a patient and dedicated teacher who made concepts easy to understand and learning enjoyable. Thanks to his personalized approach, my son not only improved his understanding but also saw a clear boost in his grades.",
            name: "Venkat",
            role: "Parent",
            rating: 5,
            initial: "V"
        },
        {
            quote: "You were truly a blessing in our children's lives. After a difficult experience with their previous teacher, your entry brought a complete turnaround with your patience, dedication, and personal touch. From customized worksheets to home deliveries, you went above and beyond. As a teacher myself, I deeply admire how you connected with them.",
            name: "Pallavi Kumar",
            role: "Parent",
            rating: 5,
            initial: "P"
        },
    ];

    const stats = [
        { number: '67+', label: 'Curriculum Chapters' },
        { number: '50+', label: 'Students Mentored' },
        { number: '95%+', label: 'Success Rate' },
        { number: 'A*/A', label: 'Average Grade' },
    ];

    const lockedResources = [
        { title: 'Complete IGCSE Formula Sheet', type: 'PDF Guide' },
        { title: 'Physics Past Paper Solutions', type: '50+ Papers' },
        { title: 'Chemistry Reaction Guide', type: 'Reference' },
        { title: 'Biology Diagram Collection', type: 'Visual Guide' },
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* Hero Section - Enhanced */}
            <section className="hero-gradient relative py-24 md:py-32 lg:py-40" data-testid="hero-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="max-w-2xl">
                            <div className="badge-accent mb-8">
                                <Sparkles className="w-4 h-4 mr-2" />
                                IISER Pune Graduate • Expert IGCSE Coaching
                            </div>
                            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tighter font-bold text-primary mb-8 leading-[1.05]">
                                Transform Your IGCSE Science Journey
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-10">
                                Concept-based learning by an experienced IISER graduate. <span className="font-semibold text-primary">95%+ success rate.</span> Small batches. Personalized attention.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-accent text-white font-bold text-lg rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-1"
                                    data-testid="hero-cta-button"
                                >
                                    Book Free Demo Class
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/programs"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-5 border-2 border-gray-200 text-primary font-bold text-lg rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                                    data-testid="hero-programs-button"
                                >
                                    View Courses
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                <span className="text-red-500 font-bold">Limited Seats</span> • Serious Students Only
                            </p>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800&q=80"
                                    alt="Student studying"
                                    className="w-full object-cover aspect-[4/3]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                            <div className="stats-card absolute -bottom-8 -left-8 md:-left-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center">
                                        <Trophy className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-4xl font-bold text-primary">95%+</p>
                                        <p className="text-gray-500 font-medium">Success Rate</p>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-card absolute -top-4 -right-4 md:-right-8 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-primary">IISER</p>
                                        <p className="text-gray-500 text-sm">Pune Graduate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-primary">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <p className="font-heading text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</p>
                                <p className="text-white/60 text-sm font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why EdVNova is Different - TRUST SECTION */}
            <section className="section section-muted" data-testid="why-different-section">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="badge-accent mx-auto mb-6 w-fit">Why We're Different</div>
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-6">
                            Why EdVNova is Different
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We don't just prepare students for exams. We build deep scientific understanding that lasts a lifetime.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyDifferent.map((feature, index) => (
                            <div key={index} className="premium-card p-8 text-center">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <feature.icon className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="font-heading text-xl font-bold text-primary mb-4">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                    {/* CTA within section */}
                    <div className="text-center mt-12">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20"
                        >
                            Book Free Demo Class
                            <ArrowRight className="w-5 h-5" />
                        </Link>
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
                        <p className="text-gray-600 text-lg leading-relaxed">
                            10-month structured programs with 67+ chapters, regular assessments, and comprehensive study materials.
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
                                <h3 className="font-heading text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                                    {program.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {program.description}
                                </p>
                                <div className="flex items-center text-accent font-bold group-hover:gap-3 gap-2 transition-all">
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built for Serious Students - AUTHORITY SECTION */}
            <section className="section section-dark" data-testid="authority-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm font-bold tracking-wide text-white/90 mb-8">
                                For Serious Students Only
                            </div>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-white mb-8">
                                Built for Students Who Want More Than Just Grades
                            </h2>
                            <p className="text-white/70 text-lg mb-10 leading-relaxed">
                                EdVNova is not for everyone. We work with students who are serious about understanding, not just memorizing. Students who want to build foundations for long-term academic success.
                            </p>
                            <div className="space-y-6">
                                {builtForSerious.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-white/60">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all duration-200"
                                >
                                    Apply for Admission
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80"
                                alt="Focused student learning"
                                className="rounded-3xl w-full object-cover aspect-[4/3]"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Award className="w-7 h-7 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Success Rate</p>
                                        <p className="text-2xl font-bold text-primary">95%+ A*/A</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real Testimonials Section */}
            <section className="section section-light" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="badge-accent mx-auto mb-6 w-fit">Success Stories</div>
                        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-6">
                            What Our Students & Parents Say
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Real testimonials from students who have transformed their academic journey with EdVNova.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card" data-testid={`testimonial-card-${index}`}>
                                <div className="flex mb-5">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-8 leading-relaxed relative z-10 text-[15px]">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* CTA within section */}
                    <div className="text-center mt-12">
                        <p className="text-gray-500 mb-4">Join 50+ successful students</p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20"
                        >
                            Book Your Free Demo
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Resource Lock Preview Section */}
            <section className="section section-muted" data-testid="resource-lock-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                        <div>
                            <div className="badge-accent mb-6 w-fit">Premium Resources</div>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-primary mb-6">
                                Unlock Exclusive Study Materials
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Get access to our comprehensive library of formula sheets, past papers, concept guides, and detailed solutions. Available only for enrolled students.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span>67+ chapter-wise notes and summaries</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span>Past paper solutions with explanations</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle className="w-5 h-5 text-accent" />
                                    <span>Formula sheets and quick reference guides</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-lg shadow-accent/20"
                                data-testid="unlock-resources-button"
                            >
                                <Lock className="w-5 h-5" />
                                Unlock All Resources
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            {lockedResources.map((resource, i) => (
                                <div key={i} className="relative premium-card p-6 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent z-10 flex items-end justify-center pb-6">
                                        <Lock className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div className="blur-[3px]">
                                        <BookOpen className="w-10 h-10 text-accent/50 mb-4" />
                                        <p className="font-bold text-primary">{resource.title}</p>
                                        <p className="text-sm text-gray-500">{resource.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section className="section section-light">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="badge-accent mx-auto mb-6 w-fit">Our Presence</div>
                        <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-bold text-primary mb-4">
                            Multiple Locations Across Pune
                        </h2>
                        <p className="text-gray-600">
                            Choose from our convenient locations for in-person classes or join online.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {['Baner', 'Kothrud', 'Amanora', 'Hinjawadi', 'Online'].map((location, i) => (
                            <div key={i} className="premium-card p-6 text-center">
                                <MapPin className="w-6 h-6 text-accent mx-auto mb-3" />
                                <p className="font-bold text-primary">{location}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section - CONVERSION */}
            <section className="section section-light" data-testid="cta-section">
                <div className="container-custom">
                    <div className="relative bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl p-12 md:p-16 lg:p-24 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <div className="inline-flex items-center px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-sm font-bold text-red-300 mb-8">
                                <Zap className="w-4 h-4 mr-2" />
                                Limited Seats Available
                            </div>
                            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight font-bold text-white mb-6">
                                Limited Seats.<br />Serious Students Only.
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                                We only work with students who are committed to excellence. Book a free demo class to see if EdVNova is right for you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary font-bold text-lg rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl"
                                    data-testid="cta-consultation-button"
                                >
                                    Book Free Demo Class
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="https://wa.me/919652546434"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-5 border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
                                >
                                    <Phone className="w-5 h-5" />
                                    WhatsApp Us
                                </a>
                            </div>
                            <p className="text-white/50 text-sm mt-8">
                                Or call us at <a href="tel:+919652546434" className="text-white/70 hover:text-white">+91 9652546434</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
