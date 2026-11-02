'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { loginAction } from '@/lib/admin/auth-actions';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';

const input =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-navy-900 shadow-[inset_0_1px_2px_rgba(7,26,54,0.04)] transition placeholder:text-slate/50 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';
const iconCls = 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60 transition peer-focus:text-brand-blue';

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-5">
      <ActionMessage state={state} />
      <label className="block text-sm font-medium text-navy-900">
        Email
        <span className="relative mt-1.5 block">
          <input name="email" type="email" autoComplete="username" required placeholder="you@alightconsultants.in" className={`peer ${input}`} />
          <Mail className={iconCls} />
        </span>
      </label>
      <label className="block text-sm font-medium text-navy-900">
        Password
        <span className="relative mt-1.5 block">
          <input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required placeholder="••••••••" className={`peer ${input} pr-11`} />
          <Lock className={iconCls} />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate/70 transition hover:bg-slate-100 hover:text-navy-900"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      <SubmitButton
        variant="accent"
        pendingText="Signing in…"
        className="!rounded-xl bg-gradient-to-r from-crimson-600 to-crimson-500 shadow-red transition-all hover:-translate-y-0.5 hover:shadow-red-lg"
        style={{ width: '100%', paddingTop: 12, paddingBottom: 12 }}
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
