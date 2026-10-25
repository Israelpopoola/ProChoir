import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key);

/** Read-only client for server components (no user session). */
export function serverClient(): SupabaseClient {
  return createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let browser: SupabaseClient | undefined;

/** Client for the browser. Keeps the MD's login session. */
export function browserClient(): SupabaseClient {
  browser ??= createClient(url!, key!);
  return browser;
}

export function audioUrl(path: string): string {
  return `${url}/storage/v1/object/public/audio/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
