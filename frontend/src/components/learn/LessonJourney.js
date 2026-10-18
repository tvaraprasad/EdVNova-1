import { useState } from 'react';
import { CheckCircle2, Circle, Compass, BookOpen, Telescope, PenLine, RotateCcw, PlayCircle, Paperclip, Loader2 } from 'lucide-react';
import { RichContent, Definitions, Formulas, WorkedExamples, TipsAndMistakes, Summary, Section } from './LessonContent';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const STAGES = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'understand', label: 'Understand', icon: BookOpen },
    { id: 'explore', label: 'Explore', icon: Telescope },
    { id: 'practise', label: 'Practise', icon: PenLine },
    { id: 'review', label: 'Review', icon: RotateCcw },
];
const filled = v => (Array.isArray(v) ? v.length > 0 : !!v);

function SubtopicBlock({ sub, sections, done, canTrack, onComplete }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);
    const mark = async () => {
        setSaving(true); setError(false);
        try { await onComplete(sub.id); } catch { setError(true); } finally { setSaving(false); }
    };
    return (
        <div id={`sub-${sub.id}`} className="scroll-mt-40 border-t border-slate-100 pt-5 mt-5 first:border-0 first:pt-0 first:mt-0" data-testid={`subtopic-block-${sub.id}`}>
            <div className="flex items-center gap-2 mb-3">
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-label="Completed" /> : <Circle className="w-4 h-4 text-slate-300" aria-label="Not completed" />}
                <h3 className="text-[15px] font-semibold text-primary">{sub.title}</h3>
            </div>
            {sections.map((s, i) => <Section key={i} section={s} />)}
            {canTrack && !done && (
                <button onClick={mark} disabled={saving} className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-60" data-testid={`complete-subtopic-${sub.id}`}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Mark section complete
                </button>
            )}
            {error && <p className="text-xs text-red-600 mt-1" role="alert">Could not save. Please try again.</p>}
        </div>
    );
}

