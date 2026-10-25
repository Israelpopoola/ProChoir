import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Server-only key: choir pages read through the server, so the database
// doesn't need to be publicly readable (the PIN can actually protect it).
const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isConfigured = Boolean(url && key);
export const isServerConfigured = Boolean(isConfigured && secret);

/** Server-side client for choir pages. Never import into client components. */
export function serverClient(): SupabaseClient {
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(url!, secret, {
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
