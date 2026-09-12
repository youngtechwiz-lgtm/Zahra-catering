import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Images,
  LayoutDashboard,
  LoaderCircle,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Utensils,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminHeading, AdminShell } from '@/pages/site';
import {
  createEvent,
  createGalleryItem,
  createMenuCategory,
  createMenuItem,
  createService,
  createTestimonial,
  deleteEvent,
  deleteGalleryItem,
  deleteMenuCategory,
  deleteMenuItem,
  deleteService,
  deleteTestimonial,
  getAdminDashboardStats,
  getSiteSettings,
  listAdminEvents,
  listAdminGallery,
  listAdminMenuCategories,
  listAdminMenuItems,
  listAdminServices,
  listAdminTestimonials,
  updateEvent,
  updateGalleryItem,
  updateMenuCategory,
  updateMenuItem,
  updateService,
  updateSiteSettings,
  updateTestimonial,
  uploadEventImage,
  uploadGalleryImage,
  uploadMenuImage,
  uploadServiceImage,
  uploadTestimonialImage,
  type DashboardStats,
  type EventItemInput,
  type GalleryItemInput,
  type MenuCategoryInput,
  type MenuItemInput,
  type ServiceInput,
  type TestimonialInput,
} from '@/services/content';
import { listBookings, updateBookingStatus } from '@/services/bookings';
import { isSupabaseConfigured } from '@/lib/supabase';
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
   HELPER COMPONENTS
========================================================= */

