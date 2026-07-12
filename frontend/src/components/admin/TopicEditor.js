import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search, Filter, ChevronDown, ChevronRight, ArrowLeft, Save, Eye, EyeOff,
    BookOpen, FileText, Beaker, Calculator, Lightbulb, AlertTriangle, CheckCircle,
    List, Hash, Clock, BarChart3, Globe, Upload
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import LearningAssetManager from './LearningAssetManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ─── Collapsible Section ──────────────────────────────
function Section({ title, icon: Icon, color, children, defaultOpen = false, count }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden" data-testid={`section-${title.toLowerCase().replace(/\s/g, '-')}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-primary text-sm">{title}</span>
                    {count !== undefined && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 pb-5 pt-3 border-t border-gray-50 bg-gray-50/30">{children}</div>}
        </div>
    );
}

// ─── Dynamic List Editor ──────────────────────────────
function ListEditor({ items, onChange, fields, addLabel }) {
    const addItem = () => {
        const empty = {};
        fields.forEach(f => { empty[f.key] = ''; });
        onChange([...items, empty]);
    };
    const updateItem = (idx, key, val) => {
        const updated = items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
        onChange(updated);
    };
    const removeItem = (idx) => {
        onChange(items.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                        <button onClick={() => removeItem(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    </div>
                    {fields.map(f => (
                        <div key={f.key}>
                            <Label className="text-xs text-gray-500">{f.label}</Label>
                            {f.type === 'textarea' ? (
                                <Textarea
                                    value={item[f.key] || ''}
                                    onChange={e => updateItem(idx, f.key, e.target.value)}
                                    rows={f.rows || 3}
                                    className="mt-1 text-sm"
                                    placeholder={f.placeholder || ''}
                                />
                            ) : (
                                <Input
                                    value={item[f.key] || ''}
                                    onChange={e => updateItem(idx, f.key, e.target.value)}
                                    className="mt-1 text-sm"
                                    placeholder={f.placeholder || ''}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ))}
            <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-accent hover:text-accent transition-colors">
                + {addLabel}
            </button>
        </div>
    );
}

// ─── String List Editor (simple) ──────────────────────
function StringListEditor({ items, onChange, placeholder }) {
    const value = (items || []).join('\n');
    return (
        <Textarea
            value={value}
            onChange={e => onChange(e.target.value.split('\n').filter(Boolean))}
            rows={4}
            className="text-sm font-mono"
            placeholder={placeholder || 'One item per line'}
        />
    );
}

// ─── Topic List View ──────────────────────────────────
function TopicList({ onSelect }) {
    const [topics, setTopics] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ board: '', subject: '', status: '', q: '' });
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 30;

    const fetchTopics = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.board) params.set('board', filters.board);
            if (filters.subject) params.set('subject', filters.subject);
            if (filters.status) params.set('status', filters.status);
            if (filters.q) params.set('q', filters.q);
            params.set('page', page);
            params.set('limit', limit);
            const res = await axios.get(`${API_URL}/api/curriculum/admin/topics?${params}`, { withCredentials: true });
            setTopics(res.data.topics);
            setTotal(res.data.total);
        } catch (err) {
            toast.error('Failed to load topics');
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/curriculum/admin/topics-stats`, { withCredentials: true });
            setStats(res.data);
        } catch {}
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    const togglePublish = async (e, topic) => {
        e.stopPropagation();
        try {
            const res = await axios.put(`${API_URL}/api/curriculum/admin/topics/${topic.id}/publish`, {}, { withCredentials: true });
            toast.success(res.data.message);
            fetchTopics();
            fetchStats();
        } catch (err) {
            toast.error('Failed to update');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div data-testid="topic-list-view">
            {/* Stats Bar */}
            {stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-primary">{stats.total}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Topics</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                        <p className="text-xs text-gray-500 mt-1">Published</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
                        <p className="text-xs text-gray-500 mt-1">Drafts</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={filters.q}
                        onChange={e => { setFilters(p => ({ ...p, q: e.target.value })); setPage(1); }}
                        placeholder="Search topics..."
                        className="pl-9"
                        data-testid="topic-search-input"
                    />
                </div>
                <select
                    value={filters.board}
                    onChange={e => { setFilters(p => ({ ...p, board: e.target.value })); setPage(1); }}
                    className="h-10 px-3 border rounded-md text-sm bg-white"
                    data-testid="topic-filter-board"
                >
                    <option value="">All Boards</option>
                    <option value="igcse">Cambridge IGCSE</option>
                    <option value="as-level">AS Level</option>
                    <option value="a-level">A Level</option>
                </select>
                <select
                    value={filters.subject}
                    onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setPage(1); }}
                    className="h-10 px-3 border rounded-md text-sm bg-white"
                    data-testid="topic-filter-subject"
                >
                    <option value="">All Subjects</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                </select>
                <select
                    value={filters.status}
                    onChange={e => { setFilters(p => ({ ...p, status: e.target.value })); setPage(1); }}
                    className="h-10 px-3 border rounded-md text-sm bg-white"
                    data-testid="topic-filter-status"
                >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            {/* Topic Table */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : (
                <>
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Board</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Subject</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Chapter</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topics.map(topic => (
                                    <tr
                                        key={topic.id}
                                        className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
                                        onClick={() => onSelect(topic)}
                                        data-testid={`topic-row-${topic.slug}`}
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-primary text-sm">{topic.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{topic.difficulty} · {topic.study_time}</p>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell capitalize">{topic.board_slug?.replace('-', ' ')}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell capitalize">{topic.subject_slug}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">{topic.chapter_title}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                                topic.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {topic.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={e => togglePublish(e, topic)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    topic.status === 'published' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                                title={topic.status === 'published' ? 'Unpublish' : 'Publish'}
                                                data-testid={`toggle-publish-${topic.slug}`}
                                            >
                                                {topic.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-500">Showing {((page-1)*limit)+1}-{Math.min(page*limit, total)} of {total}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p-1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {topics.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                            <p>No topics found matching your filters.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Topic Editor Form ────────────────────────────────
function TopicForm({ topicSummary, onBack }) {
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [studyTime, setStudyTime] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [introduction, setIntroduction] = useState('');
    const [sections, setSections] = useState([]);
    const [definitions, setDefinitions] = useState([]);
    const [formulas, setFormulas] = useState([]);
    const [workedExamples, setWorkedExamples] = useState([]);
    const [commonMistakes, setCommonMistakes] = useState([]);
    const [examinerTips, setExaminerTips] = useState([]);
    const [summary, setSummary] = useState([]);

    useEffect(() => {
        fetchTopic();
    }, [topicSummary.id]); // eslint-disable-line

    const fetchTopic = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/curriculum/admin/topics/${topicSummary.id}`, { withCredentials: true });
            const t = res.data;
            setTopic(t);
            setTitle(t.title || '');
            setSeoTitle(t.seo_title || '');
            setSeoDescription(t.seo_description || '');
            setStudyTime(t.study_time || '');
            setDifficulty(t.difficulty || 'medium');
            const c = t.content || {};
            setIntroduction(c.introduction || '');
            setSections(c.sections || []);
            setDefinitions(c.definitions || []);
            setFormulas(c.formulas || []);
            setWorkedExamples(c.worked_examples || []);
            setCommonMistakes(c.common_mistakes || []);
            setExaminerTips(c.examiner_tips || []);
            setSummary(c.summary || []);
        } catch (err) {
            toast.error('Failed to load topic');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publish = null) => {
        setSaving(true);
        try {
            const content = {
                introduction,
                sections,
                definitions,
                formulas,
                worked_examples: workedExamples,
                common_mistakes: commonMistakes,
                examiner_tips: examinerTips,
                summary,
            };
            const payload = {
                title,
                seo_title: seoTitle,
                seo_description: seoDescription,
                study_time: studyTime,
                difficulty,
                content,
            };
            if (publish !== null) {
                payload.status = publish ? 'published' : 'draft';
            }
            await axios.put(`${API_URL}/api/curriculum/admin/topics/${topicSummary.id}`, payload, { withCredentials: true });
            toast.success(publish ? 'Topic saved & published' : 'Topic saved');
        } catch (err) {
            toast.error('Failed to save topic');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="spinner"></div></div>;
    }

    return (
        <div data-testid="topic-editor-form">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" data-testid="editor-back-btn">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h3 className="font-bold text-primary text-lg">{title || 'Untitled Topic'}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {topic?.board_title} / {topic?.subject_title} / {topic?.chapter_title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        topic?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {topic?.status}
                    </span>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        data-testid="save-draft-btn"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
                        data-testid="save-publish-btn"
                    >
                        <Eye className="w-4 h-4" /> Save & Publish
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Meta */}
                <Section title="Topic Meta" icon={Globe} color="bg-blue-50 text-blue-600" defaultOpen={true}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm">Topic Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" data-testid="topic-title-input" />
                            </div>
                            <div>
                                <Label className="text-sm">SEO Title</Label>
                                <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="mt-1" data-testid="topic-seo-title-input" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm">Meta Description</Label>
                            <Textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} className="mt-1" data-testid="topic-meta-desc-input" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm">Study Time</Label>
                                <Input value={studyTime} onChange={e => setStudyTime(e.target.value)} className="mt-1" placeholder="e.g. 20 min" />
                            </div>
                            <div>
                                <Label className="text-sm">Difficulty</Label>
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mt-1 w-full h-10 px-3 border rounded-md text-sm">
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Main Content */}
                <Section title="Main Content" icon={FileText} color="bg-slate-100 text-slate-600" defaultOpen={true}>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm">Introduction</Label>
                            <Textarea
                                value={introduction}
                                onChange={e => setIntroduction(e.target.value)}
                                rows={4}
                                className="mt-1"
                                placeholder="Write the topic introduction..."
                                data-testid="topic-intro-input"
                            />
                        </div>
                        <div>
                            <Label className="text-sm mb-2 block">Content Sections</Label>
                            <ListEditor
                                items={sections}
                                onChange={setSections}
                                addLabel="Add Section"
                                fields={[
                                    { key: 'title', label: 'Section Title', type: 'input', placeholder: 'e.g. How It Works' },
                                    { key: 'content', label: 'Content', type: 'textarea', rows: 5, placeholder: 'Write section content...\nUse new lines for paragraphs.' },
                                ]}
                            />
                        </div>
                    </div>
                </Section>

                {/* Definitions */}
                <Section title="Definitions" icon={BookOpen} color="bg-blue-50 text-blue-600" count={definitions.length}>
                    <ListEditor
                        items={definitions}
                        onChange={setDefinitions}
                        addLabel="Add Definition"
                        fields={[
                            { key: 'term', label: 'Term', type: 'input', placeholder: 'e.g. Isotope' },
                            { key: 'definition', label: 'Definition', type: 'textarea', rows: 2, placeholder: 'The definition...' },
                        ]}
                    />
                </Section>

                {/* Formulas */}
                <Section title="Formulas" icon={Calculator} color="bg-purple-50 text-purple-600" count={formulas.length}>
                    <ListEditor
                        items={formulas}
                        onChange={setFormulas}
                        addLabel="Add Formula"
                        fields={[
                            { key: 'name', label: 'Name', type: 'input', placeholder: 'e.g. Ohm\'s Law' },
                            { key: 'formula', label: 'Formula', type: 'input', placeholder: 'e.g. V = IR' },
                            { key: 'description', label: 'Description', type: 'input', placeholder: 'What each symbol means' },
                        ]}
                    />
                </Section>

                {/* Worked Examples */}
                <Section title="Worked Examples" icon={Lightbulb} color="bg-green-50 text-green-600" count={workedExamples.length}>
                    <ListEditor
                        items={workedExamples}
                        onChange={setWorkedExamples}
                        addLabel="Add Worked Example"
                        fields={[
                            { key: 'question', label: 'Question', type: 'textarea', rows: 2, placeholder: 'The exam-style question...' },
                            { key: 'solution', label: 'Solution', type: 'textarea', rows: 4, placeholder: 'Step-by-step solution...' },
                        ]}
                    />
                </Section>

                {/* Examiner Tips */}
                <Section title="Examiner Tips" icon={CheckCircle} color="bg-indigo-50 text-indigo-600" count={examinerTips.length}>
                    <StringListEditor
                        items={examinerTips}
                        onChange={setExaminerTips}
                        placeholder="One tip per line&#10;e.g. Always show your working&#10;Label diagrams clearly"
                    />
                </Section>

                {/* Common Mistakes */}
                <Section title="Common Mistakes" icon={AlertTriangle} color="bg-amber-50 text-amber-600" count={commonMistakes.length}>
                    <StringListEditor
                        items={commonMistakes}
                        onChange={setCommonMistakes}
                        placeholder="One mistake per line&#10;e.g. Confusing mass with weight&#10;Forgetting units"
                    />
                </Section>

                {/* Summary */}
                <Section title="Summary" icon={List} color="bg-gray-100 text-gray-600" count={summary.length}>
                    <StringListEditor
                        items={summary}
                        onChange={setSummary}
                        placeholder="One summary point per line&#10;e.g. Key point 1&#10;Key point 2"
                    />
                </Section>

                {/* Learning Assets (Upload PDFs, Images, etc.) */}
                <Section title="Learning Assets" icon={Upload} color="bg-teal-50 text-teal-600" defaultOpen={true}>
                    <p className="text-xs text-gray-400 mb-3">Upload PDFs, images, worksheets, videos, or embed YouTube links for this topic.</p>
                    <LearningAssetManager parentType="topic" parentId={topicSummary.id} section="general" />
                </Section>
            </div>

            {/* Bottom Save Bar */}
            <div className="sticky bottom-0 mt-6 py-4 px-5 bg-white border-t border-gray-100 rounded-xl flex items-center justify-between -mx-1">
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        data-testid="bottom-save-draft"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
                        data-testid="bottom-save-publish"
                    >
                        {saving ? 'Saving...' : 'Save & Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────
export default function TopicEditor() {
    const [selectedTopic, setSelectedTopic] = useState(null);

    if (selectedTopic) {
        return <TopicForm topicSummary={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }
    return <TopicList onSelect={setSelectedTopic} />;
}
