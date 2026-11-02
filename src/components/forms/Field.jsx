export function Field({ label, name, error, required, children, hint }) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-crimson-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate">{hint}</p>}
      {error && <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs font-medium text-crimson-600">{error}</p>}
    </div>
  );
}

export const inputProps = (name, errors) => ({
  id: name,
  name,
  'aria-invalid': Boolean(errors[name]) || undefined,
  'aria-describedby': errors[name] ? `${name}-error` : undefined,
  className: `field ${errors[name] ? 'field-error' : ''}`,
});

// Hidden from humans; bots tend to fill every field.
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
    </div>
  );
}

export async function submitEnquiry(payload) {
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}
