# Version policy

- **Status:** Accepted
- **Decision date:** 2026-09-01

## Goals

- reproducible local and CI builds;
- deliberate upgrades at critical rendering boundaries;
- rapid security patching without incidental architectural drift;
- no floating production environment.

## Pinning

During Phase 1:

- pin Node with `.node-version` and `package.json#engines`;
- pin pnpm with `packageManager`;
- commit `pnpm-lock.yaml`;
- save exact dependency versions by default;
- do not use `latest`, `next`, `canary`, `alpha`, `beta`, or broad wildcard ranges in production dependencies;
- pin GitHub Actions to reviewed major versions or immutable SHAs according to action risk.

The lockfile is authoritative for installations. CI uses `pnpm install --frozen-lockfile`.

## Update classes

### Patch updates

Allowed in focused maintenance changes after:

- changelog/security review;
- clean install;
- type, lint, unit, build, and browser checks;
- visual smoke checks for rendering, image, CSS, animation, or browser-tooling packages.

### Minor updates

Require:

- compatibility review;
- bundle diff;
- browser and visual regression tests;
- performance comparison for graphics, animation, framework, image, or build tooling.

### Major updates

Require a new or superseding ADR.

This includes Node, pnpm, Next.js, React, TypeScript, Three.js ecosystem major-breaking lines, GSAP, Lenis, content architecture, and testing/deployment systems.

## Critical boundary freeze

Do not combine a feature with upgrades to:

- Next.js;
- React;
- TypeScript;
- Three.js;
- R3F;
- GSAP/ScrollTrigger;
- Lenis;
- glTF/KTX tooling.

Upgrade those in separate changes with before/after evidence.

## Pre-release policy

Pre-release packages are prohibited on production routes.

They may be used only:

- in an isolated `/lab` benchmark;
- behind a feature flag disabled by default;
- without altering production data/assets;
- with explicit removal criteria;
- under an accepted experiment ADR.

## Security

Security patches override the normal cadence. Apply the smallest safe supported update, run the full applicable gate, and document any temporary visual or browser trade-off.

## Review cadence

Review the version snapshot:

- after the Phase 1 spike;
- before the first public beta;
- quarterly after launch;
- immediately after a relevant security advisory or end-of-support notice.

Do not upgrade solely because a newer number exists.
