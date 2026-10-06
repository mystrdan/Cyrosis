type RequestLike = { method?: string; body?: unknown };

type ResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
};

type WikiResult = { title: string; url: string; extract: string };

async function searchWikipedia(question: string): Promise<WikiResult[]> {
  const lang = (process.env.CYRO_WIKI_LANG || "en").trim() || "en";
  const searchUrl = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  searchUrl.search = new URLSearchParams({
    action: "opensearch",
    search: question,
    limit: "5",
    namespace: "0",
    format: "json",
  }).toString();

  const searchResponse = await fetch(searchUrl, {
    headers: { "User-Agent": "Cyro/0.1 (research; +https://cyro-capsicom.vercel.app)" },
  });
  if (!searchResponse.ok) throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  const data = (await searchResponse.json()) as [string, string[], string[], string[]];
  const urls = data[3] || [];

  const results = await Promise.all(urls.slice(0, 5).map(async (url, index) => {
    const title = data[1]?.[index] || url;
    const page = new URL(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ", "_"))}`);
    const response = await fetch(page, {
      headers: { "User-Agent": "Cyro/0.1 research" },
    });
    if (!response.ok) return null;
    const summary = (await response.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } };
    return {
      title,
      url: summary.content_urls?.desktop?.page || url,
      extract: summary.extract || "",
    };
  }));

  return results.filter((item): item is WikiResult => Boolean(item?.extract));
}

function buildAnswer(question: string, sources: WikiResult[]): string {
  if (!sources.length) return `I couldn't find a usable source for “${question}”. Try a more specific research question.`;
  const evidence = sources.slice(0, 3).map((source) => `${source.title}: ${source.extract}`).join("\\n\\n");
  return `Initial research for “${question}”\\n\\n${evidence}\\n\\nThese are source extracts, not a final AI synthesis. Cyro's model layer can be connected next to compare and synthesize this evidence.`;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as { question?: unknown } | undefined;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question) {
    res.status(400).json({ error: "A research question is required." });
    return;
  }

  try {
    const results = await searchWikipedia(question);
    res.status(200).json({
      answer: buildAnswer(question, results),
      question,
      sources: results.map(({ title, url }) => ({ title, url })),
      status: "researched",
    });
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : "Research provider failed.",
      question,
      sources: [],
      status: "error",
    });
  }
}
