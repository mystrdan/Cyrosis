import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim();
const secret = process.env.SUPABASE_SECRET_KEY?.trim();

export function getSupabaseAdmin() {
  if (!url || !secret) throw new Error("Server Supabase configuration is missing.");
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}
