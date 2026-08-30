import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, ChevronRight, Search, FileCheck, Lock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const TYPE_LABELS = { question_paper: 'QP', mark_scheme: 'MS', examiner_report: 'ER', grade_thresholds: 'GT', insert: 'IN', specimen_paper: 'SP' };
const TYPE_FULL = { question_paper: 'Question Paper', mark_scheme: 'Mark Scheme', examiner_report: 'Examiner Report' };
const TYPE_COLORS = { question_paper: 'bg-blue-100 text-blue-700', mark_scheme: 'bg-green-100 text-green-700', examiner_report: 'bg-violet-100 text-violet-700' };

function paperUrl(p) {
    const sess = (p.session || '').toLowerCase().replace(/\//g, '-').replace(/ /g, '-');
    const rt = (p.resource_type || '').replace(/_/g, '-');
    return `/past-papers/${p.qualification}/${p.syllabus_code}/${p.year}/${sess}/paper-${p.paper}/${rt}`;
}

export default function PastPaperCollection() {
    const { qualification, subjectCode } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const yearFilter = searchParams.get('year') || '';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (yearFilter) params.set('year', yearFilter);
        axios.get(`${API_URL}/api/past-papers/collection/${qualification}/${subjectCode}?${params}`)
            .then(r => setData(r.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [qualification, subjectCode, yearFilter]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    if (!data) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-200 mb-4" />
            <h2 className="font-bold text-primary text-lg mb-2">No Papers Found</h2>
            <Link to="/exam/past-papers" className="text-accent text-sm hover:underline">Browse All Past Papers</Link>
        </div>
    );

    // Group papers by year → session → paper number
    const grouped = {};
    data.papers.forEach(p => {
        const y = p.year || 'Unknown';
        const s = p.session || 'Unknown';
        const pn = p.paper || 0;
        const key = `${y}|${s}|${pn}`;
        if (!grouped[key]) grouped[key] = { year: y, session: s, paper: pn, items: [] };
        grouped[key].items.push(p);
    });

    // Sort: newest first
    const sortedGroups = Object.values(grouped).sort((a, b) => b.year - a.year || a.session.localeCompare(b.session) || a.paper - b.paper);

    // Filter by search
    const filtered = searchQ
        ? sortedGroups.filter(g => {
            const q = searchQ.toLowerCase();
            return String(g.year).includes(q) || g.session.toLowerCase().includes(q) || g.items.some(i => i.title?.toLowerCase().includes(q));
        })
        : sortedGroups;

    const subjectName = (data.subject || subjectCode).replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="past-paper-collection">
            {/* Header */}
            <section className="py-8 md:py-10 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link to="/exam/past-papers" className="hover:text-primary">Past Papers</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{qualification?.toUpperCase()} {subjectName} {subjectCode}</span>
                    </nav>

                    <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-2" data-testid="collection-title">
                        {qualification?.toUpperCase()} {subjectName} ({subjectCode})
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">{data.total} past papers available</p>

                    {/* Search + Year Filter */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-xs">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search papers..." className="bg-transparent outline-none text-sm flex-1" data-testid="collection-search" />
                        </div>
                        <select value={yearFilter} onChange={e => setSearchParams(e.target.value ? { year: e.target.value } : {})} className="h-10 px-3 border rounded-xl text-sm bg-white" data-testid="collection-year-filter">
                            <option value="">All Years</option>
                            {(data.years || []).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </section>

            {/* Papers */}
            <section className="py-8 md:py-10">
                <div className="container-custom">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16"><p className="text-gray-400">No papers match your search.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((g, gi) => (
                                <div key={gi} className="bg-white rounded-xl border border-gray-100 p-5" data-testid={`paper-group-${g.year}-${g.paper}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-primary text-sm">
                                            {g.year} {g.session} — Paper {g.paper}
                                        </h3>
                                        <span className="text-xs text-gray-400">{g.items.length} resource{g.items.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {g.items.sort((a, b) => (a.resource_type || '').localeCompare(b.resource_type || '')).map(item => {
                                            const label = TYPE_FULL[item.resource_type] || item.resource_type?.replace(/_/g, ' ');
                                            const abbr = TYPE_LABELS[item.resource_type] || 'DOC';
                                            const color = TYPE_COLORS[item.resource_type] || 'bg-gray-100 text-gray-700';
                                            return (
                                                <Link
                                                    key={item.id}
                                                    to={paperUrl(item)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 transition-all text-sm group"
                                                    data-testid={`paper-link-${item.id}`}
                                                >
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>{abbr}</span>
                                                    <span className="text-gray-600 group-hover:text-primary capitalize">{label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
