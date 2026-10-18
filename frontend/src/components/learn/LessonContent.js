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

const filled = v => (Array.isArray(v) ? v.length > 0 : !!v);
export const hasContent = c => !!c && Object.values(c).some(filled);

const Box = ({ tone, label, children, testid }) => (
    <div className={`p-4 rounded-xl border mb-4 ${tone}`} data-testid={testid}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">{label}</p>
        {children}
    </div>
);

export function Definitions({ items }) {
    if (!filled(items)) return null;
    return (
        <Box tone="bg-blue-50/50 border-blue-100 text-blue-700" label="Key definitions" testid="lesson-definitions">
            {items.map((d, i) => (
                <div key={i} className="mb-2 last:mb-0 text-slate-700">
                    <strong className="text-primary">{d.term}:</strong>{' '}
                    {typeof d.definition === 'string' ? <span className="text-sm">{d.definition}</span> : <RichContent content={d.definition} />}
                </div>
            ))}
        </Box>
    );
}

export function Formulas({ items }) {
    if (!filled(items)) return null;
    return (
        <Box tone="bg-violet-50/50 border-violet-100 text-violet-700" label="Formulas" testid="lesson-formulas">
            {items.map((f, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-3 mb-2">
                    <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border text-violet-700">{f.formula}</code>
                    <span className="text-sm text-slate-600">{f.name}{f.description ? `: ${f.description}` : ''}</span>
                </div>
            ))}
        </Box>
    );
}

export function WorkedExamples({ items }) {
    if (!filled(items)) return null;
    return (
        <Box tone="bg-green-50/50 border-green-100 text-green-700" label="Worked examples" testid="lesson-worked-examples">
            {items.map((w, i) => (
                <div key={i} className="mb-4 last:mb-0">
                    <p className="text-sm font-medium text-primary mb-1">Q: {w.question}</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">A: {w.solution}</p>
                </div>
            ))}
        </Box>
    );
}

export function TipsAndMistakes({ tips, mistakes }) {
    if (!filled(tips) && !filled(mistakes)) return null;
    return (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {filled(tips) && (
                <Box tone="bg-accent/5 border-accent/10 text-accent" label="Examiner tips" testid="lesson-examiner-tips">
                    <ul className="space-y-1">{tips.map((t, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><Lightbulb className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />{t}</li>)}</ul>
                </Box>
            )}
            {filled(mistakes) && (
                <Box tone="bg-amber-50/50 border-amber-100 text-amber-700" label="Common mistakes" testid="lesson-common-mistakes">
                    <ul className="space-y-1">{mistakes.map((m, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />{m}</li>)}</ul>
                </Box>
            )}
        </div>
    );
}

export function Summary({ items }) {
    if (!filled(items)) return null;
    return (
        <Box tone="bg-slate-50 border-slate-100 text-slate-500" label="Summary" testid="lesson-summary">
            <ul className="space-y-1">{items.map((s, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
        </Box>
    );
}

export function Section({ section }) {
    return (
        <div className="mb-6 last:mb-0">
            {section.title && <h4 className="text-base font-bold text-primary mb-2">{section.title}</h4>}
            <RichContent content={section.content} />
        </div>
    );
}
