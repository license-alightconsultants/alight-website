// Background presets for editable page sections. Light sections keep dark text, dark sections keep
// white text, so editors can restyle a section without making its text unreadable.

export const BG_PRESETS = {
  light: [
    { value: 'default', label: 'Design default' },
    { value: 'white', label: 'White' },
    { value: 'surface', label: 'Light grey' },
    { value: 'mist', label: 'Soft blue fade' },
    { value: 'warm', label: 'Soft red-blue tint' },
    { value: 'custom', label: 'Custom colour' },
    { value: 'gradient', label: 'Custom gradient (2 colours)' },
    { value: 'image', label: 'Image' },
  ],
  dark: [
    { value: 'default', label: 'Design default' },
    { value: 'navy', label: 'Navy' },
    { value: 'midnight', label: 'Midnight' },
    { value: 'brand', label: 'Navy to crimson' },
    { value: 'aurora', label: 'Aurora glow' },
    { value: 'custom', label: 'Custom colour' },
    { value: 'gradient', label: 'Custom gradient (2 colours)' },
    { value: 'image', label: 'Image' },
  ],
};

const PRESET_CLASS = {
  white: 'bg-white',
  surface: 'bg-surface',
  mist: 'bg-gradient-to-b from-[#EAF2FF] to-white',
  warm: 'bg-gradient-to-br from-[#FFF1F1] via-white to-[#EEF4FF]',
  navy: 'bg-navy-900',
  midnight: 'bg-navy-950',
  brand: 'bg-gradient-to-br from-navy-950 via-navy-900 to-[#5A0F17]',
  aurora: 'bg-navy-950 bg-[radial-gradient(ellipse_at_15%_20%,rgba(43,108,255,0.35),transparent_55%),radial-gradient(ellipse_at_85%_80%,rgba(199,22,28,0.35),transparent_55%)]',
};

export const HEX = /^#[0-9a-f]{6}$/i;
// Local uploads (/uploads/folder/file) or Vercel Blob uploads. The strict character set keeps the value safe
// to place inside a CSS url("...").
export const isUploadUrl = (u) =>
  typeof u === 'string' &&
  (/^\/uploads\/[a-z0-9-]+\/[a-z0-9.-]+$/i.test(u) || /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[a-z0-9-]+\/[a-z0-9.-]+$/i.test(u));

/**
 * Resolves a stored background ({ preset, color, color2, image, overlay }) into a class, inline style
 * and optional overlay. Returns `custom: false` for the design default so callers keep their own styling.
 */
export function resolveBg(bg, tone = 'light') {
  const preset = bg?.preset || 'default';
  if (preset === 'default') return { custom: false, className: '', style: undefined, overlay: null };
  if (PRESET_CLASS[preset]) return { custom: true, className: PRESET_CLASS[preset], style: undefined, overlay: null };
  if (preset === 'custom' && HEX.test(bg.color || '')) return { custom: true, className: '', style: { backgroundColor: bg.color }, overlay: null };
  if (preset === 'gradient' && HEX.test(bg.color || '') && HEX.test(bg.color2 || '')) {
    return { custom: true, className: '', style: { backgroundImage: `linear-gradient(135deg, ${bg.color}, ${bg.color2})` }, overlay: null };
  }
  if (preset === 'image' && isUploadUrl(bg.image)) {
    const o = Math.min(95, Math.max(0, Number(bg.overlay ?? 60))) / 100;
    return {
      custom: true,
      className: tone === 'dark' ? 'bg-navy-950' : 'bg-white',
      style: { backgroundImage: `url("${bg.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' },
      overlay: tone === 'dark' ? `rgba(5,15,36,${o})` : `rgba(255,255,255,${o})`,
    };
  }
  return { custom: false, className: '', style: undefined, overlay: null };
}
