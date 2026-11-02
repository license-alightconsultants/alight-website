'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, ExternalLink, Plus, Search } from 'lucide-react';

const titles = [
  ['/admin/enquiries', 'Enquiries'], ['/admin/applications', 'Job applications'], ['/admin/content/', 'Content'],
  ['/admin/settings', 'Website settings'], ['/admin/users', 'Users & roles'], ['/admin/audit', 'Audit log'], ['/admin/account', 'My account'],
];

export default function Topbar({ user, newEnquiries, canEnquiries, createLinks }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const menu = useRef(null);
  const section = pathname === '/admin' ? 'Dashboard' : titles.find(([p]) => pathname.startsWith(p))?.[1] || 'Admin';

  useEffect(() => {
    const close = (e) => { if (menu.current && !menu.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-20 hidden border-b border-slate-200/80 bg-white/80 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-8">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate/70">Alight Admin</p>
          <p className="truncate font-display text-sm font-bold text-navy-900">{section}</p>
        </div>

        {canEnquiries && (
          <form role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/admin/enquiries?q=${encodeURIComponent(q)}`); }} className="relative ml-8 w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search enquiries by name, email, reference…" aria-label="Search enquiries"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-14 text-sm text-navy-900 transition focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10" />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate">Enter</kbd>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          {createLinks.length > 0 && (
            <div ref={menu} className="relative">
              <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
                className="inline-flex items-center gap-1.5 rounded-xl bg-crimson-600 px-3.5 py-2 text-sm font-semibold text-white shadow-red transition hover:bg-crimson-500">
                <Plus className="h-4 w-4" /> Create <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    {createLinks.map((l) => (
                      <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-slate-50">{l.label}</Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {canEnquiries && (
            <Link href="/admin/enquiries?status=NEW" aria-label={`${newEnquiries} new enquiries`} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate transition hover:bg-slate-100 hover:text-navy-900">
              <Bell className="h-[18px] w-[18px]" />
              {newEnquiries > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-crimson-600 px-1 text-[9px] font-bold text-white">{newEnquiries > 99 ? '99+' : newEnquiries}</span>}
            </Link>
          )}
          <a href="/" target="_blank" rel="noopener" className="grid h-10 w-10 place-items-center rounded-xl text-slate transition hover:bg-slate-100 hover:text-navy-900" title="View website" aria-label="View website">
            <ExternalLink className="h-[18px] w-[18px]" />
          </a>
          <Link href="/admin/account" className="ml-1 flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-3 transition hover:bg-slate-100">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-crimson-500 to-crimson-600 text-xs font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
            <span className="hidden text-left xl:block"><span className="block text-xs font-semibold text-navy-900">{user.name}</span><span className="block text-[10px] text-slate">{user.roleName}</span></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
