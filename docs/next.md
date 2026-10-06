# Next build steps

Cyro is intentionally being built in small layers.

## Immediate

1. Add a real model adapter behind ModelAdapter without coupling Cyro to one provider.
2. Add a lightweight web research provider with explicit source URLs.
3. Improve SQLite retrieval with ranking before considering embeddings.
4. Add a small command-line ask flow that can use the model and knowledgebase.
5. Add evaluation cases for factual accuracy, source handling, and Africa-specific questions.

## Product direction

Cyro should remain useful on modest hardware and simple to operate. Research, knowledge, and tools are capabilities around the model—not reasons to make the core system heavy.
