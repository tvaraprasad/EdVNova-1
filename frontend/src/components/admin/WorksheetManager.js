import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Upload, FileText, Download } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function WorksheetManager() {
    const [worksheets, setWorksheets] = useState([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [filters, setFilters] = useState({ subject: '', board: '', q: '' });
    const [page, setPage] = useState(1);

    const empty = { title: '', subject: 'physics', board: 'igcse', chapter: '', topic: '', description: '', is_free: false };
    const [form, setForm] = useState(empty);
    const [file, setFile] = useState(null);

    const fetchWorksheets = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.subject) p.set('subject', filters.subject);
            if (filters.board) p.set('board', filters.board);
            if (filters.q) p.set('q', filters.q);
            p.set('page', page); p.set('limit', 20);
            const res = await axios.get(`${API_URL}/api/worksheets/admin/list?${p}`, { withCredentials: true });
            setWorksheets(res.data.worksheets);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load worksheets'); }
        finally { setLoading(false); }
    }, [filters, page]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/worksheets/admin/stats`, { withCredentials: true });
            setStats(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchWorksheets(); }, [fetchWorksheets]);

    const openAdd = () => { setEditItem(null); setForm(empty); setFile(null); setShowForm(true); };
    const openEdit = (w) => {
        setEditItem(w);
        setForm({ title: w.title, subject: w.subject, board: w.board, chapter: w.chapter || '', topic: w.topic || '', description: w.description || '', is_free: w.is_free || false });
        setFile(null);
        setShowForm(true);
    };

    const handleUpload = async () => {
        if (!editItem && !file) { toast.error('Please select a file'); return; }
        setUploading(true);
        try {
            if (editItem) {
                // Update metadata only
                await axios.put(`${API_URL}/api/worksheets/admin/${editItem.id}`, form, { withCredentials: true });
                toast.success('Worksheet updated');
            } else {
                // Upload new
                const fd = new FormData();
                fd.append('file', file);
                Object.entries(form).forEach(([k, v]) => fd.append(k, v.toString()));
                await axios.post(`${API_URL}/api/worksheets/admin/upload`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Worksheet uploaded');
            }
            setShowForm(false);
            fetchWorksheets();
            fetchStats();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
        finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this worksheet?')) return;
        try {
            await axios.delete(`${API_URL}/api/worksheets/admin/${id}`, { withCredentials: true });
            toast.success('Deleted');
            fetchWorksheets();
            fetchStats();
        } catch { toast.error('Failed'); }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <div data-testid="worksheet-manager">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-primary">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Worksheets</p>
                    </div>
                    {Object.entries(stats.by_subject).map(([k, v]) => (
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
                    <Input value={filters.q} onChange={e => { setFilters(p => ({ ...p, q: e.target.value })); setPage(1); }} placeholder="Search worksheets..." className="pl-9" />
                </div>
                <select value={filters.subject} onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white">
                    <option value="">All Subjects</option>
                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="mathematics">Mathematics</option>
                </select>
                <select value={filters.board} onChange={e => { setFilters(p => ({ ...p, board: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white">
                    <option value="">All Boards</option>
                    <option value="igcse">IGCSE</option><option value="as-level">AS Level</option><option value="a-level">A Level</option>
                </select>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover" data-testid="upload-worksheet-btn">
                    <Upload className="w-4 h-4" /> Upload Worksheet
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : worksheets.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">No worksheets uploaded yet</p>
                    <p className="text-sm mt-1">Upload your first worksheet to get started</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {worksheets.map(w => (
                        <div key={w.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow" data-testid={`worksheet-row-${w.id}`}>
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary text-sm truncate">{w.title}</p>
                                <p className="text-xs text-gray-400">{w.subject} · {w.board} {w.chapter && `· ${w.chapter}`} {w.topic && `· ${w.topic}`}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0 hidden sm:flex">
                                {w.is_free && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">FREE</span>}
                                <span>{formatSize(w.file_size)}</span>
                                <span>{w.download_count || 0} downloads</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => openEdit(w)} className="p-1.5 text-gray-400 hover:text-accent rounded"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(w.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload / Edit Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>{editItem ? 'Edit Worksheet' : 'Upload Worksheet'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-3">
                        {!editItem && (
                            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <label className="cursor-pointer">
                                    <span className="text-sm text-accent font-medium hover:underline">{file ? file.name : 'Choose PDF file'}</span>
                                    <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => setFile(e.target.files[0])} data-testid="worksheet-file-input" />
                                </label>
                            </div>
                        )}
                        <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="mt-1" placeholder="e.g. Electricity Topical Worksheet" data-testid="worksheet-title-input" /></div>
                        <div className="grid grid-cols-2 gap-3">
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
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs">Chapter</Label><Input value={form.chapter} onChange={e => setForm(p => ({...p, chapter: e.target.value}))} className="mt-1" placeholder="e.g. Electricity" /></div>
                            <div><Label className="text-xs">Topic</Label><Input value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} className="mt-1" placeholder="e.g. Resistance" /></div>
                        </div>
                        <div><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2} className="mt-1 text-sm" placeholder="Brief description..." /></div>
                        <div className="flex items-center gap-3">
                            <Switch checked={form.is_free} onCheckedChange={v => setForm(p => ({...p, is_free: v}))} />
                            <Label className="text-sm">Free download (no sign-in required)</Label>
                        </div>
                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleUpload} disabled={uploading} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50" data-testid="save-worksheet-btn">
                                {uploading ? 'Uploading...' : (editItem ? 'Update' : 'Upload')}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
