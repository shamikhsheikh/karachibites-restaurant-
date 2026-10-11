import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Clean and normalize the Supabase Project URL.
 * Automatically removes any accidental paths such as `/rest/v1`, `/auth/v1`, `/storage/v1` or trailing slashes
 * commonly copied from the Supabase API settings dashboard.
 */
export function sanitizeSupabaseUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  let trimmed = rawUrl.trim();
  // Strip enclosing quotes, backticks, or angle brackets
  trimmed = trimmed.replace(/^["'`<]|["'`>]$/g, '').trim();
  if (!trimmed) return null;

  // Ensure protocol is present
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Return only the origin (e.g. 'https://apjbuzgwazsbzfhdhktb.supabase.co')
    return parsed.origin;
  } catch {
    // If URL parsing fails, strip `/rest/v1` and trailing slashes manually
    return trimmed.replace(/\/(?:rest|auth|storage)\/v\d+\/?$/i, '').replace(/\/+$/, '');
  }
}

/**
 * Clean and normalize the Supabase Service Role Key.
 * Removes surrounding whitespace or quotes.
 */
export function sanitizeSupabaseKey(rawKey?: string): string | null {
  if (!rawKey) return null;
  let trimmed = rawKey.trim();
  trimmed = trimmed.replace(/^["'`<]|["'`>]$/g, '').trim();
  return trimmed || null;
}

let clientInstance: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

/**
 * Returns true if both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured
 */
export function isSupabaseConfigured(): boolean {
  const url = sanitizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return Boolean(url && key);
}

/**
 * Returns the normalized Supabase project URL origin
 */
export function getCleanSupabaseUrl(): string | null {
  return sanitizeSupabaseUrl(process.env.SUPABASE_URL);
}

/**
 * Get the server-only Supabase client authenticated with the service role key.
 * This client bypasses RLS securely on the server side and never leaks to browser bundles.
 */
export function getSupabaseClient(): SupabaseClient {
  const url = sanitizeSupabaseUrl(process.env.SUPABASE_URL);
  const key = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  if (!clientInstance || lastUrl !== url || lastKey !== key) {
    lastUrl = url;
    lastKey = key;
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
    });
  }

  return clientInstance;
}
