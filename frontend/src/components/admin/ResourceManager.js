import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Upload, FileText, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const CATEGORIES = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

export default function ResourceManager() {
    const [resources, setResources] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterCat, setFilterCat] = useState('all');
    const [uploading, setUploading] = useState(false);

    const defaultForm = { title: '', description: '', subject: 'Mathematics', resource_type: 'PDF', is_premium: true, file_url: '', preview_content: '' };
    const [formData, setFormData] = useState(defaultForm);

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/manage/resources`, { withCredentials: true });
            setResources(res.data);
        } catch { toast.error('Failed to load resources'); }
    };

    useEffect(() => { fetchResources(); }, []);

    const filtered = filterCat === 'all' ? resources : resources.filter(r => r.subject === filterCat);

    const openAdd = () => { setEditItem(null); setFormData(defaultForm); setShowForm(true); };
    const openEdit = (r) => {
        setEditItem(r);
        setFormData({
            title: r.title, description: r.description || '', subject: r.subject || 'Mathematics',
            resource_type: r.resource_type || 'PDF', is_premium: r.is_premium !== false,
            file_url: r.file_url || '', preview_content: r.preview_content || ''
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        try {
            if (editItem) {
                await axios.put(`${API_URL}/api/admin/resources/${editItem.id}`, formData, { withCredentials: true });
                toast.success('Resource updated');
            } else {
                await axios.post(`${API_URL}/api/admin/resources`, formData, { withCredentials: true });
                toast.success('Resource created');
            }
            setShowForm(false);
            fetchResources();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await axios.delete(`${API_URL}/api/admin/resources/${id}`, { withCredentials: true });
            toast.success('Resource deleted');
            fetchResources();
        } catch { toast.error('Failed to delete'); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_type', 'resources');
            const res = await axios.post(`${API_URL}/api/uploads/file`, fd, {
                withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, file_url: res.data.file_url }));
            toast.success(`${file.name} uploaded`);
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    return (
        <div data-testid="resource-manager">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-primary">Resources ({resources.length})</h3>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors" data-testid="add-resource-btn">
                    <Plus className="w-4 h-4" /> Add Resource
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setFilterCat('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCat === 'all' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCat === cat ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Access</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">File</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50" data-testid={`resource-row-${r.id}`}>
                                <td className="py-3 px-4">
                                    <p className="font-medium text-primary text-sm">{r.title}</p>
                                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.description}</p>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{r.subject}</td>
                                <td className="py-3 px-4"><span className="px-2 py-0.5 text-xs bg-gray-100 rounded font-medium">{r.resource_type}</span></td>
                                <td className="py-3 px-4">
                                    {r.is_premium ? (
                                        <span className="flex items-center gap-1 text-xs text-amber-600"><EyeOff className="w-3 h-3" /> Locked</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-green-600"><Eye className="w-3 h-3" /> Free</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {r.file_url ? <FileText className="w-4 h-4 text-accent" /> : <span className="text-xs text-gray-400">None</span>}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-accent rounded"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-400">No resources found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editItem ? 'Edit' : 'Add'} Resource</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="mt-1" data-testid="resource-title-input" /></div>
                        <div><Label>Description *</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} rows={3} className="mt-1" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Category</Label>
                                <select value={formData.subject} onChange={e => setFormData(p => ({...p, subject: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><Label>Type</Label>
                                <select value={formData.resource_type} onChange={e => setFormData(p => ({...p, resource_type: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    {['PDF', 'Worksheet', 'Notes', 'Video', 'Other'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={!formData.is_premium} onCheckedChange={v => setFormData(p => ({...p, is_premium: !v}))} />
                            <Label>Free Access (no login required)</Label>
                        </div>
                        <div>
                            <Label>File Upload</Label>
                            <label className="mt-1 flex items-center gap-2 px-4 py-3 bg-gray-50 border border-dashed rounded-lg cursor-pointer hover:bg-gray-100 text-sm w-full">
                                <Upload className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-500">{formData.file_url ? 'Replace file' : 'Choose file (PDF, up to 50MB)'}</span>
                                <input type="file" accept=".pdf,.doc,.docx,.xlsx,.pptx" className="hidden" onChange={handleFileUpload} />
                            </label>
                            {formData.file_url && <p className="text-xs text-green-600 mt-1">File: {formData.file_url}</p>}
                        </div>
                        <div><Label>Preview Content</Label><Textarea value={formData.preview_content} onChange={e => setFormData(p => ({...p, preview_content: e.target.value}))} rows={2} className="mt-1" placeholder="Visible to non-authenticated users" /></div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={uploading} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50" data-testid="save-resource-btn">
                                {uploading ? 'Uploading...' : (editItem ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
