import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
);

let client: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = client;

/**
 * Storage helpers for uploading employee photos and company logo
 */
export async function uploadEmployeePhoto(file: File, employeeId: string): Promise<string | null> {
  if (!supabase) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}-${Date.now()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('employee-photos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading photo:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('employee-photos').getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function uploadCompanyLogo(file: File): Promise<string | null> {
  if (!supabase) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `company-logo-${Date.now()}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('company-assets')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading company logo:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('company-assets').getPublicUrl(filePath);
  return data?.publicUrl || null;
}
