from .knowledge import KnowledgeBase

def main() -> None:
    kb = KnowledgeBase()
    print("Cyro core initialized.")
    print(f"Knowledge records: {kb.db.execute('SELECT COUNT(*) FROM knowledge').fetchone()[0]}")

if __name__ == "__main__":
    main()
