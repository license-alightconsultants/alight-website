'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { buttonClass } from './ui';

export function SubmitButton({ children, variant = 'primary', size, pendingText = 'Saving…', className = '', ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${buttonClass(variant, size)} ${className}`} {...props}>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}

/** Submit button that asks for confirmation first (used for deletes). */
export function ConfirmButton({ message = 'Are you sure?', children, variant = 'danger', size = 'sm', ...props }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
      className={buttonClass(variant, size)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionMessage({ state }) {
  if (!state?.error && !state?.message) return null;
  const err = Boolean(state.error);
  return (
    <div role={err ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${err ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
      {err ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      {state.error || state.message}
    </div>
  );
}

const flashes = { saved: 'Changes saved.', deleted: 'Item deleted.', denied: 'You don’t have permission to open that page.' };

/** Shows a short-lived toast for ?saved=1 / ?deleted=1 / ?denied=1, then cleans the URL. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const key = Object.keys(flashes).find((k) => params.get(k));
  const [visible, setVisible] = useState(Boolean(key));

  useEffect(() => {
    if (!key) return;
    setVisible(true);
    const next = new URLSearchParams(params);
    next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!visible || !key) return null;
  const err = key === 'denied';
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${err ? 'bg-red-600 text-white' : 'bg-navy-900 text-white'}`}>
      {err ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
      {flashes[key]}
    </div>
  );
}
