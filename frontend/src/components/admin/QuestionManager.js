import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, ChevronDown, Upload, Image } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function QuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filters, setFilters] = useState({ subject: '', board: '', difficulty: '', q: '' });
    const [page, setPage] = useState(1);

    const empty = { subject: 'physics', board: 'igcse', topic: '', chapter: '', difficulty: 'medium', paper_type: 'structured', question_text: '', question_image_url: '', marks: 0, answer: '', mark_scheme: '', tags: '', year: '', paper_number: '' };
    const [form, setForm] = useState(empty);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (filters.subject) p.set('subject', filters.subject);
            if (filters.board) p.set('board', filters.board);
            if (filters.difficulty) p.set('difficulty', filters.difficulty);
            if (filters.q) p.set('q', filters.q);
            p.set('page', page); p.set('limit', 20);
            const res = await axios.get(`${API_URL}/api/questions/admin/list?${p}`, { withCredentials: true });
            setQuestions(res.data.questions);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load questions'); }
        finally { setLoading(false); }
    }, [filters, page]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/questions/admin/stats`, { withCredentials: true });
            setStats(res.data);
        } catch {}
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const openAdd = () => { setEditItem(null); setForm(empty); setShowForm(true); };
    const openEdit = (q) => {
        setEditItem(q);
        setForm({ ...q, tags: (q.tags || []).join(', '), marks: q.marks || 0 });
        setShowForm(true);
    };

    const handleSave = async () => {
        const payload = { ...form, marks: Number(form.marks), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
        try {
            if (editItem) {
                await axios.put(`${API_URL}/api/questions/admin/${editItem.id}`, payload, { withCredentials: true });
                toast.success('Question updated');
            } else {
                await axios.post(`${API_URL}/api/questions/admin/create`, payload, { withCredentials: true });
                toast.success('Question created');
            }
            setShowForm(false);
            fetchQuestions();
            fetchStats();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await axios.delete(`${API_URL}/api/questions/admin/${id}`, { withCredentials: true });
            toast.success('Deleted');
            fetchQuestions();
            fetchStats();
        } catch { toast.error('Failed to delete'); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await axios.post(`${API_URL}/api/questions/admin/upload-image`, fd, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
            setForm(prev => ({ ...prev, question_image_url: res.data.url }));
            toast.success('Image uploaded');
        } catch { toast.error('Upload failed'); }
    };

    const diffColors = { easy: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

    return (
        <div data-testid="question-manager">
            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-primary">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Questions</p>
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
                    <Input value={filters.q} onChange={e => { setFilters(p => ({ ...p, q: e.target.value })); setPage(1); }} placeholder="Search questions..." className="pl-9" data-testid="q-search" />
                </div>
                <select value={filters.subject} onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white" data-testid="q-filter-subject">
                    <option value="">All Subjects</option>
                    <option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="mathematics">Mathematics</option>
                </select>
                <select value={filters.board} onChange={e => { setFilters(p => ({ ...p, board: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-md text-sm bg-white">
                    <option value="">All Boards</option>
                    <option value="igcse">IGCSE</option><option value="as-level">AS Level</option><option value="a-level">A Level</option>
                </select>
                <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover" data-testid="add-question-btn">
                    <Plus className="w-4 h-4" /> Add Question
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-gray-50/50">
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Question</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Subject</th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Topic</th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase w-24">Actions</th>
                        </tr></thead>
                        <tbody>
                            {questions.map(q => (
                                <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-4"><p className="text-sm text-primary line-clamp-2">{q.question_text}</p></td>
                                    <td className="py-3 px-4 text-sm text-gray-600 capitalize hidden md:table-cell">{q.subject}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{q.topic}</td>
                                    <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${diffColors[q.difficulty] || ''}`}>{q.difficulty}</span></td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(q)} className="p-1.5 text-gray-400 hover:text-accent rounded"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {questions.length === 0 && <div className="text-center py-12 text-gray-500">No questions found.</div>}
                </div>
            )}

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-400">{total} total</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Prev</button>
                        <button onClick={() => setPage(p => p+1)} disabled={page * 20 >= total} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Add'} Question</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-3">
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
                            <div><Label className="text-xs">Difficulty</Label>
                                <select value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div><Label className="text-xs">Paper Type</Label>
                                <select value={form.paper_type} onChange={e => setForm(p => ({...p, paper_type: e.target.value}))} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="structured">Structured</option><option value="mcq">MCQ</option><option value="theory">Theory</option>
                                </select>
                            </div>
                            <div><Label className="text-xs">Marks</Label><Input type="number" value={form.marks} onChange={e => setForm(p => ({...p, marks: e.target.value}))} className="mt-1" /></div>
                            <div><Label className="text-xs">Year</Label><Input value={form.year} onChange={e => setForm(p => ({...p, year: e.target.value}))} className="mt-1" placeholder="e.g. 2023" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs">Topic</Label><Input value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} className="mt-1" placeholder="e.g. Electricity" data-testid="q-topic-input" /></div>
                            <div><Label className="text-xs">Paper Number</Label><Input value={form.paper_number} onChange={e => setForm(p => ({...p, paper_number: e.target.value}))} className="mt-1" placeholder="e.g. Paper 2" /></div>
                        </div>
                        <div><Label className="text-xs">Question Text</Label><Textarea value={form.question_text} onChange={e => setForm(p => ({...p, question_text: e.target.value}))} rows={5} className="mt-1 font-mono text-sm" placeholder="Write the question..." data-testid="q-text-input" /></div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <Label className="text-xs">Question Image</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 text-sm"><Upload className="w-4 h-4" /> Upload Image<input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                                {form.question_image_url && <p className="text-xs text-green-600 truncate flex-1">{form.question_image_url}</p>}
                            </div>
                        </div>
                        <div><Label className="text-xs">Answer</Label><Textarea value={form.answer} onChange={e => setForm(p => ({...p, answer: e.target.value}))} rows={4} className="mt-1 text-sm" placeholder="Full answer..." /></div>
                        <div><Label className="text-xs">Mark Scheme</Label><Textarea value={form.mark_scheme} onChange={e => setForm(p => ({...p, mark_scheme: e.target.value}))} rows={4} className="mt-1 text-sm" placeholder="Mark scheme..." /></div>
                        <div><Label className="text-xs">Tags (comma-separated)</Label><Input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} className="mt-1" placeholder="e.g. ohms-law, circuits, resistance" /></div>
                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover" data-testid="save-question-btn">{editItem ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
