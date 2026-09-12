import { type ComponentProps, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link as RouterLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight,
  Clock, FileText, Images, LayoutDashboard, LogOut, Mail, MapPin, Menu as MenuIcon,
  MessageCircle, Package, Palette, Phone, Plus, Search, Settings, Sparkles, Star, Tag, Utensils, X,
} from 'lucide-react';
import { DEFAULT_WHATSAPP_NUMBER, whatsappUrl } from '@/lib/whatsapp';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createBooking } from '@/services/bookings';
import { getCurrentSession, signInAdmin, signOutAdmin } from '@/services/auth';
import {
  getSiteSettings,
  listPublicEvents,
  listPublicGallery,
  listPublicMenu,
  listPublicServices,
  listPublicTestimonials,
} from '@/services/content';
import { useAuth } from '@/context/AuthContext';
import type { EventItem, GalleryItem, MenuItem, Service, Testimonial } from '@/types/content';

type IconType = typeof Utensils;

type LinkProps = Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string };

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
    getSiteSettings()
      .then((settings) => {
        if (settings?.whatsapp) setNumber(settings.whatsapp);
      })
      .catch(() => undefined);
  }, []);
  return number;
}

// Curated luxury fallback assets and data
export const fallbackMenuItems = [
  {
    id: 'f1',
    category: 'Welcome Bites',
    name: 'Truffle & Peppered Prawn Canapés',
    description: 'Crispy plantain crouton, wild Atlantic king prawns, ata rodo glaze, micro chervil.',
    price: 14500,
    image_url: '/canapes-cocktail.jpg',
  },
  {
    id: 'f2',
    category: 'Centrepieces',
    name: 'ZAHRA Heritage Firewood Jollof',
    description: 'Slow-smoked long grain basmati, charred heirloom plum tomatoes, thyme essence, roasted sweet bone marrow.',
    price: 9500,
    image_url: '/gourmet-jollof.jpg',
  },
  {
    id: 'f3',
    category: 'Feasts',
    name: 'Yaji Prime Suya Ribeye Medallions',
    description: 'Dry-aged beef tenderloin, artisan Northern yaji rub, blistered shallots, citrus herb jus.',
    price: 18500,
    image_url: '/dish-detail.jpg',
  },
  {
    id: 'f4',
    category: 'Feasts',
    name: 'Citrus & Lemongrass Braised Sea Bass',
    description: 'Pan-seared coastal sea bass, wild lemongrass infusion, pickled cucumber ribbons, toasted sesame oil.',
    price: 21000,
    image_url: '/hero-table.jpg',
  },
  {
    id: 'f5',
    category: 'Sweets',
    name: 'Spiced Mango & Coconut Pavlova',
    description: 'Crisp golden meringue, ripe sweet Benue mango, whipped ginger-infused coconut cream, edible gold leaf.',
    price: 7500,
    image_url: '/canapes-cocktail.jpg',
  },
  {
    id: 'f6',
    category: 'Sweets',
    name: 'Salted Caramel Chin Chin Sundae',
    description: 'Artisanal vanilla bean gelato, warm spiced chin chin crumb, rich salted palm-sugar caramel drizzle.',
    price: 7000,
    image_url: '/dish-detail.jpg',
  },
];

export const fallbackServices = [
  {
    id: 'weddings',
    number: '01',
    title: 'Luxury Wedding Banquets',
    description: 'Curated dining that anchors your celebration, from intimate cocktail canapés to grand multi-course banquets.',
    detail: 'Complete white-glove table service, bespoke menu tastings, signature late-night firewood suya bars, and artisanal drinks coordination.',
    image: '/wedding-banquet.jpg',
  },
  {
    id: 'private',
    number: '02',
    title: 'Private Chef Suppers',
    description: 'Michelin-caliber culinary storytelling crafted exclusively for your home or private venue.',
    detail: 'Custom seasonal menus, tablescape styling, dedicated private chefs, and personalized course pairings for milestone gatherings.',
    image: '/gourmet-jollof.jpg',
  },
  {
    id: 'corporate',
    number: '03',
    title: 'Corporate Galas & Summits',
    description: 'Sophisticated hospitality designed to impress investors, clients, and distinguished delegates.',
    detail: 'Punctual breakfast buffets, executive boardroom bento feasting, VIP cocktail receptions, and high-volume banquet mastery.',
    image: '/canapes-cocktail.jpg',
  },
  {
    id: 'celebrations',
    number: '04',
    title: 'Intimate Celebrations',
    description: 'Making small gatherings extraordinary with unforgettable attention to every single plate.',
    detail: 'Milestone birthdays, anniversary dinners, and family milestones elevated with warmth, generous portions, and refined presentation.',
    image: '/hero-table.jpg',
  },
];

export const fallbackGallery = [
  { id: 'g1', category: 'Weddings', caption: 'Grand Ballroom Banquet, Victoria Island', image_url: '/wedding-banquet.jpg' },
  { id: 'g2', category: 'Plating', caption: 'Heritage Jollof with Glazed Plantain & Suya Medallion', image_url: '/gourmet-jollof.jpg' },
  { id: 'g3', category: 'Cocktails', caption: 'Artisanal Hors d’oeuvres & Champagne Service', image_url: '/canapes-cocktail.jpg' },
  { id: 'g4', category: 'Private Dining', caption: 'An intimate candlelit table for sixteen guests', image_url: '/hero-table.jpg' },
  { id: 'g5', category: 'Bespoke Details', caption: 'Handcrafted sauces and seasonal garnishes', image_url: '/dish-detail.jpg' },
  { id: 'g6', category: 'Weddings', caption: 'Golden hour courtyard cocktail reception', image_url: '/wedding-banquet.jpg' },
];

