from pathlib import Path
from .knowledge import KnowledgeBase

def open_knowledgebase(data_dir: str = ".cyro") -> KnowledgeBase:
    Path(data_dir).mkdir(parents=True, exist_ok=True)
    return KnowledgeBase(data_dir)
