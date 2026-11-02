import PageHero from '@/components/layout/PageHero';
import ProductExplorer from '@/components/products/ProductExplorer';
import FinalCta from '@/components/home/FinalCta';
import { getProducts } from '@/lib/content';
import { productCategories } from '@/data/products';
import Section from '@/components/ui/Section';
import { ctaProps, getPage, heroProps, pageMetadata } from '@/lib/pages';


export const revalidate = 300;

export const generateMetadata = () => pageMetadata('products');

export default async function ProductsPage() {
  const [products, c] = await Promise.all([getProducts(), getPage('products')]);
  return (
    <>
      <PageHero
        {...heroProps(c)}
        crumbs={[{ label: 'Products', href: '/products' }]}
        aside={c['hero.graphic'] === false ? null : (
          <dl className="grid grid-cols-2 gap-4">
            {productCategories.map((c) => (
              <div key={c.id} className="glass rounded-2xl p-5">
                <dd className="font-display text-3xl font-bold">{products.filter((p) => p.category === c.id).length}</dd>
                <dt className="mt-1 text-xs uppercase tracking-wider text-white/55">{c.label}</dt>
              </div>
            ))}
          </dl>
        )}
      />
      <Section bg={c['list.bg']} fallback="bg-surface" className="py-24">
        <div className="container">
          <ProductExplorer products={products} />
        </div>
      </Section>
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
