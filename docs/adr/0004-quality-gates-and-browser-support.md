# ADR-0004: Make visual, browser, accessibility, and performance evidence release-blocking

- **Status:** Accepted
- **Date:** 2026-09-01

## Context

A high-end visual portfolio can compile successfully while still appearing generic, stuttering, failing on WebKit, hiding content without WebGL, or breaking reduced-motion and keyboard access. Textual code review is insufficient for the product goal.

## Decision

Every visual change requires applicable evidence from:

- real-browser inspection;
- fixed-viewport screenshots;
- motion recordings where timing matters;
- Chromium, Firefox, and WebKit;
- desktop, narrow/tablet, mobile/coarse-pointer;
- reduced-motion and static/no-WebGL states;
- console/hydration/network review;
- accessibility automation plus keyboard review;
- payload and Core Web Vitals proxies;
- frame-time and scene metrics.

The budgets in `docs/quality/performance-budget.md` are blocking. The independent `quality_reviewer` returns an explicit verdict.

## Consequences

Positive:

- visual quality becomes testable work rather than taste asserted after implementation;
- regressions are caught before launch;
- fallback and mobile states are first-class;
- performance claims require evidence.

Negative:

- visual work takes longer;
- animation baselines need careful deterministic fixtures;
- CI/browser artifacts increase operational complexity;
- some judgment cannot be fully automated.

## Alternatives considered

### Unit tests and Lighthouse only

Rejected. They do not establish composition, timing, shader quality, alpha edges, or browser-specific visual parity.

### Pixel-perfect screenshots only

Rejected as the sole method. Animated noise/particles require deterministic seeds, tolerance, recordings, and human review.

### Desktop Chromium only

Rejected. The public site must degrade intentionally across engines and input modes.

## Verification

Phase 1 establishes the first complete acceptance report and proves the test matrix can run on a clean checkout and CI preview.
