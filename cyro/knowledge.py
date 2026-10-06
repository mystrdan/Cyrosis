import sqlite3
from pathlib import Path

class KnowledgeBase:
    def __init__(self, data_dir: str = ".cyro") -> None:
        Path(data_dir).mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(Path(data_dir) / "knowledge.db")
        self.db.execute("""CREATE TABLE IF NOT EXISTS knowledge (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )""")
        self.db.commit()

    def add(self, title: str, content: str, source: str | None = None) -> int:
        cur = self.db.execute(
            "INSERT INTO knowledge(title, content, source) VALUES (?, ?, ?)",
            (title, content, source),
        )
        self.db.commit()
        return int(cur.lastrowid)

    def search(self, query: str, limit: int = 10) -> list[tuple]:
        pattern = f"%{query}%"
        return self.db.execute(
            "SELECT id, title, content, source FROM knowledge "
            "WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC LIMIT ?",
            (pattern, pattern, limit),
        ).fetchall()
