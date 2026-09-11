import { supabase } from '@/lib/supabase';
import type {
  EventItem,
  GalleryItem,
  MenuCategory,
  MenuItem,
  Service,
  SiteSettings,
  Testimonial,
} from '@/types/content';

export async function listPublicServices(): Promise<Service[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function listPublicMenu(): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
}> {
  if (!supabase) return { categories: [], items: [] };
  const [{ data: categoryData, error: categoryError }, { data: itemData, error: itemError }] =
    await Promise.all([
      supabase
        .from('menu_categories')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('menu_items')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
    ]);
  if (categoryError) throw categoryError;
  if (itemError) throw itemError;
  return {
    categories: (categoryData ?? []) as MenuCategory[],
    items: (itemData ?? []) as MenuItem[],
  };
}

export async function listPublicGallery(): Promise<GalleryItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export async function listPublicEvents(): Promise<EventItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .order('event_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function listPublicTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as SiteSettings | null;
}

export async function updateSiteSettings(
  updates: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>,
): Promise<SiteSettings> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: current, error: currentError } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .maybeSingle();
  if (currentError) throw currentError;
  const query = current?.id
    ? supabase.from('site_settings').update(updates).eq('id', current.id)
    : supabase.from('site_settings').insert(updates);
  const { data, error } = await query.select('*').single();
  if (error) throw error;
  return data as SiteSettings;
}