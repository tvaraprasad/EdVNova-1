import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Trophy, GraduationCap, CheckCircle, Star } from 'lucide-react';

export default function Home() {
    const programs = [
        {
            title: 'Mathematics',
            description: 'Master algebra, geometry, and calculus with conceptual clarity.',
            icon: '∑',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Physics',
            description: 'Understand mechanics, waves, and electricity through visualization.',
            icon: '⚡',
            color: 'bg-amber-50 text-amber-600',
        },
        {
            title: 'Chemistry',
            description: 'Explore chemical reactions and molecular structures.',
            icon: '⚗',
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Biology',
            description: 'Study life sciences from cells to ecosystems.',
            icon: '🧬',
            color: 'bg-rose-50 text-rose-600',
        },
    ];

    const features = [
        {
            title: 'Conceptual Learning',
            description: 'Focus on understanding, not memorization. Build strong foundations that last.',
            icon: BookOpen,
        },
        {
            title: 'Expert Faculty',
            description: 'Learn from experienced educators with proven track records.',
            icon: Users,
        },
        {
            title: 'Exam Excellence',
            description: 'Strategic preparation with past papers and time management.',
            icon: Trophy,
        },
        {
            title: 'Personal Mentorship',
            description: 'One-on-one guidance to address individual learning needs.',
            icon: GraduationCap,
        },
    ];

    const testimonials = [
        {
            quote: "EdVNova transformed my understanding of Physics. The conceptual approach made complex topics feel intuitive.",
            name: "Arjun Mehta",
            grade: "IGCSE Class 10",
            rating: 5,
        },
        {
            quote: "The exam strategies taught here helped me score A* in Mathematics. Highly recommended!",
            name: "Priya Sharma",
            grade: "IGCSE Class 10",
            rating: 5,
        },
        {
            quote: "Best decision for my daughter's education. The teachers are incredibly supportive and knowledgeable.",
            name: "Mrs. Deshmukh",
            grade: "Parent",
            rating: 5,
        },
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="home-page">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-background to-white py-16 md:py-24 lg:py-32" data-testid="hero-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
                                Advanced IGCSE Coaching • Pune
                            </p>
                            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                                Excel in IGCSE with conceptual mastery
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed mb-8">
                                Join Pune's premier IGCSE coaching institute. Our expert faculty combines deep subject knowledge with proven exam strategies to help students achieve academic excellence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/programs"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                                    data-testid="hero-cta-button"
                                >
                                    Explore Programs
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-primary font-medium rounded-lg hover:bg-background transition-colors"
                                    data-testid="hero-consultation-button"
                                >
                                    Book Consultation
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800&q=80"
                                alt="Student studying"
                                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">95%</p>
                                        <p className="text-sm text-text-secondary">A*/A Grades</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Programs Section */}
            <section className="section bg-white" data-testid="programs-section">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Our Programs</p>
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-4">
                            Comprehensive IGCSE Courses
                        </h2>
                        <p className="text-text-secondary">
                            Expert-led programs designed for deep understanding and exam excellence.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {programs.map((program) => (
                            <Link
                                key={program.title}
                                to={`/programs/${program.title.toLowerCase()}`}
                                className="premium-card p-6 group"
                                data-testid={`program-card-${program.title.toLowerCase()}`}
                            >
                                <div className={`w-14 h-14 ${program.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                                    {program.icon}
                                </div>
                                <h3 className="font-heading text-xl font-medium text-primary mb-2 group-hover:text-accent transition-colors">
                                    {program.title}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    {program.description}
                                </p>
                                <div className="mt-4 flex items-center text-accent text-sm font-medium">
                                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why EdVNova Section */}
            <section className="section bg-background" data-testid="features-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Why EdVNova</p>
                            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-6">
                                A different approach to IGCSE education
                            </h2>
                            <p className="text-text-secondary mb-8">
                                We believe in building strong foundations through conceptual understanding, not rote memorization. Our teaching methodology focuses on making complex topics intuitive and applicable.
                            </p>
                            <div className="space-y-4">
                                {['Small batch sizes for personalized attention', 'Regular assessments and progress tracking', 'Parent-teacher communication portal', 'Comprehensive study materials'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                        <span className="text-text-primary">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <div key={feature.title} className={`premium-card p-6 ${index === 0 ? 'col-span-2 sm:col-span-1' : ''}`}>
                                    <feature.icon className="w-8 h-8 text-accent mb-4" />
                                    <h3 className="font-heading text-lg font-medium text-primary mb-2">{feature.title}</h3>
                                    <p className="text-text-secondary text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section bg-white" data-testid="testimonials-section">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Testimonials</p>
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary">
                            What our students say
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="premium-card p-8" data-testid={`testimonial-card-${index}`}>
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-text-secondary mb-6 leading-relaxed">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-medium text-primary">{testimonial.name}</p>
                                    <p className="text-sm text-text-secondary">{testimonial.grade}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resources Preview Section */}
            <section className="section bg-secondary text-white" data-testid="resources-preview-section">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Resources</p>
                            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-white mb-6">
                                Access premium study materials
                            </h2>
                            <p className="text-white/80 mb-8">
                                Get access to our comprehensive library of study notes, formula sheets, past papers, and video tutorials. Sign up to unlock all resources.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/resources"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                    data-testid="resources-preview-button"
                                >
                                    Preview Resources
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Sign Up for Full Access
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {['Mathematics Formula Sheet', 'Physics Concepts Guide', 'Chemistry Reactions', 'Biology Diagrams'].map((item, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                    <BookOpen className="w-8 h-8 text-accent mb-3" />
                                    <p className="font-medium text-white text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-background" data-testid="cta-section">
                <div className="container-custom">
                    <div className="bg-white rounded-2xl p-8 md:p-12 lg:p-16 border border-border text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-4">
                            Ready to excel in IGCSE?
                        </h2>
                        <p className="text-text-secondary max-w-2xl mx-auto mb-8">
                            Join EdVNova today and take the first step towards academic excellence. Book a free consultation to discuss your child's learning goals.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                                data-testid="cta-consultation-button"
                            >
                                Book Free Consultation
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/programs"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-primary font-medium rounded-lg hover:bg-background transition-colors"
                            >
                                View All Programs
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
