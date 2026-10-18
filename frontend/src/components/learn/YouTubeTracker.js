import { useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const FLUSH_MS = 15000;
let apiPromise;

function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (!apiPromise) {
        apiPromise = new Promise(resolve => {
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
            const s = document.createElement('script');
            s.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(s);
        });
    }
    return apiPromise;
}

function send(videoId, body, keepalive = false) {
    return fetch(`${API_URL}/api/progress/video/${videoId}`, {
        method: 'POST', credentials: 'include', keepalive,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).then(r => (r.ok ? r.json() : null)).catch(() => null);
}

// Counts only continuously played segments; seeks start a new segment.
export function YouTubeTracker({ videoId, ytId, title, startAt = 0, onProgress }) {
    const hostRef = useRef(null);
    const onProgressRef = useRef(onProgress);
    onProgressRef.current = onProgress;

    useEffect(() => {
        const host = hostRef.current;
        let player, tick, flushTimer, destroyed = false;
        let seg = null, lastT = null, lastWall = 0, started = false;
        const pending = [];

        const closeSeg = () => {
            if (seg && seg[1] - seg[0] >= 1) pending.push([+seg[0].toFixed(1), +seg[1].toFixed(1)]);
            seg = null; lastT = null;
        };
        const flush = (keepalive = false) => {
            if (!player?.getDuration) return;
            const duration = player.getDuration();
            if (!duration) return;
            if (seg && seg[1] - seg[0] >= 1) { pending.push([+seg[0].toFixed(1), +seg[1].toFixed(1)]); seg = [seg[1], seg[1]]; }
            const intervals = pending.splice(0);
            const position = player.getCurrentTime?.() || 0;
            send(videoId, { position, duration, intervals }, keepalive).then(res => res && onProgressRef.current?.(res));
        };
        const sample = () => {
            const t = player.getCurrentTime();
            const now = performance.now();
            const rate = player.getPlaybackRate?.() || 1;
            if (lastT !== null && seg) {
                const dt = t - lastT, wall = (now - lastWall) / 1000;
                if (dt >= 0 && dt <= wall * rate + 1.5) seg[1] = t;
                else { closeSeg(); seg = [t, t]; }
            } else seg = [t, t];
            lastT = t; lastWall = now;
        };
        const onState = e => {
            const S = window.YT.PlayerState;
            if (e.data === S.PLAYING) {
                if (!started) { started = true; flush(); }
                clearInterval(tick); tick = setInterval(sample, 1000); sample();
                clearInterval(flushTimer); flushTimer = setInterval(() => flush(), FLUSH_MS);
            } else {
                clearInterval(tick); clearInterval(flushTimer);
                if (seg) sample();
                closeSeg();
                if (e.data === S.PAUSED || e.data === S.ENDED) flush();
            }
        };
        const onHide = () => { if (document.visibilityState === 'hidden') { if (seg) sample(); closeSeg(); flush(true); } };

        loadYouTubeApi().then(YT => {
            if (destroyed || !host) return;
            const el = document.createElement('div');
            host.appendChild(el);
            player = new YT.Player(el, {
                videoId: ytId, width: '100%', height: '100%',
                playerVars: { start: Math.floor(startAt), rel: 0, modestbranding: 1, playsinline: 1 },
                events: { onStateChange: onState },
            });
        });
        document.addEventListener('visibilitychange', onHide);

        return () => {
            destroyed = true;
            clearInterval(tick); clearInterval(flushTimer);
            document.removeEventListener('visibilitychange', onHide);
            if (player?.getCurrentTime) { if (seg) sample(); closeSeg(); flush(true); }
            player?.destroy?.();
            if (host) host.innerHTML = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId, ytId]);

    return (
        <div className="aspect-video bg-black" data-testid={`yt-player-${videoId}`}>
            <div ref={hostRef} title={title} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
        </div>
    );
}
