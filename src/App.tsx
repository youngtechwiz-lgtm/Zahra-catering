import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AboutPage, AdminCollectionPage, AdminDashboard, AdminSettingsPage, HomePage, NotFoundPage,
} from '@/pages/site';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  ContactLivePage,
  EventsLivePage,
  GalleryLivePage,
  MenuLivePage,
  ServicesLivePage,
  TestimonialsLivePage,
} from '@/pages/live-pages';
import { AdminLoginLivePage } from '@/pages/admin-login-live';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { AdminBookingsLivePage, AdminSettingsLivePage } from '@/pages/admin-live';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/services" element={<ServicesLivePage />} />
    <Route path="/menu" element={<MenuLivePage />} />
    <Route path="/gallery" element={<GalleryLivePage />} />
    <Route path="/events" element={<EventsLivePage />} />
    <Route path="/testimonials" element={<TestimonialsLivePage />} />
    <Route path="/contact" element={<ContactLivePage />} />
    <Route path="/admin/login" element={<AdminLoginLivePage />} />
    <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
    <Route path="/admin/menu" element={<ProtectedAdminRoute><AdminCollectionPage type="menu" /></ProtectedAdminRoute>} />
    <Route path="/admin/services" element={<ProtectedAdminRoute><AdminCollectionPage type="services" /></ProtectedAdminRoute>} />
    <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminCollectionPage type="gallery" /></ProtectedAdminRoute>} />
    <Route path="/admin/events" element={<ProtectedAdminRoute><AdminCollectionPage type="events" /></ProtectedAdminRoute>} />
    <Route path="/admin/testimonials" element={<ProtectedAdminRoute><AdminCollectionPage type="testimonials" /></ProtectedAdminRoute>} />
    <Route path="/admin/bookings" element={<ProtectedAdminRoute><AdminBookingsLivePage /></ProtectedAdminRoute>} />
    <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettingsLivePage /></ProtectedAdminRoute>} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></BrowserRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;