from .research import Source

def research_prompt(question: str, sources: list[Source]) -> str:
    if not sources:
        return question
    evidence = "\n\n".join(
        f"Source: {source.title}\nURL: {source.url}\n{source.text[:12000]}"
        for source in sources
    )
    return (
        "Answer the user's question using the research evidence below. "
        "Separate sourced facts from inference, mention uncertainty when evidence conflicts, "
        "and do not invent citations.\n\n"
        f"Research question: {question}\n\n{evidence}"
    )
