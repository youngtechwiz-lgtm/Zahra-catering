import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, LoaderCircle, MessageCircle } from 'lucide-react';
import {
  listPublicEvents,
  listPublicGallery,
  listPublicMenu,
  listPublicServices,
  listPublicTestimonials,
} from '@/services/content';
import { createBooking } from '@/services/bookings';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DEFAULT_WHATSAPP_NUMBER, whatsappUrl } from '@/lib/whatsapp';
import type { BookingInput, EventItem, GalleryItem, MenuCategory, MenuItem, Service, Testimonial } from '@/types/content';
import {
  ContactPage,
  EventsPage,
  GalleryPage,
  MenuPage,
  PublicShell,
  SectionIntro,
  ServicesPage,
  TestimonialsPage,
} from '@/pages/site';

function LoadingState() {
  return (
    <div className="flex min-h-[32vh] items-center justify-center">
      <LoaderCircle className="animate-spin text-[#de674f]" size={24} />
    </div>
  );
}

function ConnectionNotice() {
  return (
    <div className="mx-auto mt-8 max-w-xl border border-[#38263b]/15 bg-[#e6d7b9] p-5 text-sm leading-relaxed text-[#38263b]/70">
      Preview content is shown while Supabase is being connected. Once the
      project credentials are added, published records from the admin workspace
      will appear here automatically.
    </div>
  );
}

