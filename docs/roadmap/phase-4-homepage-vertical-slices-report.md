# Phase 4 — Homepage Vertical Slices Report

- **Phase:** Phase 4 — Homepage Vertical Slices
- **Status:** Accepted
- **Decision date:** 2026-09-02
- **Verification tool:** Vitest (48/48 unit tests), Playwright (23/23 E2E tests, 8/8 axe-core WCAG 2.1 AA checks), Turbopack static build

---

## 1. Overview & Architecture

Phase 4 assembled all core vertical slices of the scientific portfolio homepage according to the architectural rules defined in `AGENTS.md` and `docs/architecture/rendering-strategy.md`:

1. **Persistent Visual Engine**: Coordinated WebGL2 / GLSL GPU particle snow simulation running in a fixed background layer behind the foreground mountain crags and in front of the midground peaks.
2. **2.5D Layered Parallax Hero (`MountainHero`)**: Multi-plane depth composition (sky, midground peaks, mist, snow canvas, foreground ridge) with pointer tracking and scroll-scrubbed kinematics.
3. **Research Transition Grid (`ResearchGrid`)**: 3 core computational physics domains with pointer-reactive acrylic glow, mathematical notation badges, and fluid layout.
4. **Grants & Active Scientific Projects (`GrantsSection`)**: Showcasing Dr. Mateusz Zelent's authentic Marie Skłodowska-Curie Actions (MSCA PF) **"CNMA"** project (Horizon Europe, €217k) and National Science Centre (NCN) **SONATA-18** and **OPUS-19** grants.
5. **Flagship Computational Software (`SoftwareShowcase`)**: Presenting open-source packages *MagLens* and *SkyrmionTracker* with GitHub links, tech stacks, and feature bullets.
6. **Selected Peer-Reviewed Publications (`SelectedPublications`)**: Featuring papers in *Physical Review B*, *Applied Physics Letters*, and *Nature Communications* with Open Access badges, DOI links, and link to the complete bibliography.
7. **Institutional Affiliations Strip (`AffiliationsStrip`)**: High-contrast, glowing SVG marks for **RPTU Kaiserslautern-Landau**, **Adam Mickiewicz University in Poznań (UAM)**, **European Union — MSCA**, and **Narodowe Centrum Nauki (NCN)** with formal grant agreement disclosures.
8. **Semantic Footer & Colophon (`Footer`)**: Navigation, academic affiliations, ORCID, GitHub, architecture tags, and smooth back-to-top action.
9. **Full Bilingual Internationalization (PL | EN)**: Native Polish and English translations for all sections, reactive `LanguageProvider`, and persistent language switch in the header.

---

## 2. Quality & Performance Verification

- **Lint & Code Style**: Prettier and ESLint pass cleanly with zero errors and zero warnings.
- **Type Safety**: TypeScript 6.0 in strict mode with zero type casting escapes.
- **Accessibility (axe-core)**: Zero automated violations in Chromium and Firefox across `/`, `/publications`, and `/lab/visual-system`. Fully accessible landmarks, skip links, and WCAG 2.1 AA color contrast.
- **Reduced Motion**: Complete compliance with `prefers-reduced-motion: reduce`, disabling smooth scrolling and scrubbed transforms while preserving content accessibility.
- **Hydration Safety**: Verified zero React 19 hydration mismatches between SSR and client mounting.
- **Static Site Generation**: Turbopack prerenders all 7 static pages in under 870 ms.

---

## 3. Decision

- **Accept**: Phase 4 is officially accepted. The homepage vertical slices meet all aesthetic, scientific, and technical quality gates. Proceed to Phase 5 (Detail Routes & Admin Ingestion Interface).
