from .models import Message, ModelAdapter

class Cyro:
    """Small orchestration layer for Cyro's model, knowledge, and research tools."""

    def __init__(self, model: ModelAdapter, knowledge=None, research=None) -> None:
        self.model = model
        self.knowledge = knowledge
        self.research = research

    def ask(self, question: str) -> str:
        context = []
        if self.knowledge:
            context = self.knowledge.search(question, limit=5)

        prompt = question
        if context:
            notes = "\n\n".join(
                f"[Knowledge {row[0]}] {row[1]}\n{row[2]}" for row in context
            )
            prompt = f"Use the following local knowledge when relevant:\n{notes}\n\nQuestion: {question}"

        return self.model.generate([Message(role="user", content=prompt)])
