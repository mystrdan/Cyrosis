export type ResearchResponse = {
  answer: string;
  question: string;
  sources: Array<{ title: string; url: string }>;
  status: string;
  mode?: "retrieval-only" | "model-assisted";
};

export async function research(question: string): Promise<ResearchResponse> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Research request failed.");
  return data;
}
