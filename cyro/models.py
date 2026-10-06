from dataclasses import dataclass
from typing import Protocol

@dataclass
class Message:
    role: str
    content: str

class ModelAdapter(Protocol):
    def generate(self, messages: list[Message]) -> str: ...

class UnconfiguredModel:
    def generate(self, messages: list[Message]) -> str:
        raise RuntimeError("No Cyro model is configured yet.")
