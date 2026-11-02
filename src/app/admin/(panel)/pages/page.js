import Link from 'next/link';
import { ExternalLink, PencilLine } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requirePage } from '@/lib/auth';
import { PAGES } from '@/lib/pages/registry';
import { pageSettingKey } from '@/lib/pages';
import { PageHeader, fmtDate } from '@/components/admin/ui';

export const metadata = { title: 'Pages & backgrounds' };

export default async function PagesIndex() {
  await requirePage('content.write');
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: 'page:' } }, select: { key: true, updatedAt: true } });
  const edited = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt]));

  return (
    <>
      <PageHeader title="Pages & backgrounds" description="Edit the text, images, backgrounds and visible sections of every page. Products, services, industries, blogs and jobs have their own sections in the menu." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PAGES.map((p) => {
          const updated = edited[pageSettingKey(p.key)];
          return (
            <div key={p.key} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-blue/40 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-navy-900">{p.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate">{p.path}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${updated ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate'}`}>
                  {updated ? 'Customised' : 'Default'}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate">{p.groups.length} sections{updated ? ` · edited ${fmtDate(updated, true)}` : ''}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/pages/${p.key}`} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800">
                  <PencilLine className="h-4 w-4" /> Edit
                </Link>
                <a href={p.path} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-navy-900 hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4" /> View
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
