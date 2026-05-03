import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Lock, BookOpen, Search, Filter, ArrowRight, Calculator, Atom, FlaskConical, Leaf, Sparkles } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SUBJECT_CONFIG = {
    Mathematics: { icon: Calculator, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200', accent: 'blue' },
    Physics: { icon: Atom, color: 'bg-violet-50 text-violet-600', border: 'border-violet-200', accent: 'violet' },
    Chemistry: { icon: FlaskConical, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200', accent: 'emerald' },
    Biology: { icon: Leaf, color: 'bg-teal-50 text-teal-600', border: 'border-teal-200', accent: 'teal' },
};

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [accessFilter, setAccessFilter] = useState('all');
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

    const subjects = useMemo(() => [...new Set(resources.map(r => r.subject))], [resources]);
    const types = useMemo(() => [...new Set(resources.map(r => r.resource_type))], [resources]);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            if (subjectFilter !== 'all' && r.subject !== subjectFilter) return false;
            if (typeFilter !== 'all' && r.resource_type !== typeFilter) return false;
            if (accessFilter === 'free' && r.is_premium) return false;
            if (accessFilter === 'premium' && !r.is_premium) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q);
            }
            return true;
        });
    }, [resources, subjectFilter, typeFilter, accessFilter, searchQuery]);

    const subjectCounts = useMemo(() => {
        const counts = {};
        resources.forEach(r => { counts[r.subject] = (counts[r.subject] || 0) + 1; });
        return counts;
    }, [resources]);

    const activeFilters = (subjectFilter !== 'all' || typeFilter !== 'all' || accessFilter !== 'all' || searchQuery);

    const clearFilters = () => {
        setSubjectFilter('all');
        setTypeFilter('all');
        setAccessFilter('all');
        setSearchQuery('');
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="resources-page">

            {/* Hero */}
            <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700 mb-6 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            Learning Resources
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight mb-5">
                            Notes, Worksheets & Study Materials
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
                            Premium revision notes, formula sheets, worked examples, and past paper resources for IGCSE, AS & A Level students.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto relative" data-testid="resource-search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search notes, chapters, formulas, worksheets..."
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                                data-testid="resource-search-input"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Subject Category Cards */}
            <section className="py-10 bg-white border-b border-gray-100">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map(subj => {
                            const config = SUBJECT_CONFIG[subj];
                            const Icon = config.icon;
                            const isActive = subjectFilter === subj;
                            return (
                                <button
                                    key={subj}
                                    onClick={() => setSubjectFilter(isActive ? 'all' : subj)}
                                    className={`group p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                                        isActive
                                            ? `${config.border} bg-white shadow-sm`
                                            : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                                    }`}
                                    data-testid={`category-${subj.toLowerCase()}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary text-sm">{subj}</p>
                                            <p className="text-xs text-gray-400">{subjectCounts[subj] || 0} resources</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Filters + Resources Grid */}
            <section className="py-12 md:py-16 bg-white">
                <div className="container-custom">
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-8" data-testid="resource-filters">
                        <Filter className="w-4 h-4 text-gray-400" />

                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            data-testid="filter-type"
                        >
                            <option value="all">All Types</option>
                            {types.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select
                            value={accessFilter}
                            onChange={e => setAccessFilter(e.target.value)}
                            className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            data-testid="filter-access"
                        >
                            <option value="all">Free & Premium</option>
                            <option value="free">Free Only</option>
                            <option value="premium">Premium Only</option>
                        </select>

                        {activeFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-accent hover:underline ml-2"
                                data-testid="clear-filters"
                            >
                                Clear all
                            </button>
                        )}

                        <span className="ml-auto text-sm text-gray-400">
                            {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Resources Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="spinner mb-4"></div>
                            <p className="text-gray-400 text-sm">Loading resources...</p>
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-20" data-testid="empty-state">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-primary mb-2">No resources found</h3>
                            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                                {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'Try adjusting your filters to see more resources.'}
                            </p>
                            {activeFilters && (
                                <button onClick={clearFilters} className="text-sm text-accent font-medium hover:underline">
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredResources.map(resource => {
                                const config = SUBJECT_CONFIG[resource.subject] || { icon: FileText, color: 'bg-gray-50 text-gray-600', border: 'border-gray-200' };
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={resource.id}
                                        className="group bg-white p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                                        data-testid={`resource-card-${resource.id}`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {resource.is_premium ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                                                        Premium
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200 rounded-full">
                                                        Free
                                                    </span>
                                                )}
                                                {resource.is_premium && !isAuthenticated && (
                                                    <Lock className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>

                                        <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded ${config.color} mb-3`}>
                                            {resource.subject}
                                        </span>

                                        <h3 className="font-bold text-primary mb-1.5 group-hover:text-accent transition-colors">
                                            {resource.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                                            {resource.description}
                                        </p>

                                        {resource.preview_content && (
                                            <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg mb-4 line-clamp-2">
                                                {resource.preview_content}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-xs text-gray-400 font-medium">{resource.resource_type}</span>
                                            {resource.file_url && isAuthenticated ? (
                                                <button className="flex items-center gap-1.5 text-accent text-sm font-semibold hover:underline">
                                                    <Download className="w-3.5 h-3.5" /> Download
                                                </button>
                                            ) : resource.is_premium && !isAuthenticated ? (
                                                <Link to="/register" className="text-accent text-sm font-semibold hover:underline">
                                                    Sign up to access
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA: Explore Topics / Browse Notes */}
            <section className="py-12 bg-slate-50 border-t border-gray-100">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white rounded-2xl border border-gray-100">
                        <div>
                            <h3 className="text-xl font-bold text-primary mb-1">Looking for topic-wise revision notes?</h3>
                            <p className="text-gray-500 text-sm">Browse 340+ structured topics across IGCSE, AS & A Level.</p>
                        </div>
                        <Link
                            to="/boards"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-colors whitespace-nowrap"
                            data-testid="browse-topics-cta"
                        >
                            Browse Topics <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sign Up CTA for non-authenticated */}
            {!isAuthenticated && (
                <section className="py-16 bg-white">
                    <div className="container-custom">
                        <div className="bg-primary rounded-2xl p-10 md:p-14 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                                Unlock All Premium Resources
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8">
                                Create a free account to access our complete library of study materials, formula sheets, and past papers.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                                data-testid="resources-signup-cta"
                            >
                                Join EdVNova — It's Free
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
