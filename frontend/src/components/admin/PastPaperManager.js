import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertTriangle, Search, Filter, ChevronDown, Trash2, Eye, EyeOff, Edit3 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const QUALIFICATIONS = [
    { value: 'igcse', label: 'IGCSE' },
    { value: 'as-level', label: 'AS Level' },
    { value: 'a-level', label: 'A Level' },
];
const SUBJECTS = ['mathematics', 'physics', 'chemistry', 'biology'];
const RESOURCE_TYPES = [
    { value: 'question_paper', label: 'Question Paper' },
    { value: 'mark_scheme', label: 'Mark Scheme' },
    { value: 'examiner_report', label: 'Examiner Report' },
    { value: 'grade_thresholds', label: 'Grade Thresholds' },
    { value: 'insert', label: 'Insert' },
    { value: 'specimen_paper', label: 'Specimen Paper' },
];

const confidenceBadge = (c) => {
    if (c === 'high') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">HIGH</span>;
    if (c === 'medium') return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">MED</span>;
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">LOW</span>;
};

export default function PastPaperManager({ onBack }) {
    const [papers, setPapers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);
    const [filterReview, setFilterReview] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [editPaper, setEditPaper] = useState(null);

    const fetchPapers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 30 });
            if (filterReview) params.set('review_status', filterReview);
            const res = await axios.get(`${API_URL}/api/past-papers/admin/list?${params}`, { withCredentials: true });
            setPapers(res.data.papers);
            setTotal(res.data.total);
        } catch (e) { toast.error('Failed to load papers'); }
        finally { setLoading(false); }
    }, [page, filterReview]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/past-papers/stats`, { withCredentials: true });
            setStats(res.data);
        } catch (e) { /* ignore */ }
    }, []);

    useEffect(() => { fetchPapers(); }, [fetchPapers]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleBulkUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadResults([]);
        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('files', f));
        try {
            const res = await axios.post(`${API_URL}/api/past-papers/bulk-upload`, fd, { withCredentials: true });
            setUploadResults(res.data.papers || []);
            toast.success(`${res.data.uploaded} papers uploaded`);
            fetchPapers();
            fetchStats();
        } catch (err) {
            toast.error('Bulk upload failed');
        } finally { setUploading(false); e.target.value = ''; }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`${API_URL}/api/past-papers/admin/${id}`, { review_status: 'approved' }, { withCredentials: true });
            toast.success('Approved');
            fetchPapers();
        } catch (e) { toast.error('Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this paper?')) return;
        try {
            await axios.delete(`${API_URL}/api/past-papers/admin/${id}`, { withCredentials: true });
            toast.success('Deleted');
            fetchPapers();
            fetchStats();
        } catch (e) { toast.error('Failed'); }
    };

    const handleEditSave = async () => {
        if (!editPaper) return;
        try {
            const { id, ...data } = editPaper;
            await axios.put(`${API_URL}/api/past-papers/admin/${id}`, data, { withCredentials: true });
            toast.success('Updated');
            setEditPaper(null);
            fetchPapers();
        } catch (e) { toast.error('Failed to update'); }
    };

    const bulkApproveAll = async () => {
        const pendingIds = papers.filter(p => p.review_status === 'pending').map(p => p.id);
        if (!pendingIds.length) { toast.info('Nothing to approve'); return; }
        try {
            const res = await axios.put(`${API_URL}/api/past-papers/admin/bulk-approve`, { paper_ids: pendingIds }, { withCredentials: true });
            toast.success(`${res.data.approved} papers approved`);
            fetchPapers();
        } catch (e) { toast.error('Failed'); }
    };

    const totalPages = Math.ceil(total / 30);

    return (
        <div data-testid="past-paper-manager">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-primary">Past Paper Library</h3>
                    <p className="text-xs text-gray-400">Upload, organise, and manage Cambridge past papers with auto-metadata inference</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={bulkApproveAll} className="px-3 py-2 text-sm border border-green-200 text-green-700 rounded-lg hover:bg-green-50" data-testid="bulk-approve-btn">
                        <CheckCircle className="w-4 h-4 inline mr-1" /> Approve Pending
                    </button>
                    <button onClick={() => setShowBulkUpload(true)} className="px-4 py-2 text-sm bg-accent text-white rounded-lg font-medium hover:bg-accent-hover" data-testid="bulk-upload-btn">
                        <Upload className="w-4 h-4 inline mr-1" /> Bulk Upload
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-gray-100"><p className="text-2xl font-bold text-primary">{stats.total}</p><p className="text-xs text-gray-500">Total Papers</p></div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100"><p className="text-2xl font-bold text-green-600">{stats.approved}</p><p className="text-xs text-gray-500">Approved</p></div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100"><p className="text-2xl font-bold text-amber-600">{stats.pending_review}</p><p className="text-xs text-gray-500">Pending Review</p></div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100 flex gap-3">
                        {Object.entries(stats.by_qualification || {}).map(([q, c]) => (
                            <div key={q}><p className="text-sm font-bold text-primary">{c}</p><p className="text-[10px] text-gray-400 uppercase">{q}</p></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 mb-4">
                <select value={filterReview} onChange={e => { setFilterReview(e.target.value); setPage(1); }} className="h-9 px-3 border rounded-md text-sm bg-white" data-testid="filter-review">
                    <option value="">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="auto_approved">Auto-Approved</option>
                </select>
                <span className="text-sm text-gray-400 self-center">{total} papers</span>
            </div>

            {/* Papers Table */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : papers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">No past papers yet</p>
                    <p className="text-sm mt-1">Use Bulk Upload to import Cambridge papers</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">File</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 hidden md:table-cell">Qualification</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 hidden md:table-cell">Subject</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Code</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Year</th>
                                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 hidden lg:table-cell">Type</th>
                                <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-500">Confidence</th>
                                <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-500 w-28">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {papers.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-2 px-3"><p className="font-medium text-primary text-xs truncate max-w-[200px]">{p.title || p.original_name}</p></td>
                                    <td className="py-2 px-3 text-xs text-gray-600 hidden md:table-cell capitalize">{p.qualification || '—'}</td>
                                    <td className="py-2 px-3 text-xs text-gray-600 hidden md:table-cell capitalize">{p.subject || '—'}</td>
                                    <td className="py-2 px-3 text-xs font-mono text-gray-500 hidden lg:table-cell">{p.syllabus_code || '—'}</td>
                                    <td className="py-2 px-3 text-xs text-gray-600">{p.year || '—'} {p.session && `${p.session}`} {p.paper ? `P${p.paper}` : ''}</td>
                                    <td className="py-2 px-3 text-xs text-gray-600 hidden lg:table-cell capitalize">{(p.resource_type || '').replace('_', ' ')}</td>
                                    <td className="py-2 px-3 text-center">{confidenceBadge(p.inference_confidence)}</td>
                                    <td className="py-2 px-3 text-center">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.review_status === 'approved' || p.review_status === 'auto_approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {p.review_status === 'auto_approved' ? 'AUTO' : (p.review_status || 'pending').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {p.review_status === 'pending' && (
                                                <button onClick={() => handleApprove(p.id)} className="p-1 text-green-500 hover:bg-green-50 rounded" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                                            )}
                                            <button onClick={() => setEditPaper({ id: p.id, qualification: p.qualification, subject: p.subject, syllabus_code: p.syllabus_code, year: p.year, session: p.session, paper: p.paper, variant: p.variant, resource_type: p.resource_type, title: p.title })} className="p-1 text-gray-400 hover:text-primary hover:bg-gray-100 rounded" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}

            {/* Bulk Upload Dialog */}
            <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
                <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader><DialogTitle>Bulk Upload Past Papers</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                        <p className="text-sm text-gray-500">Select multiple PDF files. Cambridge-style filenames (e.g. <code className="text-xs bg-gray-100 px-1 rounded">0580_s24_qp_22.pdf</code>) will be parsed automatically.</p>
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <label className="cursor-pointer">
                                <span className="text-sm text-accent font-medium hover:underline">Choose files</span>
                                <input type="file" multiple accept=".pdf,.PDF" className="hidden" onChange={handleBulkUpload} disabled={uploading} data-testid="bulk-file-input" />
                            </label>
                            {uploading && <p className="text-xs text-gray-400 mt-2">Uploading...</p>}
                        </div>
                        {uploadResults.length > 0 && (
                            <div className="max-h-60 overflow-y-auto space-y-1">
                                <p className="text-xs font-semibold text-gray-500 mb-2">{uploadResults.length} files processed:</p>
                                {uploadResults.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                                        {confidenceBadge(r.confidence)}
                                        <span className="truncate flex-1">{r.filename}</span>
                                        {r.inferred?.subject && <span className="text-gray-400 capitalize">{r.inferred.subject}</span>}
                                        {r.inferred?.year && <span className="text-gray-400">{r.inferred.year}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editPaper} onOpenChange={(open) => { if (!open) setEditPaper(null); }}>
                <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader><DialogTitle>Edit Paper Metadata</DialogTitle></DialogHeader>
                    {editPaper && (
                        <div className="space-y-3 pt-2">
                            <div><Label className="text-xs">Title</Label><Input value={editPaper.title || ''} onChange={e => setEditPaper(p => ({ ...p, title: e.target.value }))} className="mt-1" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><Label className="text-xs">Qualification</Label>
                                    <select value={editPaper.qualification || ''} onChange={e => setEditPaper(p => ({ ...p, qualification: e.target.value }))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                        <option value="">—</option>{QUALIFICATIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                                    </select>
                                </div>
                                <div><Label className="text-xs">Subject</Label>
                                    <select value={editPaper.subject || ''} onChange={e => setEditPaper(p => ({ ...p, subject: e.target.value }))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                        <option value="">—</option>{SUBJECTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><Label className="text-xs">Syllabus Code</Label><Input value={editPaper.syllabus_code || ''} onChange={e => setEditPaper(p => ({ ...p, syllabus_code: e.target.value }))} className="mt-1" placeholder="0580" /></div>
                                <div><Label className="text-xs">Year</Label><Input type="number" value={editPaper.year || ''} onChange={e => setEditPaper(p => ({ ...p, year: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
                                <div><Label className="text-xs">Session</Label><Input value={editPaper.session || ''} onChange={e => setEditPaper(p => ({ ...p, session: e.target.value }))} className="mt-1" placeholder="May/Jun" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><Label className="text-xs">Paper</Label><Input type="number" value={editPaper.paper || ''} onChange={e => setEditPaper(p => ({ ...p, paper: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
                                <div><Label className="text-xs">Variant</Label><Input type="number" value={editPaper.variant || ''} onChange={e => setEditPaper(p => ({ ...p, variant: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
                                <div><Label className="text-xs">Type</Label>
                                    <select value={editPaper.resource_type || ''} onChange={e => setEditPaper(p => ({ ...p, resource_type: e.target.value }))} className="mt-1 w-full h-9 px-3 border rounded-md text-sm">
                                        {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setEditPaper(null)} className="px-3 py-1.5 text-gray-600 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                                <button onClick={handleEditSave} className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Save</button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
