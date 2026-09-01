# Technology stack

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Review point:** after the Phase 1 visual technology spike
- **Owner:** repository owner

## Objective

Select a production stack capable of matching the craft level of the approved references while keeping rendering behavior explicit, measurable, and maintainable.

The stack is intentionally stable at the graphics boundary. Visual quality will come from original assets, shaders, composition, lighting, timing, and browser iteration. A pre-release renderer is not a quality shortcut.

## Authoritative baseline

The following versions are the initial Phase 1 pins. Patch updates within the accepted line follow `version-policy.md`.

| Concern | Choice | Initial pin / line | Decision |
|---|---|---:|---|
| JavaScript runtime | Node.js LTS | `24.20.0` | Stable production runtime |
| Package manager | pnpm | `11.25.0` | Mature JS implementation; defer the days-old pnpm 12 Rust rewrite |
| Web framework | Next.js App Router | `16.3.4` | SSR/SSG, Server Components, route splitting, image/font integration, Vercel deployment |
| UI runtime | React / React DOM | `19.2.8` | Required modern React baseline |
| Type system | TypeScript | `6.0.3` | Stable JS-based API/tooling compatibility; defer TS 7 production use while Next’s CLI integration is experimental |
| Graphics engine | Three.js | `0.185.1` | Mature WebGL2 engine and asset ecosystem |
| React renderer | `@react-three/fiber` | `9.7.0` | Stable React 19 line |
| Helpers | `@react-three/drei` | same compatible stable line | Selective imports only; no helper-driven architecture |
| Post-processing | custom passes first; `@react-three/postprocessing` selectively | compatible stable line | Only when a measured visual need exists |
| Timeline/orchestration | GSAP + ScrollTrigger + `@gsap/react` | GSAP `3.15.0` line | Sole high-level timeline and scroll-trigger owner |
| Smooth scrolling | Lenis | `1.3.26` line | Sole smooth-scroll owner |
| Styling | CSS Modules + authored CSS | platform | Explicit control over cascade, masks, gradients, filters, and composition |
| Shared transient state | Zustand | `5.0.15` line | Only for cross-tree scene state; local state remains default |
| Runtime/build validation | Zod | `4.5.4` line | Validate typed content and asset manifests |
| Content | local MDX + typed data | Next-compatible stable line | Version-controlled, statically analyzable, no CMS runtime |
| 3D authoring | Blender LTS | `4.5` | Long-support asset source |
| 3D delivery | glTF 2.0 binary | `.glb` | Open, efficient runtime format |
| Geometry compression | Meshopt | current compatible stable | Default geometry compression |
| GPU texture delivery | KTX2 / Basis Universal | current compatible stable | Transcoded GPU formats and mip chains |
| Asset optimization | glTF Transform CLI/API | current compatible stable | Deterministic, scriptable pipeline |
| Unit/component tests | Vitest + React Testing Library | current compatible stable | Fast deterministic logic and component checks |
| Browser tests | Playwright | current stable | Chromium, Firefox, and WebKit coverage |
| Accessibility | axe integrated into Playwright | current stable | Automated support; not a replacement for keyboard review |
| Performance CI | Lighthouse CI + custom frame probe | current stable | Web vitals, payload, and runtime metrics |
| Hosting | Vercel | production stable | Native Next.js previews, CDN, image path, and simple promotion |
| CI | GitHub Actions | supported actions pinned by SHA/major policy | Build, test, browser, and budget gates |

## Framework decision: Next.js

Next.js is selected over Astro, a plain Vite SPA, and a custom static generator.

Reasons:

- semantic content can remain server-rendered while the visual engine is lazy and client-only;
- App Router provides route-level boundaries for research, software, publications, notes, and the visual laboratory;
- Server Components reduce accidental client JavaScript;
- dynamic imports can isolate Three.js/R3F from non-visual routes;
- built-in image/font/deployment integration reduces bespoke infrastructure;
- one React runtime simplifies coordination between DOM, R3F, and shared interaction state.

Constraints:

- do not turn the entire site into a Client Component;
- do not import graphics dependencies into the server graph;
- do not enable experimental Next.js features without an ADR;
- preserve route-independent semantic output when the visual engine is unavailable.

## Graphics decision: stable WebGL2

The production renderer is Three.js `WebGLRenderer` with WebGL2 and GLSL ES 3.00.

Rationale:

- all required effects—GPU particle simulation, transparent objects, render targets, blur/light accumulation, custom materials, instancing, and post-processing—are achievable in mature WebGL2;
- browser and debugging behavior is well understood;
- stable R3F 9 supports the selected React line;
- R3F 10/WebGPU work remains pre-release and would move a critical layer onto evolving APIs;
- the references’ quality does not depend on WebGPU.

WebGPU/TSL may be evaluated later only in `/lab/webgpu-benchmark` behind an explicit feature flag. It cannot become the default without a new ADR and parity evidence for visuals, performance, fallbacks, tests, and browser behavior.

