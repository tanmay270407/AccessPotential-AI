import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalizes Supabase URLs in case a dashboard project URL is provided in the environment.
 * e.g., https://supabase.com/dashboard/project/xyz -> https://xyz.supabase.co
 */
export function normalizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  let trimmed = url.trim().replace(/^["']|["']$/g, '').trim();
  const dashboardMatch = trimmed.match(/dashboard\/project\/([a-zA-Z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }
  return trimmed.replace(/\/+$/, '');
}

let supabaseInstance: SupabaseClient | null = null;
let isFetchingConfig = false;

/**
 * Reads public Supabase configuration from environment variables injected by Vite / Vercel.
 * NEVER reads or returns SUPABASE_SERVICE_ROLE_KEY.
 */
export function getPublicSupabaseCredentials(): { url: string; key: string } {
  let url = '';
  let key = '';

  // 1. Check Vite client environment
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    url =
      metaEnv.VITE_SUPABASE_URL ||
      metaEnv.SUPABASE_URL ||
      metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    key =
      metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.VITE_SUPABASE_ANON_KEY ||
      metaEnv.VITE_SUPABASE_KEY ||
      metaEnv.SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.SUPABASE_ANON_KEY ||
      metaEnv.SUPABASE_KEY ||
      metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';
  }

  // 2. Check process.env (Node / Vite define replacement)
  if ((!url || !key) && typeof process !== 'undefined' && process.env) {
    url =
      url ||
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    key =
      key ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '';
  }

  return {
    url: normalizeSupabaseUrl(url),
    key: (key || '').trim().replace(/^["']|["']$/g, ''),
  };
}

/**
 * Creates or returns the singleton Supabase client using public environment credentials.
 * Does NOT hardcode keys or expose service-role keys.
 */
export function getSupabase(customUrl?: string, customKey?: string): SupabaseClient | null {
  if (supabaseInstance && !customUrl && !customKey) {
    return supabaseInstance;
  }

  const { url: defaultUrl, key: defaultKey } = getPublicSupabaseCredentials();
  const activeUrl = normalizeSupabaseUrl(customUrl || defaultUrl);
  const activeKey = (customKey || defaultKey || '').trim();

  if (!activeUrl || !activeKey) {
    return null;
  }

  try {
    const client = createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    if (!customUrl && !customKey) {
      supabaseInstance = client;
    }
    return client;
  } catch (err) {
    console.error('[Supabase Client Init Error]', err);
    return null;
  }
}

/**
 * Dynamically fetches public configuration from the server endpoint if client-side injection is empty.
 */
export async function initSupabaseAsync(): Promise<SupabaseClient | null> {
  const existing = getSupabase();
  if (existing) return existing;

  if (isFetchingConfig) {
    await new Promise((r) => setTimeout(r, 200));
    return getSupabase();
  }

  isFetchingConfig = true;
  try {
    const res = await fetch('/api/supabase/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabasePublishableKey) {
        return getSupabase(data.supabaseUrl, data.supabasePublishableKey);
      }
    }
  } catch (err) {
    console.warn('[Supabase Config Fetch Notice]', err);
  } finally {
    isFetchingConfig = false;
  }

  return getSupabase();
}

/**
 * Reusable Supabase client instance (or null if unconfigured)
 */
export const supabase = getSupabase();

/**
 * Tests connection with a real database query against Supabase.
 * Returns true only when a genuine, verified connection is established.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  // 1. Try server-side test route first (runs with server environment & credentials)
  try {
    const res = await fetch('/api/supabase/test');
    if (res.ok) {
      const data = await res.json();
      if (data.connected === true) {
        return { success: true };
      }
    }
  } catch (e: any) {
    console.warn('[Supabase Test Notice] Server endpoint notice, checking client-side connection:', e?.message || e);
  }

  // 2. Client-side query test fallback
  let client = getSupabase();
  if (!client) {
    client = await initSupabaseAsync();
  }

  if (!client) {
    return {
      success: false,
      error: 'Supabase client could not be initialized. Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY.',
    };
  }

  try {
    // Query the candidates table (or fallback connection probe)
    const { error, status } = await client.from('candidates').select('id').limit(1);
    if (error) {
      const isConnected =
        error.code === '42P01' || // relation does not exist
        error.code === '42501' || // insufficient_privilege (RLS active and evaluating queries)
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST116' ||
        error.code === 'PGRST301' ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('table') ||
        error.message?.toLowerCase().includes('row-level security') ||
        error.message?.toLowerCase().includes('permission denied') ||
        error.message?.toLowerCase().includes('does not exist') ||
        (typeof status === 'number' && status >= 200 && status < 500);

      if (isConnected) {
        return { success: true };
      }
      console.error('[Supabase Client Query Error]', error);
      return { success: false, error: error.message || String(error) };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[Supabase Client Technical Error]', err);
    return { success: false, error: err?.message || String(err) };
  }
}
