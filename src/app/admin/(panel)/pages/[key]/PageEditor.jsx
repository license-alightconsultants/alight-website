'use client';

import { useActionState, useState } from 'react';
import { ImageOff, Upload } from 'lucide-react';
import { ActionMessage, SubmitButton } from '@/components/admin/FormBits';
import { ImageField } from '@/components/admin/ResourceForm';
import { Card } from '@/components/admin/ui';
import { BG_PRESETS } from '@/lib/pages/backgrounds';

const control = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';

// Swatches shown next to the preset dropdown (approximate previews of the site classes).
const SWATCH = {
  default: 'repeating-linear-gradient(45deg,#e2e8f0 0 6px,#f8fafc 6px 12px)',
  white: '#ffffff', surface: '#F4F7FB', mist: 'linear-gradient(#EAF2FF,#fff)', warm: 'linear-gradient(135deg,#FFF1F1,#fff,#EEF4FF)',
  navy: '#071A36', midnight: '#050F24', brand: 'linear-gradient(135deg,#050F24,#071A36,#5A0F17)',
  aurora: 'radial-gradient(circle at 20% 20%,rgba(43,108,255,.6),transparent 60%),radial-gradient(circle at 80% 80%,rgba(199,22,28,.6),transparent 60%),#050F24',
};

function ColorInput({ name, value, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate">
      <input type="color" value={value || '#071A36'} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-slate-200 bg-white p-0.5" aria-label={label} />
      <input name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder="#071A36" className={`${control} w-28 font-mono`} />
    </label>
  );
}

function BackgroundField({ field, value = {} }) {
  const [preset, setPreset] = useState(value.preset || 'default');
  const [color, setColor] = useState(value.color || '');
  const [color2, setColor2] = useState(value.color2 || '');
  const [overlay, setOverlay] = useState(value.overlay ?? 60);
  const [preview, setPreview] = useState(value.image || '');
  const n = field.name;

  const swatch = preset === 'custom' ? color : preset === 'gradient' ? `linear-gradient(135deg,${color || '#fff'},${color2 || '#fff'})` : preset === 'image' && preview
    ? `linear-gradient(${field.tone === 'dark' ? `rgba(5,15,36,${overlay / 100}),rgba(5,15,36,${overlay / 100})` : `rgba(255,255,255,${overlay / 100}),rgba(255,255,255,${overlay / 100})`}),url("${preview}") center/cover`
    : SWATCH[preset];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="h-10 w-16 shrink-0 rounded-md ring-1 ring-slate-200" style={{ background: swatch }} />
        <select name={`${n}.preset`} value={preset} onChange={(e) => setPreset(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10">
          {BG_PRESETS[field.tone].map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <span className="text-xs text-slate">{field.tone === 'dark' ? 'Dark section — text stays white' : 'Light section — text stays dark'}</span>
      </div>

      {(preset === 'custom' || preset === 'gradient') && (
        <div className="mt-3 flex flex-wrap gap-4">
          <ColorInput name={`${n}.color`} value={color} onChange={setColor} label="Colour" />
          {preset === 'gradient' && <ColorInput name={`${n}.color2`} value={color2} onChange={setColor2} label="Second colour" />}
        </div>
      )}
      {preset !== 'custom' && preset !== 'gradient' && <><input type="hidden" name={`${n}.color`} value={color} /><input type="hidden" name={`${n}.color2`} value={color2} /></>}

      <div className={preset === 'image' ? 'mt-3 space-y-3' : 'hidden'}>
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white">
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-slate-300" />}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy-900 hover:bg-slate-50">
            <Upload className="h-4 w-4" /> {value.image ? 'Replace image' : 'Upload image'}
            <input type="file" name={`${n}.image`} accept="image/png,image/jpeg,image/webp" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
          </label>
          <span className="text-xs text-slate">JPG / PNG / WebP · max 5 MB · wide images (1920 px) work best</span>
        </div>
        <label className="flex items-center gap-3 text-xs text-slate">
          Shade over the image (keeps text readable)
          <input type="range" min="0" max="95" step="5" name={`${n}.overlay`} value={overlay} onChange={(e) => setOverlay(Number(e.target.value))} className="w-40 accent-crimson-600" />
          <span className="w-10 font-mono">{overlay}%</span>
        </label>
      </div>
    </div>
  );
}

function Field({ f, value }) {
  const id = `f-${f.name}`;
  if (f.type === 'toggle') {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-900 hover:bg-slate-50">
        <input id={id} type="checkbox" name={f.name} defaultChecked={Boolean(value)} className="h-4 w-4 accent-crimson-600" />
        {f.label}
      </label>
    );
  }
  const input = (() => {
    switch (f.type) {
      case 'textarea':
        return <textarea id={id} name={f.name} rows={4} defaultValue={value} className={control} />;
      case 'items':
      case 'lines':
        return <textarea id={id} name={f.name} rows={Math.min(10, Math.max(3, String(value || '').split('\n').length + 1))} defaultValue={value} className={`${control} font-mono text-[13px] leading-relaxed`} />;
      case 'image':
        return <ImageField field={{ name: f.name }} value={value} />;
      case 'background':
        return <BackgroundField field={f} value={value} />;
      default:
        return <input id={id} name={f.name} defaultValue={value} className={control} />;
    }
  })();
  const hint = f.hint || (f.type === 'items' ? 'One per line: Title | Description' : f.type === 'lines' ? 'One per line' : null);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-navy-900">{f.label}</label>
      {input}
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
    </div>
  );
}

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const isWide = (f) => ['textarea', 'items', 'lines', 'image', 'background'].includes(f.type);

export default function PageEditor({ groups, values, action }) {
  const [state, formAction] = useActionState(action, null);
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav aria-label="Sections" className="hidden lg:block">
        <ul className="sticky top-6 space-y-0.5 text-sm">
          {groups.map((g) => (
            <li key={g.title}><a href={`#${slug(g.title)}`} className="block rounded-md px-3 py-1.5 text-slate hover:bg-white hover:text-navy-900">{g.title}</a></li>
          ))}
        </ul>
      </nav>
      <form action={formAction} className="min-w-0 space-y-6">
        <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-navy-800">
          Tip: wrap words in <code className="rounded bg-white px-1">*asterisks*</code> to highlight them. You can use
          {' '}<code className="rounded bg-white px-1">{'{company}'}</code> <code className="rounded bg-white px-1">{'{email}'}</code> <code className="rounded bg-white px-1">{'{phone}'}</code>
          {' '}<code className="rounded bg-white px-1">{'{careersEmail}'}</code> <code className="rounded bg-white px-1">{'{quoteEmail}'}</code> — they are filled from Website settings.
        </p>
        {groups.map((g) => (
          <div key={g.title} id={slug(g.title)} className="scroll-mt-6">
            <Card title={g.title}>
              <div className="grid gap-5 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <div key={f.name} className={isWide(f) || f.type === 'toggle' ? 'sm:col-span-2' : ''}>
                    <Field f={f} value={values[f.name]} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ))}
        <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <SubmitButton variant="accent">Save page</SubmitButton>
          <div className="flex-1"><ActionMessage state={state} /></div>
        </div>
      </form>
    </div>
  );
}
