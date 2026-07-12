import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Play, ExternalLink } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const STATUSES = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-700' },
    { value: 'coming_soon', label: 'Coming Soon', color: 'bg-amber-100 text-amber-700' },
    { value: 'premium', label: 'Premium', color: 'bg-violet-100 text-violet-700' },
    { value: 'locked', label: 'Locked', color: 'bg-gray-100 text-gray-600' },
    { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-600' },
];

function getStatusStyle(status) {
    return STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-600';
}

function extractYoutubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

export default function VideoManager() {
    const [videos, setVideos] = useState([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filters, setFilters] = useState({ subject: '', board: '', status: '', q: '' });
    const [page, setPage] = useState(1);

    const empty = { title: '', description: '', board: 'igcse', subject: 'physics', chapter: '', topic: '', question_id: '', youtube_url: '', thumbnail_url: '', duration: '', difficulty: 'medium', status: 'coming_soon', order: 0 };
    const [form, setForm] = useState(empty);

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.subject) p.set('subject', filters.subject);
            if (filters.board) p.set('board', filters.board);
            if (filters.status) p.set('status', filters.status);
            if (filters.q) p.set('q', filters.q);
            p.set('page', page); p.set('limit', 20);
            const res = await axios.get(`${API_URL}/api/videos/admin/list?${p}`, { withCredentials: true });
            setVideos(res.data.videos);
            setTotal(res.data.total);
        } catch (e) { toast.error('Failed to load videos'); }
        finally { setLoading(false); }
    }, [filters, page]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/videos/admin/stats`, { withCredentials: true });
            setStats(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchVideos(); }, [fetchVideos]);

    const openAdd = () => { setEditItem(null); setForm(empty); setShowForm(true); };
    const openEdit = (v) => { setEditItem(v); setForm({ ...v }); setShowForm(true); };

    const handleSave = async () => {
        const payload = { ...form, order: Number(form.order) || 0 };
        try {
            if (editItem) {
                await axios.put(`${API_URL}/api/videos/admin/${editItem.id}`, payload, { withCredentials: true });
                toast.success('Video updated');
            } else {
                await axios.post(`${API_URL}/api/videos/admin/create`, payload, { withCredentials: true });
                toast.success('Video created');
            }
            setShowForm(false);
            fetchVideos(); fetchStats();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await axios.delete(`${API_URL}/api/videos/admin/${id}`, { withCredentials: true });
            toast.success('Deleted'); fetchVideos(); fetchStats();
        } catch (e) { toast.error('Failed'); }
    };

    return (
        <div data-testid="video-manager">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-primary">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Videos</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                        <p className="text-xs text-gray-500">Available</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-amber-600">{stats.coming_soon}</p>
                        <p className="text-xs text-gray-500">Coming Soon</p>
                    </div>
                    {Object.entries(stats.by_subject).filter(([, v]) => v > 0).map(([k, v]) => (
                        <div key={k} className="p-4 bg-white rounded-xl border border-gray-100">
                            <p className="text-2xl font-bold text-primary">{v}</p>
                            <p className="text-xs text-gray-500 capitalize">{k}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex-1 min-w-[180px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={filters.q} onChange={e => { setFilters(p => ({ ...p, q: e.target.value })); setPage(1); }} placeholder="Search videos or question IDs..." className="pl-9" data-testid="video-search" />
                </div>
                <select value={filters.subject} onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white">
                    <option value="">All Subjects</option>
                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="mathematics">Mathematics</option>
                </select>
                <select value={filters.status} onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white">
                    <option value="">All Status</option>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover" data-testid="add-video-btn">
                    <Plus className="w-4 h-4" /> Add Video
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : videos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Play className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">No videos yet</p>
                    <p className="text-sm mt-1">Add your first video to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {videos.map(v => {
                        const ytId = extractYoutubeId(v.youtube_url);
                        return (
                            <div key={v.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow" data-testid={`video-row-${v.id}`}>
                                <div className="w-20 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                                    {ytId ? (
                                        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full"><Play className="w-6 h-6 text-gray-300" /></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="w-5 h-5 text-white" /></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-primary text-sm truncate">{v.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {v.subject} · {v.board} {v.chapter && `· ${v.chapter}`} {v.question_id && `· ${v.question_id}`} {v.duration && `· ${v.duration}`}
                                    </p>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full flex-shrink-0 ${getStatusStyle(v.status)}`}>
                                    {v.status?.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {v.youtube_url && <a href={v.youtube_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500"><ExternalLink className="w-4 h-4" /></a>}
                                    <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-accent"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(v.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Video</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-3">
                        <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="mt-1" placeholder="e.g. Ohm's Law - Worked Example" data-testid="video-title-input" /></div>
                        <div><Label className="text-xs">YouTube URL</Label><Input value={form.youtube_url} onChange={e => setForm(p => ({...p, youtube_url: e.target.value}))} className="mt-1" placeholder="https://www.youtube.com/watch?v=..." data-testid="video-url-input" /></div>
                        {form.youtube_url && extractYoutubeId(form.youtube_url) && (
                            <div className="rounded-lg overflow-hidden border"><iframe src={`https://www.youtube.com/embed/${extractYoutubeId(form.youtube_url)}`} title="Preview" className="w-full aspect-video" allowFullScreen /></div>
                        )}
                        <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2} className="mt-1 text-sm" /></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div><Label className="text-xs">Subject</Label>
                                <select value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="mathematics">Mathematics</option>
                                </select>
                            </div>
                            <div><Label className="text-xs">Board</Label>
                                <select value={form.board} onChange={e => setForm(p => ({...p, board: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="igcse">IGCSE</option><option value="as-level">AS Level</option><option value="a-level">A Level</option>
                                </select>
                            </div>
                            <div><Label className="text-xs">Status</Label>
                                <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div><Label className="text-xs">Chapter</Label><Input value={form.chapter} onChange={e => setForm(p => ({...p, chapter: e.target.value}))} className="mt-1" placeholder="e.g. electricity" /></div>
                            <div><Label className="text-xs">Topic</Label><Input value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} className="mt-1" placeholder="e.g. resistance" /></div>
                            <div><Label className="text-xs">Question ID</Label><Input value={form.question_id} onChange={e => setForm(p => ({...p, question_id: e.target.value}))} className="mt-1" placeholder="e.g. P-EL-001" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs">Duration</Label><Input value={form.duration} onChange={e => setForm(p => ({...p, duration: e.target.value}))} className="mt-1" placeholder="e.g. 5:30" /></div>
                            <div><Label className="text-xs">Difficulty</Label>
                                <select value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover" data-testid="save-video-btn">{editItem ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
