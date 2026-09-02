# AGENTS.md

## Repository mission

`mzelent.pl` is a high-craft scientific portfolio, not a generic personal-site template.

The approved visual references are:

- **Parallel Universe** — black editorial space, isolated three-dimensional or alpha-transparent objects, strong scale contrast, layered 2.5D composition, and measured parallax.
- **Torii Studio** — a restrained pointer-reactive particle/smoke field, localized colored light, subtle neon accents, refined surface illumination, and precise micro-interactions.

Use those references as art-direction evidence only. Never copy source code, assets, text, branding, or distinctive compositions one-to-one. The site's visual language must be original and derived from magnetic textures, skyrmions, spin waves, vector fields, meshes, simulations, instruments, and laboratory imagery.

The governing principle is:

> Quality comes from art direction, asset craft, motion timing, rendering discipline, and browser validation—not from adding more libraries.

## Current project phase

- **Phase 0:** Accepted
- **Phase 1:** Accepted
- **Phase 2:** Accepted
- **Phase 3:** Accepted
- **Phase 4:** Accepted
- **Phase 5:** Accepted
- **Phase 6:** Active
- **Current project phase:** Phase 6 — Production Hardening & Launch

Until the Phase 1 spike is accepted:

- do not invent portfolio content;
- do not build the complete homepage;
- do not add a CMS or database;
- do not introduce an unvalidated animation or rendering stack;
- record architectural decisions before implementation;
- keep the repository documentation-first.

The first implementation milestone is a visual technology spike, not a homepage. It must contain only:

1. a persistent black scene;
2. a subtle pointer-reactive GPU particle field;
3. one transparent parallax asset;
4. one locally illuminated surface;
5. reduced-motion, coarse-pointer, low-quality, and no-WebGL states;
6. measured browser, frame-time, payload, and screenshot evidence.

Do not proceed to full page production until that spike meets the quality gates.

## Instruction precedence

When instructions conflict, use this order:

1. the current repository-owner request;
2. this `AGENTS.md`;
3. accepted ADRs and canonical documents in `docs/architecture/`;
4. quality and workflow contracts in `docs/quality/` and `docs/workflows/`;
5. tests and established code conventions;
6. local implementation preferences.

A change to an accepted architectural decision requires an ADR update in the same change.

Codex reads `AGENTS.md` by exact name. Preserve this filename and preserve any version-matched block later maintained by Next.js tooling.

## Canonical documents

Read the smallest relevant set before modifying the repository:

- `docs/architecture/technology-stack.md`
- `docs/architecture/rendering-strategy.md`
- `docs/architecture/version-policy.md`
- `docs/quality/visual-quality-bar.md`
- `docs/quality/performance-budget.md`
- `docs/workflows/asset-pipeline.md`
- `docs/workflows/agent-workflow.md`
- `docs/references/visual-direction.md`
- `docs/roadmap/foundation.md`
- accepted records in `docs/adr/`

Do not duplicate a canonical rule in a new document. Link to its owner instead.

## Fixed technology baseline

The authoritative version table and rationale live in `docs/architecture/technology-stack.md`.

- Runtime: Node.js 24 LTS.
- Package manager: pnpm 11.25, pinned through `packageManager` and the lockfile during Phase 1.
- Framework: Next.js 16.3, App Router, React Server Components, and Turbopack.
- UI runtime: React 19.2.
- Type system: TypeScript 6.0 in strict mode.
- Three-dimensional orchestration: `@react-three/fiber` 9.7.
- Graphics engine: Three.js 0.185 with `WebGLRenderer`, WebGL2, and GLSL ES 3.00.
- WebGPU/TSL: isolated experiment only; not the production baseline.
- Scroll and timelines: Lenis + GSAP 3 + ScrollTrigger + `@gsap/react`.
- Styling: authored CSS, CSS Modules, cascade layers, and CSS custom properties.
- UI kits: none. Prefer semantic HTML; add an unstyled accessibility primitive only for a concrete requirement.
- State: local React state by default; Zustand only for cross-tree transient scene state.
- Content: local MDX and typed data validated at build time with Zod.
- Three-dimensional assets: glTF 2.0 binary (`.glb`), Meshopt geometry compression, and KTX2/Basis Universal textures.
- Three-dimensional authoring: Blender 4.5 LTS with deterministic optimization through glTF Transform.
- Testing: Vitest, React Testing Library, Playwright, axe integration, and Lighthouse CI.
- Delivery: GitHub Actions and Vercel preview/production deployments.

Do not introduce Tailwind, shadcn, Framer Motion, Spline runtime, Locomotive Scroll, a second smooth-scroll owner, a second timeline system, or a second WebGL canvas without an accepted ADR.

