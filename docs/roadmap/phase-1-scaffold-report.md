# Phase 1 scaffold report

- **Branch:** `feat/phase-1-scaffold`
- **Scope:** PR 1 — application, toolchain, and testable shell
- **Route:** `/lab/visual-system`
- **Local port:** `3154`
- **Status:** implementation complete; CI install gate pending supply-chain policy window

## What changed

- Formalized the transition to **Phase 0: Accepted** and **Phase 1: Active**.
- Added a pinned Next.js App Router application with a strict TypeScript setup.
- Added a semantic, server-rendered visual-system shell with a designed black static poster,
  reserved future canvas region, stable scroll intervals, and a development-only diagnostics panel.
- Added Vitest/React Testing Library unit coverage, Playwright smoke/visual/no-JavaScript coverage,
  and an axe accessibility check.
- Added a GitHub Actions quality job for frozen installation, static checks, production build,
  Chromium installation, and production Playwright smoke tests.

## Deliberately deferred

This branch does not add the WebGL runtime, particles, GSAP, Lenis, 2.5D production assets,
portfolio copy, a homepage, a CMS, or a database. Those belong to later bounded PRs after the
shell and toolchain are reviewed.

## Pinned versions

| Area | Version |
| --- | --- |
| Node.js | `24.20.0` |
| pnpm | `11.25.0` |
| Next.js | `16.3.4` |
| React / React DOM | `19.2.8` |
| TypeScript | `6.0.3` |
| Three.js / R3F / GSAP / Lenis | intentionally not installed in PR 1 |
| Playwright | `1.62.1` |
| Vitest | `4.1.11` |
| ESLint | `9.39.5` |

ESLint remains on the compatible 9.x line because the pinned Next.js ESLint plugin ecosystem
currently fails at runtime with ESLint 10 (`scopeManager.addGlobals is not a function`). This is
an implementation compatibility constraint to revisit during a deliberate tooling update, not a
change to the accepted application stack.

Next's default TypeScript CLI path was also incompatible with the pinned TypeScript 6.0.3 output
in this environment (`Could not parse output from TypeScript's --showConfig`). The scaffold uses
Next's TypeScript API path explicitly in `next.config.ts`; strict typechecking still runs and the
production build passes.

## Validation evidence

| Check | Result | Evidence |
| --- | --- | --- |
| `git diff --check` | PASS | no whitespace errors |
| `./node_modules/.bin/eslint .` | PASS | flat config, no lint findings |
| `./node_modules/.bin/tsc --noEmit` | PASS | strict TypeScript check |
| `./node_modules/.bin/vitest run` | PASS | 1 file, 2 tests |
| `./node_modules/.bin/next build` | PASS | static `/lab/visual-system` route generated |
| `PLAYWRIGHT_USE_PRODUCTION=1 ./node_modules/.bin/playwright test` | PASS | 5 Chromium tests |
| Playwright no-JavaScript test | PASS | semantic heading and static poster remain visible |
| Playwright mobile/reduced-motion test | PASS | `390 × 844`, touch context, reduced motion |
| Playwright visual fixture | PASS | screenshot generated in ignored `test-results/` output |
| axe Playwright check | PASS | no automated violations |
| GitHub Actions run `33544793834` | BLOCKED | clean runner reached Node/pnpm setup, then rejected fresh Next pins via `minimumReleaseAge` |

The reviewed local screenshots are generated at:

```text
test-results/visual-system-captures-the-shell-visual-fixture-visual-chromium/visual-system-shell.png
test-results/visual-system-keeps-the-fa-b54c2-reduced-motion-input-visual-chromium/visual-system-mobile-shell.png
```

They remain ignored until a visual baseline is explicitly approved.

## Environment limitation

The local runner uses Node `24.19.0`, so pnpm emits an engine warning against the required
`24.20.0` pin. The lockfile was generated with pnpm `11.25.0`. Both the local runner and clean
GitHub runner currently reject the accepted Next.js `16.3.4` packages because they were published
too recently for the active external `minimumReleaseAge` policy. The first CI run also exposed and
the next commit fixed a workflow ordering issue where pnpm was used before Corepack activation;
the current run reaches dependency installation correctly. The repository does not weaken that
supply-chain control. Rerun the CI after the policy window expires, or approve a narrowly scoped
exception for the exact accepted Next.js pin.

## Next PR

`feat/visual-runtime` should add the single dynamically imported WebGL2 canvas, lifecycle and
quality contracts, fallback transitions, and developer diagnostics described by the accepted
rendering strategy. It must retain the semantic shell and pass an independent runtime review
before particles or final assets are introduced.
