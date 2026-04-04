import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        
        const result = await register(email, password, name);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    const benefits = [
        'Access premium study resources',
        'Enroll in courses & workshops',
        'Track your progress',
        'Get personalized recommendations'
    ];

    return (
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-background to-white" data-testid="register-page">
            <div className="w-full max-w-5xl px-6 py-12">
                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    {/* Benefits */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <h2 className="font-heading text-3xl font-bold text-primary mb-6">
                            Join EdVNova today
                        </h2>
                        <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                            Create your free account and unlock access to premium IGCSE learning resources.
                        </p>
                        <div className="space-y-5">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-5 h-5 text-accent" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="premium-card p-8 md:p-10">
                            <div className="text-center mb-10">
                                <Link to="/" className="inline-block mb-6 lg:hidden">
                                    <span className="font-heading text-2xl font-bold text-primary">EdVNova</span>
                                </Link>
                                <h1 className="font-heading text-3xl font-bold text-primary mb-3">Create an account</h1>
                                <p className="text-gray-600">Join EdVNova to access courses and resources</p>
                            </div>

                            {error && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm" data-testid="register-error">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        className="mt-2 h-12"
                                        data-testid="register-name-input"
                                    />
                                </div>

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
                                        data-testid="register-email-input"
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                                        <div className="relative mt-2">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Create a password"
                                                required
                                                className="h-12 pr-12"
                                                data-testid="register-password-input"
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

                                    <div>
                                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            required
                                            className="mt-2 h-12"
                                            data-testid="register-confirm-password-input"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                                    data-testid="register-submit-button"
                                >
                                    {loading ? 'Creating account...' : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-accent font-semibold hover:underline" data-testid="login-link">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
