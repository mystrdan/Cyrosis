from cyro.africa import is_africa_relevant, research_scope

def test_africa_relevance():
    assert is_africa_relevant("What is the Ghanaian market like?")
    assert "Africa-first" in research_scope("African agriculture")
    assert "strongest available" in research_scope("What is photosynthesis?")