export function ServicesLivePage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listPublicServices()
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  if (!isSupabaseConfigured) return <ServicesPage />;
  return (
    <PublicShell>
      <section className="px-5 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro eyebrow="Our services" title={<>A menu for<br /><em className="text-[#de674f]">every gathering.</em></>} copy="From the first idea to the final clean-up, we bring a clear point of view and a calm pair of hands." />
          {loading ? <LoadingState /> : error ? <ConnectionNotice /> : items.length === 0 ? <ConnectionNotice /> : (
            <div className="mt-16">
              {items.map((item, index) => (
                <article key={item.id} className="grid gap-6 border-t border-[#38263b]/20 py-8 md:grid-cols-[.2fr_1fr_.8fr_auto] md:items-start md:py-10">
                  <span className="font-mono-brand text-[10px] text-[#de674f]">{String(index + 1).padStart(2, '0')}</span>
                  <h2 className="font-display text-4xl leading-none md:text-6xl">{item.title}</h2>
                  <p className="max-w-sm text-sm leading-relaxed text-[#38263b]/60">{item.description}</p>
                  <Link to="/contact" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#38263b]/25 hover:bg-[#38263b] hover:text-[#f7efdf]"><ArrowUpRight size={17} /></Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

export function MenuLivePage() {
  const [data, setData] = useState<{ categories: MenuCategory[]; items: MenuItem[] }>({ categories: [], items: [] });
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listPublicMenu().finally(() => setLoading(false)).then(setData);
  }, []);
  if (!isSupabaseConfigured) return <MenuPage />;
  const visibleItems = active === 'all' ? data.items : data.items.filter((item) => item.category_id === active);
  return (
    <PublicShell>
      <section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24">
        <div className="mx-auto max-w-[1200px]">
          <SectionIntro eyebrow="A taste of ZAHRA" title={<>Come hungry.<br /><em className="text-[#de674f]">Leave curious.</em></>} copy="Our menus move with the season and the mood of the room. Browse the current published menu below." />
          {loading ? <LoadingState /> : data.items.length === 0 ? <ConnectionNotice /> : (
            <>
              <div className="mt-14 flex gap-2 overflow-x-auto border-b border-[#38263b]/20 pb-3">
                <button onClick={() => setActive('all')} className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] ${active === 'all' ? 'bg-[#38263b] text-[#f7efdf]' : 'border border-[#38263b]/20'}`}>All</button>
                {data.categories.map((category) => <button key={category.id} onClick={() => setActive(category.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] ${active === category.id ? 'bg-[#38263b] text-[#f7efdf]' : 'border border-[#38263b]/20'}`}>{category.name}</button>)}
              </div>
              <div className="mt-10 grid gap-x-10 md:grid-cols-2">
                {visibleItems.map((item) => <article key={item.id} className="border-b border-[#38263b]/15 py-6"><div className="flex items-start justify-between gap-5"><div><h2 className="font-display text-3xl">{item.name}</h2><p className="mt-2 text-sm text-[#38263b]/55">{item.description}</p></div><span className="font-mono-brand text-xs text-[#38263b]/70">{item.price === null ? 'Quote' : `₦${item.price.toLocaleString()}`}</span></div><p className="mt-3 font-mono-brand text-[9px] uppercase tracking-[.14em] text-[#de674f]">{item.available ? 'Available' : 'Seasonal / enquire'}</p></article>)}
              </div>
            </>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

export function GalleryLivePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listPublicGallery().finally(() => setLoading(false)).then(setItems);
  }, []);
  if (!isSupabaseConfigured) return <GalleryPage />;
  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];
  const visible = filter === 'All' ? items : items.filter((item) => item.category === filter);
  return (
    <PublicShell>
      <section className="px-5 pb-20 pt-16 md:px-10 md:pt-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro eyebrow="The gallery" title={<>A feeling,<br /><em className="text-[#de674f]">in frames.</em></>} />
          {loading ? <LoadingState /> : items.length === 0 ? <ConnectionNotice /> : <><div className="mt-12 flex gap-2 overflow-x-auto">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[.12em] ${filter === category ? 'bg-[#de674f] text-[#f7efdf]' : 'border border-[#38263b]/20'}`}>{category}</button>)}</div><div className="mt-10 grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[250px]">{visible.map((item, index) => <figure key={item.id} className={`${index === 0 ? 'md:col-span-2 md:row-span-2' : index === 1 ? 'md:col-span-2' : ''} group relative overflow-hidden rounded-[.8rem] bg-[#d9b56b]`}><img src={item.image_url} alt={item.caption || `${item.category} catering`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#38263b]/80 to-transparent p-5 pt-14 text-[#f7efdf]"><p className="font-mono-brand text-[9px] uppercase tracking-[.16em] text-[#d9b56b]">{item.category}</p>{item.caption && <p className="mt-1 font-display text-2xl">{item.caption}</p>}</figcaption></figure>)}</div></>}
        </div>
      </section>
    </PublicShell>
  );
}

export function EventsLivePage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listPublicEvents().finally(() => setLoading(false)).then(setItems);
  }, []);
  if (!isSupabaseConfigured) return <EventsPage />;
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24"><div className="mx-auto max-w-[1100px]"><SectionIntro eyebrow="Recent work" title={<>The stories<br /><em className="text-[#de674f]">we got to feed.</em></>} copy="A few rooms, tables and very good reasons to gather." />{loading ? <LoadingState /> : items.length === 0 ? <ConnectionNotice /> : <div className="mt-16">{items.map((item) => <article key={item.id} className="grid gap-7 border-t border-[#38263b]/20 py-8 md:grid-cols-[.25fr_1fr_1.2fr] md:items-center md:py-10"><div className="font-mono-brand text-[10px] text-[#de674f]">{item.event_date}</div><div><h2 className="font-display text-4xl leading-none md:text-5xl">{item.title}</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#38263b]/60">{item.description}</p></div>{item.cover_image_url && <img src={item.cover_image_url} alt={item.title} loading="lazy" className="h-56 w-full rounded-[1rem_4rem_1rem_1rem] object-cover md:h-64" />}</article>)}</div>}</div></section></PublicShell>;
}

export function TestimonialsLivePage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    listPublicTestimonials().finally(() => setLoading(false)).then(setItems);
  }, []);
  if (!isSupabaseConfigured) return <TestimonialsPage />;
  return <PublicShell><section className="bg-[#38263b] px-5 py-20 text-[#f7efdf] md:px-10 md:py-32"><div className="mx-auto max-w-[1200px]"><SectionIntro eyebrow="Kind words" title={<>Good company<br /><em className="text-[#d9b56b]">says it best.</em></>} />{loading ? <LoadingState /> : items.length === 0 ? <ConnectionNotice /> : <div className="mt-16 grid gap-5 md:grid-cols-3">{items.map((item, index) => <blockquote key={item.id} className={`flex min-h-[330px] flex-col justify-between p-7 ${index === 1 ? 'bg-[#de674f]' : 'bg-[#4b3850]'}`}><span className="font-display text-6xl leading-none text-[#d9b56b]">“</span><p className="font-display text-3xl leading-[1.02]">{item.review}</p><footer className="border-t border-current/20 pt-4 text-[10px] uppercase tracking-[.14em] text-[#f7efdf]/65">{item.customer_name}</footer></blockquote>)}</div>}</div></section></PublicShell>;
}

