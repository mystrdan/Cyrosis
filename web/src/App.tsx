import { FormEvent, useState } from "react";

const suggestions = [
  "Research an African market",
  "Explain a historical event",
  "Find reliable sources",
  "Build a knowledge brief",
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{role: "user" | "cyro"; text: string}[]>([]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    setMessages((items) => [...items, { role: "user", text: value }]);
    setQuestion("");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="mark">C</span><span>Cyro</span></div>
        <button className="new-chat">＋ New research</button>
        <nav>
          <a className="active">⌕ Research</a>
          <a>▣ Knowledge</a>
          <a>◷ History</a>
        </nav>
        <div className="side-note">
          <strong>Africa-first.</strong>
          <span>Research, knowledge and useful work — without the bloat.</span>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <span className="eyebrow">CYRO / RESEARCH</span>
            <h1>What are you working on?</h1>
            <p>Ask a question, investigate a topic, or build knowledge you can keep.</p>
          </div>
          <div className="status"><i /> Ready</div>
        </header>

        <section className="workspace">
          {messages.length === 0 ? (
            <div className="empty">
              <div className="orb">C</div>
              <h2>Research starts here.</h2>
              <p>Cyro will eventually search sources, compare evidence, and build answers you can save.</p>
              <div className="suggestions">
                {suggestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}<span>→</span></button>)}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <article className={message.role === "user" ? "message user" : "message"} key={index}>
                  <span className="avatar">{message.role === "user" ? "Y" : "C"}</span>
                  <div><small>{message.role === "user" ? "You" : "Cyro"}</small><p>{message.text}</p></div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form className="composer" onSubmit={submit}>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask Cyro anything..." rows={1} />
          <button type="submit" aria-label="Send">↑</button>
          <span>Research · Knowledge · Useful work</span>
        </form>
      </main>
    </div>
  );
}
