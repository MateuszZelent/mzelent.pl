# mzelent.pl

A cinematic scientific portfolio for Mateusz Zelent, built as a dark digital gallery for computational magnetism, scientific software, experiments, and research output.

## Status

**Phase 0 — architecture and quality foundation**

No production page is being implemented yet. The repository first establishes:

- a fixed technology stack;
- rendering and motion ownership;
- repository-wide Codex guidance;
- specialized repo skills and custom subagents;
- visual, performance, accessibility, and asset quality gates;
- ADRs and a staged implementation roadmap.

The first code milestone will be an isolated visual technology spike. It must prove that the selected stack can produce the required quality before the complete site is designed.

## Visual references

- Parallel Universe: composition, black space, object isolation, transparent layers, and parallax rhythm.
- Torii Studio: subtle pointer-reactive atmosphere, local light, neon restraint, and surface micro-interactions.

These are references, not templates. Their assets, code, branding, text, and distinctive compositions must not be copied.

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read the [documentation index](docs/README.md).
3. Review the [fixed technology stack](docs/architecture/technology-stack.md).
4. Review the [visual direction](docs/references/visual-direction.md).
5. Review the [Phase 1 spike gate](docs/roadmap/foundation.md).

## Repository structure

```text
.agents/skills/          Repo-scoped Codex skills
.codex/agents/           Specialized custom Codex agents
docs/adr/                Accepted architectural decision records
docs/architecture/       Canonical technical architecture
docs/quality/            Visual and performance release contracts
docs/references/         Interpreted visual direction
docs/roadmap/            Staged implementation plan
docs/templates/          Repeatable audit and evidence templates
docs/workflows/          Agent and asset-production workflows
```

Application source, dependency manifests, and deployment configuration are intentionally deferred to Phase 1. They will be generated only after this foundation is accepted.

## Working language

Technical documentation, code, identifiers, tests, and commit messages are written in English. Portfolio content language is a later content-design decision.
