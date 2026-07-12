import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, Trash2, Eye, EyeOff, FileText, Image, Film, Link2, Download, File, Music } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ASSET_TYPES = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'worksheet', label: 'Worksheet', icon: FileText },
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'ppt', label: 'PowerPoint', icon: FileText },
    { value: 'document', label: 'Document', icon: File },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Film },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'zip', label: 'ZIP Archive', icon: Download },
    { value: 'youtube', label: 'YouTube', icon: Film },
    { value: 'link', label: 'External Link', icon: Link2 },
    { value: 'other', label: 'Other', icon: File },
];

const ACCESS_LEVELS = [
    { value: 'public', label: 'Public' },
    { value: 'registered', label: 'Registered Users' },
    { value: 'premium', label: 'Premium Members' },
    { value: 'school', label: 'School License' },
    { value: 'private', label: 'Private' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
];

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

/**
 * LearningAssetManager
 * Universal component for managing downloadable/supplementary resources.
 * Drop this into any section: topic sections, chapters, pages, etc.
 */
export default function LearningAssetManager({ parentType, parentId, section }) {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', asset_type: 'pdf', access_level: 'public' });
    const [embedForm, setEmbedForm] = useState({ title: '', embed_url: '', asset_type: 'youtube', description: '', access_level: 'public' });

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ parent_type: parentType, parent_id: parentId });
            if (section) params.set('section', section);
            const res = await axios.get(`${API_URL}/api/learning-assets/list?${params}`, { withCredentials: true });
            setAssets(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [parentType, parentId, section]);

    useEffect(() => { fetchAssets(); }, [fetchAssets]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('parent_type', parentType);
        fd.append('parent_id', parentId);
        fd.append('section', section || 'general');
        fd.append('title', uploadForm.title || file.name);
        fd.append('description', uploadForm.description);
        fd.append('asset_type', uploadForm.asset_type);
        fd.append('access_level', uploadForm.access_level);
        try {
            await axios.post(`${API_URL}/api/learning-assets/upload`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('Asset uploaded');
            setShowUpload(false);
            setUploadForm({ title: '', description: '', asset_type: 'pdf', access_level: 'public' });
            fetchAssets();
        } catch (err) { toast.error('Upload failed'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleEmbed = async () => {
        if (!embedForm.embed_url) { toast.error('URL required'); return; }
        try {
            await axios.post(`${API_URL}/api/learning-assets/embed`, {
                parent_type: parentType, parent_id: parentId, section: section || 'general', ...embedForm,
            }, { withCredentials: true });
            toast.success('Asset added');
            setShowEmbed(false);
            setEmbedForm({ title: '', embed_url: '', asset_type: 'youtube', description: '', access_level: 'public' });
            fetchAssets();
        } catch (err) { toast.error('Failed'); }
    };

    const toggleVisibility = async (asset) => {
        try {
            await axios.put(`${API_URL}/api/learning-assets/${asset.id}`, { is_visible: !asset.is_visible }, { withCredentials: true });
            fetchAssets();
        } catch (e) { toast.error('Failed'); }
    };

    const deleteAsset = async (id) => {
        if (!window.confirm('Delete this asset?')) return;
        try {
            await axios.delete(`${API_URL}/api/learning-assets/${id}`, { withCredentials: true });
            toast.success('Deleted'); fetchAssets();
        } catch (e) { toast.error('Failed'); }
    };

    const getIcon = (type) => (ASSET_TYPES.find(t => t.value === type)?.icon || File);
    const accessColor = (level) => {
        const colors = { public: '', registered: 'bg-blue-50 text-blue-700', premium: 'bg-violet-50 text-violet-700', school: 'bg-indigo-50 text-indigo-700', draft: 'bg-gray-100 text-gray-500', scheduled: 'bg-amber-50 text-amber-700' };
        return colors[level] || '';
    };

    return (
        <div className="mt-3" data-testid={`asset-mgr-${parentId}-${section}`}>
            <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-gray-500">Learning Assets ({assets.length})</Label>
                <div className="flex gap-2">
                    <button onClick={() => setShowEmbed(true)} className="text-[10px] text-accent hover:underline">+ Embed URL</button>
                    <button onClick={() => setShowUpload(true)} className="text-[10px] text-accent hover:underline">+ Upload File</button>
                </div>
            </div>

            {loading ? (
                <p className="text-[10px] text-gray-400">Loading...</p>
            ) : assets.length === 0 ? (
                <p className="text-[10px] text-gray-400 py-1">No assets. Upload PDFs, videos, worksheets, or embed YouTube links.</p>
            ) : (
                <div className="space-y-1">
                    {assets.map(a => {
                        const Icon = getIcon(a.asset_type);
                        return (
                            <div key={a.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${a.is_visible ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-50'}`}>
                                <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-primary truncate">{a.title || a.original_name}</p>
                                    <p className="text-[9px] text-gray-400">{a.asset_type} {a.file_size ? `· ${formatSize(a.file_size)}` : ''}</p>
                                </div>
                                {a.access_level && a.access_level !== 'public' && (
                                    <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${accessColor(a.access_level)}`}>{a.access_level}</span>
                                )}
                                <button onClick={() => toggleVisibility(a)} className="p-0.5 text-gray-400 hover:text-gray-600">
                                    {a.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                </button>
                                <button onClick={() => deleteAsset(a.id)} className="p-0.5 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Upload Learning Asset</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div><Label className="text-xs">Title</Label><Input value={uploadForm.title} onChange={e => setUploadForm(p => ({...p, title: e.target.value}))} className="mt-1" placeholder="Optional — defaults to filename" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs">Type</Label>
                                <select value={uploadForm.asset_type} onChange={e => setUploadForm(p => ({...p, asset_type: e.target.value}))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                    {ASSET_TYPES.filter(t => !['youtube', 'link'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div><Label className="text-xs">Access Level</Label>
                                <select value={uploadForm.access_level} onChange={e => setUploadForm(p => ({...p, access_level: e.target.value}))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                    {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                            <label className="cursor-pointer">
                                <span className="text-sm text-accent font-medium hover:underline">Choose file</span>
                                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                            </label>
                            {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Embed Dialog */}
            <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Embed / Link</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs">Type</Label>
                                <select value={embedForm.asset_type} onChange={e => setEmbedForm(p => ({...p, asset_type: e.target.value}))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                    <option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="link">External Link</option>
                                </select>
                            </div>
                            <div><Label className="text-xs">Access Level</Label>
                                <select value={embedForm.access_level} onChange={e => setEmbedForm(p => ({...p, access_level: e.target.value}))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                    {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div><Label className="text-xs">URL</Label><Input value={embedForm.embed_url} onChange={e => setEmbedForm(p => ({...p, embed_url: e.target.value}))} className="mt-1" placeholder="https://..." /></div>
                        <div><Label className="text-xs">Title</Label><Input value={embedForm.title} onChange={e => setEmbedForm(p => ({...p, title: e.target.value}))} className="mt-1" /></div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEmbed(false)} className="px-3 py-1.5 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                            <button onClick={handleEmbed} className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Add</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
