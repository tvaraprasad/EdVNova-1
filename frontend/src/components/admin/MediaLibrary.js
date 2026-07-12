import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, Trash2, Search, Folder, Image, FileText, Film, File, Copy, Check } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = {
    png: Image, jpg: Image, jpeg: Image, webp: Image, gif: Image, svg: Image,
    pdf: FileText, doc: FileText, docx: FileText,
    mp4: Film, mov: Film, avi: Film,
};

function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MediaLibrary() {
    const [files, setFiles] = useState([]);
    const [total, setTotal] = useState(0);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeFolder, setActiveFolder] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [newFolder, setNewFolder] = useState('general');
    const [copiedUrl, setCopiedUrl] = useState('');

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (activeFolder) p.set('folder', activeFolder);
            if (searchQuery) p.set('q', searchQuery);
            p.set('limit', 50);
            const res = await axios.get(`${API_URL}/api/media/list?${p}`, { withCredentials: true });
            setFiles(res.data.files);
            setTotal(res.data.total);
        } catch (e) { toast.error('Failed to load files'); }
        finally { setLoading(false); }
    }, [activeFolder, searchQuery]);

    const fetchFolders = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/media/folders`, { withCredentials: true });
            setFolders(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchFolders(); }, [fetchFolders]);
    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleUpload = async (e) => {
        const fileList = e.target.files;
        if (!fileList?.length) return;
        setUploading(true);
        let uploaded = 0;
        for (const file of fileList) {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', newFolder);
            try {
                await axios.post(`${API_URL}/api/media/upload`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
                uploaded++;
            } catch (err) { toast.error(`Failed: ${file.name}`); }
        }
        if (uploaded > 0) toast.success(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded`);
        setUploading(false);
        fetchFiles(); fetchFolders();
        e.target.value = '';
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            await axios.delete(`${API_URL}/api/media/${id}`, { withCredentials: true });
            toast.success('Deleted'); fetchFiles(); fetchFolders();
        } catch (e) { toast.error('Failed'); }
    };

    const copyUrl = (url) => {
        const full = `${API_URL}${url}`;
        navigator.clipboard.writeText(full);
        setCopiedUrl(url);
        toast.success('URL copied');
        setTimeout(() => setCopiedUrl(''), 2000);
    };

    const isImage = (ext) => ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);

    return (
        <div data-testid="media-library">
            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-48 flex-shrink-0 hidden md:block">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Folders</h3>
                    <button onClick={() => setActiveFolder('')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${!activeFolder ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        All Files <span className="text-xs text-gray-400 ml-1">({total})</span>
                    </button>
                    {folders.map(f => (
                        <button key={f.name} onClick={() => setActiveFolder(f.name)} className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${activeFolder === f.name ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Folder className="w-4 h-4" /> {f.name} <span className="text-xs text-gray-400 ml-auto">{f.count}</span>
                        </button>
                    ))}
                </div>

                {/* Main */}
                <div className="flex-1 min-w-0">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="flex-1 min-w-[180px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search files..." className="pl-9" data-testid="media-search" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Input value={newFolder} onChange={e => setNewFolder(e.target.value)} placeholder="Folder" className="w-28 text-sm" />
                            <label className={`flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                                <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
                                <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} data-testid="media-upload-input" />
                            </label>
                        </div>
                    </div>

                    {/* File Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="spinner"></div></div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <File className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                            <p className="font-medium">No files{activeFolder ? ` in ${activeFolder}` : ''}</p>
                            <p className="text-sm mt-1">Upload files to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {files.map(f => {
                                const Icon = ICON_MAP[f.extension] || File;
                                return (
                                    <div key={f.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow" data-testid={`media-file-${f.id}`}>
                                        {/* Preview */}
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                                            {isImage(f.extension) ? (
                                                <img src={`${API_URL}${f.file_url}`} alt={f.original_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon className="w-10 h-10 text-gray-300" />
                                            )}
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button onClick={() => copyUrl(f.file_url)} className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100" title="Copy URL">
                                                    {copiedUrl === f.file_url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => handleDelete(f.id)} className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Info */}
                                        <div className="p-2.5">
                                            <p className="text-xs font-medium text-primary truncate">{f.original_name}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-[10px] text-gray-400">{formatSize(f.file_size)}</span>
                                                <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{f.folder}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