## Styling decision: authored CSS

Use:

- CSS Modules for component scope;
- global cascade layers for reset, tokens, base, composition, utilities, and overrides;
- CSS custom properties for design tokens and pointer-local effects;
- modern platform features such as `clamp()`, container queries, masks, filters, logical properties, and `@supports`;
- small reusable layout primitives only after repeated evidence.

Do not use Tailwind, shadcn, a themed component kit, or CSS-in-JS. The target depends on deliberate editorial composition and unusual layered states; authored CSS keeps those relationships inspectable and prevents a generic utility-driven visual grammar.

## Motion decision

Responsibilities are exclusive:

- **Lenis:** smooth scroll and normalized scroll progression.
- **GSAP/ScrollTrigger:** timelines, pinning, scrubbing, section transitions, and coordinated DOM/scene values.
- **R3F/Three.js:** per-frame scene evaluation and GPU rendering.
- **CSS transitions:** small local states such as focus, hover border, or opacity.

Framer Motion, Motion One, Locomotive Scroll, and additional timeline systems are excluded by default. Multiple owners create phase drift, duplicate RAF work, inconsistent reduced-motion behavior, and difficult cleanup.

## Content and data decision

The initial production site uses local, version-controlled content:

- MDX for essays, notes, and long-form project narratives;
- TypeScript or JSON data for publications, talks, grants, repositories, and structured metadata;
- Zod schemas validated at build time;
- generated indexes and feeds;
- no client-side CMS SDK.

No database, headless CMS, or GraphQL layer is introduced until edit frequency and collaboration requirements prove the need.

## State decision

Priority order:

1. URL and server data;
2. local component state;
3. CSS state;
4. refs/uniforms for frame-local values;
5. one small Zustand store for cross-tree transient scene orchestration.

Do not put high-frequency pointer, particle, camera, or shader state through React renders.

## Asset decision

- Blender 4.5 LTS is the canonical 3D authoring environment.
- Deliver models as `.glb`.
- Use Meshopt for geometry.
- Use KTX2/Basis Universal for GPU textures.
- Use AVIF with alpha and WebP fallback for transparent 2.5D raster layers.
- Use SVG only for genuinely vector artwork; avoid complex SVG filters for full-screen animated atmosphere.
- Use self-hosted WOFF2 fonts after licensing, subset, and visual testing.
- Store large source authoring files in Git LFS or an approved external source.

## Tools deliberately excluded

| Tool/category | Status | Reason |
|---|---|---|
| R3F 10 / WebGPU production renderer | Excluded from v1 | Pre-release critical path |
| Tailwind / shadcn | Excluded | Encourages a generic component grammar and adds an unnecessary abstraction |
| Framer Motion | Excluded | Duplicates GSAP timeline ownership |
| Spline runtime | Excluded | Black-box runtime, asset/runtime control and budget concerns |
| Locomotive Scroll | Excluded | Duplicates Lenis |
| Storybook at bootstrap | Deferred | Full-screen WebGL and scroll states are better validated in a real `/lab` route initially |
| Headless CMS | Deferred | Unnecessary runtime and schema complexity for owner-maintained content |
| Multiple canvases | Prohibited by default | Context/memory/coordination cost |
| Heavy global bloom | Prohibited by default | Flattens hierarchy and produces a generic neon look |

## Design tools

- Figma is the source of truth for layout frames, type/spacing calibration, motion boards, and state annotations.
- Blender is the source of truth for 3D asset geometry and material authoring.
- Browser captures are the source of truth for implementation acceptance.
- Reference websites are observational inputs, never code or asset sources.

## Temporary tooling compatibility overrides

- **`experimental.useTypeScriptCli = false` in `next.config.ts`:**
  - **Rationale:** Next.js 16.3's experimental default CLI TypeScript inspection path failed to parse compiler options under pinned TypeScript 6.0.3 (`Could not parse output from TypeScript's --showConfig`).
  - **Behavior:** Explicitly disabling the CLI path directs Next.js to use its stable TypeScript compiler API path during build and type generation.
  - **Independent verification:** Standalone strict typechecking remains enforced via `pnpm typecheck` (`pnpm typegen && tsc --noEmit`).
  - **Re-evaluation criteria:** This override will be re-evaluated during future deliberate updates to Next.js or TypeScript; its removal requires a clean build, successful typecheck, and green CI across all runners.

## Phase 1 bootstrap rule

Phase 1 creates the application manually or from a temporary `create-next-app@16.3.4` scaffold, then copies only the reviewed files into this repository. It must:

- pin Node and pnpm;
- use exact dependency versions and a committed lockfile;
- create canonical `pnpm` scripts;
- configure strict TypeScript, ESLint flat config, formatting, tests, and browser automation;
- keep the visual engine dynamically imported;
- add `/lab/visual-system`;
- preserve all Phase 0 documents and agent instructions.

The scaffold is not accepted until a clean checkout can install, build, test, and run the lab route with one documented command path.
