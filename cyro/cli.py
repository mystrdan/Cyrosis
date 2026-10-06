import argparse

from .agent import Cyro
from .config import settings
from .knowledge import KnowledgeBase
from .models import UnconfiguredModel

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="cyro")
    sub = parser.add_subparsers(dest="command")
    ask = sub.add_parser("ask", help="Ask Cyro a question")
    ask.add_argument("question")
    knowledge = sub.add_parser("knowledge", help="Manage local knowledge")
    knowledge_sub = knowledge.add_subparsers(dest="knowledge_command")
    add = knowledge_sub.add_parser("add", help="Add a knowledge record")
    add.add_argument("title")
    add.add_argument("content")
    add.add_argument("--source", default=None)
    return parser

def main(argv=None) -> int:
    args = build_parser().parse_args(argv)
    kb = KnowledgeBase(settings.data_dir)
    if args.command == "ask":
        try:
            print(Cyro(UnconfiguredModel(), knowledge=kb).ask(args.question))
        except RuntimeError as exc:
            print(f"Cyro: {exc}")
            print("Configure a model adapter before using the ask command.")
            return 2
        return 0
    if args.command == "knowledge" and args.knowledge_command == "add":
        record_id = kb.add(args.title, args.content, args.source)
        print(f"Knowledge added: {record_id}")
        return 0
    build_parser().print_help()
    return 0
