# Research Engine

Cyro's research engine should remain modular.

## Initial pipeline

1. Accept a research question.
2. Search for relevant sources.
3. Keep source metadata.
4. Extract useful passages.
5. Compare evidence.
6. Produce an answer with source references.
7. Offer to save useful findings to the knowledgebase.

## Africa-first research

When location matters, Cyro should prioritize relevant local sources and identify the country or region being researched.

Cyro should distinguish:
- sourced facts
- reasonable inference
- uncertainty
- conflicting claims

The first implementation can use a simple search-provider adapter. More providers can be added later.
