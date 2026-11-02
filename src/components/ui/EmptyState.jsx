import Button from './Button';

export default function EmptyState({ title, body, cta = 'Contact us', href = '/contact' }) {
  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-navy-900/15 px-8 py-16 text-center">
      <p className="font-display text-2xl font-bold text-navy-900">{title}</p>
      <p className="mt-3 text-slate">{body}</p>
      <Button href={href} variant="outline" className="mt-8">{cta}</Button>
    </div>
  );
}
