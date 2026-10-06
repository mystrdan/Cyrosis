export type CyroLanguage = { code: string; name: string; nativeName: string; status: "available" | "planned" };

export const CYRO_LANGUAGES: CyroLanguage[] = [
  { code: "en", name: "English", nativeName: "English", status: "available" },
  { code: "tw", name: "Twi", nativeName: "Twi", status: "planned" },
  { code: "ak", name: "Akan", nativeName: "Akan", status: "planned" },
  { code: "ee", name: "Ewe", nativeName: "Eʋegbe", status: "planned" },
  { code: "gaa", name: "Ga", nativeName: "Gã", status: "planned" },
  { code: "dag", name: "Dagbani", nativeName: "Dagbanli", status: "planned" },
  { code: "dagb", name: "Dagaare", nativeName: "Dagaare", status: "planned" },
  { code: "nzi", name: "Nzema", nativeName: "Nzema", status: "planned" },
  { code: "gur", name: "Gurene", nativeName: "Frafra", status: "planned" },
  { code: "ksw", name: "Kasem", nativeName: "Kassem", status: "planned" },
];

export type ResearchResponse = {
  answer: string;
  question: string;
  sources: Array<{ title: string; url: string }>;
  status: string;
  mode?: "retrieval-only" | "model-assisted";
};

export async function research(question: string, language = "en"): Promise<ResearchResponse> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, language }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Research request failed.");
  return data;
}
