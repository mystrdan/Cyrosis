import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { CYRO_LANGUAGES, research, type ResearchResponse } from "./api";
import { getCurrentSession, sendMagicLink, signOut, subscribeToAuth, userLabel } from "./auth";
import {
  addResearchMessage,
  createResearchSession,
  getCurrentCyroSubscription,
  getTodayCyroUsage,
  deleteKnowledge,
  listKnowledge,
  listCyroPlans,
  listResearchMessages,
  listResearchSessions,
  saveKnowledge,
  type CyroDailyUsage,
  type CyroPlan,
  type CyroSubscription,
  type KnowledgeDocument,
  type ResearchMessage,
  type ResearchSession,
} from "./data/research";

const suggestions = ["Research an African market", "Explain a historical event", "Find reliable sources", "Build a knowledge brief"];

const pricing = [
  { name: "Essential", daily: 0.50, description: "The minimum Cyro plan for everyday research.", features: ["Core research", "Source-backed answers", "Personal history"] },
  { name: "Research", daily: 1.00, description: "More room for serious research and knowledge work.", features: ["Everything in Essential", "Larger research allowance", "Saved knowledge"] },
  { name: "Deep Research", daily: 2.00, description: "For heavier research workflows and frequent use.", features: ["Everything in Research", "Higher usage allowance", "Priority research capacity"] },
] as const;

