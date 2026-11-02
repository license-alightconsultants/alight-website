'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Field, Honeypot, inputProps } from './Field';

export default function ApplyForm({ jobId, jobTitle }) {
  const [v, setV] = useState({ name: '', email: '', mobile: '', resumeUrl: '', coverNote: '' });
  const [hp, setHp] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/careers/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...v, jobId, website: hp }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return setStatus('success');
    setErrors(data.fields || {});
    setMessage(data.error || 'Something went wrong.');
    setStatus('error');
  }

  if (status === 'success') {
    return <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Thank you — your application for {jobTitle} has been received.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative mt-6 grid gap-4 rounded-2xl bg-surface p-6 sm:grid-cols-2">
      <Honeypot value={hp} onChange={(e) => setHp(e.target.value)} />
      <Field label="Full name" name={`name-${jobId}`} required error={errors.name}><input {...inputProps('name', errors)} id={`name-${jobId}`} value={v.name} onChange={set('name')} autoComplete="name" /></Field>
      <Field label="Email" name={`email-${jobId}`} required error={errors.email}><input {...inputProps('email', errors)} id={`email-${jobId}`} type="email" value={v.email} onChange={set('email')} autoComplete="email" /></Field>
      <Field label="Mobile" name={`mobile-${jobId}`} required error={errors.mobile}><input {...inputProps('mobile', errors)} id={`mobile-${jobId}`} type="tel" value={v.mobile} onChange={set('mobile')} autoComplete="tel" /></Field>
      <Field label="Link to your CV" name={`resume-${jobId}`} required error={errors.resumeUrl} hint="Google Drive, OneDrive or LinkedIn link"><input {...inputProps('resumeUrl', errors)} id={`resume-${jobId}`} type="url" placeholder="https://" value={v.resumeUrl} onChange={set('resumeUrl')} /></Field>
      <div className="sm:col-span-2"><Field label="Cover note" name={`note-${jobId}`} error={errors.coverNote}><textarea {...inputProps('coverNote', errors)} id={`note-${jobId}`} rows={3} value={v.coverNote} onChange={set('coverNote')} /></Field></div>
      {status === 'error' && <p role="alert" className="text-sm text-crimson-600 sm:col-span-2">{message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'loading'} className="inline-flex items-center gap-2 rounded-full bg-crimson-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />} Submit application
        </button>
      </div>
    </form>
  );
}
