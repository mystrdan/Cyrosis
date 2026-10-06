from cyro.prompting import research_prompt
from cyro.research import Source

def test_research_prompt_contains_source():
    prompt = research_prompt("What happened?", [Source("Example", "https://example.com", "Evidence")])
    assert "https://example.com" in prompt
    assert "Evidence" in prompt