type Message = { role: "user" | "cyro"; text: string; result?: ResearchResponse };
type View = "research" | "knowledge" | "history" | "pricing";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [view, setView] = useState<View>("research");
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("cyro-language") || "en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeDocument[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [savingKnowledge, setSavingKnowledge] = useState<number | null>(null);
  const [plans, setPlans] = useState<CyroPlan[]>([]);
  const [subscription, setSubscription] = useState<CyroSubscription | null>(null);
  const [usage, setUsage] = useState<CyroDailyUsage | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentSession().then((current) => {
      if (active) { setSession(current); setAuthReady(true); }
    });
    return subscribeToAuth((next) => {
      if (active) {
        setSession(next);
        setSessionId(null);
        setMessages([]);
        setAuthReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!session || view !== "history") return;
    setDataLoading(true);
    listResearchSessions()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setDataLoading(false));
  }, [session, view]);

  useEffect(() => {
    if (!session || view !== "knowledge") return;
    setDataLoading(true);
    listKnowledge()
      .then(setKnowledge)
      .catch(() => setKnowledge([]))
      .finally(() => setDataLoading(false));
  }, [session, view]);

  async function login(event: FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value || authLoading) return;
    setAuthLoading(true); setAuthMessage("");
    try {
      const { error } = await sendMagicLink(value);
      setAuthMessage(error ? error.message : "Check your email for the Cyro sign-in link.");
    } catch (error) { setAuthMessage(error instanceof Error ? error.message : "Authentication failed."); }
    finally { setAuthLoading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    setMessages((items) => [...items, { role: "user", text: value }]);
    setQuestion("");
    setLoading(true);

    try {
      const activeSessionId = sessionId ?? (await createResearchSession(value.slice(0, 80))).id;
      if (!sessionId) setSessionId(activeSessionId);
      await addResearchMessage(activeSessionId, "user", value);
      const result = await research(value, language);
      await addResearchMessage(activeSessionId, "cyro", result.answer);
      setMessages((items) => [...items, { role: "cyro", text: result.answer, result }]);
    } catch (error) {
      setMessages((items) => [...items, { role: "cyro", text: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally { setLoading(false); }
  }

  async function openHistory(id: string) {
    setDataLoading(true);
    try {
      const rows = await listResearchMessages(id);
      setSessionId(id);
      setMessages(rows.filter((row) => row.role !== "system").map((row: ResearchMessage) => ({
        role: row.role === "user" ? "user" : "cyro",
        text: row.content,
      })));
      setView("research");
    } catch {
      setMessages([{ role: "cyro", text: "I couldn't reopen that research session." }]);
    } finally {
      setDataLoading(false);
    }
  }

  async function saveAnswer(message: Message) {
    if (!message.result || savingKnowledge !== null) return;
    setSavingKnowledge(Date.now());
    try {
      const source = message.result.sources?.[0];
      await saveKnowledge(
        message.text.slice(0, 80) || "Cyro research",
        message.text,
        source?.url,
        undefined,
      );
    } catch (error) {
      setMessages((items) => [...items, { role: "cyro", text: error instanceof Error ? error.message : "Couldn't save that knowledge." }]);
    } finally {
      setSavingKnowledge(null);
    }
  }

  async function removeKnowledge(id: number) {
    try {
      await deleteKnowledge(id);
      setKnowledge((items) => items.filter((item) => item.id !== id));
    } catch {
      // Keep the current list if deletion fails.
    }
  }

  function changeLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem("cyro-language", value);
  }

  function newResearch() {
    setMessages([]);
    setSessionId(null);
    setQuestion("");
    setView("research");
  }

  if (!authReady) return <div className="auth-shell"><div className="auth-card"><span className="mark">C</span><h1>Cyro</h1><p>Loading your workspace…</p></div></div>;
  if (!session) return <div className="auth-shell"><div className="auth-card"><div className="brand"><span className="mark">C</span><span>Cyro</span></div><h1>Research starts here.</h1><p>Sign in to keep your research, knowledge and history connected to your account.</p><form onSubmit={login}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /><button type="submit" disabled={authLoading}>{authLoading ? "Sending…" : "Send magic link"}</button></form>{authMessage && <small>{authMessage}</small>}</div></div>;

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="mark">C</span><span>Cyro</span></div>
      <button className="new-chat" onClick={newResearch}>＋ New research</button>
      <nav>
        <button className={view === "research" ? "active" : ""} onClick={() => setView("research")}>⌕ Research</button>
        <button className={view === "knowledge" ? "active" : ""} onClick={() => setView("knowledge")}>▣ Knowledge</button>
        <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>◷ History</button>
        <button className={view === "pricing" ? "active" : ""} onClick={() => setView("pricing")}>₵ Pricing</button>
      </nav>
      <div className="side-note"><strong>Africa-first.</strong><span>Research, knowledge and useful work — without the bloat.</span></div>
      <div className="account"><small>{userLabel(session.user)}</small>{subscription ? <span className="plan-mini">{plans.find((plan) => plan.id === subscription.plan_id)?.name ?? subscription.plan_id}</span> : <span className="plan-mini">No plan selected</span>}<button onClick={signOut}>Sign out</button></div>
    </aside>
    <main className="main">
      <header><div><span className="eyebrow">CYRO / {view.toUpperCase()}</span><h1>{view === "research" ? "What are you working on?" : view === "knowledge" ? "Your knowledge." : view === "history" ? "Your research history." : "Simple pricing."}</h1><p>{view === "research" ? "Ask a question, investigate a topic, or build knowledge you can keep." : view === "history" ? "Research sessions saved to your account." : view === "knowledge" ? "Saved knowledge from your research." : "Cyro starts at just ₵0.50 per day."}</p></div><div className="header-actions"><label className="language-picker"><span>Language</span><select value={language} onChange={(e) => changeLanguage(e.target.value)}>{CYRO_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.nativeName}{item.status === "planned" ? " — coming soon" : ""}</option>)}</select></label><div className="status"><i /> {loading ? "Researching" : "Ready"}</div></div></header>
      <section className="workspace">
        {view === "pricing" ? <div className="pricing-grid"><div className="usage-strip"><strong>{subscription ? `Current plan: ${plans.find((plan) => plan.id === subscription.plan_id)?.name ?? subscription.plan_id}` : "No active plan"}</strong><span>{usage ? `${usage.research_requests} research requests today` : "Daily usage will appear here once available."}</span></div>{pricing.map((plan, index) => <article className={`price-card ${index === 0 ? "price-card-featured" : ""}`} key={plan.name}><div><small>CYRO / {index === 0 ? "START HERE" : "PLAN"}</small><h2>{plan.name}</h2><p>{plan.description}</p></div><div className="price"><strong>₵{plan.daily.toFixed(2)}</strong><span>/ day</span></div><div className="price-month">About ₵{(plan.daily * 30).toFixed(2)} / 30 days</div><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><button onClick={() => setView("research")}>Continue with Cyro</button></article>)}</div>
          : view === "history" ? <div className="history-list">{dataLoading ? <div className="empty"><p>Loading history…</p></div> : history.length ? history.map((item) => <button key={item.id} onClick={() => openHistory(item.id)}>{item.title || "Untitled research"}<span>{new Date(item.created_at).toLocaleDateString()}</span></button>) : <div className="empty"><div className="orb">C</div><h2>No research yet.</h2><p>Your signed-in research sessions will appear here.</p></div>}</div>
          : view === "knowledge" ? <div className="knowledge-list">{dataLoading ? <div className="empty"><p>Loading knowledge…</p></div> : knowledge.length ? knowledge.map((item) => <article className="knowledge-card" key={item.id}><div><small>{new Date(item.created_at).toLocaleDateString()}</small><h2>{item.title}</h2><p>{item.content}</p>{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer">Open source ↗</a>}</div><button onClick={() => removeKnowledge(item.id)}>Delete</button></article>) : <div className="empty"><div className="orb">C</div><h2>No saved knowledge yet.</h2><p>Save useful Cyro answers and they will stay in your personal knowledgebase.</p></div>}</div>
          : messages.length === 0 ? <div className="empty"><div className="orb">C</div><h2>Research starts here.</h2><p>Cyro will search sources, compare evidence, and build answers you can save.</p><div className="suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<span>→</span></button>)}</div></div>
          : <div className="messages">{messages.map((message, index) => <article className="message" key={index}><span className="avatar">{message.role === "user" ? "Y" : "C"}</span><div><small>{message.role === "user" ? "You" : "Cyro"}</small><p>{message.text}</p>{message.role === "cyro" && message.result?.sources?.length ? <div className="sources"><strong>Sources</strong>{message.result.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}<button className="save-knowledge" onClick={() => saveAnswer(message)} disabled={savingKnowledge !== null}>{savingKnowledge !== null ? "Saving…" : "Save to knowledge"}</button></div> : null}</div></article>)}</div>}
      </section>
      {view === "research" && <form className="composer" onSubmit={submit}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Cyro anything..." rows={1} disabled={loading} /><button type="submit" aria-label="Send" disabled={loading}>{loading ? "…" : "↑"}</button><span>Research · Knowledge · Useful work</span></form>}
    </main>
  </div>;
}
