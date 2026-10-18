import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ExternalLink, FileCheck, Loader2, PenLine, Sparkles, Award } from 'lucide-react';
import { hasContent } from './LessonContent';
import { LessonJourney } from './LessonJourney';

const STATUS_LABEL = { not_started: 'Not started', in_progress: 'In progress', completed: 'Completed' };

export function StatusPill({ status }) {
    const cls = status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : status === 'in_progress' ? 'bg-tint text-accent border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${cls}`} data-testid="lesson-status">
            {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}{STATUS_LABEL[status] || STATUS_LABEL.not_started}
        </span>
    );
}

function CompletionPanel({ status, isAuthenticated, onComplete, justCompleted, chapterDone, next, onGo }) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const finish = async () => {
        setSaving(true); setError('');
        try { await onComplete(); } catch { setError('Could not save your progress. Please try again.'); }
        finally { setSaving(false); }
    };

    if (!isAuthenticated) {
        return (
            <div className="ev-card p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid="lesson-signin-prompt">
                <p className="text-sm text-slate-600">Sign in to save your progress and pick up where you left off.</p>
                <Link to="/login" className="btn-primary !py-2.5 !px-5 text-sm text-center">Sign in</Link>
            </div>
        );
    }
    if (status === 'completed') {
        return (
            <div className="ev-card p-5 border-emerald-200 bg-emerald-50/40" data-testid="lesson-completed-panel">
                <div className="flex items-start gap-3" role="status" aria-live="polite">
                    <span className={`w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 ${justCompleted ? 'ev-check-pop' : ''}`}><CheckCircle2 className="w-5 h-5" /></span>
                    <div className="flex-1">
                        <p className="font-semibold text-primary text-sm">{justCompleted ? 'Lesson completed' : 'You have completed this lesson'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Completion is saved. Practise to check your understanding.</p>
                    </div>
                </div>
                {chapterDone && (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-navy text-white ev-fade-up" data-testid="chapter-milestone">
                        <Award className="w-5 h-5 text-[#7FB0FF]" />
                        <p className="text-sm font-medium">Chapter completed. Well done!</p>
                    </div>
                )}
                {next && (
                    <button onClick={() => onGo(next)} className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary !py-2.5 !px-5 text-sm" data-testid="continue-next-lesson">
                        Continue to next lesson <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
    return (
        <div className="ev-card p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" data-testid="lesson-finish-panel">
            <div>
                <p className="text-sm font-semibold text-primary">Finished reading?</p>
                <p className="text-xs text-slate-500 mt-0.5">Mark this lesson complete when you have worked through it.</p>
                {error && <p className="text-xs text-red-600 mt-1" role="alert" data-testid="lesson-finish-error">{error}</p>}
            </div>
            <button onClick={finish} disabled={saving} className="btn-primary !py-2.5 !px-5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60" data-testid="finish-lesson-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Finish lesson
            </button>
        </div>
    );
}

function LearningLinks({ board, subject, topic }) {
    const mentor = `/dashboard?tab=mentor&board=${board}&subject=${subject}&topic=${encodeURIComponent(topic.title)}`;
    const links = [
        { to: '/practice', icon: PenLine, label: 'Practise questions', id: 'practice' },
        { to: '/past-papers', icon: FileCheck, label: 'Past papers', id: 'past-papers' },
        { to: mentor, icon: Sparkles, label: 'Ask AI Mentor', id: 'ai-mentor' },
    ];
    return (
        <div className="grid sm:grid-cols-3 gap-2" data-testid="lesson-learning-links">
            {links.map(l => (
                <Link key={l.id} to={l.to} className="group ev-card ev-card-link flex items-center gap-2.5 px-3.5 py-3 text-sm font-medium text-slate-700" data-testid={`lesson-link-${l.id}`}>
                    <span className="ev-icon-tile !w-8 !h-8"><l.icon className="w-4 h-4" /></span>{l.label}
                </Link>
            ))}
        </div>
    );
}

export function LessonView({ topic, status, position, prev, next, onGo, onVisit, onComplete, isAuthenticated, justCompleted, chapterDone, board, subject, chapter, journey }) {
    useEffect(() => { if (isAuthenticated) onVisit(topic.slug); }, [topic.slug, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <article className="ev-fade-up" key={topic.slug} data-testid="lesson-view">
            <header className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-slate-500">
                    {topic.syllabus_ref && <span className="font-semibold text-slate-600 tabular-nums" data-testid="lesson-syllabus-ref">{topic.syllabus_ref}</span>}
                    <span className="font-semibold text-accent uppercase tracking-[0.14em] text-[11px]">Lesson {position.index} of {position.total}</span>
                    <span aria-hidden="true">·</span><span>Reading</span>
                    {topic.study_time && <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1" title="Estimated study time"><Clock className="w-3 h-3" />About {topic.study_time}</span></>}
                    {isAuthenticated && <StatusPill status={status} />}
                </div>
                <h2 className="text-2xl font-bold text-primary tracking-tight" data-testid="lesson-title">{topic.title}</h2>
            </header>

            {hasContent(topic.content)
                ? <LessonJourney topic={topic} canTrack={isAuthenticated && status !== 'not_started'} {...journey} />
                : <div className="ev-card p-5 md:p-7 mb-6"><p className="text-sm text-slate-500" data-testid="lesson-content-empty">Notes for this lesson are still being written. You can practise questions or ask the AI Mentor about this topic in the meantime.</p></div>}

            <div className="space-y-4">
                <CompletionPanel status={status} isAuthenticated={isAuthenticated} onComplete={() => onComplete(topic.slug)} justCompleted={justCompleted} chapterDone={chapterDone} next={next} onGo={onGo} />
                <LearningLinks board={board} subject={subject} topic={topic} />
                <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Lesson navigation">
                    {prev ? (
                        <button onClick={() => onGo(prev)} className="btn-secondary !py-2.5 !px-4 text-sm inline-flex items-center gap-2 min-w-0" data-testid="prev-lesson-btn">
                            <ArrowLeft className="w-4 h-4 flex-shrink-0" /><span className="truncate">Previous<span className="hidden sm:inline">: {prev.title}</span></span>
                        </button>
                    ) : <span />}
                    {next ? (
                        <button onClick={() => onGo(next)} className="btn-secondary !py-2.5 !px-4 text-sm inline-flex items-center gap-2 min-w-0" data-testid="next-lesson-btn">
                            <span className="truncate">Next<span className="hidden sm:inline">: {next.title}</span></span><ArrowRight className="w-4 h-4 flex-shrink-0" />
                        </button>
                    ) : <span />}
                </nav>
                <div className="flex justify-end">
                    <Link to={`/${topic.board_slug || board}/${subject}/${chapter}/${topic.slug}`} className="text-xs text-slate-500 hover:text-accent inline-flex items-center gap-1" data-testid="full-topic-link">
                        Open full topic page <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </article>
    );
}