## Rendering architecture

Follow `docs/architecture/rendering-strategy.md`.

The site has four coordinated layers:

1. semantic, server-rendered DOM content;
2. one persistent fixed WebGL canvas owned near the root layout;
3. sparse transparent 2.5D assets in normal DOM stacking contexts;
4. CSS masks, borders, gradients, and localized light layers.

Hard rules:

- Never render essential text, navigation, links, or publication metadata inside WebGL.
- Never create one canvas per section.
- Never create thousands of React elements for particles.
- Simulate particles on the GPU with a ping-pong/FBO method or a measured equivalent.
- Keep per-frame values in refs, uniforms, or a transient store; never call React `setState` every frame.
- Allocate no arrays, vectors, matrices, geometries, materials, or render targets inside hot frame loops.
- Explicitly dispose GPU resources and remove GSAP contexts, ticker callbacks, observers, and listeners.
- Cap device pixel ratio and select a quality tier using capability plus measured frame time.
- Show a static poster before the enhanced scene is ready.
- Pause or heavily throttle animation when the document is hidden or a scene is irrelevant.
- Perform no GPU readback in the animation loop.
- Keep one coordinated animation clock. Any deviation requires measured evidence and an ADR.

## Visual quality rules

Every visual change must satisfy `docs/quality/visual-quality-bar.md`.

Non-negotiable principles:

- Black is a designed spatial foundation, not an empty default background.
- Use restrained cyan, violet, magenta, or warm highlights; never an uncontrolled rainbow gradient.
- Glow must be localized and motivated by an object, pointer, or light source.
- Depth must come from composition, scale, occlusion, focus, atmosphere, and differential motion—not arbitrary `translateZ` values.
- Prefer one dominant visual gesture per viewport.
- Avoid generic SaaS card grids, pill overload, stock gradients, excessive glassmorphism, and decorative atom icons.
- Scientific motifs must be original or generated from project-owned simulations and data.
- Typography and negative space remain primary. Effects support hierarchy rather than competing with it.
- Mobile is separately art-directed, not mechanically scaled from desktop.
- A technically functional implementation is not accepted because it is merely “similar in spirit.” Compare it in a real browser at fixed viewports.

## Motion and interaction rules

- Lenis is the sole smooth-scroll layer.
- GSAP/ScrollTrigger is the sole high-level timeline and scroll-orchestration layer.
- CSS transitions are allowed for simple local state changes.
- Do not add another motion library for convenience.
- Pointer input must be normalized and damped before reaching shaders.
- Scroll effects must preserve native keyboard navigation, anchor behavior, and browser history.
- `prefers-reduced-motion: reduce` disables smooth scrolling, scrubbed sequences, continuous camera motion, and nonessential particle motion.
- Coarse-pointer behavior must not depend on hover.
- Motion must be reversible, deterministic, and testable where practical.
- Avoid long unskippable intros and scroll-jacking.

## Performance and accessibility

Treat `docs/quality/performance-budget.md` as a release contract.

At minimum:

- maintain a static/no-WebGL fallback;
- preserve semantic heading order, landmarks, links, visible focus, and keyboard navigation;
- never use color or motion as the only carrier of meaning;
- avoid layout shifts while WebGL and media initialize;
- test current Chromium, Firefox, and WebKit engines;
- test reduced motion, coarse pointer, constrained viewport, and low-quality rendering;
- report frame-time, draw-call, triangle/point, texture-memory, and transfer-size evidence for scene changes;
- preserve readable content when JavaScript or the enhanced visual layer fails.

Do not solve a missed budget by silently degrading every user’s experience. Implement explicit quality tiers and document the trade-off.

## Asset rules

Follow `docs/workflows/asset-pipeline.md`.

- Commit only owned, generated, or correctly licensed assets.
- Every production asset needs provenance, license, dimensions, byte size, and optimization metadata.
- Keep source and output color-space intent explicit.
- Use AVIF with alpha plus WebP fallback for transparent 2.5D raster assets.
- Use KTX2 for GPU textures.
- Use UASTC for normal/data maps and ETC1S where perceptual color compression is acceptable.
- Use Meshopt as the default geometry compression.
- Never commit an unoptimized Blender or renderer export directly to a production directory.
- Large authoring files require Git LFS or an explicitly documented external source.
- Do not commit reference-site screenshots unless redistribution is permitted. Store measurements and observations instead.

## Repo-scoped skills

Load only the smallest useful set from `.agents/skills/`:

