import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        programs: [
            { name: 'Mathematics', href: '/programs/mathematics' },
            { name: 'Physics', href: '/programs/physics' },
            { name: 'Chemistry', href: '/programs/chemistry' },
            { name: 'Biology', href: '/programs/biology' },
        ],
        resources: [
            { name: 'Revision Notes', href: '/boards' },
            { name: 'Resources', href: '/resources' },
            { name: 'Store', href: '/store' },
            { name: 'Workshops', href: '/workshops' },
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Profile Building', href: '/profile-building' },
            { name: 'Career Guidance', href: '/career-guidance' },
            { name: 'Contact', href: '/contact' },
        ],
    };

    return (
        <footer className="bg-primary" data-testid="main-footer">
            {/* Newsletter Section */}
            <div className="border-b border-white/10">
                <div className="container-custom py-16">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                                Stay updated with EdVNova
                            </h3>
                            <p className="text-white/60 text-lg">
                                Get notified about new notes, courses, workshops, and exam tips.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button className="px-8 py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 flex items-center justify-center gap-2">
                                Subscribe
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom">
                {/* Main Footer */}
                <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-block mb-8">
                            <span className="font-heading text-3xl font-bold text-white">
                                EdVNova
                            </span>
                        </Link>
                        <p className="text-white/60 mb-8 max-w-sm leading-relaxed text-lg">
                            Premium learning support for Cambridge IGCSE, AS & A Level students. Expert coaching, structured notes, and academic guidance.
                        </p>
                        <div className="space-y-4">
                            <a 
                                href="mailto:info@edvnova.com" 
                                className="flex items-center gap-4 text-white/60 hover:text-white transition-colors group"
                                data-testid="footer-email"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                info@edvnova.com
                            </a>
                            <a 
                                href="tel:+919652546434" 
                                className="flex items-center gap-4 text-white/60 hover:text-white transition-colors group"
                                data-testid="footer-phone"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                +91 9652546434
                            </a>
                            <div className="flex items-center gap-4 text-white/60">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span>Pune, India &middot; Online Worldwide</span>
                            </div>
                        </div>
                    </div>

                    {/* Programs */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-8 text-white">Programs</h4>
                        <ul className="space-y-4">
                            {footerLinks.programs.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span>{link.name}</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-8 text-white">Resources</h4>
                        <ul className="space-y-4">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span>{link.name}</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-heading text-lg font-bold mb-8 text-white">Company</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/60 hover:text-white transition-colors inline-flex items-center gap-1 group"
                                    >
                                        <span>{link.name}</span>
                                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-white/50 text-sm">
                            &copy; {currentYear} EdVNova Learning. All rights reserved.
                        </p>
                        <div className="flex items-center gap-8">
                            <Link to="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-white/50 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
