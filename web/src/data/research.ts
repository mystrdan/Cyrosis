import { supabase } from "../lib/supabase";

export type ResearchSession = {
  id: string;
  title: string | null;
  created_at: string;
};

export type ResearchMessage = {
  id: number;
  session_id: string;
  role: "user" | "cyro" | "system";
  content: string;
  created_at: string;
};

export type CyroPlan = {
  id: string;
  name: string;
  daily_price_ghs: number;
  daily_research_limit: number | null;
  description: string;
};

export type CyroSubscription = {
  user_id: string;
  plan_id: string;
  status: string;
  starts_at: string;
  ends_at: string | null;
};

export type CyroDailyUsage = {
  user_id: string;
  usage_date: string;
  research_requests: number;
  research_units: number;
};

export type KnowledgeDocument = {
  id: number;
  title: string;
  content: string;
  source_url: string | null;
  country: string | null;
  created_at: string;
};

export async function createResearchSession(title?: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("research_sessions")
    .insert({ title: title?.trim() || null })
    .select("id,title,created_at")
    .single();
  if (error) throw error;
  return data as ResearchSession;
}

export async function addResearchMessage(sessionId: string, role: ResearchMessage["role"], content: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("research_messages")
    .insert({ session_id: sessionId, role, content })
    .select("id,session_id,role,content,created_at")
    .single();
  if (error) throw error;
  return data as ResearchMessage;
}

export async function listResearchSessions(limit = 25) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("research_sessions")
    .select("id,title,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ResearchSession[];
}

export async function listResearchMessages(sessionId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("research_messages")
    .select("id,session_id,role,content,created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ResearchMessage[];
}

export async function listKnowledge(limit = 50) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("id,title,content,source_url,country,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as KnowledgeDocument[];
}

export async function saveKnowledge(title: string, content: string, sourceUrl?: string, country?: string) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("knowledge_documents")
    .insert({
      title: title.trim(),
      content,
      source_url: sourceUrl?.trim() || null,
      country: country?.trim() || null,
    })
    .select("id,title,content,source_url,country,created_at")
    .single();
  if (error) throw error;
  return data as KnowledgeDocument;
}

export async function listCyroPlans() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cyro_plans")
    .select("id,name,daily_price_ghs,daily_research_limit,description")
    .order("daily_price_ghs", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CyroPlan[];
}

export async function getCurrentCyroSubscription() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cyro_subscriptions")
    .select("user_id,plan_id,status,starts_at,ends_at")
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as CyroSubscription | null;
}

export async function getTodayCyroUsage() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("cyro_daily_usage")
    .select("user_id,usage_date,research_requests,research_units")
    .eq("usage_date", new Date().toISOString().slice(0, 10))
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as CyroDailyUsage | null;
}

export async function deleteKnowledge(id: number) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("knowledge_documents").delete().eq("id", id);
  if (error) throw error;
}
