import { useEffect, useRef, useState } from 'react';

/* Общие эффекты для витрины, /box и /bags (плейбук: reveal, счётчики, частицы).
   Всё уважает prefers-reduced-motion. Без GSAP — эффекты короткие, хватает rAF. */

export const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** true, когда элемент попал в экран (один раз). */
export function useInView(options = { threshold: 0.2 }) {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el || seen) return undefined;
        if (!('IntersectionObserver' in window)) { setSeen(true); return undefined; }
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, options);
        io.observe(el);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seen]);
    return [ref, seen];
}

/** Плавное появление блока снизу при прокрутке. */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
    const [ref, seen] = useInView();
    return (
        <Tag ref={ref} className={`fx-reveal ${seen ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </Tag>
    );
}

/** Счётчик «докручивается» до значения, когда виден. */
export function Counter({ value, suffix = '', className = '' }) {
    const [ref, seen] = useInView();
    const [n, setN] = useState(reducedMotion() ? value : 0);
    useEffect(() => {
        if (!seen || reducedMotion()) { if (seen) setN(value); return undefined; }
        let raf; const t0 = performance.now();
        const step = (now) => {
            const p = Math.min(1, (now - t0) / 1100);
            setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [seen, value]);
    return <span ref={ref} className={className}>{n.toLocaleString('ru-RU')}{suffix}</span>;
}

/**
 * Фоновые частицы на canvas.
 *  mode="snow" — снег (для /box), mode="dashes" — короткие штрихи, которые медленно дрейфуют
 *  и тянутся к курсору (витрина). На телефоне частиц меньше.
 */
export function Particles({ mode = 'snow', color = '255,255,255', className = '' }) {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || reducedMotion()) return undefined;
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0, dpr = 1, raf;
        const mouse = { x: -9999, y: -9999 };
        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const count = Math.round((w * h) / (mode === 'snow' ? 9000 : 14000));
        const ps = Array.from({ length: Math.min(count, 220) }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: mode === 'snow' ? 0.6 + Math.random() * 2.2 : 6 + Math.random() * 14,
            vx: (Math.random() - 0.5) * 0.25, vy: mode === 'snow' ? 0.25 + Math.random() * 0.8 : (Math.random() - 0.5) * 0.25,
            a: Math.random() * Math.PI * 2, o: 0.15 + Math.random() * 0.55,
        }));
        const onMove = (e) => { const b = canvas.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; };
        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            for (const p of ps) {
                if (mode === 'snow') {
                    p.a += 0.01; p.x += p.vx + Math.sin(p.a) * 0.3; p.y += p.vy;
                    if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${color},${p.o})`; ctx.fill();
                } else {
                    const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.hypot(dx, dy);
                    if (dist < 180) { p.vx += dx / dist * 0.02; p.vy += dy / dist * 0.02; }
                    p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy;
                    if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
                    if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
                    const ang = Math.atan2(p.vy, p.vx);
                    ctx.strokeStyle = `rgba(${color},${p.o * 0.6})`; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + Math.cos(ang) * p.r, p.y + Math.sin(ang) * p.r); ctx.stroke();
                }
            }
            raf = requestAnimationFrame(tick);
        };
        tick();
        window.addEventListener('resize', resize);
        window.addEventListener('pointermove', onMove);
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('pointermove', onMove); };
    }, [mode, color]);
    return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none ${className}`} />;
}

/** Ставит цвет фона body (для «резинового» скролла на iOS и светлых страниц). */
export function useBodyBg(color) {
    useEffect(() => {
        const prevB = document.body.style.background, prevH = document.documentElement.style.background;
        document.body.style.background = color; document.documentElement.style.background = color;
        return () => { document.body.style.background = prevB; document.documentElement.style.background = prevH; };
    }, [color]);
}

/** description страницы (title ставит DocumentTitle в App.jsx по STATIC_TITLES). */
export function useMeta(description) {
    useEffect(() => {
        const m = document.querySelector('meta[name="description"]');
        const prev = m?.getAttribute('content');
        if (m && description) m.setAttribute('content', description);
        return () => { if (m && prev) m.setAttribute('content', prev); };
    }, [description]);
}
