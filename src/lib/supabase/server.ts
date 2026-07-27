/**
 * @fileoverview Supabase client for server components / route handlers.
 * Uses service role key for admin operations — NEVER ship to browser.
 */

import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
