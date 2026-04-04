import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Calendar, CheckCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProgramDetail() {
    const { subject } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/courses`);
                const foundCourse = response.data.find(
                    c => c.subject.toLowerCase() === subject?.toLowerCase()
                );
                setCourse(foundCourse);
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [subject]);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/programs/${subject}` } } });
            return;
        }

        setEnrolling(true);
        try {
            await axios.post(`${API_URL}/api/courses/enroll`, 
                { course_id: course.id },
                { withCredentials: true }
            );
            toast.success('Successfully enrolled in the course!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="program-not-found">
                <div className="text-center">
                    <h1 className="font-heading text-2xl text-primary mb-4">Course not found</h1>
                    <Link to="/programs" className="text-accent hover:underline">View all programs</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-20" data-testid="program-detail-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <Link to="/programs" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Programs
                    </Link>
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <span className="inline-block px-3 py-1 text-xs font-medium text-accent bg-accent/10 rounded-full mb-4">
                                {course.subject}
                            </span>
                            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tighter font-medium text-primary mb-6">
                                {course.title}
                            </h1>
                            <p className="text-lg text-text-secondary leading-relaxed mb-8">
                                {course.description}
                            </p>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <Clock className="w-5 h-5" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <Calendar className="w-5 h-5" />
                                    <span>{course.schedule}</span>
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <BookOpen className="w-5 h-5" />
                                    <span>{course.syllabus?.length} modules</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="px-8 py-4 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                                    data-testid="enroll-button"
                                >
                                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">₹{course.price?.toLocaleString()}</p>
                                    <p className="text-sm text-text-secondary">per year</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <img
                                src={course.image_url || 'https://images.unsplash.com/photo-1505209487757-5114235191e5?w=800'}
                                alt={course.title}
                                className="rounded-2xl shadow-lg w-full object-cover aspect-[4/3]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Syllabus */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <h2 className="font-heading text-2xl font-medium text-primary mb-6">Syllabus Coverage</h2>
                            <div className="space-y-3">
                                {course.syllabus?.map((topic, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                        <span className="text-text-primary">{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-heading text-2xl font-medium text-primary mb-4">Teaching Approach</h2>
                                <p className="text-text-secondary leading-relaxed">{course.teaching_approach}</p>
                            </div>
                            <div>
                                <h2 className="font-heading text-2xl font-medium text-primary mb-4">Exam Strategy</h2>
                                <p className="text-text-secondary leading-relaxed">{course.exam_strategy}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Outcomes */}
            <section className="section bg-background">
                <div className="container-custom">
                    <h2 className="font-heading text-2xl font-medium text-primary mb-8 text-center">Learning Outcomes</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {course.outcomes?.map((outcome, index) => (
                            <div key={index} className="premium-card p-6 text-center">
                                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-accent" />
                                </div>
                                <p className="text-text-primary font-medium">{outcome}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-white mb-4">
                            Ready to excel in {course.subject}?
                        </h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-8">
                            Join our {course.title} program and take the first step towards academic excellence.
                        </p>
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            data-testid="enroll-cta-button"
                        >
                            {enrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
