import Link from 'next/link';
import PageHero from '@/components/layout/PageHero';
import EmptyState from '@/components/ui/EmptyState';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { getBlogs } from '@/lib/content';
import Section from '@/components/ui/Section';
import { getPage, heroProps, pageMetadata } from '@/lib/pages';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('blogs');

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function BlogsPage() {
  const [blogs, c] = await Promise.all([getBlogs(), getPage('blogs')]);
  const [lead, ...rest] = blogs;
  return (
    <>
      <PageHero icon="Newspaper" layers={['Insights', 'Technology', 'News']} {...heroProps(c)} crumbs={[{ label: 'Blogs', href: '/blogs' }]} />
      <Section bg={c['list.bg']} fallback="bg-white" className="py-24">
        <div className="container">
          {!lead ? (
            <EmptyState title={c['empty.title']} body={c['empty.body']} cta="Contact us" />
          ) : (
            <>
              <Link href={`/blogs/${lead.slug}`} className="group grid overflow-hidden rounded-[2rem] bg-navy-900 text-white lg:grid-cols-2">
                <div className="relative min-h-[260px] bg-grid [background-size:32px_32px]">{lead.coverUrl && <img src={lead.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}</div>
                <div className="p-10 lg:p-14">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson-400">{lead.category?.name || 'Insight'} · {fmt(lead.publishedAt)}</span>
                  <h2 className="mt-4 text-display-md font-bold text-white group-hover:underline">{lead.title}</h2>
                  {lead.excerpt && <p className="mt-4 text-white/65">{lead.excerpt}</p>}
                </div>
              </Link>
              <Stagger className="mt-10 grid gap-8 md:grid-cols-3">
                {rest.map((b) => (
                  <StaggerItem key={b.id}>
                    <Link href={`/blogs/${b.slug}`} className="group block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson-600">{b.category?.name || 'Insight'} · {fmt(b.publishedAt)}</span>
                      <h3 className="mt-3 text-xl font-bold group-hover:text-crimson-600">{b.title}</h3>
                      {b.excerpt && <p className="mt-2 text-sm text-slate">{b.excerpt}</p>}
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
