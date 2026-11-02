import Hero from '@/components/home/Hero';
import TrustStrip from '@/components/home/TrustStrip';
import Intro from '@/components/home/Intro';
import Capabilities from '@/components/home/Capabilities';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Industries from '@/components/home/Industries';
import WhyAlight from '@/components/home/WhyAlight';
import TechEcosystem from '@/components/home/TechEcosystem';
import CaseStudies from '@/components/home/CaseStudies';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import Process from '@/components/home/Process';
import ScrollStatement from '@/components/home/ScrollStatement';
import FinalCta from '@/components/home/FinalCta';
import { getSite } from '@/lib/settings';
import { ctaProps, getPage, pageMetadata } from '@/lib/pages';
import { parseItems, parseLines } from '@/lib/pages/registry';
import { getApprovedTestimonials, getCaseStudies, getClientLogos, getIndustries, getProducts, getServices, getStats } from '@/lib/content';

export const revalidate = 300;
export const generateMetadata = () => pageMetadata('home');

// Section text, backgrounds and visibility are edited in Admin → Pages → Home.
const heading = (c, key) => ({ eyebrow: c[`${key}.eyebrow`], title: c[`${key}.title`], lead: c[`${key}.lead`] || undefined, bg: c[`${key}.bg`] });

export default async function HomePage() {
  const [products, stats, logos, testimonials, caseStudies, services, industries, site, c] = await Promise.all([
    getProducts(),
    getStats(),
    getClientLogos(),
    getApprovedTestimonials(),
    getCaseStudies(3),
    getServices(),
    getIndustries(),
    getSite(),
    getPage('home'),
  ]);
  const counts = { products: products.length, services: services.length, industries: industries.length };

  return (
    <>
      <Hero
        counts={counts}
        badge={c['hero.badge']}
        badgeText={c['hero.badgeText']}
        lines={parseLines(c['hero.lines'])}
        lead={c['hero.lead']}
        primary={c['hero.primary']}
        primaryHref={c['hero.primaryHref']}
        secondary={c['hero.secondary']}
        secondaryHref={c['hero.secondaryHref']}
        showCounters={c['hero.counters']}
        showTerrain={c['hero.terrain']}
        bg={c['hero.bg']}
      />
      {c['trust.show'] && <TrustStrip logos={logos} sectors={industries.map((i) => i.name)} />}
      {c['intro.show'] && (
        <Intro city={site.address.city} eyebrow={c['intro.eyebrow']} title={c['intro.title']} lead={c['intro.lead']} body={c['intro.body']} principles={parseItems(c['intro.principles'])} bg={c['intro.bg']} />
      )}
      {c['statement.show'] && <ScrollStatement text={c['statement.text']} eyebrow={c['statement.eyebrow']} bg={c['statement.bg']} />}
      {c['capabilities.show'] && <Capabilities services={services} {...heading(c, 'capabilities')} />}
      {c['products.show'] && <FeaturedProducts products={products.filter((p) => p.featured)} {...heading(c, 'products')} />}
      {c['industries.show'] && <Industries industries={industries} products={products} {...heading(c, 'industries')} />}
      {c['why.show'] && <WhyAlight {...heading(c, 'why')} />}
      {c['process.show'] && <Process eyebrow={c['process.eyebrow']} title={c['process.title']} lead={c['process.lead']} steps={parseItems(c['process.steps'])} bg={c['process.bg']} />}
      {c['tech.show'] && <TechEcosystem {...heading(c, 'tech')} />}
      {c['cases.show'] && <CaseStudies items={caseStudies} {...heading(c, 'cases')} />}
      {c['stats.show'] && <Stats stats={stats} label={c['stats.label']} bg={c['stats.bg']} />}
      {c['testimonials.show'] && <Testimonials items={testimonials} bg={c['testimonials.bg']} />}
      {c['cta.show'] && <FinalCta {...ctaProps(c)} />}
    </>
  );
}
