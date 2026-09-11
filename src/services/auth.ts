import { supabase } from '@/lib/supabase';

export async function signInAdmin(email: string, password: string) {
  if (!supabase) {
    throw new Error(
      'Admin sign-in is unavailable until Supabase is configured.',
    );
  }
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
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