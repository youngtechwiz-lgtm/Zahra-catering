import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AboutPage, HomePage, NotFoundPage } from '@/pages/site';
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
import {
  AdminBookingsLivePage,
  AdminCategoriesLivePage,
  AdminDashboardLivePage,
  AdminEventsLivePage,
  AdminGalleryLivePage,
  AdminMenuLivePage,
  AdminServicesLivePage,
  AdminSettingsLivePage,
  AdminTestimonialsLivePage,
} from '@/pages/admin-live';
import { AuthProvider } from '@/context/AuthContext';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Routes>
        {/* Public Live Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesLivePage />} />
        <Route path="/menu" element={<MenuLivePage />} />
        <Route path="/gallery" element={<GalleryLivePage />} />
        <Route path="/events" element={<EventsLivePage />} />
        <Route path="/testimonials" element={<TestimonialsLivePage />} />
        <Route path="/contact" element={<ContactLivePage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginLivePage />} />

        {/* Dedicated Admin CMS Live Pages */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedAdminRoute>
              <AdminBookingsLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedAdminRoute>
              <AdminMenuLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedAdminRoute>
              <AdminCategoriesLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedAdminRoute>
              <AdminServicesLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedAdminRoute>
              <AdminGalleryLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedAdminRoute>
              <AdminEventsLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedAdminRoute>
              <AdminTestimonialsLivePage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminSettingsLivePage />
            </ProtectedAdminRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RoutedErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter
            basename={import.meta.env.BASE_URL.replace(/\/$/, '')}
          >
            <Router />
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;