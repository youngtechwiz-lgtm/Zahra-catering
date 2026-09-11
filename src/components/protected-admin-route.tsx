import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentAdminSession } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>(
    isSupabaseConfigured ? 'checking' : 'blocked',
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    getCurrentAdminSession()
      .then((session) => {
        if (session) {
          setStatus('allowed');
        } else {
          setStatus('blocked');
          navigate('/admin/login', { replace: true });
        }
      })
      .catch(() => {
        setStatus('blocked');
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  if (status === 'checking') {
    return (
      <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5 text-center text-[#f7efdf]">
        <p className="font-mono-brand text-xs uppercase tracking-[.16em] text-[#d9b56b]">
          Checking your workspace…
        </p>
      </div>
    );
  }

  if (status !== 'allowed') {
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

  return <>{children}</>;
}