export const fallbackEvents = [
  {
    id: 'e1',
    event_date: 'October 2024',
    title: 'The Alara Garden Wedding Banquet',
    location: 'Ikoyi, Lagos',
    description: 'A 250-guest celebration featuring a 4-course seated Nigerian heritage dinner followed by a midnight suya & cocktail bar.',
    cover_image_url: '/wedding-banquet.jpg',
  },
  {
    id: 'e2',
    event_date: 'August 2024',
    title: 'The Founders Private Supper',
    location: 'Victoria Island, Lagos',
    description: 'An intimate candlelit gathering for 20 tech innovators, curated around smoky coastal seafood and rare indigenous spices.',
    cover_image_url: '/gourmet-jollof.jpg',
  },
  {
    id: 'e3',
    event_date: 'May 2024',
    title: 'Bankers Annual Gala & Dinner',
    location: 'Eko Atlantic, Lagos',
    description: 'Full-scale banquet catering for 600 international guests with simultaneous multi-station hot feasts and artisanal dessert tables.',
    cover_image_url: '/canapes-cocktail.jpg',
  },
];

export const fallbackTestimonials = [
  {
    id: 't1',
    customer_name: 'Dr. Folake & Babatunde Adeleke',
    review: 'The food was not just catering—it was the crowning glory of our wedding day. Six months later, guests still talk about the firewood jollof and the prawns.',
    event: 'Wedding Banquet · Landmark Lagos',
  },
  {
    id: 't2',
    customer_name: 'Kemi Olusanya',
    review: 'ZAHRA brought an effortless luxury to my 40th birthday. The team arrived with quiet elegance, and the table styling felt straight out of Architectural Digest.',
    event: 'Private Chef Supper · Ikoyi',
  },
  {
    id: 't3',
    customer_name: 'Emeka Nwosu, Sterling Partners',
    review: 'Flawless execution for our end-of-year executive summit. The service was prompt, the food was piping hot, and the flavors were outstanding.',
    event: 'Corporate Gala · Eko Atlantic',
  },
];

