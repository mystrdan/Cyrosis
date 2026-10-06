from dataclasses import dataclass
from typing import Protocol

@dataclass
class Source:
    title: str
    url: str
    text: str = ""

class SearchProvider(Protocol):
    def search(self, query: str, limit: int = 5) -> list[Source]: ...

class ResearchEngine:
    def __init__(self, search: SearchProvider) -> None:
        self.search = search

    def collect(self, question: str, limit: int = 5) -> list[Source]:
        return self.search.search(question, limit)
