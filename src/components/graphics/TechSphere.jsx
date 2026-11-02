'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Draggable 3D tag sphere. Labels are distributed with a Fibonacci lattice and rotated in JS;
 * depth drives scale/opacity. Auto-rotates gently; static under reduced motion.
 */
export default function TechSphere({ items, radius = 210 }) {
  const wrap = useRef(null);
  const nodes = useRef([]);
  const [size, setSize] = useState(radius);

  useEffect(() => {
    const el = wrap.current;
    const fit = () => setSize(Math.min(radius, el.clientWidth / 2 - 40));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [radius]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = items.length;
    const pts = items.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(phi) * r, y, Math.sin(phi) * r];
    });
    let ax = 0.25, ay = 0, vx = 0.0016, vy = 0.004, raf = 0, drag = null, visible = true;

    const render = () => {
      const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
      pts.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        const y2 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        const k = (z2 + 2) / 3; // 0.33..1
        const node = nodes.current[i];
        if (!node) return;
        node.style.transform = `translate(-50%,-50%) translate3d(${(x1 * size).toFixed(1)}px,${(y2 * size).toFixed(1)}px,0) scale(${(0.6 + k * 0.5).toFixed(3)})`;
        node.style.opacity = (0.25 + k * 0.75).toFixed(3);
        node.style.zIndex = String(Math.round(k * 100));
        node.style.filter = k < 0.55 ? 'blur(0.6px)' : 'none';
      });
    };
    const loop = () => {
      if (!drag) { ay += vy; ax += vx; vy += (0.004 - vy) * 0.02; vx += (0.0016 - vx) * 0.02; }
      render();
      if (visible) raf = requestAnimationFrame(loop);
    };

    const el = wrap.current;
    const down = (e) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      ay += dx * 0.008; ax -= dy * 0.008; vy = dx * 0.0008; vx = -dy * 0.0008;
      drag = { x: e.clientX, y: e.clientY };
      if (reduce) render();
    };
    const up = () => { drag = null; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    render();
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, [items, size]);

  return (
    <div ref={wrap} className="relative mx-auto aspect-square w-full max-w-[560px] cursor-grab touch-none select-none active:cursor-grabbing" role="img" aria-label={`Technologies: ${items.map((t) => t.name).join(', ')}`}>
      <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(171,210,255,0.25),rgba(34,53,121,0.15)_45%,transparent_70%)]" />
      <div className="absolute inset-[12%] rounded-full border border-white/10" />
      <div className="absolute inset-[30%] rounded-full border border-dashed border-white/10" />
      <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ABD2FF,#6683BC_38%,#223579)] shadow-[0_0_90px_rgba(171,210,255,0.45)]">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-white">Alight</span>
      </div>
      {items.map((t, i) => (
        <span key={t.name} ref={(el) => (nodes.current[i] = el)}
          className="glass absolute left-1/2 top-1/2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow will-change-transform">
          {t.name}
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-crimson-400">{t.group}</span>
        </span>
      ))}
      <p className="absolute inset-x-0 bottom-0 text-center text-[11px] uppercase tracking-[0.2em] text-white/35">Drag to explore</p>
    </div>
  );
}