- `visual-reference-audit` — decompose websites, screenshots, or recordings into measurable visual and motion requirements before implementation.
- `cinematic-ui-implementation` — implement or polish one reference-driven section using the established DOM/CSS/WebGL architecture.
- `webgl-scene-engineering` — create or optimize shaders, particles, scene lifecycle, and adaptive quality.
- `asset-production-pipeline` — prepare Blender, GLB, KTX2, Meshopt, AVIF, and WebP assets with manifests and budgets.
- `visual-quality-gate` — perform browser-based visual, responsive, interaction, accessibility, and performance acceptance.
- `architecture-decision-record` — add or change frameworks, dependencies, rendering strategies, storage, deployment, or other architectural commitments.

Do not load broad overlapping skills when one specialist skill covers the task.

## Custom subagents

Project-scoped custom agents are defined in `.codex/agents/`.

- `visual_director`: read-only reference analysis and art-direction review.
- `frontend_engineer`: bounded DOM, CSS, accessibility, and Next.js implementation.
- `graphics_engineer`: bounded WebGL, shader, particle, asset-runtime, and performance implementation.
- `quality_reviewer`: read-only release-gate verification using browser evidence.

Parallelize independent read-heavy work. Avoid parallel write-heavy work in the same files, scene, tokens, or animation timeline. One agent owns a visual slice at a time.

## Required workflow

For every nontrivial task:

1. Read this file and the linked canonical documents.
2. Inspect the repository and actual runtime state before proposing changes.
3. State measurable acceptance criteria.
4. Invoke the smallest relevant repo skill.
5. Use a reference audit before implementing a reference-driven visual.
6. Implement one coherent vertical slice.
7. Run applicable static, browser, visual, accessibility, and performance checks.
8. Compare output against the approved specification in a real browser.
9. Update documentation and ADRs in the same change when behavior or architecture changes.
10. Report evidence, remaining risks, assumptions, and intentionally deferred work.

Do not mark work complete when only compilation succeeds.

## Dependency policy

A new production dependency is acceptable only when all conditions hold:

- the platform or current stack cannot implement the requirement clearly;
- the package is maintained and compatible with the pinned runtime;
- bundle and runtime costs are measured;
- licensing is compatible;
- ownership, cleanup, server/client boundaries, and fallback behavior are understood;
- the canonical stack document and lockfile are updated;
- no existing dependency already owns the same responsibility.

Prefer platform APIs and focused packages over abstraction stacks.

Never upgrade framework, graphics, animation, package-manager, or TypeScript major versions incidentally inside a feature change.

## Code conventions

- Repository language for code, identifiers, comments, commits, and technical documentation: English.
- Use strict TypeScript. Do not introduce `any` to bypass design problems.
- Prefer small named modules with explicit ownership over all-purpose components.
- Separate simulation, rendering, orchestration, asset loading, and presentation.
- Keep shader source in dedicated modules/files with documented uniforms, coordinate spaces, color spaces, and precision assumptions.
- Use deterministic seeds for tests and visual baselines.
- Keep browser-only modules behind explicit client boundaries.
- Avoid premature general-purpose component libraries.
- Keep Server Components as the default; add `'use client'` only at the smallest interactive boundary.
- Do not import Three.js, R3F, GSAP, or Lenis into server-only modules.
- Do not hide lint/type errors with blanket disables.
- `next-env.d.ts` is generated by Next.js (`next dev`/`next build`/`next typegen`) and ignored by Git; agents must not manually edit or commit it.

## Blocking review findings

Treat these as blockers:

- visual output that is generic, visibly rough, or not compared against the approved specification;
- essential content hidden behind WebGL or JavaScript-only interaction;
- a second canvas, animation engine, or scroll owner without an ADR;
- per-frame React state updates or allocations;
- missing resource cleanup;
- missing reduced-motion, mobile/coarse-pointer, low-tier, or no-WebGL behavior;
- unbudgeted assets or dependencies;
- unstable APIs on the production path;
- unexplained visual-baseline updates;
- copied reference assets, source, or distinctive layouts;
- shader compilation errors, console errors, hydration warnings, or recurring WebGL context loss;
- claims of performance without captured metrics.

## Definition of done

A visual change is complete only when:

- acceptance criteria are met;
- implementation follows the fixed stack and rendering boundaries;
- available type, lint, unit, build, and browser checks pass;
- fixed-viewport screenshots are reviewed;
- keyboard, reduced-motion, mobile/coarse-pointer, low-tier, and no-WebGL states are verified;
- performance budgets are measured and respected;
- new assets have provenance and optimization metadata;
- documentation and ADRs are current;
- the final report contains evidence rather than subjective claims.

During Phase 1, commands that do not yet exist are not required. The Phase 1 scaffold must create the canonical `pnpm` scripts before application work begins.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
