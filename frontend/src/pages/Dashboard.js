import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, FileText, Package, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollmentsRes, workshopsRes, ordersRes] = await Promise.all([
                    axios.get(`${API_URL}/api/courses/user/enrollments`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/workshops/user/registrations`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/orders/my-orders`, { withCredentials: true })
                ]);
                setEnrollments(enrollmentsRes.data);
                setWorkshopRegistrations(workshopsRes.data);
                setOrders(ordersRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    const announcements = [
        { title: 'New Physics workshop announced', date: 'Jan 10, 2026' },
        { title: 'Term 2 schedule released', date: 'Jan 8, 2026' },
        { title: 'Holiday notice: Jan 26', date: 'Jan 5, 2026' },
    ];

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="student-dashboard">
            <div className="container-custom py-12 md:py-16">
                {/* Welcome */}
                <div className="mb-12">
                    <h1 className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-3">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="text-gray-600 text-lg">Here's an overview of your learning journey.</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{enrollments.length}</p>
                                <p className="text-gray-500 font-medium">Courses Enrolled</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{workshopRegistrations.length}</p>
                                <p className="text-gray-500 font-medium">Workshops</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <FileText className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">∞</p>
                                <p className="text-gray-500 font-medium">Resources</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
                                <Package className="w-7 h-7 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{orders.length}</p>
                                <p className="text-gray-500 font-medium">Orders</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Courses */}
                        <div className="premium-card p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading text-xl font-bold text-primary">My Courses</h2>
                                <Link to="/programs" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    View all <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {enrollments.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                                    <Link to="/programs" className="text-accent font-semibold hover:underline">
                                        Browse Courses
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {enrollments.map((enrollment, index) => (
                                        <div key={index} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                                            <div>
                                                <h3 className="font-semibold text-primary">{enrollment.course_title}</h3>
                                                <p className="text-sm text-gray-500">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-4 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-full uppercase">
                                                {enrollment.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Workshops */}
                        <div className="premium-card p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading text-xl font-bold text-primary">My Workshops</h2>
                                <Link to="/workshops" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    View all <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {workshopRegistrations.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">You haven't registered for any workshops yet.</p>
                                    <Link to="/workshops" className="text-accent font-semibold hover:underline">
                                        Browse Workshops
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {workshopRegistrations.map((registration, index) => (
                                        <div key={index} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                                            <div>
                                                <h3 className="font-semibold text-primary">{registration.workshop_title}</h3>
                                                <p className="text-sm text-gray-500">Registered: {new Date(registration.registered_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-4 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full uppercase">
                                                {registration.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="premium-card p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-heading text-xl font-bold text-primary">Recent Orders</h2>
                                <Link to="/store" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Shop <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            {orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                                    <Link to="/store" className="text-accent font-semibold hover:underline">
                                        Visit Store
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order, index) => (
                                        <div key={index} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                                            <div>
                                                <h3 className="font-semibold text-primary">Order #{order.id?.slice(-8)}</h3>
                                                <p className="text-sm text-gray-500">{order.items?.length} items • ₹{order.total?.toLocaleString()}</p>
                                            </div>
                                            <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase ${
                                                order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="premium-card p-8 sticky top-24">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-accent" />
                                </div>
                                <h2 className="font-heading text-xl font-bold text-primary">Announcements</h2>
                            </div>
                            <div className="space-y-5">
                                {announcements.map((announcement, index) => (
                                    <div key={index} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                                        <p className="text-primary font-semibold">{announcement.title}</p>
                                        <p className="text-sm text-gray-500 mt-1">{announcement.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
