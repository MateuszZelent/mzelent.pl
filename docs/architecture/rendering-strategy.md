# Rendering strategy

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Applies to:** all production routes and visual laboratory routes

## Architectural objective

Produce a deep, cinematic visual system without sacrificing semantic HTML, accessibility, route performance, browser stability, or maintainability.

The visual system is not “a Three.js website.” It is a semantic Next.js site with one progressive WebGL atmosphere and carefully placed 2.5D assets.

## Layer model

### Layer 0 — document foundation

Normal document flow owns:

- headings, paragraphs, links, navigation, metadata, publications, projects, and controls;
- focus order and landmarks;
- page height and scroll geometry;
- server-rendered fallback content.

No essential information is duplicated only inside a canvas.

### Layer 1 — persistent WebGL atmosphere

One fixed canvas sits behind or between selected DOM layers and is mounted near the root layout.

It owns:

- pointer-reactive atmospheric particles;
- section-specific abstract scientific objects;
- shader-driven light, field, and transition effects;
- camera and scene interpolation;
- optional restrained post-processing.

It does not own navigation, body copy, buttons, publication text, or route semantics.

### Layer 2 — transparent 2.5D media

DOM-positioned AVIF/WebP assets provide:

- high-detail renders with alpha;
- foreground fragments and occlusion;
- inexpensive differential parallax;
- art-directed mobile crops;
- fallback imagery when equivalent real-time 3D is wasteful.

These layers use normal responsive image semantics and predictable CSS stacking contexts.

### Layer 3 — CSS light and surface system

CSS owns:

- masks;
- localized radial illumination;
- thin borders and surface highlights;
- grain/dither overlays;
- focus/hover states;
- section fades and nonessential local transitions.

Do not use CSS blur/glow to disguise poor asset edges or weak composition.

## One-canvas contract

There is exactly one production WebGL canvas unless a later ADR proves a separate isolated context is required.

Reasons:

- a single GPU context and memory budget;
- consistent color management and DPR;
- centralized visibility, resize, quality, context-loss, and cleanup behavior;
- deterministic layering and section transitions;
- no cross-canvas synchronization drift.

The canvas remains mounted across route transitions only if tests show that persistence improves experience without retaining stale resources. Otherwise, mount it in the route group that needs enhancement while preserving one context at a time.

## Scene organization

Target modules:

```text
src/visual/
  canvas/
    VisualCanvas.tsx
    VisualRuntime.ts
    renderer-config.ts
  clock/
    motion-clock.ts
  state/
    scene-store.ts
    scene-contract.ts
  quality/
    quality-profile.ts
    frame-monitor.ts
  scenes/
    atmosphere/
    hero/
    transitions/
  shaders/
  assets/
  diagnostics/
```

Separate:

- simulation state;
- shader/rendering implementation;
- section orchestration;
- asset loading;
- quality adaptation;
- diagnostics.

Do not create one monolithic `Experience.tsx`.

## Coordinated clock

The target clock model is:

1. GSAP ticker receives the browser frame.
2. Lenis advances from that timestamp.
3. ScrollTrigger updates scroll-linked timelines.
4. shared scene progress/uniform refs update.
5. R3F advances/renders once.

The Phase 1 spike should test R3F `frameloop="never"` with explicit `advance()` from the shared ticker. If browser evidence shows incompatibility or worse behavior, document the result and amend this strategy through an ADR. Do not quietly add a second uncontrolled RAF loop.

Pause or reduce updates when:

- `document.visibilityState !== "visible"`;
- the visual route is not active;
- reduced motion is active;
- the user is on a static fallback;
- runtime frame monitoring has selected a lower cadence.

## Scene state contract

Cross-tree transient state may contain only coarse orchestration values:

```text
activeSceneId
previousSceneId
sceneTransitionProgress
normalizedPointer
pointerVelocity
normalizedScroll
qualityTier
reducedMotion
coarsePointer
webglStatus
```

High-frequency simulation arrays, camera matrices, particles, render targets, and shader internals remain outside React/Zustand state.

Use refs or uniforms for frame-local values. React state is reserved for observable UI mode changes.

## Particle atmosphere baseline

The first visual technology spike uses:

- WebGL2 floating-point/half-float render targets selected by capability;
- ping-pong position and velocity textures;
- deterministic initialization;
- curl/noise-like advection;
- a smooth pointer force with finite influence radius;
- gentle return/confinement behavior;
- one `THREE.Points` draw call;
- custom size attenuation and soft radial fragment profile;
- restrained alpha/additive contribution;
- optional half-resolution light accumulation only after direct rendering is evaluated.

Quality tiers:

