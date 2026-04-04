import { Link } from 'react-router-dom';
import { ArrowRight, Award, Lightbulb, Users, Trophy } from 'lucide-react';

export default function ProfileBuilding() {
    const opportunities = [
        {
            title: 'Research Projects',
            description: 'Engage in guided research projects with mentorship from experienced academics.',
            icon: Lightbulb,
            features: ['Individual research mentorship', 'Publication guidance', 'Research methodology training', 'Topic selection support']
        },
        {
            title: 'Academic Competitions',
            description: 'Prepare for and participate in national and international academic competitions.',
            icon: Trophy,
            features: ['Math Olympiad prep', 'Science competitions', 'Essay contests', 'Debate championships']
        },
        {
            title: 'Leadership Programs',
            description: 'Develop leadership skills through curated programs and community initiatives.',
            icon: Users,
            features: ['Student council guidance', 'Community service projects', 'Leadership workshops', 'Public speaking training']
        },
        {
            title: 'Certifications',
            description: 'Earn industry-recognized certifications to enhance your academic profile.',
            icon: Award,
            features: ['Coding certifications', 'Language proficiency', 'Skill-based courses', 'Online learning platforms']
        }
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="profile-building-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Profile Building</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Build a standout academic profile
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Go beyond academics. Develop research experience, win competitions, and demonstrate leadership to create a compelling profile for top universities.
                        </p>
                    </div>
                </div>
            </section>

            {/* Opportunities */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8">
                        {opportunities.map((opportunity, index) => (
                            <div key={index} className="premium-card p-8">
                                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                    <opportunity.icon className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="font-heading text-xl font-medium text-primary mb-3">
                                    {opportunity.title}
                                </h3>
                                <p className="text-text-secondary mb-6">
                                    {opportunity.description}
                                </p>
                                <ul className="space-y-2">
                                    {opportunity.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why It Matters */}
            <section className="section bg-background">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Why It Matters</p>
                            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary mb-6">
                                Stand out in university applications
                            </h2>
                            <p className="text-text-secondary mb-6 leading-relaxed">
                                Top universities look beyond grades. They seek students with demonstrated passion, initiative, and leadership. Our profile building program helps you develop these qualities authentically.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Differentiate yourself from other applicants',
                                    'Demonstrate passion for your chosen field',
                                    'Show initiative and self-motivation',
                                    'Build skills valuable for future careers'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                                        </div>
                                        <span className="text-text-primary">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1675179190669-ef6bc809d8d7?w=800&q=80"
                                alt="Student working on project"
                                className="rounded-2xl shadow-lg w-full object-cover aspect-square"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-white mb-4">
                            Ready to build your profile?
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-8">
                            Schedule a consultation to discuss profile building opportunities tailored to your goals.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            data-testid="profile-building-cta"
                        >
                            Book Consultation
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
