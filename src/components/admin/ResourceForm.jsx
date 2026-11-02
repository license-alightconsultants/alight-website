'use client';

import { useActionState, useRef, useState } from 'react';
import { ImageOff, Upload } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { ActionMessage, SubmitButton } from './FormBits';
import { Card } from './ui';

const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 transition focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';
const errInput = 'border-red-300 focus:border-red-400 focus:ring-red-100';

function toLocalInput(d) {
  if (!d) return '';
  const date = new Date(d);
  const off = date.getTimezoneOffset() * 60000;
  return new Date(date - off).toISOString().slice(0, 16);
}

export function ImageField({ field, value, error }) {
  const [preview, setPreview] = useState(value || '');
  const [removed, setRemoved] = useState(false);
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {preview && !removed ? <img src={preview} alt="" className="h-full w-full object-contain" /> : <ImageOff className="h-6 w-6 text-slate-300" />}
      </div>
      <div className="space-y-2 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 font-medium text-navy-900 hover:bg-slate-50">
          <Upload className="h-4 w-4" /> Choose image
          <input type="file" name={field.name} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); setRemoved(false); } }} />
        </label>
        <p className="text-xs text-slate">PNG, JPG, WebP, GIF or SVG · max 5 MB</p>
        {value && (
          <label className="flex items-center gap-2 text-xs text-slate">
            <input type="checkbox" name={`${field.name}__remove`} onChange={(e) => setRemoved(e.target.checked)} /> Remove current image
          </label>
        )}
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function GalleryField({ field, images = [] }) {
  const [count, setCount] = useState(0);
  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-lg border border-slate-200">
              <img src={img.url} alt={img.alt} className="h-32 w-full bg-slate-50 object-contain" />
              <div className="space-y-2 p-2.5">
                <input name={`${field.name}__alt_${img.id}`} defaultValue={img.alt} aria-label="Alt text" placeholder="Alt text" className={`${input} py-1.5 text-xs`} />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate">{i === 0 ? 'Cover' : `Screenshot ${i}`}</span>
                  <label className="flex items-center gap-1 text-red-600"><input type="checkbox" name={`${field.name}__delete`} value={img.id} /> Delete</label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-navy-900 hover:bg-slate-50">
        <Upload className="h-4 w-4" /> Add images
        <input type="file" multiple name={`${field.name}__new`} accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => setCount(e.target.files?.length || 0)} />
      </label>
      {count > 0 && <span className="ml-3 text-xs text-slate">{count} file(s) will be uploaded on save</span>}
      <p className="text-xs text-slate">The first image is used as the cover. Add descriptive alt text for accessibility and SEO.</p>
    </div>
  );
}

