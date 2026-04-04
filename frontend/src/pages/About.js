import { GraduationCap, Target, BookOpen, Users } from 'lucide-react';

export default function About() {
    return (
        <div className="pt-16 md:pt-20" data-testid="about-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">About EdVNova</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Redefining IGCSE education in Pune
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            We are committed to nurturing academic excellence through conceptual understanding, personalized mentorship, and strategic exam preparation.
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80"
                                alt="EdVNova Learning Environment"
                                className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Our Vision</p>
                            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-6">
                                Building foundations for lifelong learning
                            </h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                At EdVNova, we believe that true education goes beyond exam scores. Our mission is to develop critical thinkers, problem solvers, and lifelong learners who are prepared for the challenges of tomorrow.
                            </p>
                            <p className="text-text-secondary leading-relaxed">
                                Founded with a passion for quality education, EdVNova brings together experienced educators who share a common goal: to make complex subjects accessible and engaging for every student.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="section bg-background">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Our Philosophy</p>
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary">
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
                            <div key={index} className="premium-card p-6 text-center">
                                <item.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                                <h3 className="font-heading text-lg font-medium text-primary mb-2">{item.title}</h3>
                                <p className="text-text-secondary text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-primary text-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: '500+', label: 'Students Taught' },
                            { number: '95%', label: 'A*/A Grades' },
                            { number: '8+', label: 'Years Experience' },
                            { number: '4', label: 'Core Subjects' },
                        ].map((stat, index) => (
                            <div key={index}>
                                <p className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</p>
                                <p className="text-white/70">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Conceptual Learning */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Conceptual Learning</p>
                            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-6">
                                Understanding over memorization
                            </h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                Our teaching methodology is rooted in the belief that true mastery comes from understanding concepts at their core. We don't just teach formulas – we explain where they come from and why they work.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Visual explanations and real-world applications',
                                    'Interactive problem-solving sessions',
                                    'Connections between related concepts',
                                    'Building blocks approach for complex topics',
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                                        <span className="text-text-primary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1758685848095-249ad965f4f3?w=800&q=80"
                                alt="Mathematical concepts"
                                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
