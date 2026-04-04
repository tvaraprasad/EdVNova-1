import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Workshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/workshops`);
                setWorkshops(response.data);
            } catch (error) {
                console.error('Error fetching workshops:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    const handleRegister = async (workshopId) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/workshops' } } });
            return;
        }

        setRegistering(workshopId);
        try {
            await axios.post(`${API_URL}/api/workshops/register`, 
                { workshop_id: workshopId },
                { withCredentials: true }
            );
            toast.success('Successfully registered for the workshop!');
            // Refresh workshops
            const response = await axios.get(`${API_URL}/api/workshops`);
            setWorkshops(response.data);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to register');
        } finally {
            setRegistering(null);
        }
    };

    return (
        <div className="pt-16 md:pt-20" data-testid="workshops-page">
            {/* Hero */}
            <section className="section bg-gradient-to-b from-background to-white">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Workshops</p>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium text-primary mb-6">
                            Specialized workshops for skill development
                        </h1>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            Intensive workshops designed to boost specific skills and prepare you for academic success.
                        </p>
                    </div>
                </div>
            </section>

            {/* Workshops List */}
            <section className="section bg-white">
                <div className="container-custom">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-text-secondary">Loading workshops...</p>
                        </div>
                    ) : workshops.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-secondary mb-4">No workshops available at the moment.</p>
                            <Link to="/contact" className="text-accent hover:underline">Contact us for upcoming workshops</Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {workshops.map((workshop) => (
                                <div key={workshop.id} className="premium-card overflow-hidden" data-testid={`workshop-card-${workshop.id}`}>
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img
                                            src={workshop.image_url || 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=800'}
                                            alt={workshop.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-heading text-xl font-medium text-primary mb-2">
                                            {workshop.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                                            {workshop.description}
                                        </p>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Calendar className="w-4 h-4" />
                                                <span>{workshop.date} at {workshop.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Clock className="w-4 h-4" />
                                                <span>{workshop.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Users className="w-4 h-4" />
                                                <span>{workshop.enrolled}/{workshop.capacity} enrolled</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {workshop.topics?.slice(0, 3).map((topic, i) => (
                                                <span key={i} className="px-2 py-1 text-xs bg-background text-text-secondary rounded">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <p className="text-lg font-bold text-primary">₹{workshop.price?.toLocaleString()}</p>
                                            <button
                                                onClick={() => handleRegister(workshop.id)}
                                                disabled={registering === workshop.id || workshop.enrolled >= workshop.capacity}
                                                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                                                data-testid={`register-workshop-${workshop.id}`}
                                            >
                                                {registering === workshop.id ? 'Registering...' : 
                                                 workshop.enrolled >= workshop.capacity ? 'Full' : 'Register'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="section bg-background">
                <div className="container-custom">
                    <div className="bg-white rounded-2xl p-8 md:p-12 border border-border text-center">
                        <h2 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-primary mb-4">
                            Want a customized workshop for your school?
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto mb-8">
                            We offer tailored workshop programs for schools and educational institutions.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            Contact Us
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
