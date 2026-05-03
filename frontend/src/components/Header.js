import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Boards', href: '/boards' },
        { name: 'Programs', href: '/programs' },
        { name: 'Profile Building', href: '/profile-building' },
        { name: 'Workshops', href: '/workshops' },
        { name: 'Resources', href: '/resources' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActiveLink = (href) => {
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-header" data-testid="main-header">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-18 md:h-20">
                    {/* Logo - Clean, Premium */}
                    <Link to="/" className="flex items-center" data-testid="logo-link" aria-label="Home">
                        <span className="text-[22px] md:text-[24px] font-bold text-primary tracking-tight">
                            EdVNova
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActiveLink(link.href)
                                        ? 'text-accent bg-accent/5'
                                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                                }`}
                                data-testid={`nav-${link.name.toLowerCase()}`}
                            >
                                {link.name}
                            </Link>
                        ))}
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
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
                                    data-testid="login-button"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover transition-all duration-200 shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30"
                                    data-testid="register-button"
                                >
                                    Get Started
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
                        <div className="py-6 px-2 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`block px-4 py-3.5 text-base font-medium rounded-xl transition-colors ${
                                        isActiveLink(link.href)
                                            ? 'text-accent bg-accent/5'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-6 px-2 space-y-3 border-t border-gray-100 mt-4">
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
                                            onClick={() => {
                                                handleLogout();
                                                setMobileMenuOpen(false);
                                            }}
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
                                            to="/register"
                                            className="block w-full py-3.5 text-center font-semibold bg-accent text-white rounded-xl shadow-md"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Get Started
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
