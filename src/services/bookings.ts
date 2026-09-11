import { supabase } from '@/lib/supabase';
import type { Booking, BookingInput } from '@/types/content';

export async function createBooking(input: BookingInput): Promise<Booking> {
  if (!supabase) {
    throw new Error(
      'Booking enquiries are unavailable until Supabase is configured.',
    );
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...input,
      email: input.email || null,
      budget: input.budget || null,
      status: 'New',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Booking;
}

export async function listBookings(): Promise<Booking[]> {
  if (!supabase) {
    throw new Error(
      'Bookings are unavailable until Supabase is configured and an admin is signed in.',
    );
  }
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Booking[];
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status'],
): Promise<Booking> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Booking;
}