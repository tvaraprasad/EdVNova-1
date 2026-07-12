import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, ChevronDown, ChevronRight, CheckSquare, Square, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import RichContentEditor from './RichContentEditor';
import LearningAssetManager from './LearningAssetManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Convert plain text to blocks for RichContentEditor
function textToBlocks(text) {
    if (!text) return [];
    if (Array.isArray(text)) return text; // Already blocks format
    return [{ type: 'text', value: text }];
}
function blocksToText(blocks) {
    if (!Array.isArray(blocks)) return blocks || '';
    // If all blocks are text, join them. Otherwise return blocks array.
    if (blocks.every(b => b.type === 'text')) {
        return blocks.map(b => b.value).join('\n\n');
    }
    return blocks; // Return as-is for rich content
}

function TopicInlineEditor({ topic, onSave, onPublishToggle }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [introBlocks, setIntroBlocks] = useState(textToBlocks(topic.content?.introduction));
    const [sections, setSections] = useState((topic.content?.sections || []).map(s => ({
        ...s, contentBlocks: textToBlocks(s.content)
    })));
    const [definitions, setDefinitions] = useState((topic.content?.definitions || []).map(d => ({
        ...d, defBlocks: textToBlocks(d.definition)
    })));
    const [formulas, setFormulas] = useState(topic.content?.formulas || []);
    const [workedExamples, setWorkedExamples] = useState((topic.content?.worked_examples || []).map(w => ({
        ...w, questionBlocks: textToBlocks(w.question), solutionBlocks: textToBlocks(w.solution)
    })));
    const [commonMistakes, setCommonMistakes] = useState(topic.content?.common_mistakes || []);
    const [examinerTips, setExaminerTips] = useState(topic.content?.examiner_tips || []);
    const [summary, setSummary] = useState(topic.content?.summary || []);

    const hasContent = introBlocks.length > 0 || sections.length > 0 || definitions.length > 0;

    const handleSave = async (publish = false) => {
        setSaving(true);
        const content = {
            introduction: blocksToText(introBlocks),
            sections: sections.map(s => ({ title: s.title, content: blocksToText(s.contentBlocks) })),
            definitions: definitions.map(d => ({ term: d.term, definition: blocksToText(d.defBlocks) })),
            formulas,
            worked_examples: workedExamples.map(w => ({ question: blocksToText(w.questionBlocks), solution: blocksToText(w.solutionBlocks) })),
            common_mistakes: commonMistakes,
            examiner_tips: examinerTips,
            summary,
        };
        await onSave(topic.id, content, publish);
        setSaving(false);
    };

    const addSection = () => setSections(p => [...p, { title: '', contentBlocks: [] }]);
    const addDefinition = () => setDefinitions(p => [...p, { term: '', defBlocks: [] }]);
    const addFormula = () => setFormulas(p => [...p, { name: '', formula: '', description: '' }]);
    const addExample = () => setWorkedExamples(p => [...p, { questionBlocks: [], solutionBlocks: [] }]);

    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${topic.status === 'published' ? 'border-green-200 bg-green-50/20' : 'border-gray-200'}`} data-testid={`chapter-topic-${topic.slug}`}>
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setOpen(!open)}>
                <button onClick={(e) => { e.stopPropagation(); onPublishToggle(topic.id); }} className={`flex-shrink-0 ${topic.status === 'published' ? 'text-green-600' : 'text-gray-300'}`}>
                    {topic.status === 'published' ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm truncate">{topic.title}</p>
                    <p className="text-[11px] text-gray-400">{topic.difficulty} · {topic.study_time} {hasContent ? '· Has content' : '· Empty'}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${topic.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{topic.status}</span>
                {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>

            {open && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4 bg-white">
                    {/* Introduction */}
                    <div>
                        <Label className="text-xs font-semibold text-gray-500">Introduction (text + images)</Label>
                        <RichContentEditor blocks={introBlocks} onChange={setIntroBlocks} placeholder="Topic introduction..." />
                        <LearningAssetManager parentType="topic" parentId={topic.id} section="introduction" />
                    </div>

                    {/* Content Sections */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-gray-500">Content Sections ({sections.length})</Label>
                            <button onClick={addSection} className="text-xs text-accent hover:underline">+ Add Section</button>
                        </div>
                        {sections.map((s, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input value={s.title} onChange={e => { const u = [...sections]; u[i] = {...u[i], title: e.target.value}; setSections(u); }} placeholder="Section title" className="text-sm flex-1" />
                                    <button onClick={() => setSections(p => p.filter((_, j) => j !== i))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                </div>
                                <RichContentEditor blocks={s.contentBlocks} onChange={blocks => { const u = [...sections]; u[i] = {...u[i], contentBlocks: blocks}; setSections(u); }} placeholder="Section content..." />
                                <LearningAssetManager parentType="topic" parentId={topic.id} section={`section-${i}`} />
                            </div>
                        ))}
                    </div>

                    {/* Definitions */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-gray-500">Definitions ({definitions.length})</Label>
                            <button onClick={addDefinition} className="text-xs text-accent hover:underline">+ Add</button>
                        </div>
                        {definitions.map((d, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Input value={d.term} onChange={e => { const u = [...definitions]; u[i] = {...u[i], term: e.target.value}; setDefinitions(u); }} placeholder="Term" className="text-sm w-1/3" />
                                    <button onClick={() => setDefinitions(p => p.filter((_, j) => j !== i))} className="text-xs text-red-400 ml-auto">Remove</button>
                                </div>
                                <RichContentEditor blocks={d.defBlocks} onChange={blocks => { const u = [...definitions]; u[i] = {...u[i], defBlocks: blocks}; setDefinitions(u); }} placeholder="Definition with optional images..." />
                            </div>
                        ))}
                    </div>

                    {/* Formulas */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-gray-500">Formulas ({formulas.length})</Label>
                            <button onClick={addFormula} className="text-xs text-accent hover:underline">+ Add</button>
                        </div>
                        {formulas.map((f, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input value={f.name} onChange={e => { const u = [...formulas]; u[i] = {...u[i], name: e.target.value}; setFormulas(u); }} placeholder="Name" className="text-sm w-1/4" />
                                <Input value={f.formula} onChange={e => { const u = [...formulas]; u[i] = {...u[i], formula: e.target.value}; setFormulas(u); }} placeholder="Formula" className="text-sm font-mono w-1/3" />
                                <Input value={f.description} onChange={e => { const u = [...formulas]; u[i] = {...u[i], description: e.target.value}; setFormulas(u); }} placeholder="Description" className="text-sm flex-1" />
                                <button onClick={() => setFormulas(p => p.filter((_, j) => j !== i))} className="text-xs text-red-400">×</button>
                            </div>
                        ))}
                        <LearningAssetManager parentType="topic" parentId={topic.id} section="formulas" />
                    </div>

                    {/* Worked Examples */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-semibold text-gray-500">Worked Examples ({workedExamples.length})</Label>
                            <button onClick={addExample} className="text-xs text-accent hover:underline">+ Add</button>
                        </div>
                        {workedExamples.map((w, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Example #{i + 1}</span>
                                    <button onClick={() => setWorkedExamples(p => p.filter((_, j) => j !== i))} className="text-xs text-red-400">Remove</button>
                                </div>
                                <Label className="text-[10px] text-gray-400">Question</Label>
                                <RichContentEditor blocks={w.questionBlocks} onChange={blocks => { const u = [...workedExamples]; u[i] = {...u[i], questionBlocks: blocks}; setWorkedExamples(u); }} placeholder="Question..." />
                                <Label className="text-[10px] text-gray-400">Solution</Label>
                                <RichContentEditor blocks={w.solutionBlocks} onChange={blocks => { const u = [...workedExamples]; u[i] = {...u[i], solutionBlocks: blocks}; setWorkedExamples(u); }} placeholder="Solution..." />
                            </div>
                        ))}
                        <LearningAssetManager parentType="topic" parentId={topic.id} section="worked-examples" />
                    </div>

                    {/* Examiner Tips + Common Mistakes + Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <Label className="text-xs font-semibold text-gray-500">Examiner Tips</Label>
                            <Textarea value={(examinerTips || []).join('\n')} onChange={e => setExaminerTips(e.target.value.split('\n').filter(Boolean))} rows={4} className="mt-1 text-xs" placeholder="One tip per line" />
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-gray-500">Common Mistakes</Label>
                            <Textarea value={(commonMistakes || []).join('\n')} onChange={e => setCommonMistakes(e.target.value.split('\n').filter(Boolean))} rows={4} className="mt-1 text-xs" placeholder="One mistake per line" />
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-gray-500">Summary</Label>
                            <Textarea value={(summary || []).join('\n')} onChange={e => setSummary(e.target.value.split('\n').filter(Boolean))} rows={4} className="mt-1 text-xs" placeholder="One point per line" />
                        </div>
                    </div>
                    <LearningAssetManager parentType="topic" parentId={topic.id} section="general" />

                    {/* Save Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        <button onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">{saving ? 'Saving...' : 'Save Draft'}</button>
                        <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50">Save & Publish</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ChapterNotesEditor({ onBack }) {
    const [board, setBoard] = useState('igcse');
    const [subject, setSubject] = useState('');
    const [chapter, setChapter] = useState('');
    const [chapters, setChapters] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchChapters = useCallback(async () => {
        if (!board || !subject) { setChapters([]); return; }
        try {
            const res = await axios.get(`${API_URL}/api/curriculum/admin/chapters?board=${board}&subject=${subject}`, { withCredentials: true });
            setChapters(res.data);
        } catch (e) { toast.error('Failed to load chapters'); }
    }, [board, subject]);

    const fetchTopics = useCallback(async () => {
        if (!chapter) { setTopics([]); return; }
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/curriculum/admin/chapter-topics?board=${board}&subject=${subject}&chapter=${chapter}`, { withCredentials: true });
            setTopics(res.data);
        } catch (e) { toast.error('Failed to load topics'); }
        finally { setLoading(false); }
    }, [board, subject, chapter]);

    useEffect(() => { fetchChapters(); }, [fetchChapters]);
    useEffect(() => { fetchTopics(); }, [fetchTopics]);

    const handleSaveTopic = async (topicId, content, publish) => {
        try {
            const payload = { content };
            if (publish) payload.status = 'published';
            await axios.put(`${API_URL}/api/curriculum/admin/topics/${topicId}`, payload, { withCredentials: true });
            toast.success(publish ? 'Saved & Published' : 'Saved as draft');
            setTopics(prev => prev.map(t => t.id === topicId ? { ...t, content, status: publish ? 'published' : t.status } : t));
        } catch (e) { toast.error('Failed to save'); }
    };

    const handlePublishToggle = async (topicId) => {
        try {
            const res = await axios.put(`${API_URL}/api/curriculum/admin/topics/${topicId}/publish`, {}, { withCredentials: true });
            toast.success(res.data.message);
            setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status: res.data.status } : t));
        } catch (e) { toast.error('Failed'); }
    };

    const handleBulkPublish = async () => {
        const draftIds = topics.filter(t => t.status === 'draft' && (t.content?.introduction || t.content?.sections?.length > 0)).map(t => t.id);
        if (!draftIds.length) { toast.info('No topics with content to publish'); return; }
        if (!window.confirm(`Publish ${draftIds.length} topics with content?`)) return;
        try {
            const res = await axios.put(`${API_URL}/api/curriculum/admin/topics/bulk-publish`, { topic_ids: draftIds }, { withCredentials: true });
            toast.success(res.data.message);
            fetchTopics();
        } catch (e) { toast.error('Failed'); }
    };

    const publishedCount = topics.filter(t => t.status === 'published').length;
    const withContent = topics.filter(t => t.content?.introduction || t.content?.sections?.length > 0).length;

    return (
        <div data-testid="chapter-notes-editor">
            <div className="flex items-center gap-3 mb-6">
                {onBack && <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>}
                <div>
                    <h3 className="text-lg font-bold text-primary">Chapter Notes Editor</h3>
                    <p className="text-xs text-gray-400">Select a chapter to edit all topics — with inline images and learning assets</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div>
                    <Label className="text-xs text-gray-500">Board</Label>
                    <select value={board} onChange={e => { setBoard(e.target.value); setChapter(''); }} className="mt-1 block h-10 px-3 border rounded-md text-sm bg-white" data-testid="notes-board-select">
                        <option value="igcse">IGCSE</option><option value="as-level">AS Level</option><option value="a-level">A Level</option>
                    </select>
                </div>
                <div>
                    <Label className="text-xs text-gray-500">Subject</Label>
                    <select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); }} className="mt-1 block h-10 px-3 border rounded-md text-sm bg-white" data-testid="notes-subject-select">
                        <option value="">Select Subject</option>
                        <option value="mathematics">Mathematics</option><option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs text-gray-500">Chapter</Label>
                    <select value={chapter} onChange={e => setChapter(e.target.value)} className="mt-1 block w-full h-10 px-3 border rounded-md text-sm bg-white" data-testid="notes-chapter-select">
                        <option value="">Select Chapter</option>
                        {chapters.map(ch => <option key={ch.slug} value={ch.slug}>{ch.name} ({ch.topic_count} topics)</option>)}
                    </select>
                </div>
            </div>

            {chapter && (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600"><strong>{topics.length}</strong> topics</span>
                            <span className="text-sm text-green-600"><strong>{publishedCount}</strong> published</span>
                            <span className="text-sm text-gray-400"><strong>{withContent}</strong> with content</span>
                        </div>
                        <button onClick={handleBulkPublish} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700" data-testid="bulk-publish-btn">
                            <Sparkles className="w-4 h-4" /> Bulk Publish All With Content
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="spinner"></div></div>
                    ) : (
                        <div className="space-y-2">
                            {topics.map(topic => <TopicInlineEditor key={topic.id} topic={topic} onSave={handleSaveTopic} onPublishToggle={handlePublishToggle} />)}
                        </div>
                    )}
                </>
            )}
            {!chapter && subject && chapters.length > 0 && <div className="text-center py-12 text-gray-400">Select a chapter above to start editing topics</div>}
            {!subject && <div className="text-center py-12 text-gray-400">Select a board and subject to get started</div>}
        </div>
    );
}
