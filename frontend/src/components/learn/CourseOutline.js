import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronLeft, Circle, CircleDot, Lock, Search, PlayCircle } from 'lucide-react';

function TopicIcon({ status }) {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-label="Completed" />;
    if (status === 'in_progress') return <CircleDot className="w-4 h-4 text-accent flex-shrink-0" aria-label="In progress" />;
    if (status === 'unavailable') return <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" aria-label="Coming soon" />;
    return <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" aria-label="Not started" />;
}

export function CourseOutline({ course, board, subject, chapter, activeLesson, onSelect, isAuthenticated, subjectName, boardName }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState({ [chapter]: true });
    const q = query.trim().toLowerCase();
    const chapters = (course?.chapters || []).filter(c => !q || c.name.toLowerCase().includes(q) || c.topics.some(t => t.title.toLowerCase().includes(q)));

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <Link to={`/learn/${board}`} className="text-xs text-accent hover:underline inline-flex items-center gap-1 mb-2" data-testid="outline-back-link">
                    <ChevronLeft className="w-3 h-3" /> All {boardName || board?.toUpperCase()} subjects
                </Link>
                <h3 className="font-bold text-primary text-sm leading-snug">{boardName || board?.toUpperCase()} {subjectName}</h3>
                {isAuthenticated && course && (
                    <div className="mt-3" data-testid="course-progress">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                            <span>{course.completed} of {course.total} completed</span>
                            <span className="font-semibold text-primary tabular-nums">{course.percent}%</span>
                        </div>
                        <div className="ev-progress" role="progressbar" aria-valuenow={course.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress"><span style={{ width: `${course.percent}%` }} /></div>
                    </div>
                )}
            </div>

            <div className="px-3 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-soft rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-accent/30">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a topic..." aria-label="Find a topic" className="bg-transparent text-xs outline-none flex-1 placeholder:text-slate-400" data-testid="sidebar-search" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {chapters.map(c => {
                    const isActive = c.slug === chapter;
                    const expanded = !!q || !!open[c.slug];
                    const topics = c.topics.filter(t => !q || t.title.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
                    return (
                        <div key={c.slug} className={isActive ? 'bg-soft/60' : ''}>
                            <button
                                onClick={() => setOpen(o => ({ ...o, [c.slug]: !o[c.slug] }))}
                                aria-expanded={expanded}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-xs font-medium transition-colors ${isActive ? 'text-accent' : 'text-slate-600 hover:bg-soft hover:text-primary'}`}
                                data-testid={`sidebar-chapter-${c.slug}`}
                            >
                                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
                                <span className="flex-1 min-w-0 truncate">{c.name}</span>
                                {isAuthenticated && c.total > 0 && (
                                    <span className={`text-[10px] tabular-nums font-semibold ${c.completed === c.total ? 'text-emerald-600' : 'text-slate-400'}`} data-testid={`chapter-progress-${c.slug}`}>{c.completed}/{c.total}</span>
                                )}
                            </button>
                            {isAuthenticated && c.total > 0 && (
                                <div className="px-4 pb-1.5 -mt-1"><div className="ev-progress !h-[3px] ml-5"><span style={{ width: `${c.percent}%` }} /></div></div>
                            )}
                            {expanded && (
                                <div className="ml-6 border-l border-slate-200 pl-2 pb-2 space-y-0.5">
                                    {topics.length === 0 && <p className="px-2 py-1.5 text-[11px] text-slate-400">No lessons yet</p>}
                                    {topics.map(t => {
                                        const current = isActive && t.slug === activeLesson;
                                        return (
                                            <button
                                                key={t.slug}
                                                disabled={!t.available}
                                                onClick={() => onSelect(c.slug, t.slug)}
                                                aria-current={current ? 'true' : undefined}
                                                className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md flex items-center gap-2 transition-colors ${current ? 'bg-white text-primary font-semibold shadow-card ring-1 ring-accent/20' : t.available ? 'text-slate-600 hover:text-primary hover:bg-white' : 'text-slate-400 cursor-default'}`}
                                                data-testid={`sidebar-topic-${t.slug}`}
                                            >
                                                <TopicIcon status={isAuthenticated || !t.available ? t.status : 'not_started'} />
                                                <span className="truncate flex-1">{t.title}</span>
                                                {!t.available && <span className="text-[10px] text-slate-400">Soon</span>}
                                            </button>
                                        );
                                    })}
                                    {c.required_videos?.map(v => (
                                        <div key={v.id} className="px-2 py-1.5 text-[12px] text-slate-500 flex items-center gap-2" data-testid={`sidebar-video-${v.id}`}>
                                            {v.completed && isAuthenticated ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <PlayCircle className="w-4 h-4 text-slate-300" />}
                                            <span className="truncate">{v.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