export function ContactLivePage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<BookingInput>({ customer_name: '', phone: '', email: '', event_date: '', event_type: '', guest_count: 0, service_requested: '', budget: '', location: '', message: '' });
  function update<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createBooking({ ...form, guest_count: Number(form.guest_count) });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send the enquiry yet.');
    } finally {
      setSubmitting(false);
    }
  };
  if (!isSupabaseConfigured) return <ContactPage />;
  if (sent) return <PublicShell><section className="flex min-h-[70vh] items-center px-5 py-20 md:px-10"><div className="mx-auto max-w-2xl text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9b56b]"><Check size={28} /></span><p className="mt-8 font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#de674f]">Enquiry received</p><h1 className="mt-5 font-display text-6xl leading-[.9]">We will be in<br /><em className="text-[#de674f]">touch soon.</em></h1><p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#38263b]/60">Thank you, {form.customer_name || 'there'}. Your enquiry is now in the ZAHRA inbox.</p></div></section></PublicShell>;
  return <PublicShell><section className="px-5 pb-20 pt-16 md:px-10 md:pb-32 md:pt-24"><div className="mx-auto grid max-w-[1200px] gap-14 md:grid-cols-[.8fr_1.2fr]"><div><SectionIntro eyebrow="Let's talk" title={<>Tell us<br /><em className="text-[#de674f]">everything.</em></>} copy="Dates, dreams, dietary needs, a half-formed idea scribbled in your notes app. It all helps us start in the right place." /><div className="mt-12 border-t border-[#38263b]/20 pt-5"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#de674f]">Prefer a quick chat?</p><a href={whatsappUrl(DEFAULT_WHATSAPP_NUMBER)} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 font-display text-2xl hover:text-[#de674f]"><MessageCircle size={20} /> WhatsApp the team</a></div></div><form onSubmit={submit} className="rounded-[1rem_4rem_1rem_1rem] bg-[#e6d7b9] p-6 md:p-10"><div className="grid gap-6 md:grid-cols-2"><label className="block text-xs font-bold uppercase tracking-[.12em]">Your name<input required value={form.customer_name} onChange={(event) => update('customer_name', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="First and last name" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Phone<input required value={form.phone} onChange={(event) => update('phone', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="Your best number" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Email address<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="you@email.com" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Event date<input required value={form.event_date} onChange={(event) => update('event_date', event.target.value)} type="date" className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Event type<select required value={form.event_type} onChange={(event) => update('event_type', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]"><option value="">Choose one</option><option>Wedding</option><option>Private dinner</option><option>Corporate event</option><option>Birthday</option><option>Other celebration</option></select></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Guest count<input required min="1" type="number" value={form.guest_count || ''} onChange={(event) => update('guest_count', Number(event.target.value))} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="Approximate number" /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Service requested<input required value={form.service_requested} onChange={(event) => update('service_requested', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="Wedding, private dining, etc." /></label><label className="block text-xs font-bold uppercase tracking-[.12em]">Budget (optional)<input value={form.budget} onChange={(event) => update('budget', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="A range is helpful" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] md:col-span-2">Location<input required value={form.location} onChange={(event) => update('location', event.target.value)} className="mt-2 w-full border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="Where will you be gathering?" /></label><label className="block text-xs font-bold uppercase tracking-[.12em] md:col-span-2">Tell us about it<textarea required value={form.message} onChange={(event) => update('message', event.target.value)} rows={4} className="mt-2 w-full resize-none border-b border-[#38263b]/30 bg-transparent px-0 py-3 text-base font-normal outline-none focus:border-[#de674f]" placeholder="What are you imagining?" /></label></div>{error && <p className="mt-5 text-sm text-[#a24133]">{error}</p>}<button disabled={submitting} type="submit" className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#38263b] px-5 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#f7efdf] transition hover:bg-[#de674f] disabled:cursor-wait disabled:opacity-60">{submitting ? 'Sending enquiry…' : 'Send enquiry'} <ArrowUpRight size={16} /></button><p className="mt-4 text-center text-[11px] text-[#38263b]/45">Your message is stored securely for the ZAHRA team.</p></form></div></section></PublicShell>;
}