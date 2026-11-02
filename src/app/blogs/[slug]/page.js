import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/layout/PageHero';
import JsonLd from '@/components/ui/JsonLd';
import { getBlog, getBlogs } from '@/lib/content';
import { site } from '@/data/site';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = await getBlog(slug);
  if (!b) return {};
  return {
    title: b.seoTitle || b.title,
    description: b.seoDescription || b.excerpt,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: { type: 'article', title: b.title, description: b.excerpt, publishedTime: b.publishedAt?.toISOString() },
  };
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const b = await getBlog(slug);
  if (!b) notFound();
  const related = (await getBlogs(6)).filter((x) => x.slug !== slug && x.categoryId === b.categoryId).slice(0, 3);

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Article', headline: b.title, description: b.excerpt,
        datePublished: b.publishedAt, dateModified: b.updatedAt, image: b.coverUrl ? `${site.url}${b.coverUrl}` : undefined,
        author: { '@type': 'Organization', name: site.name }, publisher: { '@type': 'Organization', name: site.name },
        mainEntityOfPage: `${site.url}/blogs/${slug}`,
      }} />
      <PageHero eyebrow={b.category?.name || 'Insight'} title={b.title} lead={b.excerpt} crumbs={[{ label: 'Blogs', href: '/blogs' }, { label: b.title, href: `/blogs/${slug}` }]} />
      <article className="bg-white py-20">
        {/* Content is stored as plain text with paragraph breaks; rendered as text so stored HTML can never execute. */}
        <div className="container max-w-3xl space-y-6 text-lg leading-relaxed text-ink">
          {b.content.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
        </div>
      </article>
      {related.length > 0 && (
        <section className="bg-surface py-20">
          <div className="container">
            <h2 className="text-2xl font-bold">Related articles</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {related.map((r) => <Link key={r.id} href={`/blogs/${r.slug}`} className="text-lg font-bold hover:text-crimson-600">{r.title}</Link>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
