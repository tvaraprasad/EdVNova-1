import { Link } from 'react-router-dom';
import { ArrowRight, Compass, BookOpen, Users, Target } from 'lucide-react';

export default function CareerGuidance() {
    const services = [
        {
            title: 'Subject Selection',
            description: 'Get expert guidance on choosing the right IGCSE subjects based on your interests and career aspirations.',
            icon: BookOpen,
            points: ['Aptitude assessment', 'Career path mapping', 'Subject combination advice', 'University requirements analysis']
        },
        {
            title: 'Career Counseling',
            description: 'One-on-one sessions with experienced counselors to explore career options and create a roadmap.',
            icon: Compass,
            points: ['Interest and skill assessment', 'Industry insights', 'Career roadmap planning', 'Goal setting']
        },
        {
            title: 'Mentorship Program',
            description: 'Connect with professionals and alumni who can guide you through your academic and career journey.',
            icon: Users,
            points: ['Industry professional mentors', 'Alumni network access', 'Regular guidance sessions', 'Real-world insights']
        },
        {
            title: 'University Preparation',
            description: 'Comprehensive support for university applications and preparation for higher education.',
            icon: Target,
            points: ['University shortlisting', 'Application guidance', 'Personal statement review', 'Interview preparation']
        }
    ];

    return (
        <div className="pt-16 md:pt-20" data-testid="career-guidance-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Career Guidance</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Shape your future with expert guidance
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Make informed decisions about your academic journey and career path with personalized guidance from experienced counselors.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="premium-card p-8">
                                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                    <service.icon className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="font-heading text-xl font-medium text-primary mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-text-secondary mb-6">
                                    {service.description}
                                </p>
                                <ul className="space-y-2">
                                    {service.points.map((point, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="section bg-background">
                <div className="container-custom">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Our Process</p>
                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight font-medium text-primary">
                            How we guide you
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Assessment', description: 'Comprehensive evaluation of interests, strengths, and goals' },
                            { step: '02', title: 'Exploration', description: 'Discover career paths aligned with your profile' },
                            { step: '03', title: 'Planning', description: 'Create a personalized roadmap with milestones' },
                            { step: '04', title: 'Execution', description: 'Ongoing support as you work towards your goals' }
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-heading text-xl font-bold">
                                    {item.step}
                                </div>
                                <h3 className="font-heading text-lg font-medium text-primary mb-2">{item.title}</h3>
                                <p className="text-text-secondary text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-white mb-4">
                            Start your guidance journey
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-8">
                            Book a free initial consultation to discuss your goals and how we can help you achieve them.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            data-testid="career-guidance-cta"
                        >
                            Book Free Consultation
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
