type RequestLike = { method?: string; body?: unknown };

type ResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
};

export default function handler(req: RequestLike, res: ResponseLike) {
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

  res.status(200).json({
    answer: "Cyro's research pipeline is being connected. Your question was received successfully.",
    question,
    sources: [],
    status: "received",
  });
}
