import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Calendar, Package, ShoppingBag, MessageSquare, GraduationCap, PenTool, HelpCircle, FileUp, Layers, Play, Image, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';
import CourseManager from '../components/admin/CourseManager';
import ProductManager from '../components/admin/ProductManager';
import TopicEditor from '../components/admin/TopicEditor';
import QuestionManager from '../components/admin/QuestionManager';
import ChapterNotesEditor from '../components/admin/ChapterNotesEditor';
import WorksheetManager from '../components/admin/WorksheetManager';
import VideoManager from '../components/admin/VideoManager';
import MediaLibrary from '../components/admin/MediaLibrary';
import WebsiteContentEditor from '../components/admin/WebsiteContentEditor';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Admin() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, ordersRes, contactsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats`, { withCredentials: true }),
                axios.get(`${API_URL}/api/admin/users`, { withCredentials: true }),
                axios.get(`${API_URL}/api/admin/orders`, { withCredentials: true }),
                axios.get(`${API_URL}/api/admin/contacts`, { withCredentials: true })
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
            setContacts(contactsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: BookOpen },
        { id: 'website', name: 'Website Content', icon: Globe },
        { id: 'chapter-notes', name: 'Chapter Notes', icon: Layers },
        { id: 'topics', name: 'Topics', icon: PenTool },
        { id: 'worksheets', name: 'Worksheets', icon: FileUp },
        { id: 'questions', name: 'Questions', icon: HelpCircle },
        { id: 'videos', name: 'Videos', icon: Play },
        { id: 'media', name: 'Media Library', icon: Image },
        { id: 'courses', name: 'Courses', icon: GraduationCap },
        { id: 'products', name: 'Products', icon: Package },
        { id: 'users', name: 'Users', icon: Users },
        { id: 'orders', name: 'Orders', icon: ShoppingBag },
        { id: 'contacts', name: 'Contacts', icon: MessageSquare },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="admin-panel">
            <div className="container-custom py-8 md:py-12">
                <h1 className="font-heading text-2xl sm:text-3xl font-medium text-primary mb-8">
                    Admin Panel
                </h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-accent text-white'
                                    : 'text-text-secondary hover:bg-background'
                            }`}
                            data-testid={`admin-tab-${tab.id}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8" data-testid="admin-overview">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="premium-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stats?.users || 0}</p>
                                        <p className="text-sm text-text-secondary">Total Users</p>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stats?.courses || 0}</p>
                                        <p className="text-sm text-text-secondary">Courses</p>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stats?.workshops || 0}</p>
                                        <p className="text-sm text-text-secondary">Workshops</p>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                                        <ShoppingBag className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stats?.orders || 0}</p>
                                        <p className="text-sm text-text-secondary">Orders</p>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stats?.enrollments || 0}</p>
                                        <p className="text-sm text-text-secondary">Enrollments</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="premium-card p-6">
                                <h3 className="font-heading text-lg font-medium text-primary mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {users.slice(0, 5).map((user, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                            <div>
                                                <p className="font-medium text-primary">{user.name}</p>
                                                <p className="text-sm text-text-secondary">{user.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="premium-card p-6">
                                <h3 className="font-heading text-lg font-medium text-primary mb-4">Recent Orders</h3>
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map((order, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                            <div>
                                                <p className="font-medium text-primary">Order #{order.id?.slice(-8)}</p>
                                                <p className="text-sm text-text-secondary">₹{order.total?.toLocaleString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Website Content Tab */}
                {activeTab === 'website' && (
                    <div data-testid="admin-website">
                        <WebsiteContentEditor />
                    </div>
                )}

                {/* Chapter Notes Tab */}
                {activeTab === 'chapter-notes' && (
                    <div data-testid="admin-chapter-notes">
                        <ChapterNotesEditor />
                    </div>
                )}

                {/* Topics Tab */}
                {activeTab === 'topics' && (
                    <div data-testid="admin-topics">
                        <TopicEditor />
                    </div>
                )}

                {/* Worksheets Tab */}
                {activeTab === 'worksheets' && (
                    <div data-testid="admin-worksheets">
                        <WorksheetManager />
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div data-testid="admin-questions">
                        <QuestionManager />
                    </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                    <div data-testid="admin-videos">
                        <VideoManager />
                    </div>
                )}

                {/* Media Library Tab */}
                {activeTab === 'media' && (
                    <div data-testid="admin-media">
                        <MediaLibrary />
                    </div>
                )}

                {/* Courses Tab */}
                {activeTab === 'courses' && (
                    <div data-testid="admin-courses">
                        <CourseManager />
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div data-testid="admin-products-mgr">
                        <ProductManager />
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="premium-card p-6" data-testid="admin-users">
                        <h3 className="font-heading text-lg font-medium text-primary mb-4">All Users ({users.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Email</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Role</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={index} className="border-b border-border hover:bg-background">
                                            <td className="py-3 px-4 text-primary">{user.name}</td>
                                            <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-text-secondary">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="premium-card p-6" data-testid="admin-orders">
                        <h3 className="font-heading text-lg font-medium text-primary mb-4">All Orders ({orders.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Order ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Items</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Total</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-text-secondary">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={index} className="border-b border-border hover:bg-background">
                                            <td className="py-3 px-4 text-primary font-mono text-sm">#{order.id?.slice(-8)}</td>
                                            <td className="py-3 px-4 text-text-secondary">{order.items?.length} items</td>
                                            <td className="py-3 px-4 text-primary font-medium">₹{order.total?.toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                    order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-text-secondary">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div className="premium-card p-6" data-testid="admin-contacts">
                        <h3 className="font-heading text-lg font-medium text-primary mb-4">Contact Messages ({contacts.length})</h3>
                        <div className="space-y-4">
                            {contacts.length === 0 ? (
                                <p className="text-text-secondary py-4">No contact messages yet.</p>
                            ) : (
                                contacts.map((contact, index) => (
                                    <div key={index} className="p-4 bg-background rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-primary">{contact.name}</p>
                                                <p className="text-sm text-text-secondary">{contact.email} • {contact.phone}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                contact.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {contact.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-text-secondary mb-2"><strong>Subject:</strong> {contact.subject}</p>
                                        <p className="text-sm text-text-primary">{contact.message}</p>
                                        <p className="text-xs text-text-secondary mt-2">
                                            {new Date(contact.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
