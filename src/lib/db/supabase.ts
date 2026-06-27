import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────────────────────
// Server-side client — SERVICE ROLE key. Never expose to the browser.
// Use for all server-side reads and writes (Route Handlers, Server Actions).
// ────────────────────────────────────────────────────────────────────────────
export function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Browser client — ANON key. Memoized singleton for Realtime subscriptions.
// Only use in Client Components ("use client"). Never use for privileged writes.
// ────────────────────────────────────────────────────────────────────────────
let _browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (_browserClient) return _browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  _browserClient = createClient(url, key);
  return _browserClient;
}
