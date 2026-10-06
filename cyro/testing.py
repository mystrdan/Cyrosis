from .models import Message

class EchoModel:
    """Deterministic model used for local development and tests."""

    def generate(self, messages: list[Message]) -> str:
        return messages[-1].content if messages else ""
