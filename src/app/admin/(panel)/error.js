'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({ error, reset }) {
  const expired = /session has expired/i.test(error?.message || '');
  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
      <h1 className="mt-4 font-display text-lg font-bold text-navy-900">{expired ? 'Session expired' : 'Something went wrong'}</h1>
      <p className="mt-2 text-sm text-slate">{expired ? 'Please sign in again to continue.' : 'The action could not be completed. If this keeps happening, check the server logs.'}</p>
      <div className="mt-6 flex justify-center gap-2">
        {expired ? (
          <Link href="/admin/login" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white">Sign in</Link>
        ) : (
          <button type="button" onClick={reset} className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white">Try again</button>
        )}
      </div>
    </div>
  );
}
