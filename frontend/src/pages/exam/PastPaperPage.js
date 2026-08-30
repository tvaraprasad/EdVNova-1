import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, ChevronRight, ExternalLink, ArrowLeft, FileCheck, Lock } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_LABELS = { question_paper: 'Question Paper', mark_scheme: 'Mark Scheme', examiner_report: 'Examiner Report', grade_thresholds: 'Grade Thresholds', insert: 'Insert', specimen_paper: 'Specimen Paper' };
const TYPE_COLORS = { question_paper: 'bg-blue-50 text-blue-700', mark_scheme: 'bg-green-50 text-green-700', examiner_report: 'bg-violet-50 text-violet-700' };

function paperUrl(p) {
    const sess = (p.session || '').toLowerCase().replace(/\//g, '-').replace(/ /g, '-');
    const rt = (p.resource_type || '').replace(/_/g, '-');
    return `/past-papers/${p.qualification}/${p.syllabus_code}/${p.year}/${sess}/paper-${p.paper}/${rt}`;
}

export default function PastPaperPage() {
    const { qualification, subjectCode, year, session, paperSlug, resourceType } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/api/past-papers/page/${qualification}/${subjectCode}/${year}/${session}/${paperSlug}/${resourceType}`)
            .then(r => setData(r.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [qualification, subjectCode, year, session, paperSlug, resourceType]);

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="spinner"></div></div>;
    if (!data || !data.paper) return (
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-200 mb-4" />
            <h2 className="font-bold text-primary text-lg mb-2">Paper Not Found</h2>
            <p className="text-sm text-gray-400 mb-4">This past paper may not be available yet.</p>
            <Link to="/exam/past-papers" className="text-accent text-sm hover:underline">Browse Past Papers</Link>
        </div>
    );

    const p = data.paper;
    const related = data.related || [];
    const otherPapers = data.other_same_year || [];
    const typeLabel = TYPE_LABELS[p.resource_type] || p.resource_type;
    const typeColor = TYPE_COLORS[p.resource_type] || 'bg-gray-50 text-gray-700';
    const collectionUrl = `/past-papers/${p.qualification}/${p.syllabus_code}`;

    return (
        <div className="pt-16 md:pt-20 min-h-screen bg-background" data-testid="past-paper-page">
            {/* Breadcrumb */}
            <section className="py-6 bg-white border-b">
                <div className="container-custom">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap mb-4" data-testid="pp-breadcrumb">
                        <Link to="/exam/past-papers" className="hover:text-primary">Past Papers</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={collectionUrl} className="hover:text-primary capitalize">{p.qualification?.toUpperCase()} {p.subject?.replace(/\b\w/g, c => c.toUpperCase())} {p.syllabus_code}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-primary font-medium">{p.year} {p.session} Paper {p.paper}</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColor}`}>{typeLabel}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight" data-testid="pp-page-title">
                                {p.subject?.replace(/\b\w/g, c => c.toUpperCase())} {p.syllabus_code} — {typeLabel}
                            </h1>
                            <p className="text-gray-500 mt-1">{p.qualification?.toUpperCase()} · {p.year} {p.session} · Paper {p.paper}{p.variant ? ` Variant ${p.variant}` : ''}</p>
                        </div>

                        {p.file_url && (p.access_level === 'public' || !p.access_level) ? (
                            <a href={`${API_URL}${p.file_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm" data-testid="pp-download-btn">
                                <Download className="w-5 h-5" /> View {typeLabel}
                            </a>
                        ) : (
                            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-xl"><Lock className="w-5 h-5" /> Restricted</span>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-8 md:py-10">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main: Metadata */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Paper Details */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h2 className="font-bold text-primary text-base mb-4">Paper Details</h2>
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Curriculum</dt><dd className="font-medium text-primary capitalize">{p.curriculum}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Qualification</dt><dd className="font-medium text-primary uppercase">{p.qualification}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Subject</dt><dd className="font-medium text-primary capitalize">{p.subject}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Syllabus Code</dt><dd className="font-medium text-primary font-mono">{p.syllabus_code}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Year</dt><dd className="font-medium text-primary">{p.year}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Session</dt><dd className="font-medium text-primary">{p.session}</dd></div>
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Paper</dt><dd className="font-medium text-primary">{p.paper}</dd></div>
                                    {p.variant > 0 && <div><dt className="text-gray-400 text-xs mb-0.5">Variant</dt><dd className="font-medium text-primary">{p.variant}</dd></div>}
                                    <div><dt className="text-gray-400 text-xs mb-0.5">Type</dt><dd className="font-medium text-primary">{typeLabel}</dd></div>
                                </dl>
                            </div>

                            {/* Related: QP ↔ MS ↔ ER */}
                            {related.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-100 p-6">
                                    <h2 className="font-bold text-primary text-base mb-4">Related Resources — {p.year} {p.session} Paper {p.paper}</h2>
                                    <div className="space-y-2">
                                        {related.map(r => {
                                            const rl = TYPE_LABELS[r.resource_type] || r.resource_type;
                                            const rc = TYPE_COLORS[r.resource_type] || 'bg-gray-50 text-gray-700';
                                            return (
                                                <Link key={r.id} to={paperUrl(r)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rc}`}><FileText className="w-4 h-4" /></div>
                                                    <div className="flex-1"><p className="text-sm font-medium text-primary">{rl}</p></div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Other papers same year */}
                            {otherPapers.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-100 p-5">
                                    <h3 className="font-bold text-primary text-sm mb-3">More from {p.year}</h3>
                                    <div className="space-y-1.5">
                                        {otherPapers.slice(0, 8).map(o => (
                                            <Link key={o.id} to={paperUrl(o)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-xs transition-colors">
                                                <FileCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-600 truncate">{o.session} P{o.paper} — {TYPE_LABELS[o.resource_type] || o.resource_type}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Collection link */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5">
                                <h3 className="font-bold text-primary text-sm mb-3">Explore More</h3>
                                <div className="space-y-2">
                                    <Link to={collectionUrl} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-accent font-medium transition-colors">
                                        <FileText className="w-4 h-4" /> All {p.subject?.replace(/\b\w/g, c => c.toUpperCase())} {p.syllabus_code} Papers
                                    </Link>
                                    <Link to="/exam/past-papers" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                                        <FileCheck className="w-4 h-4 text-gray-400" /> Browse All Past Papers
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
