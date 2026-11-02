/**
 * Renders editor text where *words in asterisks* are highlighted, e.g. "Meets *Business* Transformation."
 * `accentClass` styles the highlighted part.
 */
export default function Accent({ text = '', accentClass = 'text-crimson-600' }) {
  const parts = String(text).split(/\*([^*]+)\*/g);
  return parts.map((p, i) => (i % 2 ? <span key={i} className={accentClass}>{p}</span> : p));
}

/** Plain text with the highlight markers removed (for metadata, alt text, etc.). */
export const plain = (text = '') => String(text).replace(/\*([^*]+)\*/g, '$1');
