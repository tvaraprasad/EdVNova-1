import { lazy, Suspense, useEffect, useState } from 'react';

const CrystalizedBall = lazy(() => import('./CrystalizedBall'));

export const CRYSTAL_COLOR = '#4C8DFF';

function canRunLive() {
    if (!window.matchMedia?.('(min-width: 1024px)').matches) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
        const gl = document.createElement('canvas').getContext('webgl2');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return !!gl;
    } catch {
        return false;
    }
}

export function StaticCrystal({ className = '' }) {
    return (
        <div className={`relative aspect-square ${className}`} aria-hidden="true" data-testid="hero-crystal-static">
            <div className="absolute inset-[-18%] rounded-full" style={{ background: 'radial-gradient(circle, rgba(76,141,255,0.28) 0%, rgba(76,141,255,0.08) 45%, transparent 70%)' }} />
            <div
                className="absolute inset-[14%] rounded-full"
                style={{
                    background: 'radial-gradient(circle at 50% 62%, rgba(76,141,255,0.35) 0%, rgba(16,43,75,0.55) 45%, rgba(7,24,46,0.9) 72%)',
                    boxShadow: '0 0 0 1.5px rgba(150,190,255,0.85), 0 0 18px 4px rgba(76,141,255,0.75), 0 0 60px 12px rgba(76,141,255,0.35), inset 0 0 40px 6px rgba(76,141,255,0.45)',
                }}
            />
            <div className="absolute rounded-full" style={{ top: '22%', left: '30%', width: '22%', height: '10%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.35), transparent 70%)', transform: 'rotate(-20deg)' }} />
        </div>
    );
}

export function CrystalHero() {
    const [live] = useState(canRunLive);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!live) return;
        const id = requestAnimationFrame(() => setReady(true));
        return () => cancelAnimationFrame(id);
    }, [live]);

    if (!live) return <StaticCrystal className="w-full max-w-[420px] mx-auto" />;

    return (
        <div className="relative w-full h-[560px] xl:h-[600px] pointer-events-none" aria-hidden="true" data-testid="hero-crystal-live">
            {ready && (
                <Suspense fallback={null}>
                    <CrystalizedBall preset="plasma" color={CRYSTAL_COLOR} size={0.7} crackle={0.85} fill={0.5} interactive hoverStrength={0.7} />
                </Suspense>
            )}
        </div>
    );
}