function FieldControl({ field, value, error, values, setValues, extra }) {
  const common = { id: field.name, name: field.name, 'aria-invalid': error ? true : undefined, className: `${input} ${error ? errInput : ''}` };
  switch (field.type) {
    case 'textarea':
      return <textarea {...common} rows={3} defaultValue={value ?? ''} maxLength={field.max} />;
    case 'longtext':
      return <textarea {...common} rows={10} defaultValue={value ?? ''} maxLength={field.max} className={`${common.className} font-mono text-[13px] leading-relaxed`} />;
    case 'number':
      return <input {...common} type="number" min="0" step="1" defaultValue={value ?? ''} />;
    case 'url':
      return <input {...common} type="url" placeholder="https://" defaultValue={value ?? ''} />;
    case 'datetime':
      return <input {...common} type="datetime-local" defaultValue={toLocalInput(value)} />;
    case 'select':
      return (
        <select {...common} defaultValue={value ?? field.default ?? ''}>
          {!field.required && <option value="">—</option>}
          {field.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case 'relation':
      return (
        <select {...common} defaultValue={value ?? ''}>
          <option value="">— None —</option>
          {(extra.options?.[field.name] || []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      );
    case 'lines':
      return <textarea {...common} rows={6} defaultValue={(value || []).join('\n')} />;
    case 'image':
      return <ImageField field={field} value={value} error={error} />;
    case 'gallery':
      return <GalleryField field={field} images={value} />;
    case 'slug':
      return (
        <div className="flex items-center rounded-lg border border-slate-200 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10">
          <span className="pl-3 text-sm text-slate">/</span>
          <input id={field.name} name={field.name} value={values[field.name] ?? ''} placeholder="auto-generated"
            onChange={(e) => setValues((v) => ({ ...v, [field.name]: slugify(e.target.value), __slugTouched: true }))}
            className="w-full rounded-lg bg-transparent px-1 py-2 text-sm text-navy-900 focus:outline-none" />
        </div>
      );
    default: {
      // Text inputs that feed a slug keep it in sync until the slug is edited manually.
      const feedsSlug = extra.slugField?.from === field.name;
      return (
        <input {...common} type="text" maxLength={field.max} defaultValue={value ?? field.default ?? ''}
          onChange={feedsSlug ? (e) => setValues((v) => (v.__slugTouched || extra.isEdit ? v : { ...v, [extra.slugField.name]: slugify(e.target.value) })) : undefined} />
      );
    }
  }
}

export default function ResourceForm({ config, action, initial: saved = {}, options = {}, isEdit }) {
  const [state, formAction] = useActionState(action, null);
  const initial = state?.values ? { ...saved, ...state.values } : saved;
  const slugField = config.fields.find((f) => f.type === 'slug');
  const [values, setValues] = useState(slugField ? { [slugField.name]: initial[slugField.name] || '' } : {});
  const formRef = useRef(null);
  const errors = state?.errors || {};

  const main = config.fields.filter((f) => !f.group && f.type !== 'checkbox');
  const flags = config.fields.filter((f) => f.type === 'checkbox');
  const seoFields = config.fields.filter((f) => f.group === 'SEO');
  const extra = { options, slugField, isEdit };

  const renderField = (f) => (
    <div key={f.name} className={['longtext', 'gallery', 'lines', 'image'].includes(f.type) || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label htmlFor={f.name} className="mb-1.5 block text-[13px] font-medium text-navy-900">
        {f.label} {f.required && <span className="text-crimson-600">*</span>}
      </label>
      <FieldControl field={f} value={initial[f.name]} error={errors[f.name]} values={values} setValues={setValues} extra={extra} />
      {f.hint && <p className="mt-1 text-xs text-slate">{f.hint}</p>}
      {errors[f.name] && f.type !== 'image' && <p className="mt-1 text-xs font-medium text-red-600">{errors[f.name]}</p>}
    </div>
  );

  return (
    <form ref={formRef} key={state?.values ? JSON.stringify(state) : 'initial'} action={formAction} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card title="Details"><div className="grid gap-5 sm:grid-cols-2">{main.map(renderField)}</div></Card>
        {seoFields.length > 0 && <Card title="Search engine optimisation"><div className="grid gap-5">{seoFields.map(renderField)}</div></Card>}
      </div>
      <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        {flags.length > 0 && (
          <Card title="Visibility">
            <div className="space-y-3">
              {flags.map((f) => (
                <label key={f.name} className="flex items-start gap-2.5 text-sm text-navy-900">
                  <input type="checkbox" name={f.name} defaultChecked={initial[f.name] ?? f.default ?? false} className="mt-0.5 h-4 w-4 accent-crimson-600" />
                  <span>{f.label}{f.hint && <span className="block text-xs text-slate">{f.hint}</span>}</span>
                </label>
              ))}
            </div>
          </Card>
        )}
        <Card>
          <div className="space-y-3">
            <ActionMessage state={state} />
            <SubmitButton variant="accent">{isEdit ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}</SubmitButton>
          </div>
        </Card>
      </div>
    </form>
  );
}
