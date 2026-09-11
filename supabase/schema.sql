create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'ZAHRA Catering Service',
  phone text not null default '09079622010',
  whatsapp text not null default '09079622010',
  email text,
  socials jsonb not null default '{}'::jsonb,
  address text,
  service_area text,
  hero_text text,
  hero_image text,
  about_text text,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  image_url text,
  quote_label text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(12, 2),
  image_url text,
  available boolean not null default true,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  category text not null default 'Other',
  caption text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_date date not null,
  description text not null,
  cover_image_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  review text not null,
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  event_date date not null,
  event_type text not null,
  guest_count integer not null check (guest_count > 0),
  service_requested text not null,
  budget text,
  location text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Confirmed', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_published_featured_idx on public.services (published, featured);
create index if not exists menu_items_category_published_idx on public.menu_items (category_id, published);
create index if not exists gallery_items_published_category_idx on public.gallery_items (published, category);
create index if not exists events_published_date_idx on public.events (published, event_date desc);
create index if not exists bookings_status_created_idx on public.bookings (status, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.gallery_items enable row level security;
alter table public.events enable row level security;
alter table public.testimonials enable row level security;
alter table public.bookings enable row level security;

create policy "public can view site settings" on public.site_settings
  for select using (true);
create policy "admins manage site settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published services" on public.services
  for select using (published = true or public.is_admin());
create policy "admins manage services" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published categories" on public.menu_categories
  for select using (published = true or public.is_admin());
create policy "admins manage categories" on public.menu_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published menu items" on public.menu_items
  for select using (published = true or public.is_admin());
create policy "admins manage menu items" on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published gallery" on public.gallery_items
  for select using (published = true or public.is_admin());
create policy "admins manage gallery" on public.gallery_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published events" on public.events
  for select using (published = true or public.is_admin());
create policy "admins manage events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can view published testimonials" on public.testimonials
  for select using (published = true or public.is_admin());
create policy "admins manage testimonials" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public can submit bookings" on public.bookings
  for insert with check (true);
create policy "admins manage bookings" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "admins can view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "admins can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('menu-images', 'menu-images', true),
  ('gallery-images', 'gallery-images', true),
  ('event-images', 'event-images', true),
  ('service-images', 'service-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public can view public image buckets" on storage.objects
  for select using (bucket_id in ('menu-images', 'gallery-images', 'event-images', 'service-images', 'site-assets'));
create policy "admins can upload image buckets" on storage.objects
  for insert with check (public.is_admin());
create policy "admins can update image buckets" on storage.objects
  for update using (public.is_admin()) with check (public.is_admin());
create policy "admins can delete image buckets" on storage.objects
  for delete using (public.is_admin());