function ImageUploadField({
  label,
  currentUrl,
  onFileSelect,
  previewUrl,
  onClearPreview,
}: {
  label: string;
  currentUrl?: string | null;
  previewUrl?: string | null;
  onFileSelect: (file: File) => void;
  onClearPreview?: () => void;
}) {
  const displayImage = previewUrl || currentUrl;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
        {label}
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {displayImage ? (
          <div className="relative h-28 w-36 overflow-hidden rounded-xl border border-[#f7efdf]/20 bg-[#2a1b2e]">
            <img
              src={displayImage}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {previewUrl && onClearPreview && (
              <button
                type="button"
                onClick={onClearPreview}
                className="absolute right-1.5 top-1.5 rounded-full bg-[#2a1b2e]/80 p-1 text-[#f7efdf] hover:bg-[#de674f]"
                title="Remove selected preview"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-28 w-36 items-center justify-center rounded-xl border border-dashed border-[#f7efdf]/20 bg-[#2a1b2e]/50 text-[#f7efdf]/40">
            <ImageIcon size={24} />
          </div>
        )}

        <div className="flex-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d9b56b]/40 bg-[#d9b56b]/10 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#d9b56b] transition hover:bg-[#d9b56b] hover:text-[#2a1b2e]">
            <Upload size={14} />
            <span>{displayImage ? 'Replace image' : 'Upload photo'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <p className="mt-1.5 text-[11px] text-[#f7efdf]/40">
            PNG, JPG, or WebP up to 5MB. Stored securely on Supabase Storage.
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-[#f7efdf]/15 bg-[#2a1b2e] p-6 text-[#f7efdf] shadow-2xl">
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-[#f7efdf]/70">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#de674f] px-5 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading && <LoaderCircle size={14} className="animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   1. DASHBOARD OVERVIEW
========================================================= */

export function AdminDashboardLivePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      number: stats ? String(stats.newBookings).padStart(2, '0') : '00',
      label: 'New enquiries',
      icon: CalendarDays,
      href: '/admin/bookings',
      color: '#de674f',
    },
    {
      number: stats ? String(stats.totalMenuItems).padStart(2, '0') : '00',
      label: 'Menu items',
      icon: Utensils,
      href: '/admin/menu',
      color: '#d9b56b',
    },
    {
      number: stats ? String(stats.totalServices).padStart(2, '0') : '00',
      label: 'Services',
      icon: Sparkles,
      href: '/admin/services',
      color: '#d9b56b',
    },
    {
      number: stats ? String(stats.totalGallery).padStart(2, '0') : '00',
      label: 'Gallery moments',
      icon: Images,
      href: '/admin/gallery',
      color: '#d9b56b',
    },
    {
      number: stats ? String(stats.totalEvents).padStart(2, '0') : '00',
      label: 'Published stories',
      icon: Package,
      href: '/admin/events',
      color: '#d9b56b',
    },
  ];

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Studio CMS / Overview"
        title="Good day, ZAHRA."
        action="View bookings"
        onAction={() => window.location.assign('/admin/bookings')}
      />

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex items-center gap-3 text-sm text-[#d9b56b]">
          <LoaderCircle size={20} className="animate-spin" />
          <span>Loading studio overview…</span>
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="hover-lift rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-5 transition hover:border-[#d9b56b]/40"
              >
                <card.icon size={18} style={{ color: card.color }} />
                <p className="mt-7 font-display text-4xl text-[#f7efdf]">
                  {card.number}
                </p>
                <p className="mt-1 text-xs text-[#f7efdf]/55">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
            <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Recent enquiries</h2>
                <Link
                  to="/admin/bookings"
                  className="text-xs text-[#d9b56b] hover:underline"
                >
                  View all ({stats?.totalBookings ?? 0})
                </Link>
              </div>

              {stats?.recentBookings.length ? (
                <div className="mt-6 space-y-1">
                  {stats.recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between border-t border-[#f7efdf]/10 py-3.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#f7efdf]">
                          {b.customer_name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#f7efdf]/45">
                          {b.event_date} · {b.event_type} · {b.guest_count} guests
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-[.1em] ${
                          b.status === 'New'
                            ? 'bg-[#de674f]/20 text-[#de8c7a]'
                            : b.status === 'Contacted'
                            ? 'bg-[#d9b56b]/20 text-[#d9b56b]'
                            : 'bg-[#f7efdf]/10 text-[#f7efdf]/70'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-[#f7efdf]/40">
                  No enquiries yet. Customer bookings will appear here.
                </p>
              )}
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-[#d9b56b] p-6 text-[#2a1b2e]">
              <div>
                <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] opacity-65">
                  Direct management
                </p>
                <h2 className="mt-6 font-display text-3xl leading-[1.05]">
                  Your menus, stories & tables.
                </h2>
                <p className="mt-3 text-xs leading-relaxed opacity-75">
                  Update seasonal menus, upload high-res event moments, and
                  manage pricing in real time.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-2">
                <Link
                  to="/admin/menu"
                  className="inline-flex items-center justify-between rounded-full bg-[#2a1b2e] px-4 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf] transition hover:bg-[#38263b]"
                >
                  <span>Manage Menu</span>
                  <Utensils size={14} />
                </Link>
                <Link
                  to="/admin/categories"
                  className="inline-flex items-center justify-between rounded-full border border-[#2a1b2e]/30 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] transition hover:bg-[#2a1b2e]/10"
                >
                  <span>Menu Categories</span>
                  <Tag size={13} />
                </Link>
                <Link
                  to="/admin/gallery"
                  className="inline-flex items-center justify-between rounded-full border border-[#2a1b2e]/30 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] transition hover:bg-[#2a1b2e]/10"
                >
                  <span>Gallery Moments</span>
                  <Images size={13} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}

/* =========================================================
   2. MENU MANAGEMENT
========================================================= */

const emptyMenuForm: MenuItemInput = {
  name: '',
  category_id: '',
  price: null,
  description: '',
  image_url: null,
  available: true,
  published: true,
  featured: false,
};

export function AdminMenuLivePage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemInput>(emptyMenuForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [menuData, categoryData] = await Promise.all([
        listAdminMenuItems(),
        listAdminMenuCategories(),
      ]);
      setItems(menuData);
      setCategories(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load menu.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setForm({
      ...emptyMenuForm,
      category_id: categories[0]?.id || '',
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description,
      image_url: item.image_url,
      available: item.available,
      published: item.published,
      featured: item.featured,
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalImageUrl = form.image_url;

      if (imageFile) {
        finalImageUrl = await uploadMenuImage(imageFile);
      }

      const payload: MenuItemInput = {
        ...form,
        image_url: finalImageUrl,
        price: form.price ? Number(form.price) : null,
      };

      if (editingItem) {
        const updated = await updateMenuItem(editingItem.id, payload);
        setItems((current) =>
          current.map((item) => (item.id === editingItem.id ? updated : item)),
        );
        setSuccess(`"${updated.name}" updated successfully.`);
      } else {
        const created = await createMenuItem(payload);
        setItems((current) => [created, ...current]);
        setSuccess(`"${created.name}" created successfully.`);
      }

      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenuItem(deleteTarget.id);
      setItems((current) => current.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSuccess(`"${deleteTarget.name}" deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleAvailable = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item.id, { available: !item.available });
      setItems((current) => current.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update availability.');
    }
  };

  const toggleFeatured = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item.id, { featured: !item.featured });
      setItems((current) => current.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update featured status.');
    }
  };

  const togglePublished = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item.id, { published: !item.published });
      setItems((current) => current.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update published status.');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || item.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, selectedCategory]);

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Menu"
        title="The Menu."
        action="Add menu item"
        onAction={openCreate}
      />

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-[#f7efdf]/15 bg-[#38263b] px-4 py-2">
          <Search size={16} className="text-[#f7efdf]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes by name or ingredient…"
            className="w-full bg-transparent text-sm text-[#f7efdf] outline-none placeholder:text-[#f7efdf]/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-full border border-[#f7efdf]/15 bg-[#38263b] px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf] outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Link
            to="/admin/categories"
            className="whitespace-nowrap rounded-full border border-[#d9b56b]/30 px-3.5 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#d9b56b] hover:bg-[#d9b56b]/10"
          >
            Manage categories
          </Link>
        </div>
      </div>

      {/* CREATE / EDIT FORM */}
      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <div>
              <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">
                {editingItem ? 'Edit item' : 'New creation'}
              </p>
              <h2 className="mt-1 font-display text-3xl">
                {editingItem ? 'Update menu dish.' : 'Add something delicious.'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-full p-2 text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Dish name *
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Smoky Suya Beef Carpaccio"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Category *
              <select
                required
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#2a1b2e]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70 md:col-span-2">
              Full description *
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe flavors, cooking method, textures, and key accompaniments…"
                className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Price in Naira (₦)
              <input
                type="number"
                min="0"
                step="100"
                value={form.price ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="e.g. 14500 (leave blank for Quote)"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) =>
                    setForm({ ...form, available: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Available</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Published</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Dish photo"
                currentUrl={form.image_url}
                previewUrl={imagePreview}
                onFileSelect={handleImageSelect}
                onClearPreview={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 md:col-span-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e] transition hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={15} className="animate-spin" />}
                <span>
                  {saving
                    ? 'Saving dish…'
                    : editingItem
                    ? 'Save changes'
                    : 'Publish dish'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ITEMS LIST */}
      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading menu items…</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center">
            <Utensils size={36} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl text-[#f7efdf]">
              No menu items found.
            </p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              {search
                ? 'Try adjusting your search or category filter.'
                : 'Add your first menu item to begin curating your table.'}
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf]"
            >
              <Plus size={14} /> Add menu item
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const cat = categories.find((c) => c.id === item.category_id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] transition hover:border-[#f7efdf]/20"
                >
                  <div>
                    {item.image_url ? (
                      <div className="h-44 w-full overflow-hidden bg-[#2a1b2e]">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-[#2a1b2e]/60 text-xs text-[#f7efdf]/30">
                        No photo attached
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono-brand text-[10px] uppercase tracking-[.15em] text-[#d9b56b]">
                            {cat?.name || 'Uncategorized'}
                          </p>
                          <h3 className="mt-1 font-display text-2xl text-[#f7efdf]">
                            {item.name}
                          </h3>
                        </div>
                        <span className="font-mono-brand text-sm font-bold text-[#f7efdf]">
                          {item.price === null
                            ? 'Quote'
                            : `₦${item.price.toLocaleString()}`}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#f7efdf]/60">
                        {item.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAvailable(item)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${
                            item.available
                              ? 'bg-[#d9b56b]/20 text-[#d9b56b]'
                              : 'bg-[#f7efdf]/10 text-[#f7efdf]/40'
                          }`}
                        >
                          {item.available ? 'Available' : 'Unavailable'}
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePublished(item)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${
                            item.published
                              ? 'bg-[#4b7a47]/25 text-[#98d892]'
                              : 'bg-[#de674f]/20 text-[#de8c7a]'
                          }`}
                        >
                          {item.published ? 'Published' : 'Draft'}
                        </button>

                        {item.featured && (
                          <span className="rounded-full bg-[#de674f]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#de8c7a]">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f7efdf]/10 px-5 py-3 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(item)}
                      className="text-[#f7efdf]/50 hover:text-[#d9b56b]"
                    >
                      {item.featured ? 'Unmark featured' : 'Mark featured'}
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1 font-bold text-[#f7efdf]/70 hover:text-[#d9b56b]"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="flex items-center gap-1 font-bold text-[#de8c7a] hover:text-[#de674f]"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Menu Dish"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove it from the menu.`}
        confirmLabel="Delete Dish"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   3. CATEGORIES MANAGEMENT
========================================================= */

export function AdminCategoriesLivePage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminMenuCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingCat(null);
    setName('');
    setDescription('');
    setPublished(true);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(c: MenuCategory) {
    setEditingCat(c);
    setName(c.name);
    setDescription(c.description || '');
    setPublished(c.published);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (editingCat) {
        const updated = await updateMenuCategory(editingCat.id, {
          name: name.trim(),
          description: description.trim() || null,
          published,
        });
        setCategories((current) =>
          current.map((c) => (c.id === editingCat.id ? updated : c)),
        );
        setSuccess(`Category "${updated.name}" updated.`);
      } else {
        const created = await createMenuCategory({
          name: name.trim(),
          slug: '',
          description: description.trim() || null,
          published,
        });
        setCategories((current) => [...current, created]);
        setSuccess(`Category "${created.name}" created.`);
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError('');
    try {
      await deleteMenuCategory(deleteTarget.id);
      setCategories((current) => current.filter((c) => c.id !== deleteTarget.id));
      setSuccess(`Category "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete category.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Menu Categories"
        title="Categories."
        action="Add category"
        onAction={openCreate}
      />

      <p className="mt-4 max-w-xl text-sm text-[#f7efdf]/50">
        Organize your dishes into clear culinary chapters for guests browsing
        the public menu.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <h2 className="font-display text-3xl">
              {editingCat ? 'Rename category.' : 'New menu category.'}
            </h2>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Category title *
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Canapés & Small Bites"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Short subtitle / notes
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Served upon guest arrival"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded accent-[#d9b56b]"
              />
              <span>Published / Visible on menu</span>
            </label>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                <span>{editingCat ? 'Save changes' : 'Create category'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading categories…</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
            <Tag size={32} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl">No categories yet.</p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              Create your first category (e.g. Starters, Mains, Desserts).
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]"
            >
              <Plus size={14} /> Add category
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-5 text-[#f7efdf]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-2xl">{c.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                        c.published
                          ? 'bg-[#4b7a47]/25 text-[#98d892]'
                          : 'bg-[#de674f]/20 text-[#de8c7a]'
                      }`}
                    >
                      {c.published ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mt-1 text-xs text-[#f7efdf]/50">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="flex items-center gap-1 rounded-full border border-[#f7efdf]/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/70 hover:border-[#d9b56b] hover:text-[#d9b56b]"
                  >
                    <Pencil size={13} />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="flex items-center gap-1 rounded-full border border-[#de8c7a]/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#de8c7a] hover:bg-[#de8c7a]/15"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? The system will safely check and prevent deletion if menu items are still attached to it.`}
        confirmLabel="Delete Category"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   4. SERVICES MANAGEMENT
========================================================= */

const emptyServiceForm: ServiceInput = {
  title: '',
  description: '',
  quote_label: '',
  image_url: null,
  featured: false,
  published: true,
};

export function AdminServicesLivePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceInput>(emptyServiceForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load services.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingService(null);
    setForm(emptyServiceForm);
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setForm({
      title: service.title,
      description: service.description,
      quote_label: service.quote_label || '',
      image_url: service.image_url,
      featured: service.featured,
      published: service.published,
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalImageUrl = form.image_url;

      if (imageFile) {
        finalImageUrl = await uploadServiceImage(imageFile);
      }

      const payload: ServiceInput = {
        ...form,
        image_url: finalImageUrl,
      };

      if (editingService) {
        const updated = await updateService(editingService.id, payload);
        setServices((current) =>
          current.map((s) => (s.id === editingService.id ? updated : s)),
        );
        setSuccess(`Service "${updated.title}" updated successfully.`);
      } else {
        const created = await createService(payload);
        setServices((current) => [...current, created]);
        setSuccess(`Service "${created.title}" created.`);
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setServices((current) => current.filter((s) => s.id !== deleteTarget.id));
      setSuccess(`Service "${deleteTarget.title}" removed.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete service.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Services"
        title="Services."
        action="Add service"
        onAction={openCreate}
      />

      <p className="mt-4 max-w-xl text-sm text-[#f7efdf]/50">
        Shape the offerings your guests discover on the public website.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <h2 className="font-display text-3xl">
              {editingService ? 'Edit service.' : 'Create new service.'}
            </h2>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Service title *
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Weddings & Grand Receptions"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Full description *
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Explain the culinary vision, service format, staff presence, and ambiance…"
                className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Quote label / Pricing guide
              <input
                type="text"
                value={form.quote_label ?? ''}
                onChange={(e) =>
                  setForm({ ...form, quote_label: e.target.value })
                }
                placeholder="e.g. Custom quotation or Starting from ₦45,000 / guest"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Published on website</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Featured service</span>
              </label>
            </div>

            <ImageUploadField
              label="Service cover image"
              currentUrl={form.image_url}
              previewUrl={imagePreview}
              onFileSelect={(file) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              onClearPreview={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                <span>{editingService ? 'Save changes' : 'Create service'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading services…</span>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
            <Sparkles size={32} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl">No services yet.</p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              Create your catering offerings (e.g. Weddings, Private Dining).
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]"
            >
              <Plus size={14} /> Add service
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f7efdf]/10 bg-[#38263b]"
              >
                <div>
                  {s.image_url ? (
                    <div className="h-48 w-full overflow-hidden bg-[#2a1b2e]">
                      <img
                        src={s.image_url}
                        alt={s.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-3xl text-[#f7efdf]">
                        {s.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                          s.published
                            ? 'bg-[#4b7a47]/25 text-[#98d892]'
                            : 'bg-[#de674f]/20 text-[#de8c7a]'
                        }`}
                      >
                        {s.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#f7efdf]/60">
                      {s.description}
                    </p>

                    {s.quote_label && (
                      <p className="mt-4 font-mono-brand text-xs text-[#d9b56b]">
                        {s.quote_label}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-[#f7efdf]/10 p-5 text-xs">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex items-center gap-1 font-bold text-[#f7efdf]/70 hover:text-[#d9b56b]"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="flex items-center gap-1 font-bold text-[#de8c7a] hover:text-[#de674f]"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Service"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   5. GALLERY MANAGEMENT
========================================================= */

const emptyGalleryForm: GalleryItemInput = {
  image_url: '',
  category: 'Supper Club',
  caption: '',
  featured: false,
  published: true,
};

export function AdminGalleryLivePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryItemInput>(emptyGalleryForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminGallery();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load gallery.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyGalleryForm);
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditingItem(item);
    setForm({
      image_url: item.image_url,
      category: item.category,
      caption: item.caption || '',
      featured: item.featured,
      published: item.published,
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalImageUrl = form.image_url;

      if (imageFile) {
        finalImageUrl = await uploadGalleryImage(imageFile);
      }

      if (!finalImageUrl) {
        throw new Error('Please select an image to upload.');
      }

      const payload: GalleryItemInput = {
        ...form,
        image_url: finalImageUrl,
      };

      if (editingItem) {
        const updated = await updateGalleryItem(editingItem.id, payload);
        setItems((current) =>
          current.map((i) => (i.id === editingItem.id ? updated : i)),
        );
        setSuccess('Gallery photo updated.');
      } else {
        const created = await createGalleryItem(payload);
        setItems((current) => [created, ...current]);
        setSuccess('Gallery photo uploaded.');
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save gallery photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(deleteTarget.id);
      setItems((current) => current.filter((i) => i.id !== deleteTarget.id));
      setSuccess('Gallery photo deleted.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete item.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Visual Stories"
        title="Gallery."
        action="Upload moment"
        onAction={openCreate}
      />

      <p className="mt-4 max-w-xl text-sm text-[#f7efdf]/50">
        Curate the texture, intimate moments, and vibrant tables of ZAHRA.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <h2 className="font-display text-3xl">
              {editingItem ? 'Edit gallery frame.' : 'Add new frame.'}
            </h2>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <ImageUploadField
              label="Gallery photo *"
              currentUrl={form.image_url}
              previewUrl={imagePreview}
              onFileSelect={(file) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              onClearPreview={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
                Category
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                >
                  <option value="Supper Club" className="bg-[#2a1b2e]">
                    Supper Club
                  </option>
                  <option value="Weddings" className="bg-[#2a1b2e]">
                    Weddings
                  </option>
                  <option value="Private Dinners" className="bg-[#2a1b2e]">
                    Private Dinners
                  </option>
                  <option value="Corporate" className="bg-[#2a1b2e]">
                    Corporate
                  </option>
                  <option value="Other" className="bg-[#2a1b2e]">
                    Other
                  </option>
                </select>
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
                Caption / Story title
                <input
                  type="text"
                  value={form.caption ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, caption: e.target.value })
                  }
                  placeholder="e.g. A table for twelve in Ikoyi"
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Visible in public gallery</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Hero / Large tile</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                <span>{editingItem ? 'Save frame' : 'Publish to gallery'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading gallery…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
            <Images size={32} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl">No gallery photos yet.</p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              Upload high-resolution moments from your catered events.
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]"
            >
              <Plus size={14} /> Upload moment
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-[#f7efdf]/10 bg-[#38263b]"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-[#2a1b2e]">
                  <img
                    src={item.image_url}
                    alt={item.caption || 'Gallery photo'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <p className="font-mono-brand text-[9px] uppercase tracking-[.15em] text-[#d9b56b]">
                    {item.category}
                  </p>
                  <p className="mt-1 font-display text-lg text-[#f7efdf]">
                    {item.caption || 'Untitled frame'}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f7efdf]/10 pt-3 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                        item.published
                          ? 'bg-[#4b7a47]/25 text-[#98d892]'
                          : 'bg-[#de674f]/20 text-[#de8c7a]'
                      }`}
                    >
                      {item.published ? 'Visible' : 'Draft'}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-[#f7efdf]/70 hover:text-[#d9b56b]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="text-[#de8c7a] hover:text-[#de674f]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Photo"
        message="Are you sure you want to delete this photo from the gallery?"
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   6. EVENTS MANAGEMENT
========================================================= */

const emptyEventForm: EventItemInput = {
  title: '',
  slug: '',
  event_date: new Date().toISOString().split('T')[0],
  description: '',
  cover_image_url: null,
  featured: false,
  published: true,
};

export function AdminEventsLivePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventItemInput>(emptyEventForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load events.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setForm(emptyEventForm);
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(eventItem: EventItem) {
    setEditingEvent(eventItem);
    setForm({
      title: eventItem.title,
      slug: eventItem.slug,
      event_date: eventItem.event_date,
      description: eventItem.description,
      cover_image_url: eventItem.cover_image_url,
      featured: eventItem.featured,
      published: eventItem.published,
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalImageUrl = form.cover_image_url;

      if (imageFile) {
        finalImageUrl = await uploadEventImage(imageFile);
      }

      const payload: EventItemInput = {
        ...form,
        cover_image_url: finalImageUrl,
      };

      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, payload);
        setEvents((current) =>
          current.map((ev) => (ev.id === editingEvent.id ? updated : ev)),
        );
        setSuccess(`Event story "${updated.title}" updated.`);
      } else {
        const created = await createEvent(payload);
        setEvents((current) => [created, ...current]);
        setSuccess(`Event story "${created.title}" published.`);
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents((current) => current.filter((e) => e.id !== deleteTarget.id));
      setSuccess(`Event story "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Event Stories"
        title="Events."
        action="Create event"
        onAction={openCreate}
      />

      <p className="mt-4 max-w-xl text-sm text-[#f7efdf]/50">
        Document past weddings, feasts, and gatherings hosted by ZAHRA.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <h2 className="font-display text-3xl">
              {editingEvent ? 'Edit event story.' : 'Document new event.'}
            </h2>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
                Event title *
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. The Courtyard Supper Club for 48"
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
                Event date *
                <input
                  required
                  type="date"
                  value={form.event_date}
                  onChange={(e) =>
                    setForm({ ...form, event_date: e.target.value })
                  }
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>
            </div>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Event description & story *
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Share the story of the table: what was served, the setting, guest atmosphere…"
                className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <ImageUploadField
              label="Cover photograph"
              currentUrl={form.cover_image_url}
              previewUrl={imagePreview}
              onFileSelect={(file) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              onClearPreview={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Published on website</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Featured story</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                <span>{editingEvent ? 'Save changes' : 'Publish story'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading events…</span>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
            <Package size={32} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl">No stories yet.</p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              Publish your first catered event story to inspire future clients.
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]"
            >
              <Plus size={14} /> Create event
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#f7efdf]/10 bg-[#38263b]"
              >
                <div>
                  {e.cover_image_url ? (
                    <div className="h-52 w-full overflow-hidden bg-[#2a1b2e]">
                      <img
                        src={e.cover_image_url}
                        alt={e.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    <p className="font-mono-brand text-[10px] uppercase tracking-[.16em] text-[#de674f]">
                      {e.event_date}
                    </p>
                    <h3 className="mt-1 font-display text-3xl text-[#f7efdf]">
                      {e.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#f7efdf]/60">
                      {e.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#f7efdf]/10 p-5 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                      e.published
                        ? 'bg-[#4b7a47]/25 text-[#98d892]'
                        : 'bg-[#de674f]/20 text-[#de8c7a]'
                    }`}
                  >
                    {e.published ? 'Published' : 'Draft'}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(e)}
                      className="flex items-center gap-1 font-bold text-[#f7efdf]/70 hover:text-[#d9b56b]"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(e)}
                      className="flex items-center gap-1 font-bold text-[#de8c7a] hover:text-[#de674f]"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Event Story"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Event"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   7. TESTIMONIALS MANAGEMENT
========================================================= */

const emptyTestimonialForm: TestimonialInput = {
  customer_name: '',
  review: '',
  image_url: null,
  featured: false,
  published: true,
};

export function AdminTestimonialsLivePage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialInput>(emptyTestimonialForm);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminTestimonials();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load testimonials.');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingItem(null);
    setForm(emptyTestimonialForm);
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditingItem(t);
    setForm({
      customer_name: t.customer_name,
      review: t.review,
      image_url: t.image_url,
      featured: t.featured,
      published: t.published,
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess('');
    setError('');
    setFormOpen(true);
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let finalImageUrl = form.image_url;

      if (imageFile) {
        finalImageUrl = await uploadTestimonialImage(imageFile);
      }

      const payload: TestimonialInput = {
        ...form,
        image_url: finalImageUrl,
      };

      if (editingItem) {
        const updated = await updateTestimonial(editingItem.id, payload);
        setTestimonials((current) =>
          current.map((t) => (t.id === editingItem.id ? updated : t)),
        );
        setSuccess(`Testimonial from "${updated.customer_name}" updated.`);
      } else {
        const created = await createTestimonial(payload);
        setTestimonials((current) => [...current, created]);
        setSuccess(`Testimonial from "${created.customer_name}" added.`);
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTestimonial(deleteTarget.id);
      setTestimonials((current) =>
        current.filter((t) => t.id !== deleteTarget.id),
      );
      setSuccess('Testimonial deleted.');
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete testimonial.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Workspace / Kind Words"
        title="Testimonials."
        action="Add testimonial"
        onAction={openCreate}
      />

      <p className="mt-4 max-w-xl text-sm text-[#f7efdf]/50">
        Curate reviews and generous words from your clients to build trust.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {formOpen && (
        <div className="mt-8 rounded-3xl border border-[#d9b56b]/30 bg-[#38263b] p-6 text-[#f7efdf] md:p-8">
          <div className="flex items-center justify-between border-b border-[#f7efdf]/10 pb-4">
            <h2 className="font-display text-3xl">
              {editingItem ? 'Edit testimonial.' : 'New client review.'}
            </h2>
            <button
              onClick={() => setFormOpen(false)}
              className="text-[#f7efdf]/60 hover:text-[#f7efdf]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Customer / Client name *
              <input
                required
                type="text"
                value={form.customer_name}
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
                placeholder="e.g. Amaka & Dami or Korede Studios"
                className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Review quote *
              <textarea
                required
                rows={4}
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
                placeholder="“The food was the first thing people talked about on the drive home…”"
                className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
              />
            </label>

            <ImageUploadField
              label="Customer portrait (optional)"
              currentUrl={form.image_url}
              previewUrl={imagePreview}
              onFileSelect={(file) => {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
              onClearPreview={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            />

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Published on website</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#d9b56b]"
                />
                <span>Featured / Highlighted</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/60 hover:text-[#f7efdf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={14} className="animate-spin" />}
                <span>{editingItem ? 'Save changes' : 'Publish review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center gap-3 p-12 text-sm text-[#d9b56b]">
            <LoaderCircle size={20} className="animate-spin" />
            <span>Loading reviews…</span>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
            <MessageCircle size={32} className="mx-auto text-[#d9b56b]/60" />
            <p className="mt-4 font-display text-2xl">No testimonials yet.</p>
            <p className="mt-1 text-sm text-[#f7efdf]/50">
              Add your first client feedback to celebrate your service.
            </p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-5 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-[#2a1b2e]"
            >
              <Plus size={14} /> Add testimonial
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6 text-[#f7efdf]"
              >
                <div>
                  <span className="font-display text-5xl leading-none text-[#d9b56b]">
                    “
                  </span>
                  <p className="mt-2 text-sm leading-relaxed italic text-[#f7efdf]/85">
                    {t.review}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#f7efdf]/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg text-[#f7efdf]">
                        {t.customer_name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.1em] ${
                          t.published
                            ? 'bg-[#4b7a47]/25 text-[#98d892]'
                            : 'bg-[#de674f]/20 text-[#de8c7a]'
                        }`}
                      >
                        {t.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1 text-[#f7efdf]/60 hover:text-[#d9b56b]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-1 text-[#de8c7a] hover:text-[#de674f]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteTarget?.customer_name}"?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}

/* =========================================================
   8. BOOKINGS MANAGEMENT
========================================================= */

export function AdminBookingsLivePage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    listBookings()
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: Booking['status']) => {
    try {
      const updated = await updateBookingStatus(id, status);
      setItems((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update the booking.',
      );
    }
  };

  const filtered = useMemo(() => {
    return items.filter((b) => {
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchesSearch =
        b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        b.phone.toLowerCase().includes(search.toLowerCase()) ||
        (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
        b.location.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [items, search, statusFilter]);

  return (
    <AdminShell>
      <AdminHeading eyebrow="Client desk / enquiries" title="Bookings." />

      <p className="mt-4 max-w-lg text-sm text-[#f7efdf]/50">
        Every conversation, kept moving forward.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-[#f7efdf]/15 bg-[#38263b] px-4 py-2">
          <Search size={16} className="text-[#f7efdf]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, location…"
            className="w-full bg-transparent text-sm text-[#f7efdf] outline-none placeholder:text-[#f7efdf]/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 border-b border-[#f7efdf]/10 pb-2 sm:border-0 sm:pb-0">
          {(['All', 'New', 'Contacted', 'Confirmed', 'Completed'] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.1em] transition ${
                  statusFilter === s
                    ? 'bg-[#d9b56b] text-[#2a1b2e]'
                    : 'text-[#f7efdf]/60 hover:text-[#f7efdf]'
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-[#d9b56b]">
          <LoaderCircle className="animate-spin" size={18} />
          Loading enquiries…
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-16 text-center text-[#f7efdf]">
          <CalendarDays size={32} className="mx-auto text-[#d9b56b]/60" />
          <p className="mt-4 font-display text-2xl">No enquiries found.</p>
          <p className="mt-1 text-sm text-[#f7efdf]/50">
            {search || statusFilter !== 'All'
              ? 'Try changing your search keywords or status filter.'
              : 'Client booking submissions from the website contact page will appear here.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6 text-[#f7efdf]"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-2xl">
                      {item.customer_name}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono-brand text-[9px] uppercase tracking-[.12em] ${
                        item.status === 'New'
                          ? 'bg-[#de674f]/20 text-[#de8c7a]'
                          : item.status === 'Contacted'
                          ? 'bg-[#d9b56b]/20 text-[#d9b56b]'
                          : 'bg-[#4b7a47]/20 text-[#98d892]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-1 font-mono-brand text-xs text-[#d9b56b]">
                    {item.event_date} · {item.event_type} · {item.guest_count}{' '}
                    guests · {item.location}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#f7efdf]/70">
                    <span>
                      <strong>Phone:</strong>{' '}
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-[#d9b56b]"
                      >
                        {item.phone}
                      </a>
                    </span>
                    {item.email && (
                      <span>
                        <strong>Email:</strong>{' '}
                        <a
                          href={`mailto:${item.email}`}
                          className="underline hover:text-[#d9b56b]"
                        >
                          {item.email}
                        </a>
                      </span>
                    )}
                    {item.budget && (
                      <span>
                        <strong>Budget:</strong> {item.budget}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 rounded-xl bg-[#2a1b2e]/60 p-4 text-sm leading-relaxed text-[#f7efdf]/80">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf]/50">
                    Status:
                  </label>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      changeStatus(item.id, e.target.value as Booking['status'])
                    }
                    className="rounded-full border border-[#f7efdf]/20 bg-[#2a1b2e] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-[#f7efdf] outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

/* =========================================================
   9. SETTINGS MANAGEMENT
========================================================= */

const defaultSettings: SiteSettings = {
  id: '',
  business_name: 'ZAHRA Catering Service',
  phone: '09079622010',
  whatsapp: '09079622010',
  email: 'hello@zahra.ng',
  socials: {},
  address: 'Victoria Island, Lagos, Nigeria',
  service_area: 'Lagos and destination celebrations',
  hero_text: 'Make it a table to remember.',
  hero_image: null,
  about_text:
    'ZAHRA is an elevated catering studio born in Lagos, committed to soulful flavours, attentive tables, and lasting memories.',
  updated_at: '',
};

export function AdminSettingsLivePage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) {
          setSettings((current) => ({
            ...current,
            ...data,
          }));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof SiteSettings, value: string) => {
    setSaved(false);
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
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

      setSettings((current) => ({
        ...current,
        ...result,
      }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <AdminHeading eyebrow="Workspace / Settings" title="The details." />

      <p className="mt-4 max-w-lg text-sm text-[#f7efdf]/50">
        Update contact details, WhatsApp direct number, and homepage branding.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-[#de8c7a]/30 bg-[#de8c7a]/10 p-4 text-sm text-[#de8c7a]">
          {error}
        </div>
      )}

      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#d9b56b]/30 bg-[#d9b56b]/10 p-4 text-sm text-[#d9b56b]">
          <CheckCircle2 size={16} />
          <span>Site settings saved and updated across the live website.</span>
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center gap-3 text-sm text-[#d9b56b]">
          <LoaderCircle size={18} className="animate-spin" />
          <span>Loading studio settings…</span>
        </div>
      ) : (
        <form onSubmit={save} className="mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6 text-[#f7efdf]">
            <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">
              Business Profile
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                Business name
                <input
                  value={settings.business_name || ''}
                  onChange={(e) => update('business_name', e.target.value)}
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                WhatsApp number *
                <input
                  required
                  value={settings.whatsapp || ''}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  placeholder="09079622010"
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                Phone number
                <input
                  value={settings.phone || ''}
                  onChange={(e) => update('phone', e.target.value)}
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                Email address
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                Service location / City
                <input
                  value={settings.address || ''}
                  onChange={(e) => update('address', e.target.value)}
                  className="mt-2 w-full border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#f7efdf]/10 bg-[#38263b] p-6 text-[#f7efdf]">
            <p className="font-mono-brand text-[10px] uppercase tracking-[.18em] text-[#d9b56b]">
              Editorial & Brand Copy
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                Homepage main headline
                <textarea
                  rows={3}
                  value={settings.hero_text || ''}
                  onChange={(e) => update('hero_text', e.target.value)}
                  className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/65">
                About section copy
                <textarea
                  rows={5}
                  value={settings.about_text || ''}
                  onChange={(e) => update('about_text', e.target.value)}
                  className="mt-2 w-full resize-none border-b border-[#f7efdf]/20 bg-transparent py-2 text-sm text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d9b56b] px-6 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:opacity-50"
              >
                {saving && <LoaderCircle size={15} className="animate-spin" />}
                <span>{saving ? 'Saving changes…' : 'Save all settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  );
}