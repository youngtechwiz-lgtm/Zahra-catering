import { type ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { LoaderCircle } from 'lucide-react';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5 text-center text-[#f7efdf]">
        <div>
          <p className="font-mono-brand text-xs uppercase tracking-[.16em] text-[#d9b56b]">
            Admin workspace
          </p>

          <h1 className="mt-4 font-display text-5xl">
            Supabase is not connected.
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#f7efdf]/60">
            Add the Supabase environment values to enable protected content
            management.
          </p>

          <Link
            to="/admin/login"
            className="mt-8 inline-flex rounded-full bg-[#d9b56b] px-5 py-3 text-xs font-bold uppercase tracking-[.13em] text-[#2a1b2e]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5 text-center text-[#f7efdf]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="animate-spin text-[#d9b56b]" size={28} />
          <p className="font-mono-brand text-xs uppercase tracking-[.16em] text-[#d9b56b]">
            Checking your workspace…
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}