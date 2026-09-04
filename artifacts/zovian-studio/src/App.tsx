import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Check, ChevronDown, Instagram, Mail, MapPin, Menu, Plus, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Work = {
  title: string;
  category: 'Weddings' | 'Portraits' | 'Details';
  location: string;
  image: string;
  size: 'large' | 'small' | 'wide';
};

const work: Work[] = [
  { title: 'A quiet kind of forever', category: 'Weddings', location: 'Maine, 2024', image: '/harbor-couple.jpg', size: 'large' },
  { title: 'Objects with a pulse', category: 'Details', location: 'Brooklyn, 2023', image: '/amber-table.jpg', size: 'small' },
  { title: 'The hours between', category: 'Weddings', location: 'Chicago, 2024', image: '/rooftop-bride.jpg', size: 'small' },
  { title: 'In soft focus', category: 'Portraits', location: 'Hudson Valley, 2023', image: '/soft-portrait.jpg', size: 'large' },
  { title: 'Held in the morning', category: 'Details', location: 'Vermont, 2024', image: '/hand-and-flower.jpg', size: 'wide' },
];

const packages = [
  {
    number: '01',
    title: 'The full story',
    detail: 'For wedding days that deserve their whole shape.',
    price: 'from $6,800',
    body: 'A complete visual record, from the slow start of the morning through the last song. Two photographers, a handmade album, and room for the in-between.',
    inclusions: ['Up to 10 hours of coverage', 'Two photographers', '400+ hand-finished images', '12x12 linen album'],
  },
  {
    number: '02',
    title: 'The essential',
    detail: 'A considered edit of the moments that matter.',
    price: 'from $4,200',
    body: 'For intimate celebrations and days with a clear, lovely arc. One photographer, carefully paced coverage, and photographs that leave space to remember.',
    inclusions: ['Up to 6 hours of coverage', 'One photographer', '250+ hand-finished images', 'Private online gallery'],
  },
  {
    number: '03',
    title: 'The portrait hour',
    detail: 'A little time set aside for who you are now.',
    price: 'from $650',
    body: 'A relaxed portrait session in a place that feels like yours. For new chapters, old friends, growing families, and the simple pleasure of being seen.',
    inclusions: ['90 minutes together', 'One location', '45+ hand-finished images', 'Print credit included'],
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .8s ${delay}ms cubic-bezier(.2,.8,.2,1), transform .8s ${delay}ms cubic-bezier(.2,.8,.2,1)` }}>
      {children}
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expandedPackage, setExpandedPackage] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', date: '', type: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const visibleWork = useMemo(() => filter === 'All' ? work : work.filter((item) => item.category === filter), [filter]);
  const activeWork = lightbox === null ? null : visibleWork[lightbox];

  useEffect(() => {
    document.body.style.overflow = menuOpen || lightbox !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, lightbox]);

  const navigateTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateForm = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submitInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Please add your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please add a valid email.';
    if (!form.type) nextErrors.type = 'Choose what you are planning.';
    if (!form.message.trim()) nextErrors.message = 'Tell us a little about the day.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  };

  const changeImage = (direction: number) => {
    if (lightbox === null) return;
    setLightbox((lightbox + direction + visibleWork.length) % visibleWork.length);
  };

  return (
    <main className="grain min-h-[100dvh] bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 md:px-10 md:py-7">
          <button data-testid="button-logo" onClick={() => navigateTo('top')} className="focus-ring group flex items-center gap-3 text-left">
            <span className="flex h-8 w-8 items-center justify-center border border-current"><Camera size={15} strokeWidth={1.5} /></span>
            <span className="text-[11px] font-semibold tracking-[.22em]">ZOVIAN<br />STUDIO</span>
          </button>
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ['Work', 'work'],
              ['Approach', 'approach'],
              ['Offerings', 'offerings'],
              ['Inquire', 'contact'],
            ].map(([label, id]) => (
              <button data-testid={`button-nav-${id}`} key={id} onClick={() => navigateTo(id)} className="focus-ring text-[11px] font-medium uppercase tracking-[.16em] transition-colors hover:text-accent">
                {label}
              </button>
            ))}
          </nav>
          <button data-testid="button-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((current) => !current)} className="focus-ring flex h-10 w-10 items-center justify-center border border-foreground/30 md:hidden">
            {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end bg-foreground px-6 pb-12 pt-24 text-background md:hidden">
          <div className="mb-8 font-mono-custom text-[10px] uppercase tracking-[.2em] text-accent">Menu / Zovian Studio</div>
          <nav className="flex flex-col items-start gap-5">
            {[
              ['The work', 'work'],
              ['Our approach', 'approach'],
              ['Offerings', 'offerings'],
              ['Start a conversation', 'contact'],
            ].map(([label, id], index) => (
              <button data-testid={`button-mobile-nav-${id}`} key={id} onClick={() => navigateTo(id)} className="font-display text-5xl italic leading-none text-background">
                <span className="mr-3 align-top font-mono-custom text-[10px] not-italic text-accent">0{index + 1}</span>{label}
              </button>
            ))}
          </nav>
          <div className="mt-16 flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[.15em] text-background/60"><MapPin size={13} /> New York · available worldwide</div>
        </div>
      )}

      <section id="top" className="relative min-h-[760px] overflow-hidden bg-foreground text-background md:min-h-[850px]">
        <div className="absolute inset-0 md:left-[38%]">
          <img src="/harbor-couple.jpg" alt="A couple walking together beside the harbor" className="h-full w-full object-cover opacity-75 mix-blend-luminosity md:mix-blend-normal" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/35 to-transparent md:from-foreground md:via-transparent" />
          <div className="absolute inset-0 bg-foreground/20" />
        </div>
        <div className="relative mx-auto flex min-h-[760px] max-w-[1600px] flex-col justify-end px-5 pb-14 pt-36 md:min-h-[850px] md:px-10 md:pb-20">
          <div className="max-w-[840px] animate-rise">
            <div className="eyebrow mb-7 text-accent">Photography for the beautifully unscripted</div>
            <h1 className="max-w-3xl font-display text-[clamp(4.4rem,10vw,10.5rem)] leading-[.82] tracking-[-.045em]">
              Keep the<br /><em>feeling.</em>
            </h1>
            <div className="mt-10 flex max-w-md items-start gap-5 md:ml-[28%]">
              <span className="mt-2 h-px w-12 shrink-0 bg-accent reveal-line" />
              <p className="text-sm leading-6 text-background/75">Zovian Studio makes photographs with a sense of place, a little grain, and all the room in the world for what actually happened.</p>
            </div>
          </div>
          <div className="mt-16 flex items-end justify-between border-t border-background/25 pt-4 text-background/60 md:mt-20">
            <span className="font-mono-custom text-[10px] uppercase tracking-[.2em]">Scroll to explore</span>
            <span className="font-mono-custom text-[10px] uppercase tracking-[.2em]">Est. 2016 / NYC</span>
          </div>
        </div>
      </section>

      <section id="approach" className="section-pad mx-auto max-w-[1600px]">
        <Reveal className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div>
            <div className="eyebrow mb-7">01 / Point of view</div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">The best photographs don't ask you to perform. They notice what is already there.</p>
          </div>
          <div>
            <h2 className="max-w-4xl font-display text-[clamp(3.2rem,7vw,7.2rem)] leading-[.88] tracking-[-.04em]">A little less pose.<br /><em>A lot more you.</em></h2>
            <div className="mt-12 grid gap-8 border-t border-border pt-7 text-sm leading-6 text-muted-foreground md:grid-cols-2">
              <p>There is a version of photography that tries to make a day look perfect. We are more interested in the version that lets it be alive: the crooked tie, the wet eyes, the hand that finds yours under the table.</p>
              <p>Our work moves between considered portraiture and honest observation. We bring gentle direction when you need it, then get out of the way. The result is a record that feels like memory — specific, textured, yours.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="work" className="bg-[#ded7c7] section-pad">
        <div className="mx-auto max-w-[1600px]">
          <Reveal className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="eyebrow mb-6">02 / Selected work</div>
              <h2 className="font-display text-6xl leading-[.9] tracking-[-.04em] md:text-8xl">Recent<br /><em>evidence.</em></h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Weddings', 'Portraits', 'Details'].map((item) => (
                <button data-testid={`button-filter-${item.toLowerCase()}`} key={item} onClick={() => setFilter(item)} className={`focus-ring border px-4 py-2 font-mono-custom text-[10px] uppercase tracking-[.12em] transition-colors ${filter === item ? 'border-foreground bg-foreground text-background' : 'border-foreground/30 hover:border-foreground'}`}>
                  {item}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12">
            {visibleWork.map((item, index) => (
              <Reveal key={item.title} delay={index * 70} className={item.size === 'large' ? 'md:col-span-7' : item.size === 'wide' ? 'md:col-span-12' : 'md:col-span-5'}>
                <button data-testid={`button-view-work-${index}`} onClick={() => setLightbox(index)} className="focus-ring group block w-full text-left">
                  <div className={`relative overflow-hidden bg-muted ${item.size === 'wide' ? 'aspect-[2.3/1]' : item.size === 'large' ? 'aspect-[1.18/1]' : 'aspect-[.95/1]'}`}>
                    <img src={item.image} alt={item.title} className="image-sheen h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-foreground/60 via-transparent to-transparent p-5 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="font-mono-custom text-[10px] uppercase tracking-[.14em] text-background">Open image</span>
                      <ArrowUpRight size={18} className="text-background" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-5 pt-4">
                    <div><h3 className="font-display text-2xl italic leading-none">{item.title}</h3><p className="mt-2 font-mono-custom text-[9px] uppercase tracking-[.14em] text-muted-foreground">{item.category} / {item.location}</p></div>
                    <span className="font-mono-custom text-[10px] text-muted-foreground">0{index + 1}</span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="offerings" className="section-pad mx-auto max-w-[1600px]">
        <Reveal>
          <div className="eyebrow mb-7">03 / Ways to work together</div>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="font-display text-6xl leading-[.88] tracking-[-.04em] md:text-8xl">Made for<br /><em>your kind of day.</em></h2>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">No two celebrations have the same rhythm. We keep the menu simple so the experience can stay personal.</p>
          </div>
        </Reveal>
        <div className="mt-16 border-t border-border">
          {packages.map((item, index) => {
            const open = expandedPackage === index;
            return (
              <div key={item.number} className="border-b border-border">
                <button data-testid={`button-package-${index}`} onClick={() => setExpandedPackage(open ? -1 : index)} className="focus-ring flex w-full items-center gap-4 py-7 text-left md:gap-8 md:py-9">
                  <span className="w-8 font-mono-custom text-[10px] text-accent">{item.number}</span>
                  <span className="flex-1 font-display text-3xl italic md:text-5xl">{item.title}</span>
                  <span className="hidden text-sm text-muted-foreground md:block">{item.detail}</span>
                  <span className={`flex h-8 w-8 items-center justify-center border border-foreground/25 transition-transform ${open ? 'rotate-45' : ''}`}><Plus size={15} strokeWidth={1.5} /></span>
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="grid gap-8 pb-9 pl-12 md:grid-cols-[1fr_1fr_1fr] md:pl-16">
                      <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                      <ul className="space-y-3 text-sm">
                        {item.inclusions.map((inclusion) => <li key={inclusion} className="flex items-center gap-3"><Check size={14} className="text-accent" strokeWidth={1.5} />{inclusion}</li>)}
                      </ul>
                      <div className="font-mono-custom text-[11px] uppercase tracking-[.14em] text-accent md:text-right">{item.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-40"><img src="/amber-table.jpg" alt="" className="h-full w-full object-cover" /></div>
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-5 py-28 md:grid-cols-[1fr_1fr] md:px-20 md:py-36">
          <Reveal>
            <div className="eyebrow mb-8 text-accent">A note from the studio</div>
            <p className="max-w-2xl font-display text-5xl leading-[.92] tracking-[-.03em] md:text-7xl">“The photographs we return to are rarely the ones we planned.”</p>
          </Reveal>
          <Reveal delay={120} className="flex items-end md:justify-end">
            <p className="max-w-xs text-sm leading-6 text-background/70">They are the ones that carry a little weather. A glance across a room. The exact color of the evening. This is why we photograph the edges, too.</p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-[1600px]">
        <Reveal className="grid items-start gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div>
            <div className="eyebrow mb-7">04 / The studio</div>
            <div className="aspect-[.78/1] overflow-hidden bg-muted md:max-w-sm"><img src="/soft-portrait.jpg" alt="Zovian Studio photographer in window light" className="image-sheen h-full w-full object-cover" /></div>
          </div>
          <div className="pt-2 md:pt-16">
            <h2 className="font-display text-6xl leading-[.88] tracking-[-.04em] md:text-8xl">Hi, I'm<br /><em>Zovian.</em></h2>
            <div className="mt-12 max-w-lg space-y-5 text-sm leading-6 text-muted-foreground">
              <p>I started this studio because the photographs I wanted to make didn't fit neatly into a shot list. They needed more listening, more patience, and the occasional muddy shoe.</p>
              <p>These days, I work with a small, trusted team between New York and wherever a good story takes us. We photograph with film and digital, chase good light, and believe the quiet moments usually say the most.</p>
            </div>
            <button data-testid="button-about-contact" onClick={() => navigateTo('contact')} className="focus-ring mt-10 inline-flex items-center gap-4 border-b border-foreground pb-2 text-[11px] font-semibold uppercase tracking-[.16em] transition-colors hover:border-accent hover:text-accent">Come say hello <ArrowRight size={16} strokeWidth={1.5} /></button>
          </div>
        </Reveal>
      </section>

      <section id="contact" className="bg-[#c9c7b1] section-pad">
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mb-14">
            <div className="eyebrow mb-7">05 / Start a conversation</div>
            <h2 className="max-w-3xl font-display text-6xl leading-[.88] tracking-[-.04em] md:text-8xl">Tell us<br /><em>everything.</em></h2>
            <p className="mt-8 max-w-md text-sm leading-6 text-foreground/70">The date, the place, the people you can't wait to have in one room. We read every note ourselves and reply within two working days.</p>
          </Reveal>
          {submitted ? (
            <Reveal className="border border-foreground/30 bg-background/30 p-8 md:p-12">
              <div className="flex h-12 w-12 items-center justify-center border border-accent text-accent"><Check size={22} strokeWidth={1.5} /></div>
              <h3 className="mt-8 font-display text-5xl italic">Your note is on its way.</h3>
              <p className="mt-4 max-w-md text-sm leading-6 text-foreground/70">Thank you, {form.name.split(' ')[0] || 'there'}. We’ll be in touch within two working days. Until then, keep an eye out for good light.</p>
              <button data-testid="button-send-another" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', date: '', type: '', message: '' }); }} className="focus-ring mt-8 border-b border-foreground pb-2 text-[10px] font-semibold uppercase tracking-[.16em]">Send another note</button>
            </Reveal>
          ) : (
            <form onSubmit={submitInquiry} className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              <label className="block"><span className="eyebrow mb-3 block text-foreground/60">Your name *</span><input data-testid="input-name" value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="w-full border-b border-foreground/40 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-foreground/35 focus:border-accent" placeholder="First and last" />{errors.name && <span data-testid="error-name" className="mt-2 block text-xs text-accent">{errors.name}</span>}</label>
              <label className="block"><span className="eyebrow mb-3 block text-foreground/60">Email address *</span><input data-testid="input-email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="w-full border-b border-foreground/40 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-foreground/35 focus:border-accent" placeholder="you@example.com" />{errors.email && <span data-testid="error-email" className="mt-2 block text-xs text-accent">{errors.email}</span>}</label>
              <label className="block"><span className="eyebrow mb-3 block text-foreground/60">Date or season</span><input data-testid="input-date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className="w-full border-b border-foreground/40 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-foreground/35 focus:border-accent" placeholder="September 2025" /></label>
              <label className="block"><span className="eyebrow mb-3 block text-foreground/60">I'm planning *</span><div className="relative"><select data-testid="select-type" value={form.type} onChange={(event) => updateForm('type', event.target.value)} className="w-full appearance-none border-b border-foreground/40 bg-transparent px-0 py-3 text-lg outline-none focus:border-accent"><option value="">Choose one</option><option value="wedding">A wedding</option><option value="portrait">A portrait session</option><option value="editorial">An editorial project</option><option value="something-else">Something else</option></select><ChevronDown size={16} className="pointer-events-none absolute right-0 top-4" /></div>{errors.type && <span data-testid="error-type" className="mt-2 block text-xs text-accent">{errors.type}</span>}</label>
              <label className="block md:col-span-2"><span className="eyebrow mb-3 block text-foreground/60">The short version *</span><textarea data-testid="input-message" value={form.message} onChange={(event) => updateForm('message', event.target.value)} rows={3} className="w-full resize-none border-b border-foreground/40 bg-transparent px-0 py-3 text-lg outline-none placeholder:text-foreground/35 focus:border-accent" placeholder="Give us the good bits..." />{errors.message && <span data-testid="error-message" className="mt-2 block text-xs text-accent">{errors.message}</span>}</label>
              <div className="flex items-end justify-between md:col-span-2"><span className="max-w-xs text-xs leading-5 text-foreground/60">No automated replies, no mailing list. Just a considered response from the studio.</span><button data-testid="button-submit-inquiry" type="submit" className="focus-ring inline-flex items-center gap-5 bg-foreground px-6 py-4 text-[10px] font-semibold uppercase tracking-[.15em] text-background transition-colors hover:bg-accent">Send inquiry <ArrowUpRight size={16} strokeWidth={1.5} /></button></div>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-foreground px-5 py-12 text-background md:px-10 md:py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col justify-between gap-12 md:flex-row">
            <div><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center border border-background/60"><Camera size={15} strokeWidth={1.5} /></span><span className="text-[11px] font-semibold tracking-[.22em]">ZOVIAN<br />STUDIO</span></div><p className="mt-8 max-w-xs text-sm leading-6 text-background/55">Photographs for the days you want to remember properly.</p></div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-5 text-[10px] uppercase tracking-[.15em]"><button data-testid="button-footer-work" onClick={() => navigateTo('work')} className="text-left text-background/65 transition-colors hover:text-accent">Selected work</button><button data-testid="button-footer-approach" onClick={() => navigateTo('approach')} className="text-left text-background/65 transition-colors hover:text-accent">Approach</button><button data-testid="button-footer-offerings" onClick={() => navigateTo('offerings')} className="text-left text-background/65 transition-colors hover:text-accent">Offerings</button><a data-testid="link-instagram" href="https://instagram.com" target="_blank" rel="noreferrer" className="text-background/65 transition-colors hover:text-accent">Instagram <ArrowUpRight className="ml-1 inline" size={12} /></a></div>
          </div>
          <div className="mt-16 flex flex-col justify-between gap-3 border-t border-background/20 pt-5 font-mono-custom text-[9px] uppercase tracking-[.16em] text-background/45 md:flex-row"><span>© 2024 Zovian Studio</span><span>New York / Worldwide</span><a data-testid="link-email" href="mailto:hello@zovian.studio" className="inline-flex items-center gap-2 hover:text-accent"><Mail size={12} /> hello@zovian.studio</a></div>
        </div>
      </footer>

      {activeWork && (
        <div role="dialog" aria-modal="true" aria-label={`${activeWork.title} image viewer`} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-5 md:p-12">
          <button data-testid="button-close-lightbox" aria-label="Close image viewer" onClick={() => setLightbox(null)} className="focus-ring absolute right-5 top-5 flex h-10 w-10 items-center justify-center border border-background/30 text-background md:right-10 md:top-8"><X size={18} strokeWidth={1.5} /></button>
          <button data-testid="button-previous-image" aria-label="Previous image" onClick={() => changeImage(-1)} className="focus-ring absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-background/30 text-background transition-colors hover:border-accent hover:text-accent md:left-10"><ArrowLeft size={18} strokeWidth={1.5} /></button>
          <div className="max-h-full max-w-5xl"><img src={activeWork.image} alt={activeWork.title} className="max-h-[76vh] w-auto max-w-full object-contain" /><div className="mt-5 flex justify-between gap-6 text-background"><div><h2 className="font-display text-3xl italic">{activeWork.title}</h2><p className="mt-2 font-mono-custom text-[9px] uppercase tracking-[.15em] text-background/55">{activeWork.category} / {activeWork.location}</p></div><span className="font-mono-custom text-[10px] text-background/55">{(lightbox ?? 0) + 1} / {visibleWork.length}</span></div></div>
          <button data-testid="button-next-image" aria-label="Next image" onClick={() => changeImage(1)} className="focus-ring absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-background/30 text-background transition-colors hover:border-accent hover:text-accent md:right-10"><ArrowRight size={18} strokeWidth={1.5} /></button>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;