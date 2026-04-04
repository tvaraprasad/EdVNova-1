import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star, Lock, Target, Brain, Award, MapPin, Phone, Zap } from 'lucide-react';

export default function Home() {
    const programs = [
        {
            title: 'Mathematics',
            description: 'Master algebra, geometry, and calculus with conceptual clarity and structured problem solving.',
            icon: '∑',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Physics',
            description: 'Understand mechanics, waves, and electricity through visualization and real-world applications.',
            icon: '⚡',
            color: 'bg-amber-50 text-amber-600',
        },
        {
            title: 'Chemistry',
            description: 'Explore chemical reactions and molecular structures with clarity and depth.',
            icon: '⚗',
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Biology',
            description: 'Study life sciences from cells to ecosystems with visual learning techniques.',
            icon: '🧬',
            color: 'bg-rose-50 text-rose-600',
        },
    ];

    const whyDifferent = [
        {
            title: 'Deep Conceptual Understanding',
            description: 'We focus on building true understanding over memorization. Every concept is taught with clarity and depth.',
            icon: Brain,
        },
        {
            title: 'Independent Problem Solving',
            description: 'Students learn to think and solve problems on their own, building confidence for exams and beyond.',
            icon: Target,
        },
        {
            title: 'A* Level Preparation',
            description: 'Our teaching methodology is designed specifically for top grades. 95%+ of students achieve A*/A.',
            icon: Trophy,
        },
        {
            title: 'Long-Term Academic Foundation',
            description: 'We build foundations that last — preparing students for A-Levels, IB, and university success.',
            icon: GraduationCap,
        },
    ];

    // Real testimonials from EdVNova website
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

    const stats = [
        { number: '67+', label: 'Curriculum Chapters' },
        { number: '50+', label: 'Students Mentored' },
        { number: '95%+', label: 'Success Rate' },
        { number: 'A*/A', label: 'Average Grade' },
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* Hero Section */}
            <section className="hero-gradient relative py-24 md:py-32 lg:py-40" data-testid="hero-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="max-w-xl">
                            <p className="text-sm font-semibold text-accent tracking-wide uppercase mb-6">
                                IISER Pune Graduate • Expert IGCSE Coaching
                            </p>
                            <h1 className="text-5xl sm:text-6xl font-bold text-primary tracking-tight leading-[1.1] mb-8">
                                The Most Advanced IGCSE Coaching in Pune
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-10">
                                We help students master concepts, think scientifically, and achieve A* results in Mathematics and Sciences.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all duration-200"
                                    data-testid="hero-cta-button"
                                >
                                    Book Academic Consultation
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/programs"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-primary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                                    data-testid="hero-programs-button"
                                >
                                    Explore Programs
                                </Link>
                            </div>
                            <p className="text-sm text-gray-500">
                                Limited seats available for 2024-25 batch
                            </p>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800&q=80"
                                    alt="Student studying"
                                    className="w-full object-cover aspect-[4/3]"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">95%+</p>
                                        <p className="text-gray-500 text-sm">Success Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-10 bg-primary">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <p className="text-3xl font-bold text-white mb-1">{stat.number}</p>
                                <p className="text-white/60 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why EdVNova is Different */}
            <section className="py-24 md:py-32 bg-gray-50" data-testid="why-different-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-6">
                            Why EdVNova is Different
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            We don't just prepare students for exams. We build deep scientific understanding that lasts a lifetime.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyDifferent.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-primary mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="py-24 md:py-32 bg-white" data-testid="programs-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-6">
                            Comprehensive IGCSE Courses
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            10-month structured programs with 67+ chapters, regular assessments, and comprehensive study materials.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {programs.map((program) => (
                            <Link
                                key={program.title}
                                to={`/programs/${program.title.toLowerCase()}`}
                                className="group bg-white p-8 rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                                data-testid={`program-card-${program.title.toLowerCase()}`}
                            >
                                <div className={`w-14 h-14 ${program.color} rounded-xl flex items-center justify-center text-2xl mb-6`}>
                                    {program.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                                    {program.title}
                                </h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {program.description}
                                </p>
                                <span className="text-accent font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Teaching Approach */}
            <section className="py-24 md:py-32 bg-gray-50">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-6">
                                Our Teaching Approach
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Every concept is taught with clarity, followed by structured problem solving and exam-focused practice. Students learn not just how to solve questions, but how to think.
                            </p>
                            <div className="space-y-4">
                                {[
                                    'Concept-first explanations with real-world examples',
                                    'Structured problem-solving methodology',
                                    'Regular assessments and progress tracking',
                                    'Past paper practice with detailed solutions'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80"
                                alt="Teaching methodology"
                                className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile Building Section */}
            <section className="py-24 md:py-32 bg-primary text-white" data-testid="profile-building-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-sm font-semibold text-accent tracking-wide uppercase mb-4">
                                Beyond Academics
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
                                Profile Building for Future Success
                            </h2>
                            <p className="text-white/80 text-lg leading-relaxed mb-8">
                                We help students go beyond academics by building strong profiles through research projects, competitions, and structured academic activities — preparing them for top universities worldwide.
                            </p>
                            <div className="space-y-4 mb-8">
                                {[
                                    'Research project mentorship and guidance',
                                    'Academic competition preparation',
                                    'Leadership and extracurricular planning',
                                    'University application support'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                        <span className="text-white/90">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/profile-building"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200"
                            >
                                Learn More
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
                                alt="University success"
                                className="rounded-2xl w-full object-cover aspect-[4/3]"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-xl shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                        <Award className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Preparing for</p>
                                        <p className="font-semibold text-primary">Top Universities</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 md:py-32 bg-white" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-6">
                            What Parents & Students Say
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Real feedback from our students and their families.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 p-8 rounded-xl" data-testid={`testimonial-card-${index}`}>
                                <div className="flex gap-1 mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-8 leading-relaxed">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                                        {testimonial.initial}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Locations Section */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-4">
                            Locations Across Pune
                        </h2>
                        <p className="text-gray-600">
                            Choose from convenient locations or join online.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['Baner', 'Kothrud', 'Amanora', 'Hinjawadi', 'Online'].map((location, i) => (
                            <div key={i} className="flex items-center gap-2 px-5 py-3 bg-white rounded-full border border-gray-200">
                                <MapPin className="w-4 h-4 text-accent" />
                                <span className="font-medium text-primary">{location}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 md:py-32 bg-white" data-testid="cta-section">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-100 rounded-full text-sm font-medium text-red-600 mb-8">
                            <Zap className="w-4 h-4 mr-2" />
                            Limited Seats Available
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-6">
                            Limited Seats.<br />Serious Students Only.
                        </h2>
                        <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                            We work with a focused group of students to ensure quality learning and individual attention. Book a consultation to see if EdVNova is right for you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all duration-200"
                                data-testid="cta-consultation-button"
                            >
                                Book Consultation
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="https://wa.me/919652546434"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 text-primary font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                                <Phone className="w-5 h-5" />
                                WhatsApp Us
                            </a>
                        </div>
                        <p className="text-gray-500 text-sm mt-6">
                            Or call us at <a href="tel:+919652546434" className="text-primary font-medium">+91 9652546434</a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
