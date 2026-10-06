import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { research, type ResearchResponse } from "./api";
import { getCurrentSession, sendMagicLink, signOut, subscribeToAuth, userLabel } from "./auth";
import { addResearchMessage, createResearchSession, listResearchSessions, type ResearchSession } from "./data/research";

const suggestions = ["Research an African market", "Explain a historical event", "Find reliable sources", "Build a knowledge brief"];

const pricing = [
  { name: "Essential", daily: 0.02, description: "The minimum Cyro plan for everyday research.", features: ["Core research", "Source-backed answers", "Personal history"] },
  { name: "Research", daily: 0.05, description: "More room for serious research and knowledge work.", features: ["Everything in Essential", "Larger research allowance", "Saved knowledge"] },
  { name: "Deep Research", daily: 0.10, description: "For heavier research workflows and frequent use.", features: ["Everything in Research", "Higher usage allowance", "Priority research capacity"] },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<ResearchSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    listResearchSessions().then(setHistory).catch(() => setHistory([]));
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
      const result = await research(value);
      await addResearchMessage(activeSessionId, "cyro", result.answer);
      setMessages((items) => [...items, { role: "cyro", text: result.answer, result }]);
    } catch (error) {
      setMessages((items) => [...items, { role: "cyro", text: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally { setLoading(false); }
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
      <div className="account"><small>{userLabel(session.user)}</small><button onClick={signOut}>Sign out</button></div>
    </aside>
    <main className="main">
      <header><div><span className="eyebrow">CYRO / {view.toUpperCase()}</span><h1>{view === "research" ? "What are you working on?" : view === "knowledge" ? "Your knowledge." : view === "history" ? "Your research history." : "Simple pricing."}</h1><p>{view === "research" ? "Ask a question, investigate a topic, or build knowledge you can keep." : view === "history" ? "Research sessions saved to your account." : view === "knowledge" ? "Saved knowledge will live here." : "Cyro starts at just ₵0.02 per day."}</p></div><div className="status"><i /> {loading ? "Researching" : "Ready"}</div></header>
      <section className="workspace">
        {view === "pricing" ? <div className="pricing-grid">{pricing.map((plan, index) => <article className={`price-card ${index === 0 ? "price-card-featured" : ""}`} key={plan.name}><div><small>CYRO / {index === 0 ? "START HERE" : "PLAN"}</small><h2>{plan.name}</h2><p>{plan.description}</p></div><div className="price"><strong>₵{plan.daily.toFixed(2)}</strong><span>/ day</span></div><div className="price-month">About ₵{(plan.daily * 30).toFixed(2)} / 30 days</div><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><button onClick={() => setView("research")}>Continue with Cyro</button></article>)}</div>
          : view === "history" ? <div className="history-list">{history.length ? history.map((item) => <button key={item.id} onClick={() => { setSessionId(item.id); setView("research"); }}>{item.title || "Untitled research"}<span>{new Date(item.created_at).toLocaleDateString()}</span></button>) : <div className="empty"><div className="orb">C</div><h2>No research yet.</h2><p>Your signed-in research sessions will appear here.</p></div>}</div>
          : view === "knowledge" ? <div className="empty"><div className="orb">C</div><h2>Knowledge is next.</h2><p>The database layer is ready for saved, user-owned knowledge.</p></div>
          : messages.length === 0 ? <div className="empty"><div className="orb">C</div><h2>Research starts here.</h2><p>Cyro will search sources, compare evidence, and build answers you can save.</p><div className="suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<span>→</span></button>)}</div></div>
          : <div className="messages">{messages.map((message, index) => <article className="message" key={index}><span className="avatar">{message.role === "user" ? "Y" : "C"}</span><div><small>{message.role === "user" ? "You" : "Cyro"}</small><p>{message.text}</p>{message.result?.sources?.length ? <div className="sources"><strong>Sources</strong>{message.result.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}</div> : null}</div></article>)}</div>}
      </section>
      {view === "research" && <form className="composer" onSubmit={submit}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Cyro anything..." rows={1} disabled={loading} /><button type="submit" aria-label="Send" disabled={loading}>{loading ? "…" : "↑"}</button><span>Research · Knowledge · Useful work</span></form>}
    </main>
  </div>;
}
