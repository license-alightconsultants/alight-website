'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';
import { contactSchema, fieldErrors } from '@/lib/validation';
import { services } from '@/data/services';
import { Field, Honeypot, inputProps, submitEnquiry } from './Field';
import SuccessPanel from './SuccessPanel';

const empty = { name: '', company: '', email: '', mobile: '', service: '', product: '', subject: '', message: '', consent: false };

export default function ContactForm({ defaultService = '', defaultProduct = '' }) {
  const pathname = usePathname();
  const [values, setValues] = useState({ ...empty, service: defaultService, product: defaultProduct });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [hp, setHp] = useState('');
  const startedAt = useRef(0);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    const payload = { ...values, type: 'CONTACT', sourcePage: pathname, website: hp, startedAt: startedAt.current };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setStatus('loading');
    const { ok, data } = await submitEnquiry(payload);
    if (ok) {
      setReference(data.reference);
      setStatus('success');
    } else {
      setErrors(data.fields || {});
      setMessage(data.error || 'Something went wrong.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return <SuccessPanel reference={reference} onReset={() => { setValues(empty); setStatus('idle'); startedAt.current = Date.now(); }} />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot value={hp} onChange={(e) => setHp(e.target.value)} />
      <Field label="Full name" name="name" required error={errors.name}>
        <input {...inputProps('name', errors)} autoComplete="name" value={values.name} onChange={set('name')} />
      </Field>
      <Field label="Company" name="company" error={errors.company}>
        <input {...inputProps('company', errors)} autoComplete="organization" value={values.company} onChange={set('company')} />
      </Field>
      <Field label="Email" name="email" required error={errors.email}>
        <input {...inputProps('email', errors)} type="email" autoComplete="email" value={values.email} onChange={set('email')} />
      </Field>
      <Field label="Mobile" name="mobile" required error={errors.mobile}>
        <input {...inputProps('mobile', errors)} type="tel" autoComplete="tel" value={values.mobile} onChange={set('mobile')} />
      </Field>
      <Field label="Service of interest" name="service" error={errors.service}>
        <select {...inputProps('service', errors)} value={values.service} onChange={set('service')}>
          <option value="">Select a service</option>
          {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
          <option value="Hire Developers">Hire Developers</option>
          <option value="Product Enquiry">Product Enquiry</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <Field label="Subject" name="subject" required error={errors.subject}>
        <input {...inputProps('subject', errors)} value={values.subject} onChange={set('subject')} placeholder={defaultProduct ? `Enquiry about ${defaultProduct}` : ''} />
      </Field>
      {defaultProduct && (
        <p className="rounded-xl bg-surface px-4 py-3 text-sm text-slate sm:col-span-2">Product: <strong className="text-navy-900">{defaultProduct}</strong></p>
      )}
      <div className="sm:col-span-2">
        <Field label="Message" name="message" required error={errors.message}>
          <textarea {...inputProps('message', errors)} rows={5} value={values.message} onChange={set('message')} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-slate">
          <input type="checkbox" checked={values.consent} onChange={set('consent')} className="mt-1 h-4 w-4 rounded border-navy-900/20 accent-crimson-600" />
          <span>I agree that Alight Consultants may store and use these details to respond to my enquiry, as described in the <a href="/privacy-policy" className="font-medium text-navy-900 underline">privacy policy</a>.</span>
        </label>
        {errors.consent && <p role="alert" className="mt-1.5 text-xs font-medium text-crimson-600">{errors.consent}</p>}
      </div>
      {status === 'error' && <p role="alert" className="rounded-xl bg-crimson-600/5 px-4 py-3 text-sm text-crimson-600 sm:col-span-2">{message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'loading'} className="inline-flex items-center gap-2 rounded-full bg-crimson-600 px-8 py-4 font-semibold text-white shadow-red transition hover:bg-crimson-500 disabled:opacity-60">
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {status === 'loading' ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
    </form>
  );
}
