import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Globe, ChevronDown, Save, Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function FieldEditor({ label, value, onChange, type = 'input', rows = 2 }) {
    if (type === 'textarea') {
        return (
            <div>
                <Label className="text-xs text-gray-500">{label}</Label>
                <Textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} className="mt-1 text-sm" />
            </div>
        );
    }
    return (
        <div>
            <Label className="text-xs text-gray-500">{label}</Label>
            <Input value={value || ''} onChange={e => onChange(e.target.value)} className="mt-1 text-sm" />
        </div>
    );
}

function SectionEditor({ page, section, content, onSave }) {
    const [data, setData] = useState(content || {});
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => { setData(content || {}); }, [content]);

    const handleSave = async () => {
        setSaving(true);
        await onSave(page, section, data);
        setSaving(false);
    };

    const setField = (key, val) => setData(prev => ({ ...prev, [key]: val }));

    const setNestedField = (arrKey, idx, field, val) => {
        setData(prev => {
            const arr = [...(prev[arrKey] || [])];
            arr[idx] = { ...arr[idx], [field]: val };
            return { ...prev, [arrKey]: arr };
        });
    };

    const addToArray = (arrKey, template) => {
        setData(prev => ({ ...prev, [arrKey]: [...(prev[arrKey] || []), template] }));
    };

    const removeFromArray = (arrKey, idx) => {
        setData(prev => ({ ...prev, [arrKey]: (prev[arrKey] || []).filter((_, i) => i !== idx) }));
    };

    const renderFields = () => {
        // Render CTA objects
        const renderCta = (key, label) => {
            const cta = data[key] || {};
            return (
                <div className="grid grid-cols-2 gap-2" key={key}>
                    <div><Label className="text-xs text-gray-500">{label} Text</Label><Input value={cta.text || ''} onChange={e => setField(key, {...cta, text: e.target.value})} className="mt-1 text-sm" /></div>
                    <div><Label className="text-xs text-gray-500">{label} Link</Label><Input value={cta.link || ''} onChange={e => setField(key, {...cta, link: e.target.value})} className="mt-1 text-sm" /></div>
                </div>
            );
        };

        // Simple field renderer for known keys
        const fields = [];
        for (const [key, val] of Object.entries(data)) {
            if (typeof val === 'string') {
                const isLong = val.length > 100;
                fields.push(<FieldEditor key={key} label={key.replace(/_/g, ' ')} value={val} onChange={v => setField(key, v)} type={isLong ? 'textarea' : 'input'} />);
            } else if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
                if (val.text !== undefined && val.link !== undefined) {
                    fields.push(renderCta(key, key.replace(/_/g, ' ')));
                } else {
                    // Generic nested object
                    fields.push(
                        <div key={key} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <Label className="text-xs font-semibold text-gray-500">{key.replace(/_/g, ' ')}</Label>
                            {Object.entries(val).map(([k2, v2]) => (
                                <FieldEditor key={k2} label={k2} value={typeof v2 === 'string' ? v2 : JSON.stringify(v2)} onChange={v => setField(key, {...val, [k2]: v})} />
                            ))}
                        </div>
                    );
                }
            } else if (Array.isArray(val)) {
                fields.push(
                    <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-gray-500">{key.replace(/_/g, ' ')} ({val.length})</Label>
                            <button onClick={() => {
                                const template = val.length > 0 ? Object.fromEntries(Object.keys(val[0]).map(k => [k, ''])) : { value: '' };
                                addToArray(key, template);
                            }} className="text-xs text-accent hover:underline">+ Add</button>
                        </div>
                        {val.map((item, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2 relative">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                                    <button onClick={() => removeFromArray(key, idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                </div>
                                {typeof item === 'string' ? (
                                    <Input value={item} onChange={e => {
                                        const arr = [...val]; arr[idx] = e.target.value; setField(key, arr);
                                    }} className="text-sm" />
                                ) : typeof item === 'object' ? (
                                    Object.entries(item).map(([k2, v2]) => (
                                        <FieldEditor key={k2} label={k2} value={typeof v2 === 'string' || typeof v2 === 'number' ? String(v2) : JSON.stringify(v2)} onChange={v => setNestedField(key, idx, k2, v)} type={String(v2).length > 80 ? 'textarea' : 'input'} />
                                    ))
                                ) : null}
                            </div>
                        ))}
                    </div>
                );
            }
        }
        return fields;
    };

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white" data-testid={`cms-section-${page}-${section}`}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                        <span className="font-medium text-primary text-sm capitalize">{section.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-400 ml-2">{page}</span>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-5 pb-5 pt-3 border-t border-gray-50 space-y-3">
                    {renderFields()}
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50" data-testid={`save-${page}-${section}`}>
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WebsiteContentEditor() {
    const [pages, setPages] = useState([]);
    const [activePage, setActivePage] = useState('home');
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPages = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cms/admin/pages`, { withCredentials: true });
            setPages(res.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchSections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/cms/admin/page/${activePage}`, { withCredentials: true });
            setSections(res.data);
        } catch (e) { toast.error('Failed to load content'); }
        finally { setLoading(false); }
    }, [activePage]);

    useEffect(() => { fetchPages(); }, [fetchPages]);
    useEffect(() => { fetchSections(); }, [fetchSections]);

    const handleSave = async (page, section, content) => {
        try {
            await axios.put(`${API_URL}/api/cms/admin/${page}/${section}`, { content }, { withCredentials: true });
            toast.success(`${section} updated`);
        } catch (e) { toast.error('Failed to save'); }
    };

    return (
        <div data-testid="website-content-editor">
            {/* Page Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {pages.map(p => (
                    <button key={p.page} onClick={() => setActivePage(p.page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activePage === p.page ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:bg-gray-100'}`}
                        data-testid={`cms-page-${p.page}`}
                    >
                        {p.page} <span className="text-xs text-gray-400 ml-1">({p.sections.length})</span>
                    </button>
                ))}
            </div>

            {/* Sections */}
            {loading ? (
                <div className="flex justify-center py-12"><div className="spinner"></div></div>
            ) : (
                <div className="space-y-3">
                    {sections.map(s => (
                        <SectionEditor key={s.id} page={s.page} section={s.section} content={s.content} onSave={handleSave} />
                    ))}
                    {sections.length === 0 && (
                        <div className="text-center py-12 text-gray-400">No content sections for this page yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
