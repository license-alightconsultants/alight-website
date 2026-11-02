import { notFound } from 'next/navigation';
import PageHero from '@/components/layout/PageHero';
import ProductExplorer from '@/components/products/ProductExplorer';
import FinalCta from '@/components/home/FinalCta';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { industries as staticIndustries } from '@/data/industries';
import { getIndustries, getProducts } from '@/lib/content';

export const revalidate = 300;
export const generateStaticParams = () => staticIndustries.map((i) => ({ slug: i.slug }));
const getIndustry = async (slug) => (await getIndustries()).find((i) => i.slug === slug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const ind = await getIndustry(slug);
  if (!ind) return {};
  return { title: `${ind.name} Technology Solutions`, description: ind.story, alternates: { canonical: `/industries/${slug}` } };
}

export default async function IndustryPage({ params }) {
  const { slug } = await params;
  const ind = await getIndustry(slug);
  if (!ind) notFound();
  const all = await getProducts();
  const list = all.filter((p) => ind.products.includes(p.slug));

  return (
    <>
      <PageHero
        eyebrow={`Industry · ${ind.name}`}
        title={ind.headline}
        lead={ind.story}
        crumbs={[{ label: 'Industries', href: '/industries' }, { label: ind.name, href: `/industries/${slug}` }]}
        aside={<div className="glass mx-auto grid aspect-square w-full max-w-[260px] place-items-center rounded-full"><Icon name={ind.icon} className="h-24 w-24 text-brand-sky" /></div>}
      >
        <div className="mt-10"><Button href={`/request-consultation?service=${encodeURIComponent('Digital Transformation')}`}>Discuss your requirements</Button></div>
      </PageHero>
      <section className="bg-surface py-24">
        <div className="container">
          <h2 className="text-display-md font-bold">Platforms for {ind.name.toLowerCase()}</h2>
          <div className="mt-10"><ProductExplorer products={list} /></div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