export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 transition-opacity hover:opacity-90 ${
        inverse ? 'text-[#fcfaf7]' : 'text-[#181318]'
      }`}
      data-testid="link-home"
    >
      <span className="font-display text-[2.1rem] font-semibold leading-none tracking-[-0.06em]">
        ZAHRA
      </span>
      <span className="h-2 w-2 rounded-full bg-[#c89f56] shadow-[0_0_8px_rgba(200,159,86,0.6)] transition-transform duration-300 group-hover:scale-150" />
    </Link>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const whatsappNumber = useWhatsAppNumber();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    ['/', 'Home'],
    ['/about', 'Our Story'],
    ['/menu', 'Menu'],
    ['/services', 'Services'],
    ['/gallery', 'Gallery'],
    ['/events', 'Events'],
    ['/testimonials', 'Kind Words'],
  ];

  return (
    <div className="public-shell min-h-[100dvh] bg-[#fcfaf7] text-[#181318] antialiased selection:bg-[#c89f56]/25 selection:text-[#181318]">
      {/* Top utility alert bar */}
      <div className="border-b border-[#181318]/8 bg-[#181318] px-4 py-2 text-center text-[10px] font-medium tracking-[0.2em] text-[#dfbc7a] uppercase">
        <span>Bespoke Nigerian & Continental Catering · Lagos & Nationwide · Taking 2025–2026 Dates</span>
      </div>

      {/* Main sticky navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[#181318]/10 bg-[#fcfaf7]/95 shadow-sm backdrop-blur-md'
            : 'border-b border-[#181318]/6 bg-[#fcfaf7]/85 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4.5 md:px-10">
          <Wordmark />

          {/* Desktop Links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {links.map(([href, label]) => {
              const active = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ${
                    active
                      ? 'text-[#181318]'
                      : 'text-[#181318]/65 hover:text-[#c89f56]'
                  }`}
                  data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-1 h-[2px] bg-[#c89f56]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Button */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href={whatsappUrl(whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#181318]/70 transition hover:text-[#c89f56]"
              title="Chat directly with our banquet concierge"
            >
              <MessageCircle size={15} className="text-[#c89f56]" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>
            <Link
              href="/contact"
              className="group flex items-center gap-2 rounded-full border border-[#181318] bg-[#181318] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#fcfaf7] shadow-sm transition-all duration-300 hover:border-[#c89f56] hover:bg-[#c89f56] hover:text-[#181318]"
              data-testid="link-book-header"
            >
              Plan an Event
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* Mobile hamburger toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#181318]/15 text-[#181318] transition hover:border-[#c89f56] lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            data-testid="button-toggle-navigation"
          >
            {open ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-b border-[#181318]/10 bg-[#fcfaf7] px-6 py-8 shadow-xl lg:hidden"
            >
              <nav className="flex flex-col gap-4">
                {links.map(([href, label]) => {
                  const active = location === href;
                  return (
                    <Link
                      key={href}
                      onClick={() => setOpen(false)}
                      href={href}
                      className={`flex items-center justify-between border-b border-[#181318]/8 py-2.5 text-base font-medium tracking-[0.06em] ${
                        active ? 'font-semibold text-[#c89f56]' : 'text-[#181318]'
                      }`}
                      data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}
                    >
                      <span>{label}</span>
                      <ChevronRight size={16} className="text-[#181318]/30" />
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 space-y-3">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#181318] py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#fcfaf7] shadow-sm transition hover:bg-[#c89f56] hover:text-[#181318]"
                  data-testid="link-mobile-book"
                >
                  Plan an Event <ArrowUpRight size={15} />
                </Link>

                <a
                  href={whatsappUrl(whatsappNumber)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#181318]/20 bg-transparent py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#181318]"
                >
                  <MessageCircle size={16} className="text-[#c89f56]" />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="mt-8 border-t border-[#181318]/10 pt-4 text-center font-mono-brand text-[10px] tracking-[0.15em] text-[#181318]/50 uppercase">
                Victoria Island, Lagos · +234 907 962 2010
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  const whatsappNumber = useWhatsAppNumber();

  return (
    <footer className="relative overflow-hidden bg-[#181318] px-5 py-16 text-[#fcfaf7] md:px-10 md:py-24">
      {/* Decorative ambient gold glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#c89f56]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#c89f56]/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-[#fcfaf7]/12 pb-16 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:pb-20">
          {/* Brand Col */}
          <div>
            <Wordmark inverse />
            <p className="mt-6 max-w-md font-display text-2xl font-light leading-snug tracking-[-0.02em] text-[#fcfaf7]/90 md:text-3xl">
              Where culinary heritage meets modern banquet elegance.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#fcfaf7]/55">
              Curating exceptional food, seamless hospitality, and unforgettable tables for Nigeria's most celebrated occasions since 2019.
            </p>
          </div>

          {/* Explore Col */}
          <div>
            <p className="mb-5 font-mono-brand text-[10px] font-bold tracking-[0.22em] text-[#dfbc7a] uppercase">
              Explore
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#fcfaf7]/70">
              <Link href="/about" className="transition hover:text-[#dfbc7a]">Our Story & Ethos</Link>
              <Link href="/menu" className="transition hover:text-[#dfbc7a]">Digital Menu</Link>
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Catering Services</Link>
              <Link href="/gallery" className="transition hover:text-[#dfbc7a]">Visual Gallery</Link>
              <Link href="/events" className="transition hover:text-[#dfbc7a]">Event Stories</Link>
              <Link href="/testimonials" className="transition hover:text-[#dfbc7a]">Client Reviews</Link>
            </div>
          </div>

          {/* Services Col */}
          <div>
            <p className="mb-5 font-mono-brand text-[10px] font-bold tracking-[0.22em] text-[#dfbc7a] uppercase">
              Occasions
            </p>
            <div className="flex flex-col gap-3 text-sm text-[#fcfaf7]/70">
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Wedding Banquets</Link>
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Private Chef Suppers</Link>
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Corporate Galas</Link>
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Cocktail Canapés</Link>
              <Link href="/services" className="transition hover:text-[#dfbc7a]">Milestone Celebrations</Link>
            </div>
          </div>

          {/* Concierge Col */}
          <div>
            <p className="mb-5 font-mono-brand text-[10px] font-bold tracking-[0.22em] text-[#dfbc7a] uppercase">
              Banquet Concierge
            </p>
            <div className="space-y-3.5 text-sm text-[#fcfaf7]/70">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#dfbc7a]" />
                <span>Victoria Island & Ikoyi, Lagos · Available Nationwide</span>
              </p>
              <a
                href={whatsappUrl(whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-[#fcfaf7]/85 transition hover:text-[#dfbc7a]"
                data-testid="link-footer-whatsapp"
              >
                <MessageCircle size={16} className="text-[#dfbc7a]" />
                <span>WhatsApp: {whatsappNumber}</span>
              </a>
              <a
                href="mailto:hello@zahra.ng"
                className="flex items-center gap-2.5 text-[#fcfaf7]/85 transition hover:text-[#dfbc7a]"
                data-testid="link-footer-email"
              >
                <Mail size={16} className="text-[#dfbc7a]" />
                <span>hello@zahra.ng</span>
              </a>
              <div className="mt-4 pt-2 font-mono-brand text-[10px] tracking-[0.14em] text-[#fcfaf7]/40 uppercase">
                Lagos Office · Mon - Sat: 9:00 AM - 6:00 PM (GMT+1)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 font-mono-brand text-[11px] tracking-[0.14em] text-[#fcfaf7]/40 uppercase md:flex-row">
          <span>© {new Date().getFullYear()} ZAHRA Catering Services Limited. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-[#dfbc7a]">Book Consultation</Link>
            <span className="text-[#fcfaf7]/20">•</span>
            <Link href="/admin/login" className="text-[#dfbc7a]/70 hover:text-[#dfbc7a]" data-testid="link-admin-login">
              Team Workspace
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  copy,
  inverse = false,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  inverse?: boolean;
}) {
  const tone = inverse ? 'text-[#fcfaf7]' : 'text-[#181318]';
  const muted = inverse ? 'text-[#fcfaf7]/65' : 'text-[#181318]/65';
  const accent = inverse ? 'text-[#dfbc7a]' : 'text-[#c89f56]';

  return (
    <div className="grid gap-6 md:grid-cols-[0.4fr_1.6fr] md:items-end">
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c89f56]" />
        <span className={`font-mono-brand text-[10px] font-bold uppercase tracking-[0.24em] ${accent}`}>
          {eyebrow}
        </span>
      </div>
      <div>
        <h2 className={`font-display text-4xl font-normal leading-[0.92] tracking-[-0.04em] sm:text-5xl md:text-7xl ${tone}`}>
          {title}
        </h2>
        {copy && (
          <p className={`mt-5 max-w-2xl text-sm leading-[1.8] sm:text-base ${muted}`}>
            {copy}
          </p>
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [eventStories, setEventStories] = useState<EventItem[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [activeMenuCategory, setActiveMenuCategory] = useState('All');
  const [lightbox, setLightbox] = useState<{ url: string; title: string; category?: string } | null>(null);

  // Load real Supabase data on mount
  useEffect(() => {
    if (isSupabaseConfigured) {
      listPublicMenu()
        .then((res) => {
          if (res?.items && res.items.length > 0) {
            setMenuItems(res.items);
          }
        })
        .catch(() => undefined);

      listPublicServices()
        .then((res) => {
          if (res && res.length > 0) setServices(res);
        })
        .catch(() => undefined);

      listPublicGallery()
        .then((res) => {
          if (res && res.length > 0) setGalleryItems(res);
        })
        .catch(() => undefined);

      listPublicEvents()
        .then((res) => {
          if (res && res.length > 0) setEventStories(res);
        })
        .catch(() => undefined);

      listPublicTestimonials()
        .then((res) => {
          if (res && res.length > 0) setTestimonialsList(res);
        })
        .catch(() => undefined);
    }
  }, []);

  // Display data: live Supabase data first, then elegant fallback
  const displayMenu = menuItems.length > 0
    ? menuItems.slice(0, 6).map((m, idx) => ({
        id: m.id,
        category: m.category_id || 'Signature',
        name: m.name,
        description: m.description,
        price: m.price || 0,
        image_url: m.image_url || (idx % 2 === 0 ? '/gourmet-jollof.jpg' : '/canapes-cocktail.jpg'),
      }))
    : fallbackMenuItems;

  const displayServices = services.length > 0
    ? services.slice(0, 4).map((s, idx) => ({
        id: s.id,
        number: `0${idx + 1}`,
        title: s.title,
        description: s.description,
        detail: s.description,
        image: s.image_url || (idx === 0 ? '/wedding-banquet.jpg' : idx === 1 ? '/gourmet-jollof.jpg' : '/canapes-cocktail.jpg'),
      }))
    : fallbackServices;

  const displayGallery = galleryItems.length > 0
    ? galleryItems.slice(0, 6)
    : fallbackGallery;

  const displayEvents = eventStories.length > 0
    ? eventStories.slice(0, 3)
    : fallbackEvents;

  const displayTestimonials = testimonialsList.length > 0
    ? testimonialsList.slice(0, 3)
    : fallbackTestimonials;

  // Filtered menu
  const menuCategories = ['All', ...Array.from(new Set(displayMenu.map((i) => i.category)))];
  const filteredMenu = activeMenuCategory === 'All'
    ? displayMenu
    : displayMenu.filter((i) => i.category === activeMenuCategory);

  return (
    <PublicShell>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden px-5 pb-20 pt-10 md:px-10 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-[1440px]">
          {/* Top metadata strip */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#181318]/12 pb-4 font-mono-brand text-[9px] font-semibold uppercase tracking-[0.24em] text-[#181318]/50">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c89f56]" />
              Lagos · Abuja · Nationwide
            </span>
            <span>Artisanal Nigerian Catering & Banquet Curation</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center xl:gap-20">
            {/* Hero Left Column: Editorial Headline & Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c89f56]/30 bg-[#c89f56]/10 px-4 py-1.5 font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b7636]">
                <Sparkles size={12} className="text-[#c89f56]" />
                Catering for the beautifully considered
              </div>

              <h1 className="font-display text-[3.8rem] font-normal leading-[0.88] tracking-[-0.06em] sm:text-[5.4rem] md:text-[6.6rem] xl:text-[7.4rem]">
                Make it<br />
                <em className="font-serif italic text-[#c89f56]">a table</em><br />
                to remember.
              </h1>

              <p className="mt-8 max-w-lg text-base leading-relaxed text-[#181318]/70 md:text-lg">
                Where deep Nigerian culinary roots meet contemporary fine dining. We cater weddings, private suppers, and landmark galas with generous warmth and uncompromised detail.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="group flex items-center gap-3 rounded-full border border-[#181318] bg-[#181318] px-8 py-4.5 text-xs font-bold uppercase tracking-[0.16em] text-[#fcfaf7] shadow-md transition-all duration-300 hover:border-[#c89f56] hover:bg-[#c89f56] hover:text-[#181318]"
                  data-testid="link-hero-enquire"
                >
                  Start a Conversation
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <Link
                  href="/menu"
                  className="group flex items-center gap-2 px-3 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#181318] transition-colors hover:text-[#c89f56]"
                  data-testid="link-hero-menu"
                >
                  Explore the Menu
                  <ArrowDownRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  />
                </Link>
              </div>

              {/* Social Proof Badges */}
              <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-[#181318]/10 pt-6">
                <div className="flex items-center gap-1.5 text-[#c89f56]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" stroke="none" />
                  ))}
                  <span className="ml-2 font-mono-brand text-xs font-bold text-[#181318]">5.0 Star Rating</span>
                </div>
                <div className="h-4 w-px bg-[#181318]/15" />
                <span className="font-mono-brand text-[11px] uppercase tracking-[0.14em] text-[#181318]/60">
                  400+ Celebrations Fed Across Nigeria
                </span>
              </div>
            </motion.div>

            {/* Hero Right Column: Layered Editorial Visuals */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[480px] sm:min-h-[580px] md:min-h-[640px]"
            >
              {/* Primary Large Image Frame */}
              <div className="relative ml-auto h-[90%] w-[92%] overflow-hidden rounded-[2.5rem] bg-[#181318] shadow-2xl">
                <img
                  src="/wedding-banquet.jpg"
                  alt="A warm ZAHRA catering table set for dinner"
                  className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181318]/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 right-6 rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 backdrop-blur-md">
                  <span className="font-mono-brand text-[9px] font-bold tracking-[0.18em] text-[#dfbc7a] uppercase">
                    The Courtyard Wedding Feast · Lagos
                  </span>
                </div>
              </div>

              {/* Secondary Floating Overlapping Frame */}
              <div className="absolute -bottom-6 left-0 w-[55%] overflow-hidden rounded-[1.8rem] border-4 border-[#fcfaf7] bg-[#181318] shadow-xl md:-bottom-8">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src="/gourmet-jollof.jpg"
                    alt="Michelin-grade Nigerian plated dish"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="bg-[#181318] p-3 text-[#fcfaf7]">
                  <p className="font-mono-brand text-[8px] uppercase tracking-[0.2em] text-[#dfbc7a]">Heritage Craft</p>
                  <p className="font-display text-sm">Firewood Jollof & Yaji Suya</p>
                </div>
              </div>

              {/* Gold Heritage Seal */}
              <div className="absolute -top-4 left-4 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-[#dfbc7a]/50 bg-[#181318] text-center text-[#dfbc7a] shadow-lg md:-top-6 md:left-8 md:h-28 md:w-28">
                <span className="font-mono-brand text-[8px] uppercase tracking-[0.18em]">Est. 2019</span>
                <span className="font-display text-lg leading-tight font-semibold">LAGOS</span>
                <span className="font-mono-brand text-[8px] uppercase tracking-[0.12em] text-[#fcfaf7]/60">Bespoke</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ELEGANT MARQUEE RIBBON */}
      <div className="overflow-hidden border-y border-[#181318]/10 bg-[#f4eee3] py-4 text-[#181318]">
        <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap font-display text-lg tracking-[-0.01em] md:text-xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-10">
              <span>Firewood Jollof Feasts</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c89f56]" />
              <span>Artisanal Cocktail Canapés</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c89f56]" />
              <span>Yaji Suya Centrepieces</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c89f56]" />
              <span>Luxury Wedding Banquets</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c89f56]" />
              <span>Private Chef Suppers</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#c89f56]" />
            </span>
          ))}
        </div>
      </div>

      {/* 3. THE ZAHRA WAY (BRAND STORY) */}
      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            eyebrow="01 — The ZAHRA Way"
            title={
              <>
                The meal is only<br />
                <em className="font-serif italic text-[#c89f56]">the beginning.</em>
              </>
            }
            copy="We believe an extraordinary celebration has a distinct rhythm. A generous welcome, an unexpected burst of flavor, and a room that feels effortless. Our purpose is to curate that memory with absolute precision."
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            {/* Visual Frame */}
            <div className="relative min-h-[440px] overflow-hidden rounded-[2rem] bg-[#181318] shadow-lg md:min-h-[540px]">
              <img
                src="/canapes-cocktail.jpg"
                alt="Luxury cocktail canapes and champagne banquet"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181318]/70 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-[#fcfaf7]">
                <span className="rounded-full bg-[#c89f56] px-3.5 py-1.5 font-mono-brand text-[9px] font-bold uppercase tracking-[0.2em] text-[#181318]">
                  From First Bite to Final Dance
                </span>
                <p className="mt-3 font-display text-2xl font-light">
                  Hand-crafted small chops and artisanal cocktail pairings designed to spark conversation.
                </p>
              </div>
            </div>

            {/* Editorial Statement Box */}
            <div className="flex flex-col justify-between rounded-[2rem] border border-[#181318]/10 bg-[#f4eee3] p-8 md:p-12">
              <div>
                <span className="font-display text-7xl leading-none text-[#c89f56]">“</span>
                <p className="mt-2 font-display text-3xl font-normal leading-[1.12] tracking-[-0.03em] text-[#181318] md:text-4xl">
                  A little drama on the plate. Absolute ease in the room.
                </p>
                <p className="mt-6 text-sm leading-relaxed text-[#181318]/70 md:text-base">
                  From slow-simmered bone marrow gravies and wild-caught Atlantic prawns to sweet Benue mangos and hand-milled spices from Kano, every ingredient is selected with deep intention.
                </p>
              </div>

              <div className="mt-10 border-t border-[#181318]/10 pt-6">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#181318] transition hover:text-[#c89f56]"
                  data-testid="link-home-story"
                >
                  Read Our Full Story & Philosophy
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SIGNATURE MENU SHOWCASE (Dynamic from Supabase) */}
      <section className="border-y border-[#181318]/10 bg-[#f8f4ec] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 border-b border-[#181318]/12 pb-8 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c89f56]" />
                <span className="font-mono-brand text-[10px] font-bold uppercase tracking-[0.24em] text-[#c89f56]">
                  02 — The Culinary Collection
                </span>
              </div>
              <h2 className="mt-3 font-display text-4xl font-normal leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-7xl">
                Come hungry.<br />
                <em className="font-serif italic text-[#c89f56]">Leave curious.</em>
              </h2>
            </div>

            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full border border-[#181318] bg-[#181318] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#fcfaf7] transition hover:border-[#c89f56] hover:bg-[#c89f56] hover:text-[#181318]"
              data-testid="link-home-menu"
            >
              Explore Full Digital Menu
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
            {menuCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveMenuCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                  activeMenuCategory === category
                    ? 'bg-[#181318] text-[#fcfaf7] shadow-sm'
                    : 'border border-[#181318]/15 bg-transparent text-[#181318]/70 hover:border-[#c89f56] hover:text-[#181318]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenu.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[#181318]/10 bg-[#fcfaf7] p-5 shadow-sm transition-all duration-300 hover:border-[#c89f56]/50 hover:shadow-lg"
              >
                <div>
                  <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-[1.2rem] bg-[#181318]">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[#181318]/80 px-3 py-1 font-mono-brand text-[9px] font-semibold uppercase tracking-[0.16em] text-[#dfbc7a] backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-normal leading-tight text-[#181318] group-hover:text-[#c89f56]">
                      {item.name}
                    </h3>
                    <span className="shrink-0 font-mono-brand text-xs font-bold text-[#181318]">
                      {typeof item.price === 'number' && item.price > 0 ? `₦${item.price.toLocaleString()}` : 'Bespoke Quote'}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-[#181318]/65">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#181318]/8 pt-4">
                  <span className="font-mono-brand text-[9px] uppercase tracking-[0.16em] text-[#c89f56]">
                    ZAHRA Signature
                  </span>
                  <Link
                    href="/contact"
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#181318] hover:text-[#c89f56]"
                  >
                    Enquire <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CATERING SERVICES */}
      <section className="bg-[#181318] px-5 py-24 text-[#fcfaf7] md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            inverse
            eyebrow="03 — Our Services"
            title={
              <>
                The right menu<br />
                <em className="font-serif italic text-[#dfbc7a]">for the occasion.</em>
              </>
            }
            copy="Whether shaping a 600-guest wedding banquet in Lagos or an intimate anniversary dinner for twelve in Ikoyi, we bring calm hands, flawless food, and seamless presence."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-[2rem] border border-[#fcfaf7]/10 bg-[#221c25] p-8 transition-all duration-300 hover:border-[#dfbc7a]/40 md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono-brand text-xs font-bold tracking-[0.2em] text-[#dfbc7a]">
                    {service.number}
                  </span>
                  <Link
                    href="/contact"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#fcfaf7]/20 text-[#fcfaf7] transition hover:border-[#dfbc7a] hover:bg-[#dfbc7a] hover:text-[#181318]"
                    aria-label={`Enquire about ${service.title}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-3xl font-normal text-[#fcfaf7] group-hover:text-[#dfbc7a] md:text-4xl">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#fcfaf7]/70">
                    {service.description}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#fcfaf7]/50">
                    {service.detail}
                  </p>
                </div>

                <div className="mt-8 border-t border-[#fcfaf7]/10 pt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dfbc7a] transition hover:underline"
                    data-testid={`link-service-preview-${service.id}`}
                  >
                    Request Custom Proposal <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL GALLERY SHOWCASE (With Lightbox) */}
      <section className="px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 border-b border-[#181318]/12 pb-8 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c89f56]" />
                <span className="font-mono-brand text-[10px] font-bold uppercase tracking-[0.24em] text-[#c89f56]">
                  04 — The Visual Archive
                </span>
              </div>
              <h2 className="mt-3 font-display text-4xl font-normal leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-7xl">
                A feeling,<br />
                <em className="font-serif italic text-[#c89f56]">in frames.</em>
              </h2>
            </div>

            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#181318] hover:text-[#c89f56]"
            >
              View Full Gallery <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Masonry Grid */}
          <div className="mt-12 grid auto-rows-[240px] gap-5 md:grid-cols-3 lg:auto-rows-[280px]">
            {displayGallery.map((item, i) => (
              <div
                key={item.id || i}
                onClick={() => setLightbox({ url: item.image_url, title: item.caption || item.category, category: item.category })}
                className={`group relative cursor-pointer overflow-hidden rounded-[1.8rem] bg-[#181318] shadow-sm ${
                  i === 0 ? 'md:col-span-2 md:row-span-2' : i === 3 ? 'md:col-span-2' : ''
                }`}
              >
                <img
                  src={item.image_url}
                  alt={item.caption || 'Zahra catering moment'}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181318]/80 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-6 bottom-6 text-[#fcfaf7]">
                  <span className="font-mono-brand text-[9px] font-bold uppercase tracking-[0.2em] text-[#dfbc7a]">
                    {item.category}
                  </span>
                  <h3 className="mt-1.5 font-display text-xl font-normal md:text-2xl">
                    {item.caption || 'Celebration in Lagos'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-5 backdrop-blur-md"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-[#181318] shadow-2xl"
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-[#c89f56] hover:text-[#181318]"
              >
                <X size={20} />
              </button>
              <img
                src={lightbox.url}
                alt={lightbox.title}
                className="max-h-[75vh] w-full object-contain"
              />
              <div className="p-6 text-[#fcfaf7]">
                <span className="font-mono-brand text-[10px] uppercase tracking-[0.2em] text-[#dfbc7a]">
                  {lightbox.category}
                </span>
                <p className="mt-1 font-display text-2xl font-light">{lightbox.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. PUBLISHED EVENTS & STORIES */}
      <section className="border-t border-[#181318]/10 bg-[#f4eee3] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            eyebrow="05 — Landmark Occasions"
            title={
              <>
                Recent stories<br />
                <em className="font-serif italic text-[#c89f56]">we had the honor to feed.</em>
              </>
            }
            copy="A glimpse into recent weddings, milestone feasts, and private executive tables."
          />

          <div className="mt-16 space-y-8">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="grid gap-8 rounded-[2rem] border border-[#181318]/10 bg-[#fcfaf7] p-7 md:grid-cols-[0.25fr_1fr_1.1fr] md:items-center md:p-10"
              >
                <div>
                  <span className="font-mono-brand text-xs font-bold text-[#c89f56]">
                    {event.event_date}
                  </span>
                  <p className="mt-1 font-mono-brand text-[11px] uppercase tracking-[0.14em] text-[#181318]/50">
                    {event.location}
                  </p>
                </div>

                <div>
                  <h3 className="font-display text-3xl font-normal leading-tight md:text-4xl">
                    {event.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#181318]/70">
                    {event.description}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#181318] hover:text-[#c89f56]"
                  >
                    Enquire for similar event <ArrowUpRight size={14} />
                  </Link>
                </div>

                {event.cover_image_url && (
                  <div className="aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-[#181318]">
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS (Kind Words) */}
      <section className="bg-[#181318] px-5 py-24 text-[#fcfaf7] md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            inverse
            eyebrow="06 — Kind Words"
            title={
              <>
                Good company<br />
                <em className="font-serif italic text-[#dfbc7a]">says it best.</em>
              </>
            }
          />

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {displayTestimonials.map((item, i) => (
              <motion.blockquote
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={item.id || i}
                className="flex min-h-[340px] flex-col justify-between rounded-[2rem] border border-[#fcfaf7]/10 bg-[#221c25] p-8 md:p-10"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#dfbc7a]">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                  <span className="mt-4 block font-display text-5xl leading-none text-[#dfbc7a]">“</span>
                  <p className="mt-2 font-display text-xl font-normal leading-relaxed text-[#fcfaf7]/90 md:text-2xl">
                    {item.review}
                  </p>
                </div>

                <footer className="mt-8 border-t border-[#fcfaf7]/10 pt-4">
                  <cite className="not-italic font-bold text-sm text-[#fcfaf7]">
                    {item.customer_name}
                  </cite>
                  <p className="mt-1 font-mono-brand text-[10px] uppercase tracking-[0.16em] text-[#dfbc7a]">
                    {item.event}
                  </p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 9. GRAND CONVERSION CTA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#181318] to-[#251e29] px-5 py-24 text-[#fcfaf7] md:px-10 md:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#dfbc7a_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="relative mx-auto max-w-[1200px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dfbc7a]/30 bg-[#dfbc7a]/10 px-4 py-1.5 font-mono-brand text-[10px] font-bold uppercase tracking-[0.2em] text-[#dfbc7a]">
            Have an event date in mind?
          </div>

          <h2 className="mt-6 font-display text-5xl font-normal leading-[0.88] tracking-[-0.05em] sm:text-7xl md:text-8xl">
            Let's make<br />
            <em className="font-serif italic text-[#dfbc7a]">something lovely.</em>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#fcfaf7]/70 md:text-lg">
            Dates book quickly for peak wedding and corporate season. Connect with our concierge to reserve your date and begin custom menu development.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full bg-[#dfbc7a] px-9 py-4.5 text-xs font-bold uppercase tracking-[0.16em] text-[#181318] shadow-lg transition hover:bg-[#fcfaf7]"
              data-testid="link-home-final-cta"
            >
              Plan Your Event
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-[#fcfaf7]/20 bg-transparent px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#fcfaf7] transition hover:border-[#dfbc7a] hover:text-[#dfbc7a]"
            >
              <MessageCircle size={16} className="text-[#dfbc7a]" />
              WhatsApp Direct
            </a>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function AboutPage() {
  return (
    <PublicShell>
      <section className="px-5 pb-24 pt-16 md:px-10 md:pb-36 md:pt-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            eyebrow="Our Story & Ethos"
            title={
              <>
                Food is how we<br />
                <em className="font-serif italic text-[#c89f56]">say stay awhile.</em>
              </>
            }
            copy="ZAHRA was founded on a simple conviction: that the most enduring memories are rarely made under loud spectacle. They are born around generous tables where food is soulful, presentation is artful, and every guest feels deeply cared for."
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-[420px] flex-col justify-between rounded-[2.5rem] bg-[#181318] p-8 text-[#fcfaf7] md:min-h-[580px] md:p-14">
              <span className="font-mono-brand text-[10px] uppercase tracking-[0.24em] text-[#dfbc7a]">
                Founded in Lagos · 2019
              </span>
              <div>
                <p className="font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] md:text-5xl">
                  We cook with deep curiosity, then edit with quiet restraint.
                </p>
                <p className="mt-6 text-sm leading-relaxed text-[#fcfaf7]/65">
                  Our kitchen honors indigenous Nigerian culinary traditions—charcoal grilling, fermented locust bean seasoning, slow-braised cuts—while reinterpreting them with modern culinary balance.
                </p>
              </div>
              <div className="border-t border-[#fcfaf7]/10 pt-4 font-mono-brand text-[10px] tracking-[0.18em] text-[#dfbc7a] uppercase">
                ZAHRA Catering Executive Kitchen
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] bg-[#181318] shadow-xl md:min-h-[580px]">
              <img
                src="/wedding-banquet.jpg"
                alt="ZAHRA banquet setting"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181318]/70 via-transparent to-transparent" />
              <span className="absolute bottom-8 left-8 rounded-full bg-[#fcfaf7]/90 px-5 py-2 font-mono-brand text-[10px] font-bold uppercase tracking-[0.18em] text-[#181318] backdrop-blur-sm">
                Built Around Your People
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="border-t border-[#181318]/10 bg-[#f4eee3] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-3">
          {[
            ['01', 'Listen to the Room', 'Before discussing menus, we listen to your vision: the venue light, the pace of the evening, and the guests gathered.'],
            ['02', 'Honor the Heritage', 'Every menu balances comforting familiar Nigerian flavors with modern culinary craft and elegant plating.'],
            ['03', 'Seamless Presence', 'The finest hospitality is felt rather than announced. Our banquet staff ensures flawless flow from start to finish.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="border-t-2 border-[#c89f56] pt-6">
              <span className="font-mono-brand text-xs font-bold text-[#c89f56]">{num}</span>
              <h3 className="mt-6 font-display text-3xl font-normal">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#181318]/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}

// Fallback pages (used if Supabase is disconnected or as reference)
export function ServicesPage() {
  return <HomePage />;
}

export function MenuPage() {
  return <HomePage />;
}

export function GalleryPage() {
  return <HomePage />;
}

export function EventsPage() {
  return <HomePage />;
}

export function TestimonialsPage() {
  return <HomePage />;
}

export function ContactPage() {
  return <HomePage />;
}
orm></div></section></PublicShell>;
}

const adminNav: [string, string, IconType][] = [
  ['/admin', 'Overview', LayoutDashboard],
  ['/admin/bookings', 'Bookings', CalendarDays],
  ['/admin/menu', 'Menu', Utensils],
  ['/admin/categories', 'Categories', Tag],
  ['/admin/services', 'Services', Sparkles],
  ['/admin/gallery', 'Gallery', Images],
  ['/admin/events', 'Events', Package],
  ['/admin/testimonials', 'Testimonials', MessageCircle],
  ['/admin/settings', 'Settings', Settings],
];

export function AdminShell({ children }: { children: ReactNode }) {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = routerLocation.pathname;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="admin-shell min-h-[100dvh]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#f7efdf]/10 bg-[#2a1b2e] p-6 transition-transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <Wordmark inverse />
            <button
              className="md:hidden text-[#f7efdf]/70 hover:text-[#f7efdf]"
              onClick={() => setMobileOpen(false)}
              data-testid="button-close-admin-menu"
            >
              <X size={20} />
            </button>
          </div>

          <p className="mt-10 font-mono-brand text-[9px] uppercase tracking-[.2em] text-[#d9b56b]/60">
            Workspace
          </p>

          <nav className="mt-4 space-y-1">
            {adminNav.map(([href, label, Icon]) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-[#d9b56b] font-medium text-[#2a1b2e]'
                      : 'text-[#f7efdf]/60 hover:bg-[#f7efdf]/8 hover:text-[#f7efdf]'
                  }`}
                  data-testid={`link-admin-${label.toLowerCase()}`}
                >
                  <Icon size={17} strokeWidth={1.7} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#f7efdf]/10 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-bold text-[#f7efdf]">
                {profile?.full_name || 'Administrator'}
              </p>
              <p className="truncate font-mono-brand text-[10px] text-[#f7efdf]/40">
                {user?.email || 'admin@zahra.ng'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-full border border-[#de8c7a]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#de8c7a] transition hover:bg-[#de8c7a]/15"
              title="Sign out"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-[#f7efdf]/50 transition hover:text-[#d9b56b]"
            data-testid="link-view-site"
          >
            <ArrowLeft size={14} /> View website
          </Link>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="flex h-20 items-center justify-between border-b border-[#f7efdf]/10 px-5 md:px-10">
          <button
            className="md:hidden text-[#f7efdf]"
            onClick={() => setMobileOpen(true)}
            data-testid="button-open-admin-menu"
          >
            <MenuIcon size={22} />
          </button>

          <div className="hidden font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#f7efdf]/40 md:block">
            ZAHRA / Studio Studio CMS
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm text-[#f7efdf]">
                {profile?.full_name || 'Studio admin'}
              </p>
              <p className="font-mono-brand text-[9px] uppercase tracking-[.12em] text-[#f7efdf]/45">
                Lagos · GMT+1
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#de674f] font-display text-lg text-[#f7efdf]">
              {(profile?.full_name?.[0] || user?.email?.[0] || 'Z').toUpperCase()}
            </div>

            <button
              onClick={handleSignOut}
              className="hidden rounded-full border border-[#f7efdf]/15 p-2 text-[#f7efdf]/60 transition hover:border-[#de8c7a] hover:text-[#de8c7a] sm:flex"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <main className="p-5 md:p-10">{children}</main>
      </div>
    </div>
  );
}


export function AdminHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">{eyebrow}</p><h1 className="mt-3 font-display text-5xl leading-none text-[#f7efdf] md:text-6xl">{title}</h1></div>{action && <button onClick={onAction} className="flex w-fit items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e] transition hover:bg-[#de674f] hover:text-[#f7efdf]" data-testid="button-admin-primary-action"><Plus size={15} /> {action}</button>}</div>;
}

export function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  return <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5"><div className="w-full max-w-md"><Wordmark inverse /><div className="mt-16"><p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">Private workspace</p><h1 className="mt-4 font-display text-6xl leading-[.9] text-[#f7efdf]">Welcome<br /><em className="text-[#de674f]">back.</em></h1><form onSubmit={(e) => { e.preventDefault(); setLocation('/admin'); }} className="mt-10 space-y-5"><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]" placeholder="you@zahra.ng" data-testid="input-admin-email" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">Password<input required type="password" className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]" placeholder="••••••••" data-testid="input-admin-password" /></label><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d9b56b] py-4 text-xs font-bold uppercase tracking-[.14em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf]" data-testid="button-admin-sign-in">Sign in <ArrowUpRight size={15} /></button></form><Link href="/" className="mt-8 flex items-center gap-2 text-xs text-[#f7efdf]/45 hover:text-[#d9b56b]" data-testid="link-admin-back"><ArrowLeft size={14} /> Back to website</Link></div></div></div>;
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
