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
  return data;
}
