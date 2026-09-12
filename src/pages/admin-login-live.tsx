import { type FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function AdminLoginLivePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect to target or /admin
  useEffect(() => {
    if (!loading && isAdmin) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAdmin, loading, navigate, location]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError('');

    try {
      await signIn(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-shell flex min-h-[100dvh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-3xl text-[#f7efdf]"
        >
          ZAHRA
          <span className="h-2 w-2 rounded-full bg-[#de674f]" />
        </Link>

        <div className="mt-16">
          <p className="font-mono-brand text-[10px] uppercase tracking-[.2em] text-[#d9b56b]">
            Private workspace
          </p>

          <h1 className="mt-4 font-display text-6xl leading-[.9] text-[#f7efdf]">
            Welcome
            <br />
            <em className="text-[#de674f]">back.</em>
          </h1>

          <form onSubmit={submit} className="mt-10 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                placeholder="you@zahra.ng"
                autoComplete="email"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-[.12em] text-[#f7efdf]/70">
              Password
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border-b border-[#f7efdf]/25 bg-transparent px-0 py-3 text-base text-[#f7efdf] outline-none focus:border-[#d9b56b]"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="text-sm leading-relaxed text-[#de8c7a]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !isSupabaseConfigured}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#d9b56b] py-4 text-xs font-bold uppercase tracking-[.14em] text-[#2a1b2e] hover:bg-[#de674f] hover:text-[#f7efdf] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSupabaseConfigured
                ? submitting
                  ? 'Signing in…'
                  : 'Sign in'
                : 'Connect Supabase to sign in'}

              <ArrowUpRight size={15} />
            </button>
          </form>

          <Link
            to="/"
            className="mt-8 flex items-center gap-2 text-xs text-[#f7efdf]/45 hover:text-[#d9b56b]"
          >
            <ArrowLeft size={14} />
            Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}