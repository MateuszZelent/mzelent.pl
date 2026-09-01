# Phase 1 scaffold report

- **Branch:** `feat/phase-1-scaffold`
- **Scope:** PR 1 — application, toolchain, and testable shell
- **Route:** `/lab/visual-system`
- **Local port:** `3154`
- **Status:** hardened, audited, and verified locally and in GitHub Actions CI

## What changed

- Formalized the transition to **Phase 0: Accepted** and **Phase 1: Active**.
- Added a pinned Next.js App Router application with a strict TypeScript setup.
- Added a semantic, server-rendered visual-system shell with a designed black static poster,
  reserved future canvas region, stable scroll intervals, and a development-only diagnostics panel.
- Hardened `next-env.d.ts`: untracked from Git, ignored via `.gitignore`, and integrated via `pnpm typegen`.
- Pinned `@types/node` to exact `24.13.3` to match the Node.js 24 LTS runtime.
- Added exact pinned `prettier@3.9.6` with `.prettierrc.json`, `.prettierignore`, and `format` / `format:check` scripts.
- Pinned GitHub Actions to immutable commit SHAs and configured clean-tree gate checks.
- Enhanced accessibility and Windows High Contrast support (`@media (forced-colors: active)`),
  keyboard-accessible skip link focus (`tabIndex={-1}` on target), and semantic hero capability lists (`<ul>`/`<li>`).
- Added Playwright artifact upload in CI for `playwright-report/**` and `test-results/**`.
- Added Vitest/React Testing Library unit coverage, Playwright smoke/visual/no-JavaScript/forced-colors/keyboard coverage,
  and an axe accessibility check.

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
| `@types/node` | `24.13.3` |
| Prettier | `3.9.6` |
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
production build passes. This override is documented in `docs/architecture/technology-stack.md`.

## Validation evidence

| Check | Result | Evidence |
| --- | --- | --- |
| `pnpm format:check` | PASS | all matched files adhere to Prettier rules |
| `pnpm lint` (`eslint .`) | PASS | flat config, 0 errors, 0 warnings |
| `pnpm typecheck` (`pnpm typegen && tsc --noEmit`) | PASS | strict TypeScript check with route type generation |
| `pnpm test` (`vitest run`) | PASS | 1 file, 2 tests |
| `pnpm build` (`next build`) | PASS | static `/_not-found` and `/lab/visual-system` routes generated |
| `PLAYWRIGHT_USE_PRODUCTION=1 pnpm test:e2e` | PASS | 7 Chromium tests passing (smoke, no-JS, keyboard, forced-colors, visual, a11y) |
| Playwright keyboard test | PASS | Tab activates skip link, Enter transfers focus to `#laboratory-shell` with valid URL hash |
| Playwright forced-colors test | PASS | `forcedColors: "active"`, heading, navigation, surface sample, and focus outline visible |
| Playwright no-JavaScript test | PASS | semantic heading and static poster remain visible without JS |
| Playwright mobile/reduced-motion test | PASS | `390 × 844`, touch context, reduced motion |
| Playwright visual fixture | PASS | screenshots generated in ignored `test-results/` output |
| Playwright a11y check (`axe`) | PASS | 0 automated violations via `@axe-core/playwright` |
| Clean tracked tree gate | PASS | `git diff --check`, `git diff --exit-code`, untracked files clean |
| GitHub Actions workflow `CI` | PASS | verified automated quality pipeline |

## Artifacts and visual evidence

The CI workflow publishes Playwright test artifacts with name `playwright-evidence-${{ github.run_number }}-${{ github.run_attempt }}` (retention: 7 days):

- `test-results/visual-system-captures-the-shell-visual-fixture-visual-chromium/visual-system-shell.png`
- `test-results/visual-system-keeps-the-fa-b54c2-reduced-motion-input-visual-chromium/visual-system-mobile-shell.png`
- `test-results/visual-system-remains-read-f5bd3-n-forced-colors-mode-visual-chromium/visual-system-forced-colors.png`

> [!NOTE]
> Screenshots are technically generated during test execution as evidence for manual review. They are not approved as permanent golden visual baselines until explicitly signed off by the repository owner.

## Audit findings and resolutions

1. **`next-env.d.ts` tracking:** Removed from Git tracking, added to `.gitignore`, `typegen` script added, and `AGENTS.md` updated.
2. **`@types/node` mismatch:** Replaced 26.x with exact pinned `@types/node@24.13.3`.
3. **Automated code formatting:** Added exact pinned `prettier@3.9.6`, `.prettierrc.json`, `.prettierignore`, `format` / `format:check` scripts, and integrated into `check` and CI.
4. **GitHub Actions security:** Pinned actions to immutable commit SHAs (`checkout`, `setup-node`, `upload-artifact`) with minimal `contents: read` permissions and `NEXT_TELEMETRY_DISABLED: "1"`.
5. **Playwright evidence publishing:** Configured `actions/upload-artifact` with `if: always()` and run-specific artifact naming.
6. **High contrast / Forced colors:** Removed `forced-color-adjust: none` on `.surfaceSample` and added `@media (forced-colors: active)` rules. Added E2E test verifying visibility and contrast.
7. **Skip link & hero semantics:** Added `tabIndex={-1}` to `#laboratory-shell` for keyboard focus, added keyboard navigation test, and converted hero capability metadata to a semantic `<ul>`/`<li>`.
8. **TypeScript compatibility override:** Documented `useTypeScriptCli = false` in `docs/architecture/technology-stack.md`.
9. **Clean tracked tree gate:** Added strict `git diff --check`, `git diff --exit-code`, and status checks to CI.

## Next PR

`feat/visual-runtime` should add the single dynamically imported WebGL2 canvas, lifecycle and
quality contracts, fallback transitions, and developer diagnostics described by the accepted
rendering strategy. It must retain the semantic shell and pass an independent runtime review
before particles or final assets are introduced.
