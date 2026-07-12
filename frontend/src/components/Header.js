import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown, BookOpen, GraduationCap, Users, Award, Compass, Play, FileText, Lightbulb } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Desktop nav dropdown (hover-based)
function NavDropdown({ label, items, isActive }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);

    const handleEnter = () => {
        clearTimeout(timeoutRef.current);
        setOpen(true);
    };
    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 150);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                        ? 'text-accent bg-accent/5'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
                data-testid={`nav-${label.toLowerCase()}`}
            >
                {label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 pt-2 z-50" data-testid={`dropdown-${label.toLowerCase()}`}>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 py-2 min-w-[220px]">
                        {items.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                                onClick={() => setOpen(false)}
                                data-testid={`dropdown-item-${item.name.toLowerCase().replace(/\s/g, '-')}`}
                            >
                                {item.icon && <item.icon className="w-4 h-4 text-gray-400" />}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
    const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const learnItems = [
        { name: 'IGCSE', href: '/learn/igcse', icon: BookOpen },
        { name: 'AS Level', href: '/learn/as-level', icon: GraduationCap },
        { name: 'A Level', href: '/learn/a-level', icon: Award },
        { name: 'Live Coaching', href: '/programs', icon: Users },
    ];

    const communityItems = [
        { name: 'Profile Building', href: '/profile-building', icon: Compass },
        { name: 'Career Guidance', href: '/career-guidance', icon: Lightbulb },
        { name: 'Workshops', href: '/workshops', icon: Users },
    ];

    const isActiveLearn = ['/learn', '/boards', '/igcse', '/as-level', '/a-level', '/programs', '/practice'].some(
        p => location.pathname === p || location.pathname.startsWith(p + '/')
    );
    const isActiveCommunity = ['/profile-building', '/career-guidance', '/workshops'].some(
        p => location.pathname === p || location.pathname.startsWith(p + '/')
    );
    const isActiveLink = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-header" data-testid="main-header">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-18 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center" data-testid="logo-link" aria-label="Home">
                        <span className="text-[22px] md:text-[24px] font-bold text-primary tracking-tight">
                            EdVNova
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        <NavDropdown label="Learn" items={learnItems} isActive={isActiveLearn} />

                        <Link
                            to="/store"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActiveLink('/store')
                                    ? 'text-accent bg-accent/5'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                            }`}
                            data-testid="nav-store"
                        >
                            Store
                        </Link>

                        <NavDropdown label="Community" items={communityItems} isActive={isActiveCommunity} />

                        <Link
                            to="/about"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActiveLink('/about')
                                    ? 'text-accent bg-accent/5'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                            }`}
                            data-testid="nav-about"
                        >
                            About
                        </Link>

                        <Link
                            to="/contact"
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isActiveLink('/contact')
                                    ? 'text-accent bg-accent/5'
                                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                            }`}
                            data-testid="nav-contact"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link
                            to="/store/cart"
                            className="relative p-2.5 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200"
                            data-testid="cart-button"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-all duration-200"
                                        data-testid="user-menu-trigger"
                                    >
                                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-accent" />
                                        </div>
                                        <span className="max-w-[100px] truncate">{user?.name}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="flex items-center gap-3 py-2" data-testid="dashboard-link">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link to="/admin" className="flex items-center gap-3 py-2" data-testid="admin-link">
                                                <User className="w-4 h-4" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 py-2 text-red-600 focus:text-red-600" data-testid="logout-button">
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                    data-testid="login-button"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/contact"
                                    className="px-5 py-2.5 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-sm"
                                    data-testid="book-consultation-btn"
                                >
                                    Book Consultation
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <Link
                            to="/store/cart"
                            className="relative p-2.5 text-gray-500"
                            data-testid="mobile-cart-button"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2.5 text-gray-500 hover:text-primary"
                            data-testid="mobile-menu-toggle"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg" data-testid="mobile-menu">
                        <div className="py-5 px-2 space-y-1">
                            {/* Learn Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobileLearnOpen(!mobileLearnOpen)}
                                    className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                                >
                                    <span>Learn</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileLearnOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileLearnOpen && (
                                    <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5 mt-1 mb-2">
                                        {learnItems.map(item => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/store"
                                className="block px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Store
                            </Link>

                            {/* Community Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)}
                                    className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                                >
                                    <span>Community</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileCommunityOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileCommunityOpen && (
                                    <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5 mt-1 mb-2">
                                        {communityItems.map(item => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className="block px-4 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/about"
                                className="block px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                About
                            </Link>

                            <Link
                                to="/contact"
                                className="block px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>

                            {/* Auth Actions */}
                            <div className="pt-5 px-2 space-y-3 border-t border-gray-100 mt-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="block w-full py-3.5 text-center font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="block w-full py-3.5 text-center font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Admin Panel
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                            className="block w-full py-3.5 text-center font-semibold text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-50"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="block w-full py-3.5 text-center font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/contact"
                                            className="block w-full py-3.5 text-center font-semibold bg-accent text-white rounded-xl shadow-md"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Book Consultation
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
