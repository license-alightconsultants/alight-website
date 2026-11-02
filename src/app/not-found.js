import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="relative grid min-h-[80vh] place-items-center overflow-hidden bg-navy-900 px-6 pt-24 text-center text-white">
      <div className="absolute inset-0 bg-grid [background-size:48px_48px] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
      <div className="relative">
        <p className="font-display text-[8rem] font-extrabold leading-none text-white/10">404</p>
        <h1 className="-mt-8 text-display-md font-bold text-white">This page has moved or doesn’t exist.</h1>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="ghostLight">Contact us</Button>
        </div>
      </div>
    </section>
  );
}
