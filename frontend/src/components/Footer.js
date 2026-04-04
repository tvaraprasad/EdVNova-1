import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

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
            { name: 'Workshops', href: '/workshops' },
            { name: 'Resources', href: '/resources' },
            { name: 'Store', href: '/store' },
            { name: 'Profile Building', href: '/profile-building' },
        ],
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Career Guidance', href: '/career-guidance' },
            { name: 'Contact', href: '/contact' },
        ],
    };

    return (
        <footer className="bg-primary text-white" data-testid="main-footer">
            <div className="container-custom">
                {/* Main Footer */}
                <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-heading text-2xl font-semibold text-white">
                                EdVNova
                            </span>
                        </Link>
                        <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                            Advanced IGCSE coaching in Pune, India. Building academic excellence through conceptual learning and personalized mentorship.
                        </p>
                        <div className="space-y-3">
                            <a 
                                href="mailto:info@edvnova.com" 
                                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                                data-testid="footer-email"
                            >
                                <Mail className="w-5 h-5" />
                                info@edvnova.com
                            </a>
                            <a 
                                href="tel:+919652546434" 
                                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                                data-testid="footer-phone"
                            >
                                <Phone className="w-5 h-5" />
                                +91 9652546434
                            </a>
                            <div className="flex items-start gap-3 text-white/70">
                                <MapPin className="w-5 h-5 mt-0.5" />
                                <span>Pune, Maharashtra, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Programs */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-6 text-white">Programs</h4>
                        <ul className="space-y-3">
                            {footerLinks.programs.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-6 text-white">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-heading text-lg font-semibold mb-6 text-white">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link 
                                        to={link.href}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/60 text-sm">
                            &copy; {currentYear} EdVNova Learning. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
