# Cyro Architecture

Cyro starts intentionally small.

```
User
  |
  v
Cyro
  |
  +-- Model
  |
  +-- Research
  |     +-- Web
  |     +-- Sources
  |
  +-- Knowledge
  |     +-- Documents
  |     +-- Notes
  |     +-- Projects
  |
  +-- Tools
        +-- Files
        +-- Search
```

## Design goals

1. Keep the runtime lightweight.
2. Keep the model provider replaceable.
3. Separate research from stored knowledge.
4. Make sources first-class data.
5. Avoid unnecessary infrastructure.
6. Design for Ghanaian customers and African context from the start.
7. Keep research and knowledge global: Ghana is the customer home, not a geographic restriction.

## Initial storage

Start with local SQLite and filesystem storage. Introduce external databases only when actual requirements justify them.

## Initial model interface

Cyro should communicate with a small model adapter rather than binding the application directly to one provider.

Conceptually:

```text
Cyro -> ModelAdapter -> selected model
```

This lets us change models without redesigning Cyro.

## Research flow

```text
Question
  -> search
  -> collect sources
  -> extract relevant information
  -> compare / reason
  -> answer with sources
  -> optionally save knowledge
```

## Knowledge flow

```text
Document / Note / Research
  -> normalize
  -> store
  -> index
  -> retrieve
  -> use in future conversations
```

## What we are deliberately NOT building yet

- Microservices
- Kubernetes
- Large distributed infrastructure
- Custom foundation-model training
- Complex autonomous-agent systems
- Multiple databases
- Enterprise orchestration
