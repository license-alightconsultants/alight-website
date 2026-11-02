import { Reveal } from './Reveal';
import Accent from './Accent';

export default function SectionHeading({ eyebrow, title, lead, align = 'left', dark = false, className = '' }) {
  const center = align === 'center';
  return (
    <Reveal className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && <span className={`eyebrow ${dark ? 'eyebrow-light' : ''}`}>{eyebrow}</span>}
      <h2 className={`mt-4 text-display-lg font-bold ${dark ? 'text-white' : ''}`}><Accent text={title} accentClass={dark ? 'text-gradient' : 'text-gradient-red'} /></h2>
      {lead && <p className={`mt-5 text-lg leading-relaxed ${dark ? 'text-white/65' : 'text-slate'}`}>{lead}</p>}
    </Reveal>
  );
}
