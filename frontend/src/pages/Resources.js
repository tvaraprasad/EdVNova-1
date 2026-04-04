import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Lock, BookOpen } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/resources`, { withCredentials: true });
                setResources(response.data);
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const subjects = ['all', ...new Set(resources.map(r => r.subject))];
    const filteredResources = filter === 'all' ? resources : resources.filter(r => r.subject === filter);

    const subjectColors = {
        'Mathematics': 'bg-blue-50 text-blue-600 border-blue-200',
        'Physics': 'bg-amber-50 text-amber-600 border-amber-200',
        'Chemistry': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'Biology': 'bg-rose-50 text-rose-600 border-rose-200',
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="resources-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Resources</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Study materials & resources
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Access comprehensive study materials, formula sheets, and past papers to enhance your learning.
                            {!isAuthenticated && ' Sign up to unlock all premium resources.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter & Resources */}
            <section className="section bg-white">
                <div className="container-custom">
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        {subjects.map((subject) => (
                            <button
                                key={subject}
                                onClick={() => setFilter(subject)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                    filter === subject
                                        ? 'bg-accent text-white'
                                        : 'bg-background text-text-secondary hover:bg-border'
                                }`}
                                data-testid={`filter-${subject}`}
                            >
                                {subject === 'all' ? 'All Subjects' : subject}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-text-secondary">Loading resources...</p>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary">No resources found.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.map((resource) => (
                                <div key={resource.id} className="premium-card p-6" data-testid={`resource-card-${resource.id}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            subjectColors[resource.subject]?.split(' ')[0] || 'bg-gray-50'
                                        }`}>
                                            <FileText className={`w-6 h-6 ${
                                                subjectColors[resource.subject]?.split(' ')[1] || 'text-gray-600'
                                            }`} />
                                        </div>
                                        {resource.is_premium && !isAuthenticated && (
                                            <Lock className="w-5 h-5 text-text-secondary" />
                                        )}
                                    </div>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
                                        subjectColors[resource.subject] || 'bg-gray-50 text-gray-600 border-gray-200'
                                    } mb-3`}>
                                        {resource.subject}
                                    </span>
                                    <h3 className="font-heading text-lg font-medium text-primary mb-2">
                                        {resource.title}
                                    </h3>
                                    <p className="text-text-secondary text-sm mb-4">
                                        {resource.description}
                                    </p>
                                    {resource.preview_content && (
                                        <p className="text-xs text-text-secondary bg-background p-3 rounded-lg mb-4 line-clamp-2">
                                            {resource.preview_content}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-xs text-text-secondary">{resource.resource_type}</span>
                                        {resource.file_url && isAuthenticated ? (
                                            <button className="flex items-center gap-1 text-accent text-sm font-medium hover:underline">
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        ) : resource.is_premium && !isAuthenticated ? (
                                            <Link to="/register" className="text-accent text-sm font-medium hover:underline">
                                                Sign up to access
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Sign Up CTA for non-authenticated users */}
            {!isAuthenticated && (
                <section className="section bg-background">
                    <div className="container-custom">
                        <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center">
                            <BookOpen className="w-16 h-16 text-white/80 mx-auto mb-6" />
                            <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-white mb-4">
                                Unlock all premium resources
                            </h2>
                            <p className="text-white/80 max-w-xl mx-auto mb-8">
                                Create a free account to access our complete library of study materials, formula sheets, and past papers.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                data-testid="resources-signup-cta"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
