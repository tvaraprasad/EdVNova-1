import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ATOMS = [
    { pos: [0, 0, 0], r: 0.35, color: '#94a3b8' },
    { pos: [1.2, 0.8, 0.3], r: 0.28, color: '#3b82f6' },
    { pos: [-1.0, 0.6, -0.4], r: 0.28, color: '#64748b' },
    { pos: [0.3, -1.1, 0.5], r: 0.3, color: '#3b82f6' },
    { pos: [-0.5, -0.3, 1.2], r: 0.25, color: '#94a3b8' },
    { pos: [1.0, -0.4, -0.8], r: 0.25, color: '#64748b' },
];
const BONDS = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 5], [2, 4]];
const PYRAMID = [[0, 1.2, 0], [-1, -0.5, 0.8], [1, -0.5, 0.8], [0, -0.5, -1]];
const PYRAMID_EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]];

function segments(points, pairs, color, opacity) {
    const pos = pairs.flatMap(([a, b]) => [...points[a], ...points[b]]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function buildScene(mobile) {
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(5, 5, 5);
    scene.add(key);

    const seg = mobile ? 12 : 24;
    const molecule = new THREE.Group();
    ATOMS.forEach(({ pos, r, color }) => {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(r, seg, seg),
            new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.25, transparent: true, opacity: mobile ? 0.22 : 0.32 })
        );
        m.position.set(...pos);
        molecule.add(m);
    });
    molecule.add(segments(ATOMS.map((a) => a.pos), BONDS, '#94a3b8', mobile ? 0.25 : 0.35));
    molecule.scale.setScalar(mobile ? 0.7 : 0.85);
    scene.add(molecule);

    let pyramid = null;
    if (!mobile) {
        pyramid = segments(PYRAMID, PYRAMID_EDGES, '#3b82f6', 0.18);
        pyramid.position.z = -1;
        scene.add(pyramid);
    }

    const rings = new THREE.Group();
    [2.5, 3.5, 4.5].forEach((r, i) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.008, 6, mobile ? 48 : 96),
            new THREE.MeshBasicMaterial({ color: '#94a3b8', transparent: true, opacity: 0.08 - i * 0.02 })
        );
        ring.rotation.set(Math.PI / 2 + i * 0.15, i * 0.1, 0);
        rings.add(ring);
    });
    scene.add(rings);

    return { scene, molecule, pyramid, rings };
}

function disposeScene(scene) {
    scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
    });
}

function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        const gl = window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'));
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        return !!gl;
    } catch {
        return false;
    }
}

function useMedia(query) {
    const [match, setMatch] = useState(() => window.matchMedia?.(query)?.matches ?? false);
    useEffect(() => {
        const mq = window.matchMedia?.(query);
        if (!mq) return;
        const onChange = (e) => setMatch(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return match;
}

function StaticBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" data-testid="hero-static-background">
            <svg className="w-full h-full opacity-[0.14]" viewBox="0 0 1200 500" fill="none" preserveAspectRatio="xMidYMid slice">
                <g stroke="#94a3b8" strokeWidth="0.8">
                    <line x1="250" y1="250" x2="320" y2="200" /><line x1="250" y1="250" x2="190" y2="210" />
                    <line x1="250" y1="250" x2="270" y2="320" /><line x1="250" y1="250" x2="215" y2="285" />
                </g>
                <circle cx="250" cy="250" r="14" fill="#94a3b8" fillOpacity="0.5" />
                <circle cx="320" cy="200" r="11" fill="#3b82f6" fillOpacity="0.5" />
                <circle cx="190" cy="210" r="11" fill="#64748b" fillOpacity="0.5" />
                <circle cx="270" cy="320" r="12" fill="#3b82f6" fillOpacity="0.5" />
                <circle cx="215" cy="285" r="9" fill="#94a3b8" fillOpacity="0.5" />
                <ellipse cx="600" cy="250" rx="420" ry="110" stroke="#94a3b8" strokeWidth="0.5" />
                <ellipse cx="600" cy="250" rx="520" ry="150" stroke="#94a3b8" strokeWidth="0.35" />
                <path d="M950 140 L880 300 L1020 300 Z M950 140 L960 260" stroke="#3b82f6" strokeWidth="0.6" />
            </svg>
        </div>
    );
}

function useThreeHero(canvasRef, mobile, enabled, onFail) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!enabled || !canvas) return;
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile, powerPreference: mobile ? 'low-power' : 'high-performance' });
        } catch {
            onFail();
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
        const camera = new THREE.PerspectiveCamera(mobile ? 60 : 45, 1, 0.1, 100);
        camera.position.set(0, 0, 8);
        const { scene, molecule, pyramid, rings } = buildScene(mobile);
        const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 9;

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = canvas.parentElement;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            const halfW = halfH * camera.aspect;
            const edge = Math.min(7.5, halfW * (mobile ? 0.9 : camera.aspect < 1.8 ? 0.82 : 0.68));
            molecule.position.set(-edge, mobile || camera.aspect < 1.2 ? -halfH * 0.72 : -0.3, -1);
            if (pyramid) pyramid.position.set(edge, camera.aspect < 1.2 ? -halfH * 0.5 : 0.5, -1);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.parentElement);

        const pointer = { x: 0, y: 0 }, cam = { x: 0, y: 0 };
        const onMove = (e) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        if (!mobile) window.addEventListener('pointermove', onMove, { passive: true });

        let visible = true, raf = 0;
        const start = performance.now();
        const tick = () => {
            raf = 0;
            if (!visible || document.hidden) return;
            const t = (performance.now() - start) / 1000;
            molecule.rotation.y = t * 0.08;
            molecule.rotation.x = Math.sin(t * 0.05) * 0.1;
            if (pyramid) {
                pyramid.rotation.y = t * 0.06;
                pyramid.rotation.z = Math.sin(t * 0.04) * 0.05;
            }
            rings.rotation.z = t * 0.02;
            cam.x += (pointer.x * 0.3 - cam.x) * 0.02;
            cam.y += (pointer.y * 0.2 - cam.y) * 0.02;
            camera.position.x = cam.x;
            camera.position.y = cam.y;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        };
        const resume = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); });
        io.observe(canvas);
        document.addEventListener('visibilitychange', resume);
        const onLost = (e) => { e.preventDefault(); onFail(); };
        canvas.addEventListener('webglcontextlost', onLost);
        resume();

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('visibilitychange', resume);
            canvas.removeEventListener('webglcontextlost', onLost);
            disposeScene(scene);
            renderer.dispose();
        };
    }, [canvasRef, mobile, enabled, onFail]);
}

export default function ScientificHeroBackground() {
    const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
    const mobile = useMedia('(max-width: 767px)');
    const [failed, setFailed] = useState(() => !hasWebGL());
    const [onFail] = useState(() => () => setFailed(true));
    const canvasRef = useRef(null);
    const enabled = !reducedMotion && !failed;

    useThreeHero(canvasRef, mobile, enabled, onFail);

    if (!enabled) return <StaticBackground />;

    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" data-testid="hero-3d-background">
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
    );
}
