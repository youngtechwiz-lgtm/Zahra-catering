import { type ComponentProps, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight, ArrowLeft, ArrowUpRight, CalendarDays, Check, FileText,
  Images, LayoutDashboard, Mail, Menu as MenuIcon, MessageCircle, Package,
  Palette, Plus, Search, Settings, Sparkles, Star, Utensils, X,
} from 'lucide-react';
import { DEFAULT_WHATSAPP_NUMBER, whatsappUrl } from '@/lib/whatsapp';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createBooking } from '@/services/bookings';
import { getCurrentSession, signInAdmin, signOutAdmin } from '@/services/auth';
import { getSiteSettings } from '@/services/content';

type IconType = typeof Utensils;

type LinkProps = Omit<ComponentProps<typeof RouterLink>, 'to'> & {
  href: string;
};

function Link({ href, ...props }: LinkProps) {
  return <RouterLink to={href} {...props} />;
}

function useLocation() {
  const location = useRouterLocation();
  const navigate = useNavigate();
  return [location.pathname, navigate] as const;
}

function useWhatsAppNumber() {
  const [number, setNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSiteSettings().then((settings) => {
      if (settings?.whatsapp) setNumber(settings.whatsapp);
    }).catch(() => undefined);
  }, []);
  return number;
}

const menuItems = [
  { id: 1, category: 'Welcome to the table', name: 'ZAHRA house jollof', description: 'Smoky tomato rice, charred peppers, thyme oil', price: '₦8,500' },
  { id: 2, category: 'Welcome to the table', name: 'Coconut curry prawns', description: 'Tiger prawns, coconut, lime leaf, toasted rice', price: '₦14,000' },
  { id: 3, category: 'The centrepiece', name: 'Citrus suya chicken', description: 'Yaji spice, grilled citrus, green herb relish', price: '₦12,500' },
  { id: 4, category: 'The centrepiece', name: 'Miso-glazed sea bass', description: 'Spring onion, sesame, pickled cucumber', price: '₦18,000' },
  { id: 5, category: 'To finish', name: 'Mango & ginger pavlova', description: 'Crisp meringue, ripe mango, ginger cream', price: '₦7,000' },
  { id: 6, category: 'To finish', name: 'Warm chin chin sundae', description: 'Vanilla bean, salted caramel, spiced crunch', price: '₦6,500' },
];

const services = [
  { id: 'weddings', number: '01', title: 'Weddings', description: 'A menu that holds the room, from your first tasting to the last dance.', icon: Sparkles, detail: 'Full-service dining, family-style feasts and late-night bites for the day you have imagined.' },
  { id: 'private', number: '02', title: 'Private dining', description: 'Restaurant-level detail, in the place that means something to you.', icon: Utensils, detail: 'Intimate dinners, milestone birthdays and candlelit tables built around your people.' },
  { id: 'corporate', number: '03', title: 'Corporate events', description: 'Thoughtful food for launches, off-sites and rooms full of new ideas.', icon: Package, detail: 'Breakfast meetings, team celebrations, brand moments and polished service without the fuss.' },
  { id: 'celebrations', number: '04', title: 'Intimate celebrations', description: 'Small can be just as memorable. We make every plate count.', icon: Star, detail: 'Anniversaries, birthdays and the beautiful in-between occasions worth marking.' },
];

const gallery = [
  { id: 'g1', tag: 'Weddings', title: 'The courtyard supper', image: '/hero-table.jpg', size: 'tall' },
  { id: 'g2', tag: 'Private dining', title: 'A table for twelve', image: '/dish-detail.jpg', size: 'wide' },
  { id: 'g3', tag: 'Corporate', title: 'Good work, well fed', image: '/hero-table.jpg', size: 'square' },
  { id: 'g4', tag: 'Birthdays', title: 'A little more sparkle', image: '/dish-detail.jpg', size: 'square' },
];

const events = [
  { date: '14.06.24', title: 'A garden wedding for 96', location: 'Lagos', type: 'Wedding', image: '/hero-table.jpg', text: 'A sun-warmed, family-style feast with a late-night suya bar.' },
  { date: '28.04.24', title: 'The Sunday table', location: 'Ikoyi', type: 'Private dining', image: '/dish-detail.jpg', text: 'Twelve guests, five courses, and a table that kept the conversation going.' },
  { date: '09.03.24', title: 'The makers lunch', location: 'Victoria Island', type: 'Corporate', image: '/hero-table.jpg', text: 'A bright, generous lunch for a room full of people building what is next.' },
];

