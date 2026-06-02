import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn('[VisaPath] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — auth and persistence disabled.');
}

export const supabase: SupabaseClient | null = (url && key)
  ? createClient(url, key)
  : null;
