'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Award, BarChart3, Briefcase, Building2, ExternalLink, FileUser, Inbox, Layers, LayoutDashboard, LogOut,
  Menu, Newspaper, Package, PanelsTopLeft, Quote, ScrollText, Settings, Tags, UserPlus, Users, X, KeyRound,
} from 'lucide-react';
import { logoutAction } from '@/lib/admin/auth-actions';

const icons = { Award, BarChart3, Briefcase, Building2, FileUser, Inbox, Layers, LayoutDashboard, Newspaper, Package, PanelsTopLeft, Quote, ScrollText, Settings, Tags, UserPlus, Users };

export default function Sidebar({ nav, user, badges = {} }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/'));

  const content = (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand-blue/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-crimson-600/15 blur-[80px]" />
      <div className="relative flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/assets/logo/alight-logo-light.svg" alt="Alight" width={64} height={35} unoptimized className="h-9 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Admin</span>
        </Link>
        <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5 text-white/70" /></button>
      </div>

      <nav aria-label="Admin" className="relative flex-1 overflow-y-auto px-3 pb-6 [scrollbar-width:thin]">
        {nav.map((group) => (
          <div key={group.section} className="mt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{group.section}</p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = isActive(item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-[7px] text-[13px] font-medium transition ${active ? 'bg-gradient-to-r from-crimson-600/25 via-white/[0.07] to-white/[0.02] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]' : 'text-white/55 hover:translate-x-0.5 hover:bg-white/[0.05] hover:text-white'}`}
                    >
                      {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-crimson-500 shadow-[0_0_12px_2px_rgba(234,83,97,0.7)]" />}
                      <Icon className={`h-4 w-4 ${active ? 'text-crimson-400' : ''}`} />
                      <span className="flex-1">{item.label}</span>
                      {badges[item.href] > 0 && <span className="rounded-full bg-crimson-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{badges[item.href]}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-crimson-500 to-crimson-600 text-sm font-bold text-white ring-2 ring-white/10 ring-offset-2 ring-offset-[#06142B]">{user.name.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/50">{user.roleName}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1">
          <Link href="/" target="_blank" className="flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] text-white/60 hover:bg-white/5 hover:text-white" title="View website"><ExternalLink className="h-3.5 w-3.5" />Site</Link>
          <Link href="/admin/account" className="flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] text-white/60 hover:bg-white/5 hover:text-white" title="Account"><KeyRound className="h-3.5 w-3.5" />Account</Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-[11px] text-white/60 hover:bg-white/5 hover:text-white"><LogOut className="h-3.5 w-3.5" />Logout</button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100"><Menu className="h-5 w-5" /></button>
        <span className="text-sm font-semibold text-navy-900">Alight Admin</span>
        <span className="w-9" />
      </div>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] bg-gradient-to-b from-[#071A36] via-[#06142B] to-[#050F24] shadow-[4px_0_24px_-12px_rgba(5,15,36,0.5)] lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#06142B]">{content}</aside>
        </div>
      )}
    </>
  );
}
