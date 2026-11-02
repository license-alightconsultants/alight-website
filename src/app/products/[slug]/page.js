import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Check } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import ProductVisual from '@/components/products/ProductVisual';
import ContactForm from '@/components/forms/ContactForm';
import Button from '@/components/ui/Button';
import JsonLd from '@/components/ui/JsonLd';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { categoryLabel, products as staticProducts } from '@/data/products';
import { getIndustries, getProducts } from '@/lib/content';
import { site } from '@/data/site';

export const revalidate = 300;
export const generateStaticParams = () => staticProducts.map((p) => ({ slug: p.slug }));

async function load(slug) {
  const all = await getProducts();
  return { product: all.find((p) => p.slug === slug), all };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await load(slug);
  if (!product) return {};
  return {
    title: product.seoTitle || `${product.name} (${product.short})`,
    description: product.seoDescription || product.summary,
    alternates: { canonical: `/products/${slug}` },
    openGraph: { title: product.name, description: product.summary },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product, all } = await load(slug);
  if (!product) notFound();

  const related = all.filter((p) => p.category === product.category && p.slug !== slug).slice(0, 3);
  const industries = await getIndustries();
  const usedIn = industries.filter((i) => i.products.includes(slug));

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: product.name,
        applicationCategory: 'BusinessApplication', description: product.summary,
        url: `${site.url}/products/${slug}`, publisher: { '@type': 'Organization', name: site.name },
      }} />
      <PageHero
        eyebrow={categoryLabel(product.category)}
        title={product.name}
        lead={product.summary}
        crumbs={[{ label: 'Products', href: '/products' }, { label: product.short || product.name, href: `/products/${slug}` }]}
        aside={<ProductVisual product={product} dark className="h-72 shadow-glow" />}
      >
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#enquire">Request a demo</Button>
          <Button href={`/request-consultation?service=${encodeURIComponent('Ready-made Product')}&product=${encodeURIComponent(product.name)}`} variant="ghostLight">Plan an implementation</Button>
        </div>
      </PageHero>

      <section className="bg-white py-24">
        <div className="container grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <span className="eyebrow">Capabilities</span>
            <h2 className="mt-4 text-display-md font-bold">What {product.short || product.name} does</h2>
            {product.description && <p className="mt-6 text-lg leading-relaxed text-slate">{product.description}</p>}
            {usedIn.length > 0 && (
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate">Used in</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {usedIn.map((i) => <Link key={i.slug} href={`/industries/${i.slug}`} className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-navy-900 hover:bg-navy-900 hover:text-white">{i.name}</Link>)}
                </div>
              </div>
            )}
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {product.features.map((f, i) => (
              <StaggerItem key={f} className="rounded-2xl border border-navy-900/10 p-6 transition hover:border-crimson-600/40 hover:shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white"><Check className="h-5 w-5" /></span>
                <p className="mt-5 font-display text-lg font-semibold text-navy-900">{f}</p>
                <span className="mt-1 block text-xs text-slate">Module {String(i + 1).padStart(2, '0')}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-surface py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">Enquire</span>
            <h2 className="mt-4 text-display-md font-bold">See {product.short || product.name} in action.</h2>
            <p className="mt-4 text-slate">Request a walkthrough, pricing or a customisation discussion. Your enquiry will be routed to the product team.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-8 shadow-card md:p-10">
            <ContactForm defaultService="Product Enquiry" defaultProduct={product.name} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white py-24">
          <div className="container">
            <h2 className="text-display-md font-bold">Related products</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-3xl border border-navy-900/10 p-6 transition hover:shadow-card">
                  <ProductVisual product={p} className="h-36" />
                  <h3 className="mt-5 flex items-center justify-between text-lg font-bold">{p.name}<ArrowUpRight className="h-4 w-4 text-slate transition group-hover:text-crimson-600" /></h3>
                  <p className="mt-1 text-sm text-slate">{p.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
