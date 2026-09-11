export type PublishableRecord = {
  id: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  business_name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  socials: Record<string, string>;
  address: string | null;
  service_area: string | null;
  hero_text: string | null;
  hero_image: string | null;
  about_text: string | null;
  updated_at: string;
};

export type Service = PublishableRecord & {
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  quote_label: string | null;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = PublishableRecord & {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  image_url: string | null;
  available: boolean;
};

export type GalleryItem = PublishableRecord & {
  image_url: string;
  category: string;
  caption: string | null;
};

export type EventItem = PublishableRecord & {
  title: string;
  slug: string;
  event_date: string;
  description: string;
  cover_image_url: string | null;
};

export type Testimonial = PublishableRecord & {
  customer_name: string;
  review: string;
  image_url: string | null;
};

export type BookingInput = {
  customer_name: string;
  phone: string;
  email?: string;
  event_date: string;
  event_type: string;
  guest_count: number;
  service_requested: string;
  budget?: string;
  location: string;
  message: string;
};

export type Booking = BookingInput & {
  id: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Completed';
  created_at: string;
  updated_at: string;
};