| Tier | Particles | DPR cap | Extra light pass | Target |
|---|---:|---:|---|---|
| High | 50,000 | 1.75 | allowed when measured | discrete GPU / strong desktop |
| Medium | 24,000 | 1.35 | off by default | modern laptop/iGPU |
| Low | 8,000 | 1.0 | off | mobile/older iGPU |
| Static | 0 | n/a | n/a | reduced capability/failure/user preference |

Particle counts are starting budgets, not goals. Reduce them if the same appearance can be achieved more efficiently.

## Pointer model

Raw pointer coordinates must not drive visuals directly.

Pipeline:

1. normalize to viewport and canvas coordinates;
2. account for canvas bounds and device orientation;
3. detect coarse/no pointer;
4. low-pass/damp position and velocity;
5. map through an explicit influence radius and smooth falloff;
6. limit maximum force and color response;
7. decay naturally after pointer exit.

The field should remain alive without input and become noticeably reactive only after interaction. Avoid a bright cursor halo that follows the mouse mechanically.

## Scroll-to-scene mapping

DOM sections publish stable IDs and normalized progress ranges. GSAP timelines map those ranges to scene contracts.

Rules:

- section heights are owned by DOM, not the canvas;
- pinning is rare and purposeful;
- avoid long dead zones;
- scroll-linked values must be deterministic and reversible;
- route/anchor navigation must land correctly;
- mobile may replace a scrubbed sequence with discrete fades or a static composition;
- reduced motion uses immediate state transitions.

## Color management

- Author color textures in sRGB.
- Treat normal, roughness, metalness, masks, simulation data, and lookup data as non-color/linear.
- Use the renderer’s current recommended color-management configuration for the pinned Three.js line.
- Tone mapping and exposure are global visual-system decisions.
- Validate Blender-to-browser appearance with reference spheres/ramps.
- Do not compensate for color-space mistakes by hand-tinting materials.
- Verify transparency and premultiplication in every delivery format.

## Transparency and depth

Transparent materials are expensive and order-sensitive.

Prefer, in order:

1. opaque geometry;
2. alpha test / dithered cutout;
3. carefully sorted transparent surfaces;
4. screen-space composite for atmosphere.

Limit overlapping full-screen transparent planes. Document `depthWrite`, `depthTest`, blending, and render order when deviating from defaults.

## Post-processing

Post-processing is opt-in.

Allowed only with a measured purpose:

- restrained selective bloom;
- half-resolution atmospheric blur;
- subtle dither/grain;
- color grading implemented as a small explicit pass.

Avoid:

- global bloom on all bright pixels;
- stacked cinematic filters;
- chromatic aberration as decoration;
- depth of field that harms text or motion clarity;
- high-resolution multi-pass effects without tiering.

Every pass must have a low-tier behavior and a documented frame/payload cost.

## Asset loading

- Render semantic DOM immediately.
- Show an art-directed static poster before WebGL readiness.
- Dynamically import the visual runtime.
- Load only hero/active-scene assets initially.
- Prefetch the next scene after idle or proximity.
- Abort obsolete loads on route change when possible.
- Never block navigation or readable content on GLB/KTX2 completion.
- Use stable dimensions/aspect ratios to prevent layout shift.

## Quality selection

Initial selection may use non-sensitive capability signals:

- WebGL2 and required extension support;
- viewport pixel count;
- DPR;
- pointer type;
- `prefers-reduced-motion`;
- conservative device-memory hints where available.

Runtime selection uses a rolling frame-time window.

Downgrade when p95 frame duration remains above the tier threshold for a defined interval. Avoid rapid oscillation; do not auto-upgrade repeatedly in the same session.

Never infer identity or store a detailed hardware fingerprint.

## Lifecycle and failure handling

The visual runtime must handle:

- WebGL unsupported;
- shader compile/link failure;
- asset decode/load failure;
- context lost and restored;
- resize and orientation change;
- page hidden/visible;
- route change;
- React development remount/Strict Mode behavior;
- hot reload;
- reduced-motion changes during the session.

On failure, preserve the poster and semantic DOM. Log a bounded diagnostic; do not show a broken black canvas.

## Instrumentation

Development diagnostics must expose:

- selected quality tier;
- FPS and p50/p95 frame duration;
- renderer info: calls, points, triangles, lines, textures, geometries;
- render-target dimensions/formats;
- approximate texture-memory total;
- active scene and asset state;
- reduced-motion/coarse-pointer/fallback status.

Diagnostics must be tree-shaken or disabled in production unless explicitly activated.

## Validation

Every scene change runs the matrix in `docs/quality/performance-budget.md` and the `visual-quality-gate` skill. Animated output requires recordings in addition to still screenshots when timing is part of the acceptance criteria.
