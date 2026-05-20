import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, FileText, Package, Bell, ArrowRight, Download, FolderOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIMentor from '../components/AIMentor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [resources, setResources] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollmentsRes, workshopsRes, ordersRes, resourcesRes, downloadsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/courses/user/enrollments`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/workshops/user/registrations`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/orders/my-orders`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/resources`, { withCredentials: true }).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/api/downloads/my`, { withCredentials: true }).catch(() => ({ data: [] }))
                ]);
                setEnrollments(enrollmentsRes.data);
                setWorkshopRegistrations(workshopsRes.data);
                setOrders(ordersRes.data);
                setResources(resourcesRes.data);
                setDownloads(downloadsRes.data);
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{enrollments.length}</p>
                                <p className="text-gray-500 font-medium">Courses</p>
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
                                <FolderOpen className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{resources.filter(r => !r.is_premium || r.file_url).length}</p>
                                <p className="text-gray-500 font-medium">Resources</p>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card p-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <Download className="w-7 h-7 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{downloads.length}</p>
                                <p className="text-gray-500 font-medium">Downloads</p>
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

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 border-b border-border pb-3 flex-wrap" data-testid="dashboard-tabs">
                    {['overview', 'ai-mentor', 'courses', 'resources', 'downloads', 'orders'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${activeTab === tab ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            data-testid={`dash-tab-${tab}`}
                        >
                            {tab === 'ai-mentor' && <Sparkles className="w-3.5 h-3.5" />}
                            {tab === 'overview' ? 'Overview' : tab === 'ai-mentor' ? 'AI Mentor' : `My ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
                        </button>
                    ))}
                </div>

                {/* AI Mentor Tab */}
                {activeTab === 'ai-mentor' && (
                    <div data-testid="dashboard-ai-mentor">
                        <AIMentor />
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
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
                )}

                {/* My Courses Tab */}
                {activeTab === 'courses' && (
                    <div className="space-y-4" data-testid="dash-courses-tab">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-heading text-xl font-bold text-primary">My Courses</h2>
                            <Link to="/programs" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Browse More <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                        {enrollments.length === 0 ? (
                            <div className="premium-card p-8 text-center"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-4">No courses yet.</p><Link to="/programs" className="text-accent font-semibold hover:underline">Browse Courses</Link></div>
                        ) : (
                            enrollments.map((enrollment, index) => (
                                <Link key={index} to={`/course/${enrollment.course_id}`} className="block premium-card p-6 hover:shadow-md transition-shadow" data-testid={`enrolled-course-${index}`}>
                                    <div className="flex items-center justify-between">
                                        <div><h3 className="font-semibold text-primary text-lg">{enrollment.course_title}</h3><p className="text-sm text-gray-500">Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p></div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-full uppercase">{enrollment.status}</span>
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* My Resources Tab */}
                {activeTab === 'resources' && (
                    <div className="space-y-4" data-testid="dash-resources-tab">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-heading text-xl font-bold text-primary">My Resources</h2>
                            <Link to="/resources" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">Library <ArrowRight className="w-4 h-4" /></Link>
                        </div>
                        {resources.length === 0 ? (
                            <div className="premium-card p-8 text-center"><FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-4">No resources available.</p><Link to="/resources" className="text-accent font-semibold hover:underline">Browse Resources</Link></div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {resources.filter(r => !r.is_premium || r.file_url).map((res, index) => (
                                    <div key={index} className="premium-card p-5" data-testid={`resource-item-${index}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-accent" /></div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-primary">{res.title}</h4>
                                                <p className="text-sm text-gray-500">{res.subject} · {res.resource_type}</p>
                                                {res.file_url && (
                                                    <a href={`${API_URL}${res.file_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-accent hover:underline"><Download className="w-3.5 h-3.5" /> Download</a>
                                                )}
                                            </div>
                                            {!res.is_premium && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded font-medium">Free</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Downloads Tab */}
                {activeTab === 'downloads' && (
                    <div data-testid="dash-downloads-tab">
                        <h2 className="font-heading text-xl font-bold text-primary mb-4">Download History</h2>
                        {downloads.length === 0 ? (
                            <div className="premium-card p-8 text-center"><Download className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No downloads yet. Download resources and lesson materials to see them here.</p></div>
                        ) : (
                            <div className="premium-card overflow-hidden">
                                <table className="w-full">
                                    <thead><tr className="bg-gray-50 border-b"><th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th><th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th></tr></thead>
                                    <tbody>
                                        {downloads.map((dl, index) => (
                                            <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm font-medium text-primary">{dl.resource_title}</td>
                                                <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs bg-gray-100 rounded font-medium capitalize">{dl.resource_type}</span></td>
                                                <td className="py-3 px-4 text-sm text-gray-500">{new Date(dl.downloaded_at).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 text-right">{dl.file_url && <a href={`${API_URL}${dl.file_url}`} target="_blank" rel="noopener noreferrer" className="text-accent text-sm hover:underline">Re-download</a>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div data-testid="dash-orders-tab">
                        <h2 className="font-heading text-xl font-bold text-primary mb-4">Order History</h2>
                        {orders.length === 0 ? (
                            <div className="premium-card p-8 text-center"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 mb-4">No orders yet.</p><Link to="/store" className="text-accent font-semibold hover:underline">Visit Store</Link></div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order, index) => (
                                    <div key={index} className="premium-card p-5 flex items-center justify-between">
                                        <div><h3 className="font-semibold text-primary">Order #{order.id?.slice(-8)}</h3><p className="text-sm text-gray-500">{order.items?.length} items · ₹{order.total?.toLocaleString()} · {new Date(order.created_at).toLocaleDateString()}</p></div>
                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase ${order.status === 'confirmed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