const testimonials = [
  { quote: 'The food was the first thing people talked about, and the last thing they wanted to leave.', name: 'Tolu A.', event: 'Private dinner · Lagos' },
  { quote: 'ZAHRA understood the feeling we wanted before we knew how to describe it. Every detail landed.', name: 'Mariam O.', event: 'Wedding · Ibadan' },
  { quote: 'Warm, precise and completely unflustered. Our guests felt looked after from the first plate.', name: 'Kene E.', event: 'Corporate lunch · Lagos' },
];

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`flex items-center gap-2 group ${inverse ? 'text-[#f7efdf]' : 'text-[#38263b]'}`} data-testid="link-home">
    <span className="font-display text-[2rem] leading-none tracking-[-.08em]">ZAHRA</span>
    <span className="mt-1 h-2 w-2 rounded-full bg-[#de674f] transition-transform group-hover:scale-150" />
  </Link>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const links = [['/', 'Home'], ['/about', 'Our story'], ['/services', 'Services'], ['/menu', 'Menu'], ['/gallery', 'Gallery'], ['/events', 'Events']];
  return <div className="public-shell min-h-[100dvh] grain">
    <header className="relative z-40 border-b border-[#38263b]/15">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 md:px-10">
        <Wordmark />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {links.map(([href, label]) => <Link key={href} href={href} aria-current={location === href ? 'page' : undefined} className="nav-link text-[11px] font-semibold uppercase tracking-[.18em] text-[#38263b]/75 hover:text-[#38263b]" data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/contact" className="group flex items-center gap-2 rounded-full bg-[#38263b] px-5 py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#f7efdf] transition hover:bg-[#de674f]" data-testid="link-book-header">Plan an event <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">{open ? <X /> : <MenuIcon />}</button>
      </div>
      {open && <div className="border-t border-[#38263b]/15 bg-[#f7efdf] px-5 py-5 md:hidden">
        <nav className="flex flex-col gap-4">{links.map(([href, label]) => <Link key={href} onClick={() => setOpen(false)} href={href} className="text-sm font-semibold uppercase tracking-[.14em]" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}</nav>
        <Link href="/contact" onClick={() => setOpen(false)} className="mt-5 flex w-full justify-center rounded-full bg-[#38263b] px-5 py-3 text-xs font-semibold uppercase tracking-[.15em] text-[#f7efdf]" data-testid="link-mobile-book">Plan an event</Link>
      </div>}
    </header>
    <main>{children}</main>
    <Footer />
  </div>;
}

function Footer() {
  const whatsappNumber = useWhatsAppNumber();
  return <footer className="bg-[#38263b] px-5 py-12 text-[#f7efdf] md:px-10 md:py-20">
    <div className="mx-auto max-w-[1440px]">
      <div className="grid gap-12 md:grid-cols-[1.4fr_.8fr_.8fr]">
        <div><Wordmark inverse /><p className="mt-8 max-w-sm font-display text-3xl leading-[1.05] text-[#f7efdf] md:text-5xl">Good food makes a room feel like yours.</p></div>
        <div><p className="mb-5 font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Explore</p><div className="flex flex-col gap-3 text-sm text-[#f7efdf]/70"><Link href="/about" data-testid="link-footer-about">Our story</Link><Link href="/services" data-testid="link-footer-services">Services</Link><Link href="/menu" data-testid="link-footer-menu">Menu</Link><Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link></div></div>
        <div><p className="mb-5 font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Say hello</p><a href={whatsappUrl(whatsappNumber)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-[#f7efdf]/80 hover:text-[#d9b56b]" data-testid="link-footer-whatsapp"><MessageCircle size={16} /> WhatsApp us</a><a href="mailto:hello@zahra.ng" className="mt-3 flex items-center gap-2 text-sm text-[#f7efdf]/80 hover:text-[#d9b56b]" data-testid="link-footer-email"><Mail size={16} /> hello@zahra.ng</a></div>
      </div>
      <div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#f7efdf]/15 pt-5 font-mono-brand text-[10px] uppercase tracking-[.12em] text-[#f7efdf]/45 md:flex-row"><span>© 2024 ZAHRA Catering Service</span><Link href="/admin/login" className="hover:text-[#d9b56b]" data-testid="link-admin-login">Team sign in</Link></div>
    </div>
  </footer>;
}

export function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: ReactNode; copy?: string }) {
  return <div className="grid gap-5 md:grid-cols-[.7fr_1.3fr] md:items-end"><div className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#de674f]">{eyebrow}</div><div><h1 className="font-display text-5xl leading-[.92] tracking-[-.05em] text-[#38263b] md:text-7xl">{title}</h1>{copy && <p className="mt-6 max-w-lg text-base leading-relaxed text-[#38263b]/65">{copy}</p>}</div></div>;
}

export function HomePage() {
  return <PublicShell>
    <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-10 md:pb-28 md:pt-20">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[.92fr_1.08fr] md:items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }} className="relative z-10">
          <p className="mb-6 font-mono-brand text-[10px] uppercase tracking-[.24em] text-[#de674f]">Catering for the beautifully considered</p>
          <h1 className="font-display text-[4.6rem] leading-[.83] tracking-[-.07em] text-[#38263b] sm:text-[6.5rem] md:text-[8.7rem]">Make it<br /><em className="ml-[.2em] text-[#de674f]">a table</em><br />to remember.</h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[#38263b]/65 md:ml-2">Food with a point of view, service with a soft touch. We cater weddings, dinners and the reasons you gather.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><Link href="/contact" className="group flex items-center gap-3 rounded-full bg-[#de674f] px-6 py-4 text-xs font-bold uppercase tracking-[.13em] text-[#f7efdf] transition hover:bg-[#38263b]" data-testid="link-hero-enquire">Start a conversation <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link><Link href="/menu" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.13em] text-[#38263b] hover:text-[#de674f]" data-testid="link-hero-menu">See the menu <ArrowDownRight size={15} /></Link></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }} className="relative min-h-[420px] md:min-h-[650px]">
          <div className="absolute inset-x-5 top-0 h-[88%] overflow-hidden rounded-[9rem_9rem_1rem_1rem] bg-[#d9b56b] md:inset-x-12"><img src="/hero-table.jpg" alt="A warm ZAHRA catering table set for dinner" className="h-full w-full object-cover object-center mix-blend-multiply opacity-90" /><div className="absolute inset-0 bg-[#de674f]/10" /></div>
          <div className="absolute bottom-0 left-0 flex h-32 w-32 items-center justify-center rounded-full bg-[#38263b] text-center text-[10px] uppercase leading-relaxed tracking-[.14em] text-[#f7efdf] md:h-40 md:w-40">Made for<br />your people<br /><span className="text-[#d9b56b]">+</span></div>
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono-brand text-[9px] uppercase tracking-[.22em] text-[#38263b]/55 md:block">Lagos · Nigeria · 2024</div>
        </motion.div>
      </div>
    </section>
    <div className="overflow-hidden border-y border-[#38263b]/15 py-4"><div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap font-display text-xl text-[#38263b]/70">{Array.from({ length: 6 }).map((_, i) => <span key={i}>Good food, good company <b className="mx-8 text-[#de674f]">+</b></span>)}</div></div>
    <section className="px-5 py-20 md:px-10 md:py-32"><div className="mx-auto max-w-[1440px]"><SectionIntro eyebrow="01 — The ZAHRA way" title={<>The meal is only<br /><em className="text-[#de674f]">the beginning.</em></>} copy="We believe a great event has a rhythm. A warm welcome, an unexpected bite, a plate that makes everyone pause. Our job is to make that rhythm feel effortless." /><div className="mt-14 grid gap-5 md:grid-cols-[1.35fr_.65fr]"><div className="overflow-hidden rounded-[1rem_5rem_1rem_1rem] bg-[#d9b56b]"><img src="/dish-detail.jpg" alt="Plated citrus-glazed dish" className="h-[380px] w-full object-cover md:h-[500px]" /></div><div className="flex flex-col justify-between rounded-[1rem] bg-[#e6d7b9] p-7 md:p-10"><div><span className="font-display text-6xl text-[#de674f]">“</span><p className="font-display text-3xl leading-[1.05] text-[#38263b]">A little drama on the plate. A lot of ease in the room.</p></div><Link href="/about" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#38263b]" data-testid="link-home-story">Meet the people behind the plates <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></div></div></section>
    <ServicesPreview />
    <section className="bg-[#de674f] px-5 py-20 text-[#f7efdf] md:px-10 md:py-28"><div className="mx-auto max-w-[1100px] text-center"><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#38263b]/70">Have a date in mind?</p><h2 className="mt-5 font-display text-5xl leading-[.9] tracking-[-.05em] md:text-8xl">Let's make<br /><em>something lovely.</em></h2><Link href="/contact" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#38263b] px-7 py-4 text-xs font-bold uppercase tracking-[.15em] text-[#f7efdf] transition hover:bg-[#f7efdf] hover:text-[#38263b]" data-testid="link-home-final-cta">Tell us about it <ArrowUpRight size={16} /></Link></div></section>
  </PublicShell>;
}

function ServicesPreview() {
  return <section className="bg-[#38263b] px-5 py-20 text-[#f7efdf] md:px-10 md:py-28"><div className="mx-auto max-w-[1440px]"><SectionIntro eyebrow="02 — What we do" title={<>The right food<br /><em className="text-[#d9b56b]">for the feeling.</em></>} /><div className="mt-14 grid divide-y divide-[#f7efdf]/15 border-y border-[#f7efdf]/15 md:grid-cols-2 md:divide-x md:divide-y-0">{services.slice(0, 4).map((service) => <Link href={`/services#${service.id}`} key={service.id} className="group flex gap-5 p-6 pl-0 md:p-8 md:pl-8" data-testid={`link-service-preview-${service.id}`}><span className="font-mono-brand text-[10px] text-[#d9b56b]">{service.number}</span><div className="flex-1"><service.icon size={21} strokeWidth={1.3} className="mb-8 text-[#de674f]" /><h3 className="font-display text-3xl">{service.title}</h3><p className="mt-3 max-w-xs text-sm leading-relaxed text-[#f7efdf]/55">{service.description}</p></div><ArrowUpRight size={17} className="text-[#f7efdf]/40 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></Link>)}</div></div></section>;
}

export function AboutPage() {
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-28"><div className="mx-auto max-w-[1440px]"><SectionIntro eyebrow="Our story" title={<>Food is how we<br /><em className="text-[#de674f]">say stay awhile.</em></>} copy="ZAHRA began with a simple instinct: that the most memorable celebrations are rarely the loudest ones. They are generous, intentional, and full of small details that make people feel considered." /><div className="mt-16 grid gap-6 md:grid-cols-[.8fr_1.2fr]"><div className="flex min-h-[360px] flex-col justify-between rounded-t-[8rem] bg-[#d9b56b] p-8 md:min-h-[560px] md:p-12"><span className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#38263b]/60">Since 2019 · Lagos</span><p className="font-display text-4xl leading-[.95] text-[#38263b] md:text-6xl">We cook with curiosity, then edit with care.</p></div><div className="flex items-end overflow-hidden rounded-br-[8rem] bg-[#de674f]"><img src="/hero-table.jpg" alt="ZAHRA table scene" className="h-[360px] w-full object-cover mix-blend-multiply opacity-80 md:h-[560px]" /></div></div></div></section><section className="bg-[#e6d7b9] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-3">{[['01', 'Start with the room', 'Before we talk menus, we listen for the mood: the light, the pace, the people.'], ['02', 'Make it personal', 'Every menu is built around your occasion, with familiar flavours given a fresh turn.'], ['03', 'Leave room for joy', 'The best service is felt, not noticed. We keep things moving so you can be present.']].map(([n, t, d]) => <div key={n} className="border-t border-[#38263b]/25 pt-4"><span className="font-mono-brand text-[10px] text-[#de674f]">{n}</span><h3 className="mt-12 font-display text-3xl">{t}</h3><p className="mt-4 text-sm leading-relaxed text-[#38263b]/65">{d}</p></div>)}</div></section></PublicShell>;
}

export function ServicesPage() {
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24"><div className="mx-auto max-w-[1440px]"><SectionIntro eyebrow="Our services" title={<>A menu for<br /><em className="text-[#de674f]">every gathering.</em></>} copy="From the first idea to the final clean-up, we bring a clear point of view and a calm pair of hands." /><div className="mt-16">{services.map((service, i) => <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: i * .06 }} id={service.id} key={service.id} className="group grid gap-6 border-t border-[#38263b]/20 py-8 md:grid-cols-[.2fr_1fr_.8fr_auto] md:items-start md:py-10"><span className="font-mono-brand text-[10px] text-[#de674f]">{service.number}</span><h2 className="font-display text-4xl leading-none md:text-6xl">{service.title}</h2><p className="max-w-sm text-sm leading-relaxed text-[#38263b]/60">{service.detail}</p><Link href="/contact" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#38263b]/25 transition group-hover:bg-[#38263b] group-hover:text-[#f7efdf]" data-testid={`link-enquire-${service.id}`}><ArrowUpRight size={17} /></Link></motion.div>)}</div></div></section><section className="bg-[#38263b] px-5 py-20 text-[#f7efdf] md:px-10"><div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2 md:items-center"><h2 className="font-display text-5xl leading-[.9] md:text-7xl">Not sure where<br /><em className="text-[#d9b56b]">you fit?</em></h2><div><p className="max-w-sm text-sm leading-relaxed text-[#f7efdf]/60">Tell us what you are planning. We will help shape the right format, even if you do not have all the answers yet.</p><Link href="/contact" className="mt-7 inline-flex items-center gap-2 border-b border-[#de674f] pb-2 text-xs font-bold uppercase tracking-[.15em] text-[#de674f]" data-testid="link-services-contact">Talk it through <ArrowUpRight size={15} /></Link></div></div></section></PublicShell>;
}

export function MenuPage() {
  const [active, setActive] = useState('All');
  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))];
  const visible = active === 'All' ? menuItems : menuItems.filter((item) => item.category === active);
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24"><div className="mx-auto max-w-[1200px]"><SectionIntro eyebrow="A taste of ZAHRA" title={<>Come hungry.<br /><em className="text-[#de674f]">Leave curious.</em></>} copy="Our menus move with the season and the mood of the room. Here is a little of what we love to cook right now." /><div className="mt-14 flex gap-2 overflow-x-auto border-b border-[#38263b]/20 pb-3">{categories.map((cat) => <button key={cat} onClick={() => setActive(cat)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition ${active === cat ? 'bg-[#38263b] text-[#f7efdf]' : 'border border-[#38263b]/20 hover:bg-[#e6d7b9]'}`} data-testid={`button-menu-category-${cat.toLowerCase().replaceAll(' ', '-')}`}>{cat}</button>)}</div><div className="mt-10 grid gap-x-10 md:grid-cols-2">{visible.map((item) => <motion.div layout key={item.id} className="group border-b border-[#38263b]/15 py-6"><div className="flex items-start justify-between gap-5"><div><p className="font-mono-brand text-[9px] uppercase tracking-[.16em] text-[#de674f]">{item.category}</p><h2 className="mt-3 font-display text-3xl">{item.name}</h2><p className="mt-2 text-sm text-[#38263b]/55">{item.description}</p></div><span className="font-mono-brand text-xs text-[#38263b]/70">{item.price}</span></div></motion.div>)}</div><p className="mt-10 font-mono-brand text-[10px] uppercase tracking-[.14em] text-[#38263b]/45">Menus are bespoke · Please tell us about dietary needs in your enquiry</p></div></section><section className="mx-5 mb-20 rounded-[1rem_6rem_1rem_1rem] bg-[#d9b56b] px-7 py-14 md:mx-10 md:px-16"><div className="mx-auto flex max-w-[1100px] flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#38263b]/60">Want the whole picture?</p><h2 className="mt-4 font-display text-5xl leading-[.9]">Let's build<br />your menu.</h2></div><Link href="/contact" className="flex w-fit items-center gap-2 rounded-full bg-[#38263b] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f7efdf]" data-testid="link-menu-enquire">Start an enquiry <ArrowUpRight size={15} /></Link></div></section></PublicShell>;
}

export function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const cats = ['All', 'Weddings', 'Private dining', 'Corporate', 'Birthdays'];
  const visible = filter === 'All' ? gallery : gallery.filter((g) => g.tag === filter);
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pt-24"><div className="mx-auto max-w-[1440px]"><SectionIntro eyebrow="The gallery" title={<>A feeling,<br /><em className="text-[#de674f]">in frames.</em></>} /><div className="mt-12 flex gap-2 overflow-x-auto">{cats.map((cat) => <button key={cat} onClick={() => setFilter(cat)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] ${filter === cat ? 'bg-[#de674f] text-[#f7efdf]' : 'border border-[#38263b]/20'}`} data-testid={`button-gallery-filter-${cat.toLowerCase().replaceAll(' ', '-')}`}>{cat}</button>)}</div><div className="mt-10 grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[250px]">{visible.map((item, i) => <motion.div layout key={item.id} className={`${i === 0 ? 'md:col-span-2 md:row-span-2' : i === 1 ? 'md:col-span-2' : ''} group relative overflow-hidden rounded-[.8rem] bg-[#d9b56b]`}><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#38263b]/80 to-transparent p-5 pt-14 text-[#f7efdf]"><p className="font-mono-brand text-[9px] uppercase tracking-[.16em] text-[#d9b56b]">{item.tag}</p><h2 className="mt-1 font-display text-2xl">{item.title}</h2></div></motion.div>)}</div></div></section></PublicShell>;
}

export function EventsPage() {
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24"><div className="mx-auto max-w-[1100px]"><SectionIntro eyebrow="Recent work" title={<>The stories<br /><em className="text-[#de674f]">we got to feed.</em></>} copy="A few rooms, tables and very good reasons to gather." /><div className="mt-16">{events.map((event, i) => <article key={event.title} className="grid gap-7 border-t border-[#38263b]/20 py-8 md:grid-cols-[.25fr_1fr_1.2fr] md:items-center md:py-10"><div className="font-mono-brand text-[10px] leading-relaxed text-[#de674f]">{event.date}<br /><span className="text-[#38263b]/45">{event.location}</span></div><div><p className="font-mono-brand text-[9px] uppercase tracking-[.16em] text-[#38263b]/50">{event.type}</p><h2 className="mt-3 font-display text-4xl leading-none md:text-5xl">{event.title}</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#38263b]/60">{event.text}</p></div><div className={`overflow-hidden bg-[#d9b56b] ${i % 2 ? 'rounded-[1rem_1rem_4rem_1rem]' : 'rounded-[1rem_4rem_1rem_1rem]'}`}><img src={event.image} alt={event.title} className="h-56 w-full object-cover transition duration-500 hover:scale-105 md:h-64" /></div></article>)}</div></div></section></PublicShell>;
}

export function TestimonialsPage() {
  return <PublicShell><section className="bg-[#38263b] px-5 py-20 text-[#f7efdf] md:px-10 md:py-32"><div className="mx-auto max-w-[1200px]"><SectionIntro eyebrow="Kind words" title={<>Good company<br /><em className="text-[#d9b56b]">says it best.</em></>} /><div className="mt-16 grid gap-5 md:grid-cols-3">{testimonials.map((item, i) => <motion.blockquote initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} key={item.name} className={`flex min-h-[330px] flex-col justify-between p-7 ${i === 1 ? 'bg-[#de674f]' : 'bg-[#4b3850]'}`}><span className="font-display text-6xl leading-none text-[#d9b56b]">“</span><p className="font-display text-3xl leading-[1.02]">{item.quote}</p><footer className="border-t border-current/20 pt-4 text-[10px] uppercase tracking-[.14em] text-[#f7efdf]/65">{item.name}<br /><span className="text-[#d9b56b]">{item.event}</span></footer></motion.blockquote>)}</div></div></section><section className="bg-[#d9b56b] px-5 py-20 text-center md:px-10"><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#38263b]/60">Your turn</p><h2 className="mx-auto mt-5 max-w-3xl font-display text-5xl leading-[.9] md:text-7xl">Let's make a memory<br /><em>worth quoting.</em></h2><Link href="/contact" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#38263b] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f7efdf]" data-testid="link-testimonials-contact">Make an enquiry <ArrowUpRight size={15} /></Link></section></PublicShell>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', date: '', type: '', guests: '', note: '' });
  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  if (sent) return <PublicShell><section className="flex min-h-[70vh] items-center px-5 py-20 md:px-10"><div className="mx-auto max-w-2xl text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b56b]"><Check size={28} /></span><p className="mt-8 font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#de674f]">Enquiry received</p><h1 className="mt-5 font-display text-6xl leading-[.9]">We will be in<br /><em className="text-[#de674f]">touch soon.</em></h1><p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#38263b]/60">Thank you, {form.name || 'there'}. We have your details and will come back with the next delicious step.</p><button onClick={() => setSent(false)} className="mt-8 border-b border-[#38263b] pb-1 text-xs font-bold uppercase tracking-[.14em]" data-testid="button-send-another">Send another enquiry</button></div></section></PublicShell>;
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24"><div className="mx-auto grid max-w-[1200px] gap-14 md:grid-cols-[.8fr_1.2fr]"><div><SectionIntro eyebrow="Let's talk" title={<>Tell us<br /><em className="text-[#de674f]">everything.</em></>} copy="Dates, dreams, dietary needs, a half-formed idea scribbled in your notes app. It all helps us start in the right place." /><div className="mt-12 border-t border-[#38263b]/20 pt-5"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#de674f]">Prefer a quick chat?</p><a href={whatsappUrl()} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 font-display text-2xl hover:text-[#de674f]" data-testid="link-contact-whatsapp"><MessageCircle size={20} /> WhatsApp the team</a></div></div><form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="rounded-[1rem_4rem_1rem_1rem] bg-[#e6d7b9] p-6 md:p-10"><div className="grid gap-6 md:grid-cols-2"><label className="block text-xs font-bold uppercase tracking-[.12em]">Your name<input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="First and last name" data-testid="input-contact-name" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Email address<input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="you@email.com" data-testid="input-contact-email" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Event date<input value={form.date} onChange={(e) => update('date', e.target.value)} type="date" className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" data-testid="input-contact-date" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Event type<select value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" data-testid="select-contact-type"><option value="">Choose one</option><option>Wedding</option><option>Private dinner</option><option>Corporate event</option><option>Birthday</option><option>Other celebration</option></select></label><label className="block text-xs font-bold uppercase tracking-[.12em] md:col-span-2">Guest count<input value={form.guests} onChange={(e) => update('guests', e.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="A considered estimate is perfect" data-testid="input-contact-guests" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] md:col-span-2">Tell us about it<textarea required value={form.note} onChange={(e) => update('note', e.target.value)} rows={4} className="mt-2 w-full resize-none border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="What are you imagining?" data-testid="textarea-contact-note" /></label></div><button type="submit" className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#38263b] px-5 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f7efdf] transition hover:bg-[#de674f]" data-testid="button-submit-enquiry">Send enquiry <ArrowUpRight size={16} /></button><p className="mt-4 text-center text-[11px] text-[#38263b]/45">We reply within two working days.</p></form></div></section></PublicShell>;
}

const adminNav: [string, string, IconType][] = [['/admin', 'Overview', LayoutDashboard], ['/admin/bookings', 'Bookings', CalendarDays], ['/admin/menu', 'Menu', Utensils], ['/admin/services', 'Services', Sparkles], ['/admin/gallery', 'Gallery', Images], ['/admin/events', 'Events', Package], ['/admin/testimonials', 'Testimonials', MessageCircle], ['/admin/settings', 'Settings', Settings]];

export function AdminShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="admin-shell min-h-[100dvh]"><aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#f7efdf]/10 bg-[#2a1b2e] p-6 transition-transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="flex items-center justify-between"><Wordmark inverse /><button className="md:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-admin-menu"><X size={20} /></button></div><p className="mt-12 font-mono-brand text-[9px] uppercase tracking-[.2em] text-[#d9b56b]/60">Workspace</p><nav className="mt-5 space-y-1">{adminNav.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${location === href ? 'bg-[#d9b56b] text-[#2a1b2e]' : 'text-[#f7efdf]/60 hover:bg-[#f7efdf]/8 hover:text-[#f7efdf]'}`} data-testid={`link-admin-${label.toLowerCase()}`}><Icon size={17} strokeWidth={1.6} />{label}</Link>)}</nav><div className="absolute inset-x-6 bottom-6 border-t border-[#f7efdf]/10 pt-5"><Link href="/" className="flex items-center gap-3 text-sm text-[#f7efdf]/50 hover:text-[#f7efdf]" data-testid="link-view-site"><ArrowLeft size={16} /> View website</Link></div></aside><div className="md:pl-72"><header className="flex h-20 items-center justify-between border-b border-[#f7efdf]/10 px-5 md:px-10"><button className="md:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-admin-menu"><MenuIcon /></button><div className="hidden font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#f7efdf]/40 md:block">ZAHRA / Studio</div><div className="flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm">Studio admin</p><p className="font-mono-brand text-[9px] uppercase tracking-[.12em] text-[#f7efdf]/45">Lagos · GMT+1</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#de674f] font-display text-lg text-[#f7efdf]">Z</div></div></header><main className="p-5 md:p-10">{children}</main></div></div>;
}

export function AdminHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">{eyebrow}</p><h1 className="mt-3 font-display text-5xl leading-none text-[#f7efdf] md:text-6xl">{title}</h1></div>{action && <button onClick={onAction} className="flex w-fit items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e] transition hover:bg-[#de674f] hover:text-[#f7efdf]" data-testid="button-admin-primary-action"><Plus size={15} /> {action}</button>}</div>;
}

export function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInAdmin(email.trim(), password);
      setLocation('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5"><div className="w-full max-w-md"><Wordmark inverse /><div className="mt-16"><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">Private workspace</p><h1 className="mt-4 font-display text-6xl leading-[.9] text-[#f7efdf]">Welcome<br /><em className="text-[#de674f]">back.</em></h1><form onSubmit={handleSubmit} className="mt-10 space-y-5"><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]" placeholder="you@zahra.ng" data-testid="input-admin-email" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]" placeholder="••••••••" data-testid="input-admin-password" /></label>{error && <p role="alert" className="rounded-lg border border-[#de8c7a]/30 bg-[#de8c7a]/10 px-4 py-3 text-xs leading-relaxed text-[#de8c7a]">{error}</p>}<button type="submit" disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d9b56b] py-4 text-xs font-bold uppercase tracking-[.14em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-admin-sign-in">{loading ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={15} /></button></form><Link href="/" className="mt-8 flex items-center gap-2 text-xs text-[#f7efdf]/45 hover:text-[#d9b56b]" data-testid="link-admin-back"><ArrowLeft size={14} /> Back to website</Link></div></div></div>;
}

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const cards: [string, string, IconType, string][] = [['12', 'New enquiries', CalendarDays, '/admin/bookings'], ['06', 'Menu items', Utensils, '/admin/menu'], ['18', 'Gallery moments', Images, '/admin/gallery'], ['04', 'Published stories', FileText, '/admin/events']];
  return <AdminShell><AdminHeading eyebrow="Monday, 24 June 2024" title="Good morning, ZAHRA." action="New booking" onAction={() => setLocation('/admin/bookings')} /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([number, label, I, href]) => <Link href={href} key={label} className="hover-lift rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-5" data-testid={`card-admin-${label.toLowerCase().replaceAll(' ', '-')}`}><I size={18} className="text-[#de674f]" /><p className="mt-9 font-display text-5xl text-[#f7efdf]">{number}</p><p className="mt-1 text-sm text-[#f7efdf]/55">{label}</p></Link>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6"><div className="flex items-center justify-between"><h2 className="font-display text-3xl">Upcoming enquiries</h2><Link href="/admin/bookings" className="text-xs text-[#d9b56b]" data-testid="link-dashboard-bookings">View all <ArrowUpRight size={13} className="inline" /></Link></div><div className="mt-6 space-y-1">{[['Amaka & Dami', '12 Jul · Wedding · 120 guests', 'New'], ['Korede Studios', '20 Jul · Corporate · 46 guests', 'Review'], ['Nneka Obi', '03 Aug · Birthday · 24 guests', 'New']].map(([name, meta, status], i) => <div key={name} className="flex items-center justify-between border-t border-[#f7efdf]/10 py-4"><div><p className="text-sm">{name}</p><p className="mt-1 text-xs text-[#f7efdf]/45">{meta}</p></div><span className={`rounded-full px-2.5 py-1 font-mono-brand text-[9px] uppercase tracking-[.1em] ${i === 1 ? 'bg-[#d9b56b]/20 text-[#d9b56b]' : 'bg-[#de674f]/20 text-[#de8c7a]'}`}>{status}</span></div>)}</div></div><div className="rounded-2xl bg-[#d9b56b] p-6 text-[#2a1b2e]"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] opacity-60">Quick note</p><h2 className="mt-10 font-display text-4xl leading-[.95]">Your next<br />great table<br /><em>is waiting.</em></h2><Link href="/admin/settings" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.13em]" data-testid="link-dashboard-settings">Review settings <ArrowUpRight size={14} /></Link></div></div></AdminShell>;
}

type Collection = 'menu' | 'services' | 'gallery' | 'events' | 'testimonials' | 'bookings';
const collectionConfig: Record<Collection, { title: string; eyebrow: string; description: string; labels: string[]; seed: string[] }> = {
  menu: { title: 'Menu', eyebrow: 'Content / menu', description: 'The dishes and details your guests will discover.', labels: ['ZAHRA house jollof', 'Coconut curry prawns', 'Mango & ginger pavlova'], seed: ['ZAHRA house jollof', 'Citrus suya chicken', 'Mango & ginger pavlova'] },
  services: { title: 'Services', eyebrow: 'Content / offerings', description: 'Shape how guests find the right way to gather.', labels: ['Weddings', 'Private dining', 'Corporate events'], seed: ['Weddings', 'Private dining', 'Corporate events', 'Intimate celebrations'] },
  gallery: { title: 'Gallery', eyebrow: 'Content / visual stories', description: 'Images that show the texture of a ZAHRA table.', labels: ['The courtyard supper', 'A table for twelve', 'Good work, well fed'], seed: ['The courtyard supper', 'A table for twelve', 'Good work, well fed'] },
  events: { title: 'Events', eyebrow: 'Content / recent work', description: 'The work, the places, and the stories behind them.', labels: ['A garden wedding for 96', 'The Sunday table', 'The makers lunch'], seed: ['A garden wedding for 96', 'The Sunday table', 'The makers lunch'] },
  testimonials: { title: 'Testimonials', eyebrow: 'Content / kind words', description: 'Approved reviews ready to be shared.', labels: ['The room felt like ours', 'Every detail landed', 'Warm and precise'], seed: ['The food was the first thing people talked about', 'Every detail landed', 'Warm, precise and unflustered'] },
  bookings: { title: 'Bookings', eyebrow: 'Client desk / enquiries', description: 'Keep every conversation moving forward.', labels: ['Amaka & Dami', 'Korede Studios', 'Nneka Obi'], seed: ['Amaka & Dami', 'Korede Studios', 'Nneka Obi'] },
};

export function AdminCollectionPage({ type }: { type: Collection }) {
  const config = collectionConfig[type];
  const [items, setItems] = useState(config.seed);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const filtered = useMemo(() => items.filter((item) => item.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const add = () => { if (draft.trim()) { setItems((current) => [draft.trim(), ...current]); setDraft(''); setAdding(false); } };
  return <AdminShell><AdminHeading eyebrow={config.eyebrow} title={config.title} action={`Add ${type === 'bookings' ? 'booking' : 'new'}`} onAction={() => setAdding(true)} /><p className="mt-4 max-w-lg text-sm text-[#f7efdf]/50">{config.description}</p>{adding && <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#d9b56b]/35 bg-[#38263b] p-5 sm:flex-row"><input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} className="flex-1 border-b border-[#f7efdf]/25 bg-transparent px-1 py-2 text-sm outline-none focus:border-[#d9b56b]" placeholder={`Name this ${type === 'bookings' ? 'booking' : 'item'}`} data-testid="input-admin-new-item" /><button onClick={add} className="rounded-full bg-[#d9b56b] px-5 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]" data-testid="button-save-admin-item">Save</button><button onClick={() => setAdding(false)} className="px-3 text-xs text-[#f7efdf]/45" data-testid="button-cancel-admin-item">Cancel</button></div>}<div className="mt-10 rounded-2xl border border-[#f7efdf]/10 bg-[#38263b]"><div className="flex flex-col gap-4 border-b border-[#f7efdf]/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-[#f7efdf]/45"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none placeholder:text-[#f7efdf]/35" placeholder="Search this collection" data-testid="input-admin-search" /></div><span className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-[#f7efdf]/35">{filtered.length} records</span></div>{filtered.length ? <div>{filtered.map((item, i) => <div key={`${item}-${i}`} className="group flex items-center justify-between border-b border-[#f7efdf]/10 px-5 py-5 last:border-0" data-testid={`row-admin-${i}`}><div className="flex items-center gap-4"><span className="font-mono-brand text-[10px] text-[#d9b56b]">{String(i + 1).padStart(2, '0')}</span><div><p className="text-sm">{item}</p><p className="mt-1 font-mono-brand text-[9px] uppercase tracking-[.12em] text-[#f7efdf]/35">{type === 'bookings' ? 'New enquiry · needs review' : i === 0 ? 'Published · featured' : 'Draft · last edited today'}</p></div></div><div className="flex items-center gap-3"><button className="hidden rounded-full border border-[#f7efdf]/15 px-3 py-1.5 text-[10px] uppercase tracking-[.1em] text-[#f7efdf]/55 hover:border-[#d9b56b] hover:text-[#d9b56b] sm:block" data-testid={`button-edit-admin-${i}`}>Edit</button><button onClick={() => setItems((current) => current.filter((_, idx) => idx !== i))} className="rounded-full p-2 text-[#f7efdf]/35 hover:bg-[#de674f]/15 hover:text-[#de8c7a]" aria-label={`Delete ${item}`} data-testid={`button-delete-admin-${i}`}><X size={15} /></button></div></div>)}</div> : <div className="p-16 text-center"><Package className="mx-auto text-[#d9b56b]" size={30} /><p className="mt-4 font-display text-2xl">Nothing here yet.</p><p className="mt-2 text-sm text-[#f7efdf]/45">Try a different search, or add the first record.</p></div>}</div></AdminShell>;
}

export function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  return <AdminShell><AdminHeading eyebrow="Workspace / settings" title="The details." action="Save changes" onAction={() => setSaved(true)} /><div className="mt-10 grid max-w-4xl gap-5 md:grid-cols-2"><div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Business profile</p><div className="mt-7 space-y-5"><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">Business name<input defaultValue="ZAHRA Catering Service" className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" data-testid="input-settings-business-name" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">Reply email<input defaultValue="hello@zahra.ng" className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" data-testid="input-settings-email" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">WhatsApp number<input defaultValue="09079622010" className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" data-testid="input-settings-whatsapp" /></label></div></div><div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Site message</p><label className="mt-7 block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">Homepage headline<textarea defaultValue="Make it a table to remember." rows={3} className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" data-testid="textarea-settings-headline" /></label><div className="mt-8 flex items-start gap-3 rounded-xl bg-[#d9b56b]/10 p-4 text-xs leading-relaxed text-[#d9b56b]"><Palette size={16} className="mt-0.5 shrink-0" />Changes are ready to connect to your Supabase site_settings record.</div></div></div>{saved && <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-3 text-xs font-bold text-[#2a1b2e] shadow-lg" data-testid="status-settings-saved"><Check size={15} /> Changes saved</div>}</AdminShell>;
}

export function NotFoundPage() {
  return <PublicShell><section className="flex min-h-[70vh] items-center px-5 py-20 md:px-10"><div className="mx-auto text-center"><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#de674f]">404 / Wrong turn</p><h1 className="mt-5 font-display text-[8rem] leading-[.75] tracking-[-.08em] text-[#38263b] md:text-[13rem]">Oh <em className="text-[#de674f]">crumbs.</em></h1><p className="mx-auto mt-8 max-w-sm text-sm leading-relaxed text-[#38263b]/60">This page wandered off before dinner. Let's get you back to something good.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#38263b] px-6 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f7efdf]" data-testid="link-404-home">Back to the table <ArrowUpRight size={15} /></Link></div></section></PublicShell>;
}