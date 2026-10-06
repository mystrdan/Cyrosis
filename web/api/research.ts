type RequestLike = { method?: string; body?: unknown };

type ResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
};

type WikiResult = { title: string; url: string; extract: string };

type ModelResponse = { choices?: Array<{ message?: { content?: string } }> };

async function searchWikipedia(question: string): Promise<WikiResult[]> {
  const lang = (process.env.CYRO_WIKI_LANG || "en").trim() || "en";
  const searchUrl = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  searchUrl.search = new URLSearchParams({ action: "opensearch", search: question, limit: "5", namespace: "0", format: "json" }).toString();
  const searchResponse = await fetch(searchUrl, { headers: { "User-Agent": "Cyro/0.1 research" } });
  if (!searchResponse.ok) throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  const data = (await searchResponse.json()) as [string, string[], string[], string[]];
  const urls = data[3] || [];
  const results = await Promise.all(urls.slice(0, 5).map(async (url, index) => {
    const title = data[1]?.[index] || url;
    const page = new URL(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`);
    const response = await fetch(page, { headers: { "User-Agent": "Cyro/0.1 research" } });
    if (!response.ok) return null;
    const summary = (await response.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } };
    return { title, url: summary.content_urls?.desktop?.page || url, extract: summary.extract || "" };
  }));
  return results.filter((item): item is WikiResult => Boolean(item?.extract));
}

function languageName(code: string): string {
  const languages: Record<string, string> = { en: "English", tw: "Twi", ak: "Akan", ee: "Ewe", gaa: "Ga", dag: "Dagbani", dga: "Dagaare", nzi: "Nzema", gur: "Gurene", xsm: "Kasem" };
  return languages[code] || "English";
}

function evidencePrompt(question: string, sources: WikiResult[], language: string): string {
  const evidence = sources.map((source) => `[Source: ${source.title}]\
${source.extract}`).join("\
\
");
  return [
    "You are Cyro, a lightweight research assistant.",
    "Answer using only the supplied evidence. Distinguish facts from inference, acknowledge uncertainty, and do not invent citations.",
    `Answer language: ${languageName(language)}.`,
    `Question: ${question}`,
    "Evidence:",
    evidence,
  ].join("\
\
");
}

async function synthesize(question: string, sources: WikiResult[], language: string): Promise<{ answer: string; mode: string }> {
  if (!sources.length) return { answer: `I couldn't find a usable source for “${question}”. Try a more specific research question.`, mode: "retrieval-only" };

  const modelUrl = process.env.CYRO_MODEL_URL?.trim();
  const modelKey = process.env.CYRO_MODEL_KEY?.trim();
  const modelName = process.env.CYRO_MODEL_NAME?.trim() || "cyro-default";
  if (modelUrl && modelKey) {
    const response = await fetch(modelUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${modelKey}` },
      body: JSON.stringify({ model: modelName, messages: [{ role: "user", content: evidencePrompt(question, sources, language) }], temperature: 0.2 }),
    });
    if (response.ok) {
      const data = (await response.json()) as ModelResponse;
      const answer = data.choices?.[0]?.message?.content?.trim();
      if (answer) return { answer, mode: "model-assisted" };
    }
  }

  const extracts = sources.slice(0, 3).map((source) => `${source.title}: ${source.extract}`).join("\
\
");
  return { answer: `Initial research for “${question}”\
\
${extracts}\
\
These are source extracts, not a final AI synthesis. Configure CYRO_MODEL_URL, CYRO_MODEL_KEY and CYRO_MODEL_NAME to enable model-assisted synthesis.`, mode: "retrieval-only" };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  const body = req.body as { question?: unknown; language?: unknown } | undefined;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "en";
  if (!question) { res.status(400).json({ error: "A research question is required." }); return; }
  try {
    const results = await searchWikipedia(question);
    const synthesis = await synthesize(question, results, language);
    res.status(200).json({ answer: synthesis.answer, question, sources: results.map(({ title, url }) => ({ title, url })), status: "researched", mode: synthesis.mode });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Research provider failed.", question, sources: [], status: "error" });
  }
}
