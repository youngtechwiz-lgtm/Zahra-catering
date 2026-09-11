import { supabase } from '@/lib/supabase';

export async function signInAdmin(email: string, password: string) {
  if (!supabase) {
    throw new Error(
      'Admin sign-in is unavailable until Supabase is configured.',
    );
  }

  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (result.error) throw result.error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', result.data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    throw profileError;
  }

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('This account does not have administrator access.');
  }

  return result.data;
}

export async function signOutAdmin() {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session;
}

export async function getCurrentAdminSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  const session = data.session;

  if (!session) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return null;
  }

  return session;
}