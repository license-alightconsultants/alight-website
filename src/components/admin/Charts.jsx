'use client';

import { useRef, useState } from 'react';

// Chart conventions (see dataviz guidance): single series → one hue, no legend box;
// 2px lines, recessive grid, hover crosshair + tooltip, and a table view for accessibility.
const BLUE = '#2864A5';
const BLUE_DARK = '#123D70';
// Sequential single-hue ramp (light → dark) for ordered pipeline stages.
export const PIPELINE_RAMP = ['#9CC2EE', '#6E9FD6', '#4680C0', '#2864A5', '#123D70'];

function niceMax(v) {
  if (v <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

/** Smooth area chart with crosshair tooltip. data: [{key,label,year,value}] */
export function AreaTrend({ data, label = 'Enquiries' }) {
  const [hover, setHover] = useState(null);
  const ref = useRef(null);
  const W = 720, H = 240, pad = { l: 34, r: 12, t: 18, b: 28 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const x = (i) => pad.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => pad.t + ih - (v / max) * ih;
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  // Catmull-Rom → Bezier for a smooth but honest curve
  const path = pts.reduce((acc, [px, py], i, a) => {
    if (i === 0) return `M${px},${py}`;
    const [x0, y0] = a[i - 2] || a[i - 1];
    const [x1, y1] = a[i - 1];
    const [x3, y3] = a[i + 1] || [px, py];
    const c1x = x1 + (px - x0) / 6, c1y = y1 + (py - y0) / 6;
    const c2x = px - (x3 - x1) / 6, c2y = py - (y3 - y1) / 6;
    return `${acc} C${c1x},${Math.min(c1y, pad.t + ih)} ${c2x},${Math.min(c2y, pad.t + ih)} ${px},${py}`;
  }, '');
  const area = `${path} L${x(data.length - 1)},${pad.t + ih} L${x(0)},${pad.t + ih} Z`;
  const ticks = [0, max / 2, max];

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    data.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
    setHover(best);
  };

  return (
    <div className="relative">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label} per month, last 12 months`}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={BLUE} stopOpacity="0.22" />
            <stop offset="1" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#E8EDF3" strokeDasharray={t ? '3 4' : undefined} />
            <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" className="fill-slate-400 text-[10px] tabular-nums">{Math.round(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={d.key} x={x(i)} y={H - 8} textAnchor="middle" className={`text-[10px] ${hover === i ? 'fill-navy-900 font-semibold' : 'fill-slate-400'}`}>{d.label}</text>
        ))}
        <path d={area} fill="url(#trendFill)" />
        <path d={path} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke={BLUE_DARK} strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill={BLUE} stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {/* direct label on the latest point only */}
        {hover === null && (
          <g>
            <circle cx={x(data.length - 1)} cy={y(data.at(-1).value)} r="4" fill={BLUE} stroke="#fff" strokeWidth="2" />
            <text x={x(data.length - 1) - 8} y={y(data.at(-1).value) - 10} textAnchor="end" className="fill-navy-900 text-[11px] font-semibold">{data.at(-1).value}</text>
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%` }}>
          <p className="font-semibold">{data[hover].label} {data[hover].year}</p>
          <p className="text-white/70"><span className="font-semibold text-white">{data[hover].value}</span> {label.toLowerCase()}</p>
        </div>
      )}
      <details className="mt-1 text-xs text-slate">
        <summary className="cursor-pointer select-none">View as table</summary>
        <table className="mt-2 w-full"><tbody>{data.map((d) => <tr key={d.key} className="border-b border-slate-100"><td className="py-1">{d.label} {d.year}</td><td className="text-right tabular-nums">{d.value}</td></tr>)}</tbody></table>
      </details>
    </div>
  );
}

/** Tiny inline trend line for KPI tiles. */
export function Sparkline({ values, color = BLUE }) {
  const W = 96, H = 28;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * W, H - 3 - (v / max) * (H - 6)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-24" aria-hidden>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={color} fillOpacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="2.5" fill={color} />
    </svg>
  );
}

/** Horizontal ranked bars. */
export function BarList({ data, emptyText = 'No data yet', ranked = false }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0);
  if (!total) return <p className="py-8 text-center text-sm text-slate">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              {ranked && <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate">{i + 1}</span>}
              <span className="truncate font-medium text-navy-900">{d.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-slate"><span className="font-semibold text-navy-900">{d.value}</span> · {Math.round((d.value / total) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full transition-colors" style={{ width: `${(d.value / max) * 100}%`, background: hover === i ? BLUE_DARK : BLUE, minWidth: d.value ? 6 : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Funnel of ordered pipeline stages, coloured with a sequential ramp; labels carry identity. */
export function Pipeline({ stages, closed }) {
  const top = Math.max(1, stages[0]?.value || 0);
  const [hover, setHover] = useState(null);
  return (
    <div>
      <ol className="space-y-2.5">
        {stages.map((s, i) => {
          const pct = Math.round((s.value / top) * 100);
          const step = i > 0 && stages[i - 1].value ? Math.round((s.value / stages[i - 1].value) * 100) : null;
          return (
            <li key={s.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="font-medium text-navy-900">{s.label}</span>
                <span className="tabular-nums text-slate">
                  {hover === i ? `${s.current} currently here · ` : ''}<span className="font-semibold text-navy-900">{s.value}</span> reached{step !== null && <span className="text-slate/70"> · {step}% of prior</span>}
                </span>
              </div>
              <div className="h-7 rounded-lg bg-slate-50">
                <div className={`flex h-7 items-center justify-end rounded-lg pr-2 text-[10px] font-semibold transition-all duration-700 ${i < 2 ? 'text-navy-900' : 'text-white'}`}
                  style={{ width: `${Math.max(pct, s.value ? 8 : 0)}%`, background: PIPELINE_RAMP[i], outline: hover === i ? `2px solid ${BLUE_DARK}` : 'none', outlineOffset: 1 }}>
                  {pct >= 14 && `${pct}%`}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate">Closed without conversion: <span className="font-semibold text-navy-900">{closed}</span></p>
    </div>
  );
}
