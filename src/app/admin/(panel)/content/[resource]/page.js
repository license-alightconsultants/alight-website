import Link from 'next/link';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { loadResource, getPath } from '@/lib/admin/resource-data';
import { moveResource, toggleResource } from '@/lib/admin/resource-actions';
import { Badge, Card, Empty, LinkButton, PageHeader, buttonClass, fmtDate } from '@/components/admin/ui';

export async function generateMetadata({ params }) {
  const { RESOURCES } = await import('@/lib/admin/resources');
  return { title: RESOURCES[(await params).resource]?.label || 'Content' };
}

function Toggle({ on, action, label }) {
  return (
    <form action={action}>
      <button type="submit" role="switch" aria-checked={on} aria-label={label} title={label}
        className={`relative h-5 w-9 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </form>
  );
}

export default async function ResourceListPage({ params, searchParams }) {
  const { resource } = await params;
  const { res } = await loadResource(resource);
  const { q = '' } = await searchParams;

  const where = q ? { OR: res.search.map((f) => ({ [f]: { contains: q, mode: 'insensitive' } })) } : undefined;
  const orderBy = res.orderable ? [{ sortOrder: 'asc' }, { id: 'asc' }] : res.orderBy || [{ id: 'desc' }];
  const rows = await prisma[res.model].findMany({ where, orderBy, include: res.include, take: 500 });

  return (
    <>
      <PageHeader
        title={res.label}
        description={`${rows.length} item${rows.length === 1 ? '' : 's'}${res.orderable ? ' · use the arrows to set display order' : ''}`}
        actions={<LinkButton href={`/admin/content/${resource}/new`} variant="accent"><Plus className="h-4 w-4" /> New {res.singular.toLowerCase()}</LinkButton>}
      />
      <Card padded={false}>
        <form role="search" className="border-b border-slate-100 p-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">Search {res.label}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60" />
            <input name="q" defaultValue={q} placeholder={`Search ${res.label.toLowerCase()}…`} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm transition focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10" />
          </label>
        </form>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-slate">
                  {res.orderable && !q && <th className="w-20 px-4 py-2.5 font-medium">Order</th>}
                  {res.columns.map((c) => <th key={c.name} className="px-4 py-2.5 font-medium">{c.label}</th>)}
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const href = res.publicPath?.(row);
                  return (
                    <tr key={row.id} className="group border-b border-slate-100/70 transition-colors last:border-0 hover:bg-gradient-to-r hover:from-brand-sky/15 hover:to-transparent">
                      {res.orderable && !q && (
                        <td className="px-4 py-2">
                          <div className="flex gap-0.5">
                            <form action={moveResource.bind(null, resource, row.id, 'up')}><button type="submit" disabled={i === 0} aria-label="Move up" className="rounded-md p-2 text-slate hover:bg-slate-200 disabled:opacity-25"><ArrowUp className="h-3.5 w-3.5" /></button></form>
                            <form action={moveResource.bind(null, resource, row.id, 'down')}><button type="submit" disabled={i === rows.length - 1} aria-label="Move down" className="rounded-md p-2 text-slate hover:bg-slate-200 disabled:opacity-25"><ArrowDown className="h-3.5 w-3.5" /></button></form>
                          </div>
                        </td>
                      )}
                      {res.columns.map((c, ci) => {
                        const v = getPath(row, c.name);
                        let content = v ?? '—';
                        if (c.toggle) content = <Toggle on={Boolean(v)} label={`${c.label}: ${v ? 'on' : 'off'}`} action={toggleResource.bind(null, resource, row.id, c.name)} />;
                        else if (c.badge) content = <Badge value={v} label={String(v).charAt(0) + String(v).slice(1).toLowerCase()} />;
                        else if (c.date) content = <span className="text-xs text-slate">{fmtDate(v)}</span>;
                        else if (c.image) content = v ? <img src={v} alt="" className="h-8 w-auto max-w-[96px] object-contain" /> : '—';
                        else if (c.options) content = v ? <Chip text={c.options.find(([k]) => k === v)?.[1] || v} seed={String(v)} /> : '—';
                        return (
                          <td key={c.name} className="px-4 py-3">
                            {ci === 0 && !c.image ? <Link href={`/admin/content/${resource}/${row.id}`} className="font-medium text-navy-900 hover:text-brand-blue">{content}</Link> : <span className="text-slate">{content}</span>}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {href && <a href={href} target="_blank" rel="noopener" className={buttonClass('ghost', 'sm')} aria-label="View on website"><ExternalLink className="h-3.5 w-3.5" /></a>}
                          <Link href={`/admin/content/${resource}/${row.id}`} className={buttonClass('outline', 'sm')}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={q ? 'Nothing matches your search' : `No ${res.label.toLowerCase()} yet`} action={!q && <LinkButton href={`/admin/content/${resource}/new`} variant="primary"><Plus className="h-4 w-4" /> Create the first one</LinkButton>} />
        )}
      </Card>
    </>
  );
}

// Stable colour per category value, so the same category always gets the same chip.
const CHIP_TONES = [
  'bg-blue-50 text-blue-700 ring-blue-600/15',
  'bg-violet-50 text-violet-700 ring-violet-600/15',
  'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  'bg-amber-50 text-amber-800 ring-amber-600/15',
  'bg-rose-50 text-rose-700 ring-rose-600/15',
  'bg-cyan-50 text-cyan-700 ring-cyan-600/15',
];
function Chip({ text, seed }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${CHIP_TONES[h % CHIP_TONES.length]}`}>{text}</span>;
}
