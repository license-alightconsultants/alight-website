'use client';

import { motion } from 'framer-motion';

// Code-drawn application previews (no stock imagery, no invented figures — values are
// illustrative percentages/labels only). An uploaded screenshot replaces the drawing.

const ease = [0.22, 1, 0.36, 1];

function theme(dark) {
  return dark
    ? { bg: 'bg-[#0B1F3F]', panel: 'bg-white/[0.05]', line: 'border-white/10', ink: 'text-white/85', mute: 'text-white/40', bar: 'bg-white/15', strong: '#ABD2FF', soft: 'rgba(171,210,255,0.18)' }
    : { bg: 'bg-white', panel: 'bg-[#F3F6FA]', line: 'border-navy-900/[0.07]', ink: 'text-navy-900', mute: 'text-slate/70', bar: 'bg-navy-900/10', strong: '#2864A5', soft: 'rgba(40,100,165,0.14)' };
}

function AreaChart({ t, id, animate }) {
  const d = 'M0,62 C18,58 26,40 44,42 C62,44 70,24 90,26 C110,28 118,46 138,38 C158,30 166,12 186,14 L200,13';
  return (
    <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={`area-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={t.strong} stopOpacity="0.35" />
          <stop offset="1" stopColor={t.strong} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 40, 60].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} stroke={t.soft} strokeDasharray="2 4" />)}
      <path d={`${d} L200,80 L0,80 Z`} fill={`url(#area-${id})`} />
      <motion.path d={d} fill="none" stroke={t.strong} strokeWidth="2" strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease }} />
      <path d="M0,70 C30,66 50,58 80,60 C110,62 140,48 200,44" fill="none" stroke="#EA5361" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      <circle cx="186" cy="14" r="3.5" fill={t.strong} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function Dashboard({ t, id, animate }) {
  return (
    <div className="grid h-full grid-cols-3 grid-rows-[auto_1fr] gap-2">
      {[['Released', '84%', t.strong], ['Utilised', '62%', '#EA5361'], ['Balance', '22%', t.strong]].map(([l, v, c], i) => (
        <div key={l} className={`rounded-lg p-2 ${t.panel}`}>
          <p className={`text-[7px] font-semibold uppercase tracking-wider ${t.mute}`}>{l}</p>
          <p className={`mt-0.5 font-display text-[13px] font-bold leading-none ${t.ink}`}>{v}</p>
          <div className={`mt-1.5 h-1 rounded-full ${t.bar}`}>
            <motion.div className="h-1 rounded-full" style={{ background: c }} initial={animate ? { width: 0 } : false} whileInView={{ width: v }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease }} />
          </div>
        </div>
      ))}
      <div className={`col-span-2 rounded-lg p-2 ${t.panel}`}>
        <div className="flex items-center justify-between">
          <p className={`text-[7px] font-semibold uppercase tracking-wider ${t.mute}`}>Fund flow</p>
          <div className="flex gap-1"><span className={`h-1 w-4 rounded ${t.bar}`} /><span className="h-1 w-4 rounded bg-crimson-400/60" /></div>
        </div>
        <div className="mt-1 h-[calc(100%-10px)]"><AreaChart t={t} id={id} animate={animate} /></div>
      </div>
      <div className={`grid place-items-center rounded-lg ${t.panel}`}>
        <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
          <circle cx="18" cy="18" r="13" fill="none" stroke={t.soft} strokeWidth="5" />
          <motion.circle cx="18" cy="18" r="13" fill="none" stroke={t.strong} strokeWidth="5" strokeLinecap="round" strokeDasharray="82"
            initial={animate ? { strokeDashoffset: 82 } : false} whileInView={{ strokeDashoffset: 28 }} viewport={{ once: true }} transition={{ duration: 1.4, ease }} />
          <circle cx="18" cy="18" r="13" fill="none" stroke="#EA5361" strokeWidth="5" strokeDasharray="10 72" strokeDashoffset="-58" />
        </svg>
      </div>
    </div>
  );
}

function Ledger({ t }) {
  const rows = [['OK', 72], ['PAID', 54], ['OK', 88], ['PENDING', 40], ['PAID', 66]];
  const pill = { OK: 'bg-brand-blue/15 text-brand-blue', PAID: 'bg-emerald-500/15 text-emerald-600', PENDING: 'bg-amber-500/15 text-amber-600' };
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className={`flex items-center gap-2 px-2 text-[7px] font-semibold uppercase tracking-wider ${t.mute}`}>
        <span className="w-4" /><span className="flex-1">Voucher</span><span className="w-14">Amount</span><span className="w-10 text-right">Status</span>
      </div>
      {rows.map(([s, w], i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.07 }}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${t.panel}`}>
          <span className={`h-4 w-4 rounded ${i === 1 ? 'bg-crimson-500' : 'bg-brand-blue/70'}`} />
          <span className="flex flex-1 flex-col gap-1"><span className={`h-1 rounded ${t.bar}`} style={{ width: `${w}%` }} /><span className={`h-1 w-1/3 rounded ${t.bar} opacity-60`} /></span>
          <span className={`h-1.5 w-14 rounded ${t.bar}`} />
          <span className={`w-10 rounded px-1 py-0.5 text-center text-[6px] font-bold ${pill[s]}`}>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Flow({ t, dark }) {
  const steps = [['Release', 18, 50], ['Agency', 72, 22], ['Bank', 72, 78], ['Verify', 128, 50], ['Utilised', 182, 50]];
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full">
      {edges.map(([a, b], i) => (
        <g key={i}>
          <path d={`M${steps[a][1]} ${steps[a][2]} L${steps[b][1]} ${steps[b][2]}`} stroke={t.soft} strokeWidth="2" />
          <path d={`M${steps[a][1]} ${steps[a][2]} L${steps[b][1]} ${steps[b][2]}`} stroke={t.strong} strokeWidth="1.5" strokeDasharray="3 6" className="animate-dash" />
        </g>
      ))}
      {steps.map(([label, x, y], i) => (
        <g key={label}>
          <rect x={x - 17} y={y - 11} width="34" height="22" rx="6" fill={i === 4 ? '#C7161C' : dark ? '#123D70' : '#fff'} stroke={i === 4 ? '#C7161C' : t.strong} strokeOpacity="0.5" />
          <text x={x} y={y + 2.5} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={i === 4 ? '#fff' : dark ? '#fff' : '#071A36'}>{label}</text>
        </g>
      ))}
    </svg>
  );
}

function GridView({ t }) {
  return (
    <div className="grid h-full grid-cols-3 gap-1.5">
      {['To do', 'In progress', 'Done'].map((col, c) => (
        <div key={col} className={`flex flex-col gap-1.5 rounded-lg p-1.5 ${t.panel}`}>
          <p className={`text-[7px] font-semibold uppercase tracking-wider ${t.mute}`}>{col}</p>
          {Array.from({ length: 3 - (c === 2 ? 1 : 0) }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + (c * 3 + i) * 0.05 }}
              className={`rounded-md p-1.5 ${t.bg} shadow-sm ring-1 ring-black/[0.03]`}>
              <span className={`block h-1 w-4/5 rounded ${t.bar}`} />
              <span className={`mt-1 block h-1 w-1/2 rounded ${t.bar} opacity-60`} />
              <span className="mt-1.5 flex items-center justify-between">
                <span className={`h-2.5 w-2.5 rounded-full ${(c + i) % 2 ? 'bg-crimson-400' : 'bg-brand-blue'}`} />
                {c === 2 && <span className="text-[6px] font-bold text-emerald-600">✓</span>}
              </span>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Mobile({ t, dark }) {
  return (
    <div className="flex h-full items-center justify-center gap-4">
      {[0, 1].map((p) => (
        <motion.div key={p} initial={{ y: 12, opacity: 0 }} whileInView={{ y: p ? 10 : -4, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: p * 0.15, ease }}
          className={`relative w-[72px] rounded-[14px] p-1 shadow-lg ring-1 ${dark ? 'bg-navy-950 ring-white/15' : 'bg-navy-900 ring-navy-900/20'}`}>
          <div className={`overflow-hidden rounded-[10px] ${t.bg}`}>
            <div className={`px-1.5 pb-1.5 pt-2 ${p ? 'bg-crimson-600' : 'bg-brand-blue'}`}>
              <span className="mx-auto mb-1.5 block h-1 w-5 rounded-full bg-white/40" />
              <span className="block h-1.5 w-3/4 rounded bg-white/80" />
            </div>
            <div className="space-y-1 p-1.5">
              {[0, 1, 2, 3].map((r) => (
                <div key={r} className={`flex items-center gap-1 rounded p-1 ${t.panel}`}>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r === 1 ? 'bg-crimson-400' : 'bg-brand-blue/60'}`} />
                  <span className={`h-1 flex-1 rounded ${t.bar}`} />
                </div>
              ))}
              <div className={`mt-1 h-3 rounded ${p ? 'bg-crimson-600' : 'bg-brand-blue'}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const views = { dashboard: Dashboard, ledger: Ledger, flow: Flow, grid: GridView, mobile: Mobile };
const navIcons = 5;

export default function ProductVisual({ product, dark = false, className = '', animate = true }) {
  if (product.cover) {
    return (
      <div className={className}>
        <div className={`h-full w-full overflow-hidden rounded-xl ring-1 ${dark ? 'ring-white/10' : 'ring-navy-900/10'}`}>
          <img src={product.cover} alt={product.images?.[0]?.alt || product.name} loading="lazy" className="h-full w-full object-cover object-top" />
        </div>
      </div>
    );
  }
  const t = theme(dark);
  const View = views[product.visual] || Dashboard;
  const id = product.slug || product.name;
  const chrome = product.visual !== 'mobile';

  return (
    <div className={className}>
      <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-xl ring-1 ${dark ? 'ring-white/10' : 'ring-navy-900/10'} ${t.bg}`}>
        <div className={`flex items-center gap-2 border-b px-3 py-1.5 ${t.line}`}>
          <span className="flex gap-1"><span className="h-1.5 w-1.5 rounded-full bg-crimson-500/80" /><span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" /></span>
          <span className={`truncate text-[8px] font-bold uppercase tracking-[0.14em] ${t.ink}`}>{product.short || product.name}</span>
          <span className={`ml-auto h-2.5 w-16 rounded-full ${t.panel}`} />
        </div>
        <div className="flex min-h-0 flex-1">
          {chrome && (
            <div className={`flex w-6 shrink-0 flex-col items-center gap-1.5 border-r py-2 ${t.line}`}>
              {Array.from({ length: navIcons }).map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-[3px] ${i === 0 ? 'bg-crimson-500' : t.bar}`} />
              ))}
            </div>
          )}
          <div className="min-h-0 flex-1 p-2"><View t={t} dark={dark} id={id} animate={animate} /></div>
        </div>
      </div>
    </div>
  );
}
