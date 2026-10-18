import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function RichContent({ content }) {
    if (!content) return null;
    if (typeof content === 'string') {
        return <p className="text-slate-700 leading-[1.75] whitespace-pre-wrap text-[15px]">{content}</p>;
    }
    if (Array.isArray(content)) {
        return (
            <div className="space-y-3">
                {content.map((block, i) => {
                    if (block.type === 'text') {
                        return <p key={i} className="text-slate-700 leading-[1.75] whitespace-pre-wrap text-[15px]">{block.value}</p>;
                    }
                    if (block.type === 'image') {
                        return (
                            <figure key={i} className="my-3">
                                <img src={block.url?.startsWith('/') ? `${API_URL}${block.url}` : block.url} alt={block.caption || ''} className="max-w-full rounded-lg border" />
                                {block.caption && <figcaption className="text-xs text-slate-500 mt-1 text-center">{block.caption}</figcaption>}
                            </figure>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }
    return null;
}

const hasContent = c => !!c && Object.values(c).some(v => (Array.isArray(v) ? v.length > 0 : !!v));

export function LessonContent({ topic }) {
    const c = topic.content || {};
    if (!hasContent(c)) {
        return <p className="text-sm text-slate-500" data-testid="lesson-content-empty">Notes for this lesson are still being written. You can practise questions or ask the AI Mentor about this topic in the meantime.</p>;
    }
    return (
        <div data-testid={`lesson-content-${topic.slug}`}>
            {c.introduction && <div className="mb-6"><RichContent content={c.introduction} /></div>}
            {c.sections?.map((s, i) => (
                <div key={i} className="mb-7">
                    <h3 className="text-base font-bold text-primary mb-2">{s.title}</h3>
                    <RichContent content={s.content} />
                </div>
            ))}
            {c.definitions?.length > 0 && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-5">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Key Definitions</p>
                    {c.definitions.map((d, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                            <strong className="text-primary">{d.term}:</strong>{' '}
                            {typeof d.definition === 'string' ? <span className="text-sm text-slate-700">{d.definition}</span> : <RichContent content={d.definition} />}
                        </div>
                    ))}
                </div>
            )}
            {c.formulas?.length > 0 && (
                <div className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl mb-5">
                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-3">Formulas</p>
                    {c.formulas.map((f, i) => (
                        <div key={i} className="flex items-baseline gap-3 mb-2">
                            <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border text-violet-700">{f.formula}</code>
                            <span className="text-sm text-slate-600">{f.name} — {f.description}</span>
                        </div>
                    ))}
                </div>
            )}
            {c.worked_examples?.length > 0 && (
                <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl mb-5">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">Worked Examples</p>
                    {c.worked_examples.map((w, i) => (
                        <div key={i} className="mb-4 last:mb-0">
                            <p className="text-sm font-medium text-primary mb-1">Q: {w.question}</p>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">A: {w.solution}</p>
                        </div>
                    ))}
                </div>
            )}
            {(c.examiner_tips?.length > 0 || c.common_mistakes?.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    {c.examiner_tips?.length > 0 && (
                        <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl">
                            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Examiner Tips</p>
                            <ul className="space-y-1">{c.examiner_tips.map((t, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><Lightbulb className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />{t}</li>)}</ul>
                        </div>
                    )}
                    {c.common_mistakes?.length > 0 && (
                        <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Common Mistakes</p>
                            <ul className="space-y-1">{c.common_mistakes.map((m, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />{m}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
            {c.summary?.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Summary</p>
                    <ul className="space-y-1">{c.summary.map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                </div>
            )}
        </div>
    );
}
