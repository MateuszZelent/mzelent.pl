# Foundation roadmap

- **Phase 0 status:** Accepted
- **Phase 1 status:** Accepted
- **Phase 2 status:** Active
- **Current project phase:** Phase 2 — Visual Design System
- **Decision date:** 2026-09-02

## Gate model

A later phase cannot compensate for a failed earlier foundation. Each phase ends with an explicit accept/reject gate.

## Phase 0 — architecture and agent foundation

**Status: Accepted**

### Deliverables

- canonical `AGENTS.md`;
- repo-scoped skills;
- custom subagents;
- fixed technology stack;
- rendering, motion, asset, version, and quality policies;
- accepted ADRs;
- reference interpretation;
- measurable Phase 1 scope.

### Exit gate

- no contradictory technology ownership;
- no unresolved production renderer choice;
- no duplicate animation/scroll system;
- quality and performance targets are measurable;
- repo instructions fit Codex discovery limits;
- owner accepts the foundation.

### Explicitly out of scope

- portfolio copy;
- complete navigation/information architecture;
- production homepage;
- final typography;
- final brand tokens;
- publication/project data;
- CMS integration.

## Phase 1 — visual technology spike

**Status: Accepted**

Route: `/lab/visual-system`

### Scope

1. semantic black-page shell;
2. one persistent dynamically imported R3F canvas;
3. GPU ping-pong particle atmosphere;
4. damped pointer response;
5. one transparent 2.5D parallax asset created for the project;
6. one local CSS illumination surface;
7. one short GSAP/ScrollTrigger scene transition;
8. Lenis integration;
9. high/medium/low/static tiers;
10. reduced-motion, coarse-pointer, no-WebGL, loading, and failure states;
11. developer diagnostics;
12. Playwright visual and browser tests;
13. Lighthouse and frame metrics.

No real portfolio content. Use neutral labels and original test assets.

### Acceptance gate

Visual:

- black remains deep and clean;
- field is subtle at rest and organic under pointer;
- no obvious sprite squares/banding/repeating noise;
- local glow is motivated and restrained;
- parallax produces depth without text instability;
- mobile composition is deliberate;
- static fallback feels designed.

Technical:

- one WebGL context;
- stable coordinated clock;
- no console, hydration, shader, or context-loss errors;
- no per-frame React state or allocations;
- cleanup passes remount/route tests;
- budgets in `performance-budget.md` pass;
- browser matrix documented.

Decision:

- **accept:** use this runtime as the production visual foundation;
- **revise:** repeat the spike with bounded changes;
- **reject:** reconsider rendering technique through a new ADR before building pages.

## Phase 2 — visual design system

Deliver:

- final font selection and licensing;
- calibrated type scale;
- color/light tokens;
- spacing/grid system;
- depth/parallax scale;
- surface states;
- motion durations/easings;
- responsive composition rules;
- design-lab fixtures and visual baselines.

Gate: representative hero, editorial section, list, and long-form reading states pass the quality matrix.

## Phase 3 — information and content model

Deliver:

- route map;
- schemas for publications, grants, talks, software, notes, and profile metadata;
- MDX conventions;
- SEO/structured-data plan;
- language strategy;
- content provenance and update workflow.

No full visual page implementation until schemas are accepted.

## Phase 4 — homepage vertical slices

Build one reviewed slice at a time:

1. shell/navigation;
2. hero;
3. research transition;
4. flagship software;
5. selected work/publications;
6. notes/lab preview;
7. contact/footer.

Each slice uses reference audit → implementation → quality gate.

## Phase 5 — detail routes

- research;
- software;
- publications;
- funded projects;
- talks;
- notes/blog;
- about/CV/contact.

Maintain semantic accessibility and avoid forcing the full visual engine onto reading-heavy routes.

## Phase 6 — production hardening

- final asset compression;
- browser/device matrix;
- analytics/privacy decision;
- metadata, feed, sitemap, robots;
- error monitoring;
- security headers;
- caching;
- Vercel production configuration;
- domain/DNS;
- launch audit.

## Non-negotiable sequencing

Do not build the content-rich homepage before Phase 1 proves the effect quality. Do not install a broad component library to accelerate Phase 2. Do not import real content merely to hide an unresolved visual-system problem.
