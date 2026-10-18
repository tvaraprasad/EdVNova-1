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
    const [closedGroups, setClosedGroups] = useState({ 'AS Foundation': true });
    const q = query.trim().toLowerCase();
    const label = t => (t.syllabus_ref && t.syllabus_title) || t.title;
    const matches = t => label(t).toLowerCase().includes(q) || t.title.toLowerCase().includes(q);
    const chapters = (course?.chapters || []).filter(c => !q || c.name.toLowerCase().includes(q) || c.topics.some(matches));
    const groupCount = g => chapters.filter(c => c.group === g).length;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <Link to={`/learn/${board}`} className="text-xs text-accent hover:underline inline-flex items-center gap-1 mb-2" data-testid="outline-back-link">
                    <ChevronLeft className="w-3 h-3" /> All {boardName || board?.toUpperCase()} subjects
                </Link>
                <h3 className="font-bold text-primary text-sm leading-snug" data-testid="outline-course-title">{course?.course_title || `${boardName || board?.toUpperCase()} ${subjectName || ''}`}</h3>
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
                {chapters.map((c, ci) => {
                    const isActive = c.slug === chapter;
                    const groupStart = c.group && c.group !== chapters[ci - 1]?.group;
                    const expanded = !!q || !!open[c.slug];
                    const topics = c.topics.filter(t => !q || matches(t) || c.name.toLowerCase().includes(q));
                    const groupId = c.group.toLowerCase().replace(/\s+/g, '-');
                    const groupClosed = !q && closedGroups[c.group] && c.group === 'AS Foundation' && chapters.some(x => x.group === 'A Level Extension');
                    const header = groupStart && (
                        <button onClick={() => setClosedGroups(g => ({ ...g, [c.group]: !groupClosed }))} aria-expanded={!groupClosed} className="w-full flex items-center gap-1.5 px-4 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-primary transition-colors" data-testid={`outline-group-${groupId}`}>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${groupClosed ? '-rotate-90' : ''}`} />
                            <span className="flex-1 text-left">{c.group}</span><span className="tabular-nums normal-case tracking-normal font-medium text-slate-400">{groupCount(c.group)} chapters</span>
                        </button>
                    );
                    if (groupClosed && !isActive) return header ? <div key={c.slug}>{header}</div> : null;
                    const empty = c.total === 0;
                    return (
                        <div key={c.slug} className={isActive ? 'bg-soft/60' : ''}>
                            {c.group && groupStart && (c.group === 'AS Foundation' || c.group === 'A Level Extension') ? header
                                : groupStart && <p className="px-4 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500" data-testid={`outline-group-${groupId}`}>{c.group}</p>}
                            <button
                                onClick={() => setOpen(o => ({ ...o, [c.slug]: !o[c.slug] }))}
                                aria-expanded={expanded}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-xs font-medium transition-colors ${isActive ? 'text-accent' : 'text-slate-600 hover:bg-soft hover:text-primary'}`}
                                data-testid={`sidebar-chapter-${c.slug}`}
                            >
                                <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
                                <span className="flex-1 min-w-0 truncate">{(c.coursebook_number || c.syllabus_number) && <span className="tabular-nums text-slate-400 mr-1.5">{c.coursebook_number || c.syllabus_number}</span>}{c.name}</span>
                                {empty && <span className="text-[10px] font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 whitespace-nowrap" data-testid={`chapter-coming-soon-${c.slug}`}>Coming soon</span>}
                                {isAuthenticated && c.total > 0 && (
                                    <span className={`text-[10px] tabular-nums font-semibold ${c.completed === c.total ? 'text-emerald-600' : 'text-slate-400'}`} data-testid={`chapter-progress-${c.slug}`}>{c.completed}/{c.total}</span>
                                )}
                            </button>
                            {isAuthenticated && c.total > 0 && (
                                <div className="px-4 pb-1.5 -mt-1"><div className="ev-progress !h-[3px] ml-5"><span style={{ width: `${c.percent}%` }} /></div></div>
                            )}
                            {expanded && (
                                <div className="ml-6 border-l border-slate-200 pl-2 pb-2 space-y-0.5">
                                    {topics.length === 0 && <p className="px-2 py-1.5 text-[11px] text-slate-400">Lessons coming soon</p>}
                                    {topics.map(t => {
                                        const current = isActive && t.slug === activeLesson;
                                        const subs = current ? t.subtopics || [] : [];
                                        return (<div key={t.slug}>{
                                            <button
                                                key={t.slug}
                                                disabled={!t.available}
                                                onClick={() => onSelect(c.slug, t.slug)}
                                                aria-current={current ? 'true' : undefined}
                                                className={`w-full text-left px-2 py-1.5 text-[12px] rounded-md flex items-center gap-2 transition-colors ${current ? 'bg-white text-primary font-semibold shadow-card ring-1 ring-accent/20' : t.available ? 'text-slate-600 hover:text-primary hover:bg-white' : 'text-slate-400 cursor-default'}`}
                                                data-testid={`sidebar-topic-${t.slug}`}
                                            >
                                                <TopicIcon status={isAuthenticated || !t.available ? t.status : 'not_started'} />
                                                <span className="truncate flex-1">{t.syllabus_ref && <span className="tabular-nums text-slate-400 mr-1">{t.syllabus_ref}</span>}{label(t)}</span>
                                                {!t.available && <span className="text-[10px] text-slate-400">Soon</span>}
                                            </button>
                                            }{subs.length > 0 && (
                                                <ul className="ml-6 my-1 space-y-0.5" data-testid={`sidebar-subtopics-${t.slug}`}>
                                                    {subs.map(st => (
                                                        <li key={st.id}>
                                                            <button onClick={() => document.getElementById(`sub-${st.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="w-full text-left flex items-center gap-1.5 px-1 py-0.5 text-[11px] text-slate-500 hover:text-accent" data-testid={`sidebar-subtopic-${st.id}`}>
                                                                {isAuthenticated && t.subtopics_completed?.includes(st.id) ? <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" /> : <span className="w-1 h-1 rounded-full bg-slate-300 mx-1 flex-shrink-0" />}
                                                                <span className="truncate">{st.title}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}</div>
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
