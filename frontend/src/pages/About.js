import { GraduationCap, Target, BookOpen, Users, Sparkles, CheckCircle } from 'lucide-react';

export default function About() {
    return (
        <div className="pt-16 md:pt-20" data-testid="about-page">
            {/* Hero */}
            <section className="hero-gradient py-20 md:py-28 lg:py-32">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="badge-accent mx-auto mb-6 w-fit">
                            <Sparkles className="w-4 h-4 mr-2" />
                            About EdVNova
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-bold text-primary mb-8">
                            Redefining IGCSE education in Pune
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            We are committed to nurturing academic excellence through conceptual understanding, personalized mentorship, and strategic exam preparation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="section section-light">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80"
                                alt="EdVNova Learning Environment"
                                className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
                            />
                            <div className="absolute -bottom-8 -right-8 stats-card hidden md:block">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-accent to-blue-600 rounded-2xl flex items-center justify-center">
                                        <GraduationCap className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">8+</p>
                                        <p className="text-gray-500">Years Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="badge-accent mb-6 w-fit">Our Vision</div>
                            <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-bold text-primary mb-8">
                                Building foundations for lifelong learning
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                At EdVNova, we believe that true education goes beyond exam scores. Our mission is to develop critical thinkers, problem solvers, and lifelong learners who are prepared for the challenges of tomorrow.
                            </p>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Founded with a passion for quality education, EdVNova brings together experienced educators who share a common goal: to make complex subjects accessible and engaging for every student.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="section section-muted">
                <div className="container-custom">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="badge-accent mx-auto mb-6 w-fit">Our Philosophy</div>
                        <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-bold text-primary">
                            The EdVNova approach
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Conceptual Clarity',
                                description: 'We focus on understanding "why" before "how", building strong foundations that support advanced learning.',
                            },
                            {
                                icon: Target,
                                title: 'Strategic Preparation',
                                description: 'Our exam strategies are developed through years of experience and analysis of past papers and trends.',
                            },
                            {
                                icon: Users,
                                title: 'Personal Attention',
                                description: 'Small batch sizes ensure every student receives the guidance and support they need to excel.',
                            },
                            {
                                icon: GraduationCap,
                                title: 'Holistic Development',
                                description: 'Beyond academics, we nurture critical thinking, communication skills, and confidence.',
                            },
                        ].map((item, index) => (
                            <div key={index} className="premium-card p-8 text-center">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold text-primary mb-4">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-primary text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { number: '500+', label: 'Students Taught' },
                            { number: '95%', label: 'A*/A Grades' },
                            { number: '8+', label: 'Years Experience' },
                            { number: '4', label: 'Core Subjects' },
                        ].map((stat, index) => (
                            <div key={index}>
                                <p className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">{stat.number}</p>
                                <p className="text-white/60 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Conceptual Learning */}
            <section className="section section-light">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="badge-accent mb-6 w-fit">Conceptual Learning</div>
                            <h2 className="font-heading text-3xl sm:text-4xl tracking-tight font-bold text-primary mb-8">
                                Understanding over memorization
                            </h2>
                            <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                                Our teaching methodology is rooted in the belief that true mastery comes from understanding concepts at their core. We don't just teach formulas – we explain where they come from and why they work.
                            </p>
                            <div className="space-y-5">
                                {[
                                    'Visual explanations and real-world applications',
                                    'Interactive problem-solving sessions',
                                    'Connections between related concepts',
                                    'Building blocks approach for complex topics',
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-accent" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1758685848095-249ad965f4f3?w=800&q=80"
                                alt="Mathematical concepts"
                                className="rounded-3xl shadow-2xl w-full object-cover aspect-square"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
