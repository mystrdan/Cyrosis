from dataclasses import dataclass
from typing import Protocol
from urllib.parse import urlparse
from urllib.request import Request, urlopen

@dataclass
class Source:
    title: str
    url: str
    text: str = ""

class SearchProvider(Protocol):
    def search(self, query: str, limit: int = 5) -> list[Source]: ...

class UrlFetcher:
    """Small standard-library fetcher for explicitly supplied research URLs."""

    def __init__(self, timeout: int = 15) -> None:
        self.timeout = timeout

    def fetch(self, url: str) -> Source:
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"}:
            raise ValueError("Only HTTP(S) URLs are supported.")
        request = Request(url, headers={"User-Agent": "Cyro/0.1 research"})
        with urlopen(request, timeout=self.timeout) as response:
            raw = response.read()
            charset = response.headers.get_content_charset() or "utf-8"
        return Source(parsed.netloc or url, url, raw.decode(charset, errors="replace"))

class ResearchEngine:
    def __init__(self, search: SearchProvider | None = None, fetcher: UrlFetcher | None = None) -> None:
        self.search = search
        self.fetcher = fetcher or UrlFetcher()

    def collect(self, question: str, limit: int = 5) -> list[Source]:
        return [] if self.search is None else self.search.search(question, limit)

    def collect_urls(self, urls: list[str]) -> list[Source]:
        return [self.fetcher.fetch(url) for url in urls]
