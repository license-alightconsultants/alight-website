'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { consultationSchema, consultationSteps, fieldErrors } from '@/lib/validation';
import { services } from '@/data/services';
import { products } from '@/data/products';
import { industries } from '@/data/industries';
import { Field, Honeypot, inputProps, submitEnquiry } from './Field';
import SuccessPanel from './SuccessPanel';

const sizes = ['1–10', '11–50', '51–200', '201–1000', '1000+'];
const budgets = ['Under ₹5 Lakh', '₹5–15 Lakh', '₹15–50 Lakh', '₹50 Lakh+', 'Not sure yet'];
const timelines = ['Immediately', 'Within 1 month', '1–3 months', '3–6 months', 'Exploring'];

function Choice({ options, value, onChange, name }) {
  return (
    <div role="radiogroup" aria-labelledby={`${name}-label`} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onChange(o)}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${value === o ? 'border-navy-900 bg-navy-900 text-white' : 'border-navy-900/10 bg-white text-navy-900 hover:border-navy-900/40'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function ConsultationForm() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [hp, setHp] = useState('');
  const startedAt = useRef(0);
  const [v, setV] = useState({
    name: '', email: '', mobile: '', company: '', designation: '', companySize: '', industry: '',
    service: params.get('service') || '', product: params.get('product') || '',
    message: '', budget: '', timeline: '', consent: false,
  });

  useEffect(() => { startedAt.current = Date.now(); }, []);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }));

  function validateStep(i) {
    const parsed = consultationSchema.safeParse({ ...v, website: hp });
    if (parsed.success) return true;
    const all = fieldErrors(parsed.error);
    const stepErrors = Object.fromEntries(Object.entries(all).filter(([k]) => consultationSteps[i].fields.includes(k)));
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  const next = () => { if (validateStep(step)) { setDir(1); setStep((s) => s + 1); } };
  const back = () => { setErrors({}); setDir(-1); setStep((s) => s - 1); };

  async function submit() {
    if (!validateStep(step)) return;
    setStatus('loading');
    const { ok, data } = await submitEnquiry({ ...v, type: 'CONSULTATION', sourcePage: pathname, website: hp, startedAt: startedAt.current });
    if (ok) { setReference(data.reference); setStatus('success'); }
    else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong.');
      if (data.fields) {
        setErrors(data.fields);
        const first = consultationSteps.findIndex((s) => s.fields.some((f) => data.fields[f]));
        if (first >= 0) setStep(first);
      }
    }
  }

  if (status === 'success') return <SuccessPanel reference={reference} />;

  const review = [
    ['Name', v.name], ['Email', v.email], ['Mobile', v.mobile], ['Company', v.company], ['Designation', v.designation],
    ['Company size', v.companySize], ['Industry', v.industry], ['Service', v.service], ['Product', v.product],
    ['Budget', v.budget], ['Timeline', v.timeline],
  ].filter(([, x]) => x);

  return (
    <div className="relative">
      <Honeypot value={hp} onChange={(e) => setHp(e.target.value)} />

      <ol className="flex gap-2" aria-label="Progress">
        {consultationSteps.map((s, i) => (
          <li key={s.id} className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-navy-900/10">
              <motion.div className="h-full bg-crimson-600" initial={false} animate={{ width: i <= step ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
            </div>
            <p className={`mt-2 hidden text-xs font-medium md:block ${i === step ? 'text-navy-900' : 'text-slate/70'}`} aria-current={i === step ? 'step' : undefined}>
              {i + 1}. {s.title}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs font-medium text-slate md:hidden">Step {step + 1} of {consultationSteps.length}: {consultationSteps[step].title}</p>

      <div className="relative mt-10 min-h-[340px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <h3 className="text-2xl font-bold sm:col-span-2">How can we reach you?</h3>
                <div className="sm:col-span-2"><Field label="Full name" name="name" required error={errors.name}><input {...inputProps('name', errors)} autoComplete="name" value={v.name} onChange={set('name')} /></Field></div>
                <Field label="Work email" name="email" required error={errors.email}><input {...inputProps('email', errors)} type="email" autoComplete="email" value={v.email} onChange={set('email')} /></Field>
                <Field label="Mobile" name="mobile" required error={errors.mobile}><input {...inputProps('mobile', errors)} type="tel" autoComplete="tel" value={v.mobile} onChange={set('mobile')} /></Field>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <h3 className="text-2xl font-bold sm:col-span-2">Tell us about your organisation.</h3>
                <Field label="Company / organisation" name="company" required error={errors.company}><input {...inputProps('company', errors)} autoComplete="organization" value={v.company} onChange={set('company')} /></Field>
                <Field label="Designation" name="designation" error={errors.designation}><input {...inputProps('designation', errors)} value={v.designation} onChange={set('designation')} /></Field>
                <div className="sm:col-span-2">
                  <p id="companySize-label" className="label">Organisation size</p>
                  <Choice name="companySize" options={sizes} value={v.companySize} onChange={set('companySize')} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Industry" name="industry" error={errors.industry}>
                    <select {...inputProps('industry', errors)} value={v.industry} onChange={set('industry')}>
                      <option value="">Select industry</option>
                      {industries.map((i) => <option key={i.slug}>{i.name}</option>)}
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 className="text-2xl font-bold">What do you need help with?</h3>
                <div role="radiogroup" className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[...services.map((s) => s.title), 'Hire Developers', 'Ready-made Product'].map((title) => (
                    <button key={title} type="button" role="radio" aria-checked={v.service === title} onClick={() => set('service')(title)}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${v.service === title ? 'border-crimson-600 bg-crimson-600/5 text-navy-900' : 'border-navy-900/10 hover:border-navy-900/30'}`}>
                      {title}
                      <span className={`grid h-5 w-5 place-items-center rounded-full border ${v.service === title ? 'border-crimson-600 bg-crimson-600 text-white' : 'border-navy-900/20'}`}>{v.service === title && <Check className="h-3 w-3" />}</span>
                    </button>
                  ))}
                </div>
                {errors.service && <p role="alert" className="mt-3 text-xs font-medium text-crimson-600">{errors.service}</p>}
                {v.service === 'Ready-made Product' && (
                  <div className="mt-6">
                    <Field label="Which product?" name="product">
                      <select {...inputProps('product', errors)} value={v.product} onChange={set('product')}>
                        <option value="">Select a product</option>
                        {products.map((p) => <option key={p.slug}>{p.name}</option>)}
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 className="text-2xl font-bold">Describe your project.</h3>
                <p className="mt-2 text-slate">Goals, current challenges, users, integrations — whatever helps us understand the scope.</p>
                <div className="mt-6"><Field label="Project requirements" name="message" required error={errors.message}><textarea {...inputProps('message', errors)} rows={8} value={v.message} onChange={set('message')} /></Field></div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold">Budget and timeline</h3>
                <div><p id="budget-label" className="label">Estimated budget</p><Choice name="budget" options={budgets} value={v.budget} onChange={set('budget')} /></div>
                <div><p id="timeline-label" className="label">When would you like to start?</p><Choice name="timeline" options={timelines} value={v.timeline} onChange={set('timeline')} /></div>
              </div>
            )}
            {step === 5 && (
              <div>
                <h3 className="text-2xl font-bold">Review and submit</h3>
                <dl className="mt-6 grid gap-x-8 gap-y-3 rounded-2xl bg-surface p-6 sm:grid-cols-2">
                  {review.map(([k, x]) => (
                    <div key={k}><dt className="text-xs uppercase tracking-wider text-slate">{k}</dt><dd className="font-medium text-navy-900">{x}</dd></div>
                  ))}
                  <div className="sm:col-span-2"><dt className="text-xs uppercase tracking-wider text-slate">Requirements</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-navy-900">{v.message}</dd></div>
                </dl>
                <label className="mt-6 flex items-start gap-3 text-sm text-slate">
                  <input type="checkbox" checked={v.consent} onChange={set('consent')} className="mt-1 h-4 w-4 accent-crimson-600" />
                  <span>I agree that Alight Consultants may store and use these details to respond to my request, as described in the <a href="/privacy-policy" className="font-medium text-navy-900 underline">privacy policy</a>.</span>
                </label>
                {errors.consent && <p role="alert" className="mt-1.5 text-xs font-medium text-crimson-600">{errors.consent}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {status === 'error' && <p role="alert" className="mt-6 rounded-xl bg-crimson-600/5 px-4 py-3 text-sm text-crimson-600">{message}</p>}

      <div className="mt-10 flex items-center justify-between border-t border-navy-900/10 pt-6">
        <button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 disabled:invisible">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < consultationSteps.length - 1 ? (
          <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={status === 'loading'} className="inline-flex items-center gap-2 rounded-full bg-crimson-600 px-7 py-3.5 text-sm font-semibold text-white shadow-red transition hover:bg-crimson-500 disabled:opacity-60">
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
          </button>
        )}
      </div>
    </div>
  );
}
