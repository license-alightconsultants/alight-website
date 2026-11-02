import { resolveBg } from '@/lib/pages/backgrounds';

/**
 * A page section whose background can be changed in Admin → Pages.
 * `fallback` is the design's own background class, used while the editor keeps "Design default".
 */
export default function Section({ as: Tag = 'section', bg, tone = 'light', fallback = '', className = '', children, ...rest }) {
  const r = resolveBg(bg, tone);
  return (
    <Tag className={`relative isolate ${r.custom ? r.className : fallback} ${className}`} style={r.style} {...rest}>
      {r.overlay && <div aria-hidden className="absolute inset-0 -z-10" style={{ background: r.overlay }} />}
      {children}
    </Tag>
  );
}
