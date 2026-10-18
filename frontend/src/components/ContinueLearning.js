import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen, Compass } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const lessonUrl = (c, l) => `/learn/${c.board}/${c.subject}/${l.chapter}?lesson=${l.topic}`;

function ProgressBar({ percent, label }) {
    return (
        <div className="ev-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
            <span style={{ width: `${percent}%` }} />
        </div>
    );
}

function MainCourse({ c }) {
    const resume = c.last_visited || c.next_lesson;
    const showNext = c.next_lesson && !(c.last_visited && c.next_lesson.chapter === c.last_visited.chapter && c.next_lesson.topic === c.last_visited.topic);
    return (
        <div className="relative overflow-hidden rounded-2xl bg-navy text-white p-6 md:p-7" data-testid="continue-main-card">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: 'radial-gradient(ellipse 60% 120% at 100% 0%, rgba(76,141,255,0.22), transparent 60%)' }} />
            <div className="relative">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7FB0FF] mb-2">{c.board_name || c.board.toUpperCase()}</p>
                <h3 className="text-xl font-bold text-white mb-1" data-testid="continue-course-name">{c.course_title || c.subject_name}</h3>
                {c.last_visited && <p className="text-sm text-[#C5D5E8]" data-testid="continue-last-lesson">Last opened: {c.last_visited.title}</p>}
                <div className="mt-5 mb-2 flex items-center justify-between text-xs text-[#C5D5E8]">
                    <span data-testid="continue-progress-text">{c.completed} of {c.total} completed</span>
                    <span className="font-semibold text-white tabular-nums">{c.percent}%</span>
                </div>
                <div className="[&_.ev-progress]:bg-white/15"><ProgressBar percent={c.percent} label={`${c.subject_name} progress`} /></div>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    {resume && (
                        <Link to={lessonUrl(c, resume)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB0FF]" data-testid="continue-learning-btn">
                            Continue learning <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                    {showNext && (
                        <Link to={lessonUrl(c, c.next_lesson)} className="text-sm text-[#C5D5E8] hover:text-white transition-colors" data-testid="continue-next-lesson-link">
                            Next lesson: <span className="font-medium text-white">{c.next_lesson.title}</span>
                        </Link>
                    )}
                    {!c.next_lesson && c.total > 0 && <span className="text-sm text-[#C5D5E8]">All lessons completed</span>}
                </div>
            </div>
        </div>
    );
}

export function ContinueLearning() {
    const [courses, setCourses] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/api/progress/continue`, { withCredentials: true })
            .then(r => setCourses(r.data.courses || []))
            .catch(() => setError(true));
    }, []);

    if (error) return <div className="ev-card p-5 text-sm text-slate-500" data-testid="continue-learning-error">We could not load your progress right now. Please refresh to try again.</div>;
    if (!courses) return <div className="ev-card h-40 animate-pulse bg-slate-50" data-testid="continue-learning-loading" />;

    if (courses.length === 0) {
        return (
            <div className="ev-card p-6 flex flex-col sm:flex-row sm:items-center gap-4" data-testid="continue-learning-empty">
                <span className="ev-icon-tile !w-11 !h-11"><Compass className="w-5 h-5" /></span>
                <div className="flex-1">
                    <p className="font-semibold text-primary">Ready to start learning?</p>
                    <p className="text-sm text-slate-500">Open any lesson and your progress will appear here.</p>
                </div>
                <Link to="/learn" className="btn-primary !py-2.5 !px-5 text-sm text-center" data-testid="explore-subjects-btn">Explore subjects</Link>
            </div>
        );
    }

    const [main, ...others] = courses;
    return (
        <div data-testid="continue-learning">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-primary text-base">Continue learning</h2>
                <Link to="/learn" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">Browse all <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <MainCourse c={main} />
            {others.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    {others.map(c => {
                        const resume = c.last_visited || c.next_lesson;
                        return (
                            <Link key={`${c.board}-${c.subject}`} to={resume ? lessonUrl(c, resume) : `/learn/${c.board}/${c.subject}`} className="group ev-card ev-card-link p-4" data-testid={`continue-other-${c.board}-${c.subject}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="ev-icon-tile !w-9 !h-9"><BookOpen className="w-4 h-4" /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-primary truncate">{c.course_title || c.subject_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{c.board_name}{c.last_visited ? ` · ${c.last_visited.title}` : ''}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-primary tabular-nums">{c.percent}%</span>
                                </div>
                                <ProgressBar percent={c.percent} label={`${c.subject_name} progress`} />
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
