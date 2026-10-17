import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
    Menu, X, ShoppingCart, User, LogOut, ChevronDown, BookOpen, GraduationCap,
    Award, Users, Compass, Lightbulb, Home, PenLine, FileCheck, BarChart3,
    CalendarDays, Store, Settings, HelpCircle, ShieldCheck, FileText, Sparkles
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import GlobalSearch from './GlobalSearch';

// ── Learn Mega Menu (desktop) ──
function LearnMegaMenu({ isActive }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);
    const handleEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
    const handleLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 200); };

    return (
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave} onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); e.currentTarget.querySelector('button')?.focus(); } }}>
            <button type="button" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(true)} className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${isActive ? 'text-accent bg-accent/[0.07]' : 'text-slate-600 hover:text-primary hover:bg-slate-900/[0.04]'}`} data-testid="nav-learn">
                Learn <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="nav-pop rounded-2xl p-4 w-[440px]" data-testid="learn-mega-menu">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-2 px-3">Academic</p>
                                <div className="space-y-0.5">
                                    {[
                                        { name: 'IGCSE', href: '/learn/igcse', icon: BookOpen },
                                        { name: 'AS Level', href: '/learn/as-level', icon: GraduationCap },
                                        { name: 'A Level', href: '/learn/a-level', icon: Award },
                                    ].map(item => (
                                        <Link key={item.name} to={item.href} data-testid={`mega-item-${item.name.toLowerCase().replace(/\s/g, '-')}`} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-primary hover:bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" onClick={() => setOpen(false)}>
                                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-2 px-3">Learning</p>
                                <div className="space-y-0.5">
                                    {[
                                        { name: 'Courses', href: '/programs', icon: Users },
                                        { name: 'Expert Learning', href: '/programs', icon: GraduationCap },
                                        { name: 'AI Mentor', href: '/dashboard', icon: Sparkles },
                                    ].map(item => (
                                        <Link key={item.name} to={item.href} data-testid={`mega-item-${item.name.toLowerCase().replace(/\s/g, '-')}`} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-primary hover:bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" onClick={() => setOpen(false)}>
                                            <item.icon className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Hover dropdown (desktop) ──
function NavDropdown({ label, items, isActive }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);
    const handleEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
    const handleLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 150); };

    return (
        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave} onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); e.currentTarget.querySelector('button')?.focus(); } }}>
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen(true)}
               
                className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isActive ? 'text-accent bg-accent/[0.07]' : 'text-slate-600 hover:text-primary hover:bg-slate-900/[0.04]'
                }`}
                data-testid={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
            >
                {label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="nav-pop rounded-xl p-1.5 min-w-[230px]">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-primary hover:bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                onClick={() => setOpen(false)}
                                data-testid={`dropdown-item-${item.name.toLowerCase().replace(/\s/g, '-')}`}
                            >
                                {item.icon && <item.icon className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" />}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Simple nav link (desktop) ──
function NavLink({ to, label, isActive, testId }) {
    return (
        <Link
            to={to}
            className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                isActive ? 'text-accent bg-accent/[0.07]' : 'text-slate-600 hover:text-primary hover:bg-slate-900/[0.04]'
            }`}
            data-testid={testId}
        >
            {label}
        </Link>
    );
}

// ── Mobile accordion section ──
function MobileAccordion({ label, items, onNavigate }) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                type="button"
                aria-expanded={open}
                data-testid={`mobile-accordion-${label.toLowerCase()}`}
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
                <span>{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="ml-4 pl-4 border-l border-slate-200 space-y-0.5 mt-1 mb-2">
                    {items.map(item => (
                        <Link key={item.name} to={item.href} data-testid={`mobile-link-${item.href.replace(/\//g, '-').slice(1)}`} className="block px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-soft hover:text-primary" onClick={onNavigate}>
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = async () => { await logout(); navigate('/'); };
    const closeMobile = () => setMobileMenuOpen(false);
    const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');
    const isActiveAny = (paths) => paths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    // ═══════════════════════════════════════════════════════════
    //  PUBLIC NAVIGATION (visitors, parents, prospective students)
    // ═══════════════════════════════════════════════════════════
    const publicLearnItems = [
        { name: 'IGCSE', href: '/learn/igcse', icon: BookOpen },
        { name: 'AS Level', href: '/learn/as-level', icon: GraduationCap },
        { name: 'A Level', href: '/learn/a-level', icon: Award },
        { name: 'Courses', href: '/programs', icon: Users },
    ];
    const publicMoreItems = [
        { name: 'Workshops', href: '/workshops', icon: CalendarDays },
        { name: 'Career Guidance', href: '/career-guidance', icon: Lightbulb },
        { name: 'Profile Building', href: '/profile-building', icon: Compass },
    ];

    // ═══════════════════════════════════════════════════════════
    //  AUTHENTICATED NAVIGATION (students in learning mode)
    // ═══════════════════════════════════════════════════════════
    const studentLearnItems = [
        { name: 'IGCSE', href: '/learn/igcse', icon: BookOpen },
        { name: 'AS Level', href: '/learn/as-level', icon: GraduationCap },
        { name: 'A Level', href: '/learn/a-level', icon: Award },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 glass-header ${scrolled || mobileMenuOpen ? 'is-scrolled' : ''}`} data-testid="main-header">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-[60px] md:h-[72px]">
                    {/* Logo */}
                    <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" data-testid="logo-link" aria-label="Home">
                        <span className="text-[22px] md:text-[23px] font-bold text-primary tracking-[-0.03em]">EdVNova</span>
                    </Link>

                    {/* ═══ DESKTOP NAV ═══ */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {isAuthenticated ? (
                            /* ── Student Learning Nav ── */
                            <>
                                <NavLink to="/dashboard" label="Home" isActive={isActive('/dashboard')} testId="nav-home" />
                                <LearnMegaMenu isActive={isActiveAny(['/learn', '/boards', '/igcse', '/as-level', '/a-level', '/programs', '/practice', '/past-papers'])} />
                                <NavLink to="/store" label="Store" isActive={isActive('/store')} testId="nav-store" />
                                <NavLink to="/about" label="About" isActive={isActive('/about')} testId="nav-about" />
                            </>
                        ) : (
                            /* ── Public Discovery Nav ── */
                            <>
                                <LearnMegaMenu isActive={isActiveAny(['/learn', '/boards', '/igcse', '/as-level', '/a-level', '/programs', '/practice', '/past-papers'])} />
                                <NavLink to="/store" label="Store" isActive={isActive('/store')} testId="nav-store" />
                                <NavDropdown label="Community" items={publicMoreItems} isActive={isActiveAny(['/workshops', '/career-guidance', '/profile-building'])} />
                                <NavLink to="/about" label="About" isActive={isActive('/about')} testId="nav-about" />
                                <NavLink to="/contact" label="Contact" isActive={isActive('/contact')} testId="nav-contact" />
                            </>
                        )}
                    </div>

                    {/* ═══ DESKTOP ACTIONS ═══ */}
                    <div className="hidden lg:flex items-center gap-3">
                        <GlobalSearch />
                        {/* Cart (always visible) */}
                        <Link to="/store/cart" aria-label="Cart" className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-slate-900/[0.04] rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" data-testid="cart-button">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            /* ── Authenticated: Profile dropdown ── */
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200" data-testid="user-menu-trigger">
                                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-accent" />
                                        </div>
                                        <span className="max-w-[100px] truncate">{user?.name}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="flex items-center gap-3 py-2" data-testid="dashboard-link">
                                            <Home className="w-4 h-4" /> My Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/workshops" className="flex items-center gap-3 py-2">
                                            <CalendarDays className="w-4 h-4" /> Workshops
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/career-guidance" className="flex items-center gap-3 py-2">
                                            <Lightbulb className="w-4 h-4" /> Career Guidance
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile-building" className="flex items-center gap-3 py-2">
                                            <Compass className="w-4 h-4" /> Profile Building
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/contact" className="flex items-center gap-3 py-2">
                                            <HelpCircle className="w-4 h-4" /> Help & Contact
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin" className="flex items-center gap-3 py-2" data-testid="admin-link">
                                                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 py-2 text-red-600 focus:text-red-600" data-testid="logout-button">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            /* ── Public: Sign In + Get Started ── */
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" data-testid="login-button">
                                    Sign In
                                </Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.1),0_4px_12px_-4px_rgba(37,99,235,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2" data-testid="get-started-btn">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ═══ MOBILE MENU BUTTON ═══ */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link to="/store/cart" aria-label="Cart" className="relative p-2.5 text-slate-500 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" data-testid="mobile-cart-button">
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                            )}
                        </Link>
                        <button type="button" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 text-slate-600 hover:text-primary rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60" data-testid="mobile-menu-toggle">
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* ═══ MOBILE MENU ═══ */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-100 -mx-6 md:-mx-10 px-4 md:px-8 max-h-[calc(100vh-60px)] overflow-y-auto" data-testid="mobile-menu">
                        <div className="py-5 px-2 space-y-1">
                            {isAuthenticated ? (
                                /* ── Student mobile nav ── */
                                <>
                                    <Link to="/dashboard" className="block px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft" onClick={closeMobile}>Home</Link>
                                    <MobileAccordion label="Learn" items={[
                                        { name: 'Cambridge IGCSE', href: '/learn/igcse' },
                                        { name: 'Cambridge AS Level', href: '/learn/as-level' },
                                        { name: 'Cambridge A Level', href: '/learn/a-level' },
                                        { name: 'Courses', href: '/programs' },
                                        { name: 'Practice', href: '/practice' },
                                        { name: 'Past Papers', href: '/past-papers' },
                                    ]} onNavigate={closeMobile} />
                                    <Link to="/store" className="block px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft" onClick={closeMobile}>Store</Link>
                                    <MobileAccordion label="More" items={[
                                        { name: 'Workshops', href: '/workshops' },
                                        { name: 'Career Guidance', href: '/career-guidance' },
                                        { name: 'Profile Building', href: '/profile-building' },
                                        { name: 'About', href: '/about' },
                                        { name: 'Contact', href: '/contact' },
                                    ]} onNavigate={closeMobile} />
                                    <div className="pt-5 px-2 space-y-3 border-t border-gray-100 mt-3">
                                        {isAdmin && (
                                            <Link to="/admin" className="block w-full py-3.5 text-center font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50" onClick={closeMobile}>Admin Panel</Link>
                                        )}
                                        <button onClick={() => { handleLogout(); closeMobile(); }} className="block w-full py-3.5 text-center font-semibold text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-50">Logout</button>
                                    </div>
                                </>
                            ) : (
                                /* ── Public mobile nav ── */
                                <>
                                    <MobileAccordion label="Learn" items={[
                                        { name: 'Cambridge IGCSE', href: '/learn/igcse' },
                                        { name: 'Cambridge AS Level', href: '/learn/as-level' },
                                        { name: 'Cambridge A Level', href: '/learn/a-level' },
                                        { name: 'Courses', href: '/programs' },
                                        { name: 'Practice', href: '/practice' },
                                        { name: 'Past Papers', href: '/past-papers' },
                                    ]} onNavigate={closeMobile} />
                                    <Link to="/store" className="block px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft" onClick={closeMobile}>Store</Link>
                                    <MobileAccordion label="Community" items={publicMoreItems} onNavigate={closeMobile} />
                                    <Link to="/about" className="block px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft" onClick={closeMobile}>About</Link>
                                    <Link to="/contact" className="block px-4 py-3 text-base font-medium text-slate-700 rounded-xl hover:bg-soft" onClick={closeMobile}>Contact</Link>
                                    <div className="pt-5 px-2 space-y-3 border-t border-gray-100 mt-3">
                                        <Link to="/login" className="block w-full py-3.5 text-center font-semibold text-primary border border-slate-200 rounded-xl hover:bg-soft" onClick={closeMobile}>Sign In</Link>
                                        <Link to="/register" className="block w-full py-3.5 text-center font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover" onClick={closeMobile}>Get Started</Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
