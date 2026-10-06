# Cyro language roadmap

Cyro is Africa-first and English-first.

## Initial language scope

- English — available now
- Twi — planned
- Akan — planned
- Ewe — planned
- Ga — planned
- Dagbani — planned
- Dagaare — planned
- Nzema — planned
- Gurene (Frafra) — planned
- Kasem — planned

The web client stores the selected language and sends it with research requests. The research layer asks the configured model to answer in the requested language.

Language support is deliberately separated from the source-retrieval layer: sources may be in English or another available source language while Cyro produces the requested answer language.

Future work:
1. Add high-quality language-specific evaluation sets.
2. Add Ghanaian-language source discovery and ranking.
3. Add translation/fallback behavior when a model cannot reliably answer in a selected language.
4. Expand beyond Ghana to major African languages without making Ghanaian languages an afterthought.
