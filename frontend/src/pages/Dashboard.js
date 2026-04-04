import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, FileText, Package, Bell } from 'lucide-react';

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
            <div className="container-custom py-8 md:py-12">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="font-heading text-2xl sm:text-3xl font-medium text-primary mb-2">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="text-text-secondary">Here's an overview of your learning journey.</p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{enrollments.length}</p>
                                <p className="text-sm text-text-secondary">Courses Enrolled</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{workshopRegistrations.length}</p>
                                <p className="text-sm text-text-secondary">Workshops Registered</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">∞</p>
                                <p className="text-sm text-text-secondary">Resources Available</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-primary">{orders.length}</p>
                                <p className="text-sm text-text-secondary">Orders Placed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Courses */}
                        <div className="premium-card p-6">
                            <h2 className="font-heading text-xl font-medium text-primary mb-4">My Courses</h2>
                            {enrollments.length === 0 ? (
                                <p className="text-text-secondary py-4">You haven't enrolled in any courses yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {enrollments.map((enrollment, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-primary">{enrollment.course_title}</h3>
                                                <p className="text-sm text-text-secondary">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                {enrollment.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* My Workshops */}
                        <div className="premium-card p-6">
                            <h2 className="font-heading text-xl font-medium text-primary mb-4">My Workshops</h2>
                            {workshopRegistrations.length === 0 ? (
                                <p className="text-text-secondary py-4">You haven't registered for any workshops yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {workshopRegistrations.map((registration, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-primary">{registration.workshop_title}</h3>
                                                <p className="text-sm text-text-secondary">Registered: {new Date(registration.registered_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                {registration.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="premium-card p-6">
                            <h2 className="font-heading text-xl font-medium text-primary mb-4">Recent Orders</h2>
                            {orders.length === 0 ? (
                                <p className="text-text-secondary py-4">You haven't placed any orders yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.slice(0, 5).map((order, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-primary">Order #{order.id?.slice(-8)}</h3>
                                                <p className="text-sm text-text-secondary">{order.items?.length} items • ₹{order.total?.toLocaleString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
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
                        <div className="premium-card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Bell className="w-5 h-5 text-accent" />
                                <h2 className="font-heading text-xl font-medium text-primary">Announcements</h2>
                            </div>
                            <div className="space-y-4">
                                {announcements.map((announcement, index) => (
                                    <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                                        <p className="text-text-primary font-medium text-sm">{announcement.title}</p>
                                        <p className="text-xs text-text-secondary mt-1">{announcement.date}</p>
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
