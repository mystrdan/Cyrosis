import { useState } from "react";
import type { FormEvent } from "react";
import { research, type ResearchResponse } from "./api";

const suggestions = ["Research an African market", "Explain a historical event", "Find reliable sources", "Build a knowledge brief"];
type Message = { role: "user" | "cyro"; text: string; result?: ResearchResponse };
type View = "research" | "knowledge" | "history";

export default function App() {
  const [view, setView] = useState<View>("research");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value || loading) return;
    setMessages((items: Message[]) => [...items, { role: "user", text: value }]);
    setQuestion("");
    setLoading(true);
    try {
      const result = await research(value);
      setMessages((items: Message[]) => [...items, { role: "cyro", text: result.answer, result }]);
    } catch (error) {
      setMessages((items: Message[]) => [...items, { role: "cyro", text: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally { setLoading(false); }
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="mark">C</span><span>Cyro</span></div>
      <button className="new-chat" onClick={() => setMessages([])}>＋ New research</button>
      <nav>
        <button className={view === "research" ? "active" : ""} onClick={() => setView("research")}>⌕ Research</button>
        <button className={view === "knowledge" ? "active" : ""} onClick={() => setView("knowledge")}>▣ Knowledge</button>
        <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>◷ History</button>
      </nav>
      <div className="side-note"><strong>Africa-first.</strong><span>Research, knowledge and useful work — without the bloat.</span></div>
    </aside>
    <main className="main">
      <header><div><span className="eyebrow">CYRO / {view.toUpperCase()}</span><h1>{view === "research" ? "What are you working on?" : view === "knowledge" ? "Your knowledge." : "Your research history."}</h1><p>{view === "research" ? "Ask a question, investigate a topic, or build knowledge you can keep." : "This lightweight workspace will grow here as persistence is connected."}</p></div><div className="status"><i /> {loading ? "Researching" : "Ready"}</div></header>
      <section className="workspace">
        {view !== "research" ? <div className="empty"><div className="orb">C</div><h2>{view === "knowledge" ? "Knowledge is next." : "History is next."}</h2><p>The interface is ready. Supabase persistence will populate this section once the dedicated Cyro project is connected.</p></div> :
        messages.length === 0 ? <div className="empty"><div className="orb">C</div><h2>Research starts here.</h2><p>Cyro will search sources, compare evidence, and build answers you can save.</p><div className="suggestions">{suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<span>→</span></button>)}</div></div> :
        <div className="messages">{messages.map((message, index) => <article className="message" key={index}><span className="avatar">{message.role === "user" ? "Y" : "C"}</span><div><small>{message.role === "user" ? "You" : "Cyro"}</small><p>{message.text}</p>{message.result?.sources?.length ? <div className="sources"><strong>Sources</strong>{message.result.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}</a>)}</div> : null}</div></article>)}</div>}
      </section>
      {view === "research" && <form className="composer" onSubmit={submit}><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Cyro anything..." rows={1} disabled={loading} /><button type="submit" aria-label="Send" disabled={loading}>{loading ? "…" : "↑"}</button><span>Research · Knowledge · Useful work</span></form>}
    </main>
  </div>;
}
