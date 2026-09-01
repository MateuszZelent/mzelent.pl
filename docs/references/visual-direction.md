# Visual direction

- **Status:** Accepted direction; implementation not started
- **Decision date:** 2026-09-01

## Reference A — Parallel Universe

Reference URL: `https://paralleluniverse.com.ua/en/`

Use as the primary composition reference.

Traits to learn from:

- deep black as an active spatial field;
- large isolated objects with transparent or visually open edges;
- strong foreground/background separation;
- objects crossing section and viewport boundaries;
- asymmetrical editorial placement;
- long vertical rhythm;
- depth created with scale, crop, focus, overlap, and differential parallax;
- sparse text relative to visual mass;
- cinematic scene-to-scene continuity.

Do not copy:

- its specific sculptures, models, branding, layout sequence, words, or recognizable compositions;
- exact object placements or transitions;
- assets downloaded from the site.

## Reference B — Torii Studio

Reference URL: `https://torii.studio/`

Use as the primary interaction, atmosphere, and light reference.

Traits to learn from:

- a subtle colored particle/smoke field that reacts to the pointer;
- low-amplitude ambient motion;
- colored light emerging from black rather than sitting on top of it;
- localized illumination on surfaces and borders;
- delicate neon accents;
- smooth state transitions;
- micro-interactions that reward discovery;
- restraint: effects remain subordinate to composition.

Do not copy:

- its exact particle shader, color choreography, interaction geometry, transitions, or brand system;
- source code or runtime assets.

## Synthesis

The intended hierarchy is:

1. **Parallel Universe composition**
2. **Torii atmosphere and interaction**
3. **original magnetic-science visual language**
4. **semantic academic/software portfolio structure**

The result should not look like a hybrid template. It should feel internally coherent, as if the black environment, scientific objects, particles, and local light belong to one physical world.

## Original scientific vocabulary

Preferred raw material:

- skyrmion magnetization fields;
- vortices and anti-vortices;
- spin-wave amplitude and phase;
- standing-wave nodal structure;
- vector fields;
- FEM meshes and geometric refinement;
- magnetic field lines;
- spectra and Fourier-space patterns;
- microwave antennas and waveguides;
- laboratory instruments and sample fragments;
- code/mesh/data transitions.

Avoid generic:

- atom or electron-orbit icons;
- decorative DNA strands;
- random space nebulas;
- planet imagery;
- stock chrome blobs;
- unrelated abstract 3D shapes;
- hacker-code rain.

Artistic transformation is allowed, but the origin should remain project-owned and conceptually connected to the work.

## Layer translation

| Visual need | Preferred implementation |
|---|---|
| Deep black spatial background | authored CSS + one persistent WebGL atmosphere |
| Colored gas/field | GPU particles and a small explicit composite |
| Hero scientific object requiring interaction | GLB/custom shader in shared canvas |
| High-detail fixed-angle object | transparent AVIF/WebP 2.5D layer |
| Foreground occlusion | alpha media or simple WebGL geometry |
| Local card/block illumination | CSS radial mask driven by local pointer coordinates |
| Section timing | GSAP/ScrollTrigger |
| Smooth scroll | Lenis |
| Essential content | server-rendered semantic DOM |

## Motion character

Desired:

- slow ambient drift;
- pointer inertia;
- damped return;
- broad light falloff;
- subtle differential parallax;
- reversible scroll progress;
- occasional precise, short feedback;
- quiet resting states.

Rejected:

- bouncing;
- constant spinning product models;
- aggressive cursor followers;
- every section pinned;
- long cinematic preload;
- obvious scroll hijacking;
- rapid particle explosions;
- global pulsing neon.

## Visual spike questions

The Phase 1 lab must answer with evidence:

1. Can a 24k–50k GPU particle field feel volumetric and delicate without heavy global bloom?
2. Can a single persistent canvas remain synchronized with Lenis/GSAP without phase drift?
3. Can transparent 2.5D foreground layers integrate with real-time particles without alpha halos?
4. Can local surface illumination remain elegant rather than gaming-like?
5. What desktop/mobile particle counts and DPR caps satisfy the frame budget?
6. How does the atmosphere look in Chromium, Firefox, and WebKit?
7. What is the correct black level, accent density, and text contrast?
8. Does the static fallback still feel intentionally designed?

## Reference-audit requirement

Before implementing any specific section, create a fresh task-level audit using `docs/templates/reference-audit.md`. The references above establish direction, not exact section geometry.
