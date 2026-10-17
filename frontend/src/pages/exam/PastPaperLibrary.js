import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Filter, ChevronDown, Search, ExternalLink, Lock } from 'lucide-react';
import axios from 'axios';
import { Input } from '../../components/ui/input';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PastPaperLibrary() {
    const { qualification: qualParam } = useParams();
    const [papers, setPapers] = useState([]);
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState({ qualification: qualParam || '', subject: '', syllabus_code: '', year: '', session: '', resource_type: '' });

    useEffect(() => {
        axios.get(`${API_URL}/api/past-papers/filters`).then(r => setFilters(r.data)).catch(() => {});
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 30 });
        Object.entries(selected).forEach(([k, v]) => { if (v) params.set(k, v); });
        axios.get(`${API_URL}/api/past-papers/browse?${params}`)
            .then(r => { setPapers(r.data.papers); setTotal(r.data.total); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, selected]);

    const resourceIcon = (type) => {
        const colors = { question_paper: 'bg-blue-50 text-blue-600', mark_scheme: 'bg-green-50 text-green-600', examiner_report: 'bg-violet-50 text-violet-600' };
        return colors[type] || 'bg-gray-50 text-gray-600';
    };

    const typeLabel = (t) => (t || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="past-paper-library">
            <section className="py-10 md:py-14 bg-white border-b">
                <div className="container-custom">
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-2" data-testid="pp-title">Past Paper Library</h1>
                    <p className="text-gray-600">Find Cambridge IGCSE, AS & A Level past papers, mark schemes, and examiner reports.</p>
                </div>
            </section>

            <section className="py-8 md:py-10">
                <div className="container-custom">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl border border-gray-100" data-testid="pp-filters">
                        <select value={selected.qualification} onChange={e => { setSelected(p => ({ ...p, qualification: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-filter-qual">
                            <option value="">All Qualifications</option>
                            {filters?.qualifications?.map(q => <option key={q} value={q} className="capitalize">{q.toUpperCase()}</option>)}
                        </select>
                        <select value={selected.subject} onChange={e => { setSelected(p => ({ ...p, subject: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-filter-subject">
                            <option value="">All Subjects</option>
                            {filters?.subjects?.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <select value={selected.syllabus_code} onChange={e => { setSelected(p => ({ ...p, syllabus_code: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-filter-code">
                            <option value="">All Codes</option>
                            {filters?.syllabus_codes?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={selected.year} onChange={e => { setSelected(p => ({ ...p, year: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white" data-testid="pp-filter-year">
                            <option value="">All Years</option>
                            {filters?.years?.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={selected.session} onChange={e => { setSelected(p => ({ ...p, session: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white">
                            <option value="">All Sessions</option>
                            {filters?.sessions?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={selected.resource_type} onChange={e => { setSelected(p => ({ ...p, resource_type: e.target.value })); setPage(1); }} className="h-10 px-3 border rounded-lg text-sm bg-white">
                            <option value="">All Types</option>
                            <option value="question_paper">Question Paper</option>
                            <option value="mark_scheme">Mark Scheme</option>
                            <option value="examiner_report">Examiner Report</option>
                        </select>
                        {Object.values(selected).some(Boolean) && (
                            <button onClick={() => { setSelected({ qualification: '', subject: '', syllabus_code: '', year: '', session: '', resource_type: '' }); setPage(1); }} className="h-10 px-3 text-sm text-red-500 hover:bg-red-50 rounded-lg">Clear All</button>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mb-4">{total} papers found</p>

                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-16"><div className="spinner"></div></div>
                    ) : papers.length === 0 ? (
                        <div className="text-center py-14">
                            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                            <h3 className="font-bold text-primary text-base mb-1">No past papers found</h3>
                            <p className="text-[13px] text-gray-400">Try adjusting your filters or check back as papers are being added.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {papers.map(p => (
                                <div key={p.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:scale-[0.99] transition-all duration-200" data-testid={`pp-item-${p.id}`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${resourceIcon(p.resource_type)}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-primary text-sm truncate">{p.title || p.original_name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {p.qualification?.toUpperCase()} · {p.subject?.replace(/\b\w/g, c => c.toUpperCase())} {p.syllabus_code && `(${p.syllabus_code})`} · {p.year} {p.session} {p.paper ? `Paper ${p.paper}` : ''}
                                        </p>
                                    </div>
                                    <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${resourceIcon(p.resource_type)}`}>
                                        {typeLabel(p.resource_type)}
                                    </span>
                                    {p.access_level === 'public' || !p.access_level ? (
                                        <a href={`${API_URL}${p.file_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover flex-shrink-0">
                                            <Download className="w-3 h-3" /> View
                                        </a>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" /> {p.access_level}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {Math.ceil(total / 30) > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 30)}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 30)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
