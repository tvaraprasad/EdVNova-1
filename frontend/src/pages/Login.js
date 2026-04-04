import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const result = await login(email, password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-background to-white" data-testid="login-page">
            <div className="w-full max-w-md px-6 py-12">
                <div className="premium-card p-8 md:p-10">
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-heading text-2xl font-bold text-primary">EdVNova</span>
                        </Link>
                        <h1 className="font-heading text-3xl font-bold text-primary mb-3">Welcome back</h1>
                        <p className="text-gray-600">Sign in to access your account</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm" data-testid="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="mt-2 h-12"
                                data-testid="login-email-input"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                            <div className="relative mt-2">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="h-12 pr-12"
                                    data-testid="login-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                            data-testid="login-submit-button"
                        >
                            {loading ? 'Signing in...' : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-accent font-semibold hover:underline" data-testid="register-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
