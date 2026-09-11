import { type FormEvent, useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { AdminHeading, AdminShell } from '@/pages/site';
import { listBookings, updateBookingStatus } from '@/services/bookings';
import { getSiteSettings, updateSiteSettings } from '@/services/content';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Booking, SiteSettings } from '@/types/content';

export function AdminBookingsLivePage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    listBookings().then(setItems).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  const changeStatus = async (id: string, status: Booking['status']) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setItems((current) => current.map((item) => item.id === id ? updated : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the booking.');
    }
  };
  return <AdminShell><AdminHeading eyebrow="Client desk / enquiries" title="Bookings." /><p className="mt-4 max-w-lg text-sm text-[#f7efdf]/50">Every conversation, kept moving forward.</p>{loading ? <div className="mt-10 flex items-center gap-3 text-sm text-[#d9b56b]"><LoaderCircle className="animate-spin" size={18} /> Loading enquiries…</div> : error ? <p className="mt-10 text-sm text-[#de8c7a]">{error}</p> : items.length === 0 ? <div className="mt-10 rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-12 text-center text-sm text-[#f7efdf]/55">No bookings yet.</div> : <div className="mt-10 space-y-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="font-display text-2xl">{item.customer_name}</p><p className="mt-1 text-sm text-[#f7efdf]/55">{item.event_type} · {item.event_date} · {item.guest_count} guests</p><p className="mt-3 text-sm text-[#f7efdf]/70">{item.message}</p><p className="mt-3 text-xs text-[#d9b56b]">{item.phone}{item.email ? ` · ${item.email}` : ''} · {item.location}</p></div><select value={item.status} onChange={(event) => changeStatus(item.id, event.target.value as Booking['status'])} className="rounded-full border border-[#f7efdf]/15 bg-[#2a1b2e] px-3 py-2 text-xs text-[#f7efdf]"><option>New</option><option>Contacted</option><option>Confirmed</option><option>Completed</option></select></div></article>)}</div>}</AdminShell>;
}

const defaultSettings: SiteSettings = {
  id: '',
  business_name: 'ZAHRA Catering Service',
  phone: '09079622010',
  whatsapp: '09079622010',
  email: '',
  socials: {},
  address: '',
  service_area: 'Lagos and surrounding areas',
  hero_text: 'Make it a table to remember.',
  hero_image: null,
  about_text: '',
  updated_at: '',
};

export function AdminSettingsLivePage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    getSiteSettings().then((data) => data && setSettings((current) => ({ ...current, ...data }))).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);
  const update = (key: keyof SiteSettings, value: string) => setSettings((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const result = await updateSiteSettings({
        business_name: settings.business_name,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email || null,
        address: settings.address || null,
        service_area: settings.service_area || null,
        hero_text: settings.hero_text || null,
        about_text: settings.about_text || null,
      });
      setSettings((current) => ({ ...current, ...result }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };
  if (!isSupabaseConfigured) return <AdminShell><AdminHeading eyebrow="Workspace / settings" title="The details." /><p className="mt-8 max-w-lg text-sm text-[#f7efdf]/60">Connect Supabase to edit live site settings. The initial WhatsApp value is 09079622010.</p></AdminShell>;
  return <AdminShell><AdminHeading eyebrow="Workspace / settings" title="The details." /><form onSubmit={save} className="mt-10 grid max-w-4xl gap-5 md:grid-cols-2">{loading ? <div className="text-sm text-[#d9b56b]">Loading settings…</div> : <><div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Business profile</p><div className="mt-7 space-y-5">{(['business_name', 'email', 'phone', 'whatsapp', 'service_area', 'address'] as const).map((key) => <label key={key} className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">{key.replace('_', ' ')}<input value={settings[key] || ''} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" /></label>)}</div></div><div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6"><p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">Site message</p><label className="mt-7 block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">Homepage headline<textarea value={settings.hero_text || ''} onChange={(event) => update('hero_text', event.target.value)} rows={3} className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" /></label><label className="mt-7 block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">About copy<textarea value={settings.about_text || ''} onChange={(event) => update('about_text', event.target.value)} rows={5} className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm outline-none focus:border-[#d9b56b]" /></label><button disabled={saving} className="mt-8 flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e] disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'} {saved && <Check size={15} />}</button></div></>}{error && <p className="text-sm text-[#de8c7a] md:col-span-2">{error}</p>}</form></AdminShell>;
}