function SubtopicOutline({ subtopics, authored, done, onJump }) {
    const next = subtopics.find(s => authored.has(s.id) && !done.includes(s.id));
    return (
        <div className="mb-5" data-testid="subtopic-outline">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500">In this topic</p>
                {next && done.length > 0 && <button onClick={() => onJump(next.id)} className="text-xs text-accent font-semibold hover:underline" data-testid="resume-subtopic">Continue with: {next.title}</button>}
            </div>
            <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
                {subtopics.map((s, i) => {
                    const has = authored.has(s.id);
                    return (
                        <li key={s.id}>
                            <button disabled={!has} onClick={() => onJump(s.id)} className={`w-full text-left flex items-center gap-2 py-1 text-[13px] ${has ? 'text-slate-700 hover:text-accent' : 'text-slate-400 cursor-default'}`} data-testid={`subtopic-link-${s.id}`}>
                                {done.includes(s.id) ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <span className="w-3.5 text-[10px] text-slate-400 tabular-nums flex-shrink-0">{i + 1}</span>}
                                <span className="truncate">{s.title}</span>
                                {!has && <span className="text-[10px] text-slate-400 flex-shrink-0">not written yet</span>}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

export function LessonJourney({ topic, subtopics = [], subtopicsDone = [], canTrack, onSubtopic, attachments = [], videoCount = 0, questionCount = 0, onOpenTab }) {
    const c = topic.content || {};
    const sections = c.sections || [];
    const authored = new Set(sections.map(s => s.subtopic_id).filter(Boolean));
    const general = sections.filter(s => !s.subtopic_id || !subtopics.some(st => st.id === s.subtopic_id));
    const explore = attachments.length > 0 || videoCount > 0;
    const available = {
        discover: filled(c.introduction),
        understand: sections.length > 0 || filled(c.definitions) || filled(c.formulas),
        explore,
        practise: filled(c.worked_examples) || questionCount > 0,
        review: filled(c.summary) || filled(c.examiner_tips) || filled(c.common_mistakes),
    };
    const stages = STAGES.filter(s => available[s.id]);
    const jump = id => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

    return (
        <div data-testid="lesson-journey">
            {stages.length > 1 && (
                <nav className="sticky top-[150px] md:top-[157px] z-10 -mx-1 mb-5 flex gap-1 overflow-x-auto bg-background border-b border-slate-100 py-2 px-1" aria-label="Learning stages" data-testid="journey-nav">
                    {stages.map(s => (
                        <button key={s.id} onClick={() => jump(`stage-${s.id}`)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-accent hover:border-accent/40 transition-colors whitespace-nowrap" data-testid={`journey-${s.id}`}>
                            <s.icon className="w-3.5 h-3.5" />{s.label}
                        </button>
                    ))}
                </nav>
            )}

            {available.discover && (
                <section id="stage-discover" className="scroll-mt-48 ev-card p-5 md:p-6 mb-4 border-l-[3px] border-l-accent" data-testid="stage-discover">
                    <p className="ev-eyebrow mb-2">Discover</p>
                    <RichContent content={c.introduction} />
                </section>
            )}

            {available.understand && (
                <section id="stage-understand" className="scroll-mt-48 ev-card p-5 md:p-7 mb-4" data-testid="stage-understand">
                    <p className="ev-eyebrow mb-3">Understand</p>
                    {subtopics.length > 0 && <SubtopicOutline subtopics={subtopics} authored={authored} done={subtopicsDone} onJump={id => jump(`sub-${id}`)} />}
                    {general.map((s, i) => <Section key={i} section={s} />)}
                    {subtopics.filter(st => authored.has(st.id)).map(st => (
                        <SubtopicBlock key={st.id} sub={st} sections={sections.filter(s => s.subtopic_id === st.id)} done={subtopicsDone.includes(st.id)} canTrack={canTrack} onComplete={onSubtopic} />
                    ))}
                    <div className="mt-5"><Definitions items={c.definitions} /><Formulas items={c.formulas} /></div>
                </section>
            )}

            {available.explore && (
                <section id="stage-explore" className="scroll-mt-48 ev-card p-5 md:p-6 mb-4" data-testid="stage-explore">
                    <p className="ev-eyebrow mb-3">Explore</p>
                    <div className="flex flex-wrap gap-2">
                        {videoCount > 0 && (
                            <button onClick={() => onOpenTab('videos')} className="btn-secondary !py-2 !px-3.5 text-sm inline-flex items-center gap-2" data-testid="explore-videos-btn"><PlayCircle className="w-4 h-4 text-accent" /> Chapter videos ({videoCount})</button>
                        )}
                        {attachments.map(a => (
                            <a key={a.id || a.title} href={a.file_url?.startsWith('/') ? `${API_URL}${a.file_url}` : a.file_url || a.url} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-2 !px-3.5 text-sm inline-flex items-center gap-2" data-testid={`explore-asset-${a.id}`}>
                                <Paperclip className="w-4 h-4 text-accent" /> {a.title}
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {available.practise && (
                <section id="stage-practise" className="scroll-mt-48 ev-card p-5 md:p-6 mb-4" data-testid="stage-practise">
                    <p className="ev-eyebrow mb-3">Practise</p>
                    <WorkedExamples items={c.worked_examples} />
                    {questionCount > 0 && (
                        <button onClick={() => onOpenTab('workbook')} className="btn-secondary !py-2 !px-3.5 text-sm inline-flex items-center gap-2" data-testid="practise-workbook-btn"><PenLine className="w-4 h-4 text-accent" /> Workbook questions ({questionCount})</button>
                    )}
                </section>
            )}

            {available.review && (
                <section id="stage-review" className="scroll-mt-48 ev-card p-5 md:p-6 mb-4" data-testid="stage-review">
                    <p className="ev-eyebrow mb-3">Review</p>
                    <Summary items={c.summary} />
                    <TipsAndMistakes tips={c.examiner_tips} mistakes={c.common_mistakes} />
                </section>
            )}

            <p className="text-xs text-slate-500 mb-2" data-testid="mastery-note">A mastery check for this topic is not available yet. Finishing the lesson records completion, not mastery.</p>
        </div>
    );
}
