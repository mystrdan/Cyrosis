import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentClaims() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;
  return data.claims;
}

export async function sendMagicLink(email: string) {
  if (!supabase) throw new Error("Supabase Auth is not configured.");
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export function subscribeToAuth(callback: (session: Session | null) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export function userLabel(user: User | null): string {
  return user?.email || "User";
}
