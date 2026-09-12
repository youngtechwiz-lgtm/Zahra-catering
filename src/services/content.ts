import { supabase } from '@/lib/supabase';
import type {
  Booking,
  EventItem,
  GalleryItem,
  MenuCategory,
  MenuItem,
  Service,
  SiteSettings,
  Testimonial,
} from '@/types/content';

/* =========================================================
   STORAGE HELPERS
========================================================= */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

async function uploadToBucket(
  bucket: string,
  folder: string,
  file: File,
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (PNG, JPG, WEBP, or SVG).');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image file must be 5MB or smaller.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error('Could not retrieve public image URL.');
  }

  return data.publicUrl;
}

export async function uploadMenuImage(file: File): Promise<string> {
  return uploadToBucket('menu-images', 'items', file);
}

export async function uploadServiceImage(file: File): Promise<string> {
  return uploadToBucket('service-images', 'services', file);
}

export async function uploadGalleryImage(file: File): Promise<string> {
  return uploadToBucket('gallery-images', 'gallery', file);
}

export async function uploadEventImage(file: File): Promise<string> {
  return uploadToBucket('event-images', 'events', file);
}

export async function uploadTestimonialImage(file: File): Promise<string> {
  return uploadToBucket('site-assets', 'testimonials', file);
}

/* =========================================================
   PUBLIC CONTENT
========================================================= */

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

  const [
    { data: categoryData, error: categoryError },
    { data: itemData, error: itemError },
  ] = await Promise.all([
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

/* =========================================================
   MENU & CATEGORIES ADMIN
========================================================= */

export type MenuItemInput = {
  name: string;
  category_id: string;
  description: string;
  price: number | null;
  image_url?: string | null;
  available?: boolean;
  published?: boolean;
  featured?: boolean;
  sort_order?: number;
};

export type MenuCategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  sort_order?: number;
  published?: boolean;
};

export async function listAdminMenuCategories(): Promise<MenuCategory[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MenuCategory[];
}

export async function createMenuCategory(
  input: MenuCategoryInput,
): Promise<MenuCategory> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const slug =
    input.slug.trim() ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('menu_categories')
    .insert({
      name: input.name,
      slug,
      description: input.description ?? null,
      sort_order: input.sort_order ?? 0,
      published: input.published ?? true,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MenuCategory;
}

export async function updateMenuCategory(
  id: string,
  updates: Partial<MenuCategoryInput>,
): Promise<MenuCategory> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const payload: Partial<MenuCategoryInput> = { ...updates };
  if (updates.name && !updates.slug) {
    payload.slug = updates.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await supabase
    .from('menu_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as MenuCategory;
}

export async function deleteMenuCategory(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Guard: check if any menu items are assigned to this category
  const { count, error: countError } = await supabase
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  if (countError) throw countError;

  if (count && count > 0) {
    throw new Error(
      `Cannot delete this category because ${count} menu item(s) are assigned to it. Please reassign or delete those items first.`,
    );
  }

  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function listAdminMenuItems(): Promise<MenuItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function createMenuItem(
  input: MenuItemInput,
): Promise<MenuItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const slug = `${input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: input.name,
      slug,
      category_id: input.category_id,
      description: input.description,
      price: input.price,
      image_url: input.image_url ?? null,
      available: input.available ?? true,
      published: input.published ?? true,
      featured: input.featured ?? false,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as MenuItem;
}

export async function updateMenuItem(
  id: string,
  updates: Partial<MenuItemInput>,
): Promise<MenuItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as MenuItem;
}

export async function deleteMenuItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================================================
   SERVICES ADMIN
========================================================= */

export type ServiceInput = {
  title: string;
  description: string;
  quote_label?: string | null;
  image_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

export async function listAdminServices(): Promise<Service[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function createService(input: ServiceInput): Promise<Service> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const slug = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from('services')
    .insert({
      title: input.title,
      slug,
      description: input.description,
      quote_label: input.quote_label ?? null,
      image_url: input.image_url ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Service;
}

export async function updateService(
  id: string,
  updates: Partial<ServiceInput>,
): Promise<Service> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Service;
}

export async function deleteService(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================================================
   GALLERY ADMIN
========================================================= */

export type GalleryItemInput = {
  image_url: string;
  category: string;
  caption?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

export async function listAdminGallery(): Promise<GalleryItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as GalleryItem[];
}

export async function createGalleryItem(
  input: GalleryItemInput,
): Promise<GalleryItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      image_url: input.image_url,
      category: input.category || 'Other',
      caption: input.caption ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as GalleryItem;
}

export async function updateGalleryItem(
  id: string,
  updates: Partial<GalleryItemInput>,
): Promise<GalleryItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as GalleryItem;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================================================
   EVENTS ADMIN
========================================================= */

export type EventItemInput = {
  title: string;
  slug?: string;
  event_date: string;
  description: string;
  cover_image_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

export async function listAdminEvents(): Promise<EventItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function createEvent(input: EventItemInput): Promise<EventItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const slug =
    input.slug?.trim() ||
    `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Math.random().toString(36).slice(2, 7)}`;

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      slug,
      event_date: input.event_date,
      description: input.description,
      cover_image_url: input.cover_image_url ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function updateEvent(
  id: string,
  updates: Partial<EventItemInput>,
): Promise<EventItem> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function deleteEvent(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================================================
   TESTIMONIALS ADMIN
========================================================= */

export type TestimonialInput = {
  customer_name: string;
  review: string;
  image_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
};

export async function listAdminTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<Testimonial> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      customer_name: input.customer_name,
      review: input.review,
      image_url: input.image_url ?? null,
      featured: input.featured ?? false,
      published: input.published ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function updateTestimonial(
  id: string,
  updates: Partial<TestimonialInput>,
): Promise<Testimonial> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =========================================================
   DASHBOARD STATS
========================================================= */

export type DashboardStats = {
  totalBookings: number;
  newBookings: number;
  totalMenuItems: number;
  totalServices: number;
  totalGallery: number;
  totalEvents: number;
  recentBookings: Booking[];
};

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  if (!supabase) {
    return {
      totalBookings: 0,
      newBookings: 0,
      totalMenuItems: 0,
      totalServices: 0,
      totalGallery: 0,
      totalEvents: 0,
      recentBookings: [],
    };
  }

  const [
    totalBookingsRes,
    newBookingsRes,
    menuItemsRes,
    servicesRes,
    galleryRes,
    eventsRes,
    recentBookingsRes,
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'New'),
    supabase.from('menu_items').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_items').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    totalBookings: totalBookingsRes.count ?? 0,
    newBookings: newBookingsRes.count ?? 0,
    totalMenuItems: menuItemsRes.count ?? 0,
    totalServices: servicesRes.count ?? 0,
    totalGallery: galleryRes.count ?? 0,
    totalEvents: eventsRes.count ?? 0,
    recentBookings: (recentBookingsRes.data ?? []) as Booking[],
  };
}

/* =========================================================
   SITE SETTINGS
========================================================= */

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
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data: current, error: currentError } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (currentError) throw currentError;

  const query = current?.id
    ? supabase
        .from('site_settings')
        .update(updates)
        .eq('id', current.id)
    : supabase.from('site_settings').insert(updates);

  const { data, error } = await query.select('*').single();

  if (error) throw error;
  return data as SiteSettings;
}