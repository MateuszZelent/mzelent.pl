---
name: architecture-decision-record
description: Use before adding or replacing frameworks, production dependencies, rendering/animation owners, content storage, deployment, asset formats, browser support, or cross-cutting architecture. Do not use for local implementation details already covered by accepted ADRs.
---

# Architecture decision record

## Trigger

Create or supersede an ADR when a change affects any of:

- framework/runtime/package manager;
- rendering backend or canvas ownership;
- animation or scroll ownership;
- state/content/storage architecture;
- asset formats and production pipeline;
- deployment/hosting;
- browser support and fallback policy;
- testing or release gates;
- a new dependency with cross-cutting ownership.

## Procedure

1. Read existing ADRs and canonical architecture documents.
2. State the decision problem without assuming a preferred tool.
3. List hard requirements and measurable constraints.
4. Evaluate at least:
   - current baseline;
   - proposed choice;
   - one credible alternative;
   - “do nothing” where meaningful.
5. Compare stability, visual capability, runtime cost, bundle cost, browser coverage, accessibility, maintenance, licensing, debugging, and fallback behavior.
6. Record:
   - status;
   - date;
   - context;
   - decision;
   - consequences;
   - rejected alternatives;
   - verification plan;
   - rollback/supersession path.
7. Update canonical documents in the same change.
8. Do not implement the architectural change before acceptance unless the work is explicitly an isolated experiment.

## Output contract

Use the next numeric file in `docs/adr/`. Keep the title decision-oriented. Avoid marketing language and unsupported performance claims.
