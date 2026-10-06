from cyro.knowledge import KnowledgeBase

def test_add_and_search(tmp_path):
    kb = KnowledgeBase(str(tmp_path))
    kb.add("Ghana", "Ghana is in West Africa.", "test")
    rows = kb.search("West Africa")
    assert rows
    assert rows[0][1] == "Ghana"
