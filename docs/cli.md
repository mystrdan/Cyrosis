# Cyro CLI

Cyro currently exposes a small command-line surface.

## Ask

cyro ask "What is Ghana's capital?"

Until a real model adapter is configured, this reports that no model is configured rather than pretending to answer.

## Knowledge

Add local knowledge:

cyro knowledge add "Ghana" "Accra is the capital of Ghana." --source "example"

The CLI is intentionally small. A web UI can be added later without making the core dependent on a web framework.
