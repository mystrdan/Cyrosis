from cyro.agent import Cyro
from cyro.knowledge import KnowledgeBase
from cyro.testing import EchoModel

def test_cyro_uses_local_knowledge(tmp_path):
    kb = KnowledgeBase(str(tmp_path))
    kb.add("Ghana", "Accra is the capital of Ghana.", "local")

    answer = Cyro(EchoModel(), knowledge=kb).ask("What is the capital of Ghana?")

    assert "Accra is the capital of Ghana." in answer
    assert "What is the capital of Ghana?" in answer
