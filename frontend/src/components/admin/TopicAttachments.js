import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, Trash2, Eye, EyeOff, GripVertical, FileText, Image, Film, Link2, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_OPTIONS = [
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'ppt', label: 'PowerPoint', icon: FileText },
    { value: 'worksheet', label: 'Worksheet', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video File', icon: Film },
    { value: 'youtube', label: 'YouTube Embed', icon: Film },
    { value: 'link', label: 'External Link', icon: Link2 },
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText },
];

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function TopicAttachments({ topicId, topicTitle }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', description: '', attachment_type: 'pdf' });
    const [embedForm, setEmbedForm] = useState({ title: '', embed_url: '', attachment_type: 'youtube', description: '' });

    const fetchAttachments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/attachments/topic/${topicId}`, { withCredentials: true });
            setAttachments(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [topicId]);

    useEffect(() => { fetchAttachments(); }, [fetchAttachments]);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        fd.append('topic_id', topicId);
        fd.append('title', uploadForm.title || file.name);
        fd.append('description', uploadForm.description);
        fd.append('attachment_type', uploadForm.attachment_type);
        try {
            await axios.post(`${API_URL}/api/attachments/upload`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('File uploaded');
            setShowUpload(false);
            setUploadForm({ title: '', description: '', attachment_type: 'pdf' });
            fetchAttachments();
        } catch (err) { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    const handleAddEmbed = async () => {
        if (!embedForm.embed_url) { toast.error('URL required'); return; }
        try {
            await axios.post(`${API_URL}/api/attachments/embed`, { topic_id: topicId, ...embedForm }, { withCredentials: true });
            toast.success('Embed added');
            setShowEmbed(false);
            setEmbedForm({ title: '', embed_url: '', attachment_type: 'youtube', description: '' });
            fetchAttachments();
        } catch (err) { toast.error('Failed'); }
    };

    const toggleVisibility = async (att) => {
        try {
            await axios.put(`${API_URL}/api/attachments/${att.id}`, { is_visible: !att.is_visible }, { withCredentials: true });
            fetchAttachments();
        } catch (e) { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attachment?')) return;
        try {
            await axios.delete(`${API_URL}/api/attachments/${id}`, { withCredentials: true });
            toast.success('Deleted');
            fetchAttachments();
        } catch (e) { toast.error('Failed'); }
    };

    const typeIcon = (type) => {
        const t = TYPE_OPTIONS.find(o => o.value === type);
        return t ? t.icon : FileText;
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100" data-testid={`attachments-${topicId}`}>
            <div className="flex items-center justify-between mb-3">
                <Label className="text-xs font-semibold text-gray-500">Attachments ({attachments.length})</Label>
                <div className="flex gap-2">
                    <button onClick={() => setShowEmbed(true)} className="text-xs text-accent hover:underline">+ Embed URL</button>
                    <button onClick={() => setShowUpload(true)} className="text-xs text-accent hover:underline">+ Upload File</button>
                </div>
            </div>

            {loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
            ) : attachments.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">No attachments yet. Upload PDFs, images, videos, or embed YouTube links.</p>
            ) : (
                <div className="space-y-1.5">
                    {attachments.map(att => {
                        const Icon = typeIcon(att.attachment_type);
                        return (
                            <div key={att.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${att.is_visible ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}>
                                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary truncate">{att.title || att.original_name}</p>
                                    <p className="text-[10px] text-gray-400">{att.attachment_type} {att.file_size ? `· ${formatSize(att.file_size)}` : ''}</p>
                                </div>
                                <button onClick={() => toggleVisibility(att)} className="p-1 text-gray-400 hover:text-gray-600" title={att.is_visible ? 'Hide' : 'Show'}>
                                    {att.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => handleDelete(att.id)} className="p-1 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUpload} onOpenChange={setShowUpload}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Upload Attachment</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div><Label className="text-xs">Title</Label><Input value={uploadForm.title} onChange={e => setUploadForm(p => ({...p, title: e.target.value}))} className="mt-1" placeholder="Optional — defaults to filename" /></div>
                        <div><Label className="text-xs">Type</Label>
                            <select value={uploadForm.attachment_type} onChange={e => setUploadForm(p => ({...p, attachment_type: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                {TYPE_OPTIONS.filter(t => t.value !== 'youtube' && t.value !== 'link').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <label className="cursor-pointer">
                                <span className="text-sm text-accent font-medium hover:underline">Choose file</span>
                                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                            </label>
                            {uploading && <p className="text-xs text-gray-400 mt-2">Uploading...</p>}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Embed Dialog */}
            <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Embed / Link</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div><Label className="text-xs">Type</Label>
                            <select value={embedForm.attachment_type} onChange={e => setEmbedForm(p => ({...p, attachment_type: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="link">External Link</option>
                            </select>
                        </div>
                        <div><Label className="text-xs">URL</Label><Input value={embedForm.embed_url} onChange={e => setEmbedForm(p => ({...p, embed_url: e.target.value}))} className="mt-1" placeholder="https://..." /></div>
                        <div><Label className="text-xs">Title</Label><Input value={embedForm.title} onChange={e => setEmbedForm(p => ({...p, title: e.target.value}))} className="mt-1" /></div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowEmbed(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                            <button onClick={handleAddEmbed} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Add</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
