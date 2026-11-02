'use client';

import { useEffect, useRef } from 'react';

/**
 * Perspective dot-terrain that ripples like flowing data. Canvas 2D — no WebGL dependency.
 * Pauses when off-screen or the tab is hidden; renders one static frame for reduced motion.
 */
export default function ParticleField({ className = '', density = 1, tint = 'hero' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    const COLS = Math.round(120 * density);
    const ROWS = Math.round(42 * density);

    function resize() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const horizon = h * (tint === 'hero' ? 0.46 : 0.34);
      const fov = h * 0.9;
      const camY = 44 + (mouse.y - 0.5) * 16;

      // Each depth row is drawn as a flowing wave line (far → near), forming a 3D terrain.
      for (let r = ROWS - 1; r >= 0; r--) {
        const z = 70 + r * 15;                       // depth
        const scale = fov / z;
        const depth = 1 - r / ROWS;                // 1 near, 0 far
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) {
          const x3 = (c - COLS / 2) * 14 + (mouse.x - 0.5) * 60;
          const wave = Math.sin(c * 0.16 + t * 1.2) * 14 + Math.cos(r * 0.3 - t * 0.9) * 12 + Math.sin((c + r) * 0.09 + t * 0.6) * 10;
          const sx = w / 2 + x3 * scale;
          const sy = horizon + (camY - wave) * scale * 0.5;
          if (c === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        // near rows warm towards brand red, far rows stay brand blue
        const warm = Math.min(1, Math.max(0, depth - 0.45) * 1.6);
        const red = Math.round(171 + (234 - 171) * warm);
        const green = Math.round(210 - (210 - 83) * warm);
        const blue = Math.round(255 - (255 - 97) * warm);
        ctx.strokeStyle = `rgba(${red},${green},${blue},${(0.05 + depth * depth * 0.5).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.6, Math.min(1.6, scale * 0.14));
        ctx.stroke();
      }
      t += 0.012;
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      cancelAnimationFrame(raf);
      if (visible && !reduce) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; cancelAnimationFrame(raf); if (visible && !reduce) raf = requestAnimationFrame(frame); };
    const onMove = (e) => { mouse.tx = e.clientX / window.innerWidth; mouse.ty = e.clientY / window.innerHeight; };
    const ro = new ResizeObserver(() => { resize(); if (reduce) frame(); });
    ro.observe(canvas);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
    };
  }, [density, tint]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
