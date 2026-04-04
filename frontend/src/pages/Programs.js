import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Clock, BookOpen, Sparkles } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Programs() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/courses`);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const subjectColors = {
        'Mathematics': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:border-blue-300' },
        'Physics': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:border-amber-300' },
        'Chemistry': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', hover: 'hover:border-emerald-300' },
        'Biology': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', hover: 'hover:border-rose-300' },
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="programs-page">
            {/* Hero */}
            <section className="hero-gradient py-20 md:py-28 lg:py-32">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="badge-accent mx-auto mb-6 w-fit">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Our Programs
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-bold text-primary mb-8">
                            Comprehensive IGCSE Courses
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Expert-led programs designed for deep understanding and exam excellence. Choose your subject and start your journey to academic success.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="section section-light">
                <div className="container-custom">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading courses...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-10">
                            {courses.map((course) => {
                                const colors = subjectColors[course.subject] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', hover: 'hover:border-gray-300' };
                                return (
                                    <Link
                                        key={course.id}
                                        to={`/programs/${course.subject.toLowerCase()}`}
                                        className={`premium-card overflow-hidden group ${colors.hover}`}
                                        data-testid={`course-card-${course.subject.toLowerCase()}`}
                                    >
                                        <div className="aspect-[16/9] overflow-hidden">
                                            <img
                                                src={course.image_url || 'https://images.unsplash.com/photo-1505209487757-5114235191e5?w=800'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="p-8">
                                            <span className={`inline-block px-4 py-1.5 text-xs font-bold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                                {course.subject}
                                            </span>
                                            <h3 className="font-heading text-2xl font-bold text-primary mt-5 mb-3 group-hover:text-accent transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {course.duration}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" />
                                                        {course.syllabus?.length || 0} modules
                                                    </span>
                                                </div>
                                                <span className="text-accent font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                                                    Learn more <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section section-muted">
                <div className="container-custom">
                    <div className="relative bg-gradient-to-br from-secondary to-primary rounded-3xl p-12 md:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                        <div className="relative z-10">
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight font-bold text-white mb-6">
                                Not sure which program is right for you?
                            </h2>
                            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
                                Book a free consultation with our academic advisors to discuss your goals and find the perfect learning path.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-xl"
                                data-testid="programs-cta-button"
                            >
                                Book Free Consultation
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
