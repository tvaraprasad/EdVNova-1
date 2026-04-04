import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';

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
        'Mathematics': 'bg-blue-50 text-blue-600 border-blue-200',
        'Physics': 'bg-amber-50 text-amber-600 border-amber-200',
        'Chemistry': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'Biology': 'bg-rose-50 text-rose-600 border-rose-200',
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="programs-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Our Programs</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Comprehensive IGCSE Courses
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Expert-led programs designed for deep understanding and exam excellence. Choose your subject and start your journey to academic success.
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="section bg-white">
                <div className="container-custom">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-text-secondary">Loading courses...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {courses.map((course) => (
                                <Link
                                    key={course.id}
                                    to={`/programs/${course.subject.toLowerCase()}`}
                                    className="premium-card overflow-hidden group"
                                    data-testid={`course-card-${course.subject.toLowerCase()}`}
                                >
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img
                                            src={course.image_url || 'https://images.unsplash.com/photo-1505209487757-5114235191e5?w=800'}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${subjectColors[course.subject] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {course.subject}
                                        </span>
                                        <h3 className="font-heading text-xl font-medium text-primary mt-4 mb-2 group-hover:text-accent transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {course.duration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    {course.syllabus?.length || 0} modules
                                                </span>
                                            </div>
                                            <span className="text-accent font-medium flex items-center gap-1">
                                                Learn more <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-background">
                <div className="container-custom">
                    <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-white mb-4">
                            Not sure which program is right for you?
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-8">
                            Book a free consultation with our academic advisors to discuss your goals and find the perfect learning path.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
                            data-testid="programs-cta-button"
                        >
                            Book Free Consultation
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
