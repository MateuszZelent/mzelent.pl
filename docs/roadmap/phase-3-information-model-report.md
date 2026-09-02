# Phase 3 — Information and Content Model Report

- **Phase:** Phase 3 — Information and Content Model
- **Status:** Accepted
- **Decision date:** 2026-09-02
- **Validation tool:** Zod 4.5.4 build-time parsing + Vitest unit test suite

---

## 1. Route Map

| Route | Content Responsibility | Visual Complexity | Rendering Boundary |
|---|---|---|---|
| `/` | Flagship editorial homepage (Hero, Research Domains, Flagship Software, Selected Publications, Contact) | High (persistent canvas, snow simulation, 2.5D parallax) | Hybrid (Server rendered semantic DOM + Client canvas slot) |
| `/research` | Detailed research axes, theoretical frameworks, Hamiltonian equations, spin-wave dispersion | Moderate (interactive vector diagrams, reading layout) | Server Component default |
| `/publications` | Complete peer-reviewed publications, preprints, BibTeX exporters, DOI links | Low/Reading (instant load, fast text filtering) | Server Component default |
| `/software` | Open-source micromagnetic software, GPU solvers, documentation links, benchmark cards | Moderate (code snippets, release tags) | Server Component default |
| `/lab/visual-system` | Isolated WebGL graphics engine laboratory, GPU telemetry, quality tier calibration | Maximum (full-screen GPU FBO particles, real-time FPS probe) | Client Component boundary |

---

## 2. Typed Content Schemas (Zod)

All content data is strictly typed and parsed at build time via Zod schemas located in `src/content/schemas/`:

- `profile.schema.ts` — Validates institutional affiliations (AMU Poznań), ORCID format (`0000-0002-3908-0118`), research interests, and contact details.
- `publication.schema.ts` — Validates peer-reviewed articles (PRB, APL, NatComm, JAP), DOIs, BibTeX records, and open-access metadata.
- `software.schema.ts` — Validates scientific packages (MagLens, SkyrmionTracker), repositories, license identifiers, and technological stacks.
- `grant.schema.ts` — Validates funded research grants (NCN SONATA, OPUS), grant numbers, roles, and project periods.
- `talk.schema.ts` — Validates invited seminar and conference presentations (INTERMAG, Solsky).
- `research-domain.schema.ts` — Validates the three primary scientific axes:
  1. *Topological Solitons & Chiral Skyrmions*
  2. *Spin-Wave Optics & Graded Magnonics*
  3. *GPU Vector Fields & High-Performance Solvers*

---

## 3. SEO & Structured Data (JSON-LD)

Implemented in `src/content/seo/json-ld.ts`:
- **`generatePersonJsonLd(profile)`**: Emits Schema.org `Person` with academic affiliation (`EducationalOrganization`), ORCID identifier, and `knowsAbout` topics for Google Knowledge Graph and academic indexing.
- **`generateScholarlyArticleJsonLd(pub)`**: Emits Schema.org `ScholarlyArticle` linking DOI, authors, journal, and abstract for Google Scholar crawlers.
- **`generateSoftwareApplicationJsonLd(soft)`**: Emits Schema.org `SoftwareApplication` with repository URL and software category.

---

## 4. Verification Evidence

- `tests/unit/content-schemas.test.ts` — 6/6 unit tests passing.
- `next build` (Turbopack) validates all content imports at build time.
