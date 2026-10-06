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
        self._fts_available = self._setup_fts()
        self.db.commit()

    def _setup_fts(self) -> bool:
        try:
            self.db.execute("""CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
                title, content, source, content='knowledge', content_rowid='id'
            )""")
            self.db.execute("INSERT INTO knowledge_fts(knowledge_fts) VALUES('rebuild')")
            return True
        except sqlite3.OperationalError:
            return False

    def add(self, title: str, content: str, source: str | None = None) -> int:
        cur = self.db.execute(
            "INSERT INTO knowledge(title, content, source) VALUES (?, ?, ?)",
            (title, content, source),
        )
        self.db.commit()
        if self._fts_available:
            self.db.execute("INSERT INTO knowledge_fts(rowid, title, content, source) VALUES (?, ?, ?, ?)",
                             (cur.lastrowid, title, content, source or ""))
            self.db.commit()
        return int(cur.lastrowid)

    def search(self, query: str, limit: int = 10) -> list[tuple]:
        if self._fts_available:
            terms = " ".join(part for part in query.replace('"', ' ').split() if part)
            if terms:
                try:
                    return self.db.execute(
                        "SELECT k.id, k.title, k.content, k.source "
                        "FROM knowledge_fts f JOIN knowledge k ON k.id = f.rowid "
                        "WHERE knowledge_fts MATCH ? ORDER BY bm25(knowledge_fts) LIMIT ?",
                        (terms, limit),
                    ).fetchall()
                except sqlite3.OperationalError:
                    pass
        pattern = f"%{query}%"
        return self.db.execute(
            "SELECT id, title, content, source FROM knowledge "
            "WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC LIMIT ?",
            (pattern, pattern, limit),
        ).fetchall()
