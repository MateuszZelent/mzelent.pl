# Visual quality bar

- **Status:** Accepted
- **Decision date:** 2026-09-01

## Target character

The site should feel like a dark scientific gallery in which magnetic matter is alive.

It must combine:

- editorial restraint;
- deep black spatial composition;
- sparse, high-detail objects;
- physically plausible local light;
- transparent foreground/background layers;
- slow, controlled parallax;
- a subtle reactive field;
- exact typography and negative space;
- original scientific imagery.

It must not feel like:

- a gaming landing page;
- a crypto/Web3 template;
- a neon dashboard;
- a generic developer portfolio;
- a collection of glass cards;
- a WebGL demo with content attached.

## Reference responsibility

Use **Parallel Universe** primarily for composition:

- black space;
- isolated object scale;
- transparent/layered imagery;
- asymmetry;
- editorial pacing;
- depth through crop and occlusion;
- measured parallax.

Use **Torii Studio** primarily for atmosphere and interaction:

- subtle pointer-reactive particles/smoke;
- localized colored light;
- delicate neon accents;
- surface illumination;
- restrained transitions;
- interaction discovered rather than announced.

Do not merge every effect from both references into every viewport.

## Initial visual calibration

These are starting calibration values for the Phase 1 spike, not final brand assets:

```css
:root {
  --color-canvas: #030405;
  --color-canvas-raised: #07090d;
  --color-ink: #f1efe9;
  --color-ink-muted: #9a9ea8;
  --color-line: rgb(255 255 255 / 0.08);

  --accent-cyan: #57e6dd;
  --accent-violet: #846cff;
  --accent-magenta: #ef5aa8;
  --accent-warm: #d5b779;
}
```

Rules:

- one section normally uses one dominant accent and at most one secondary trace;
- the average background remains near-black;
- large saturated areas require explicit art direction;
- text contrast must remain readable over all animation states;
- white is slightly warm, not pure display white;
- glow opacity is low and falloff broad.

Typography is selected in the visual spike after licensing, glyph, variable-font, rendering, and performance checks. Do not install a font package as a substitute for that decision.

## Composition

- Establish a clear dominant object or headline.
- Preserve meaningful empty space.
- Use asymmetry intentionally, not randomly.
- Crop large objects at viewport edges to imply scale.
- Use overlap and occlusion to connect planes.
- Keep body text in stable readable zones.
- Avoid equal-weight repeated cards.
- Maintain a deliberate vertical rhythm across section boundaries.
- On desktop, use large-object/quiet-text tension.
- On mobile, recrop or replace the composition; do not merely scale it.

## Depth system

Each scene should define a small depth plan, for example:

| Plane | Role | Pointer range | Scroll range | Focus |
|---|---|---:|---:|---|
| Atmosphere | distant particle/light field | 1–4 px | 0–8 px | soft |
| Background object | context/silhouette | 4–10 px | 8–20 px | slightly soft |
| Primary object | dominant scientific form | 10–22 px | 20–48 px | sharp |
| Foreground fragment | occlusion/detail | 18–34 px | 32–70 px | selective |

These are bounds, not mandatory values. Depth must remain subtle enough that text does not swim.

## Lighting

- Every highlight must have a plausible source.
- Use local radial masks based on pointer or object position.
- Keep borders mostly dark; brighten only the nearby segment/state.
- Prefer reflected light and edge accents over a uniform outer glow.
- Preserve black regions for contrast.
- Limit bloom to selected emissive elements.
- Avoid identical cyan-purple gradients on every surface.
- Do not light all sides of an object equally.

A surface can be visible through value, texture, edge light, or motion. It does not need all four.

## Particle/smoke atmosphere

The background field should:

- be barely perceptible at rest;
- respond with inertia, not attach rigidly to the cursor;
- retain organic motion after pointer exit;
- use broad color density, not bright discrete confetti;
- avoid obscuring text;
- avoid obvious repeating noise;
- remain calm enough for long-form reading;
- become static or nearly static under reduced motion.

The first reaction should feel discovered.

## Parallax

- Parallax supports depth and hierarchy.
- Use a small number of planes with distinct but related motion.
- Anchor objects to composition, not to arbitrary scroll values.
- Avoid every element moving.
- Keep text motion shorter than decorative object motion.
- Preserve reversibility when scrolling upward.
- Disable or simplify where touch scrolling would feel unstable.
- Never require excessive scrolling to reveal basic navigation or identity.

## Surfaces and local illumination

Preferred surface:

```text
near-black base
+ 1 px low-opacity border
+ local pointer/object radial light
+ optional subtle inner reflection
+ minimal elevation shift
```

Avoid:

- large translucent gray cards;
- strong backdrop blur everywhere;
- constant neon outlines;
- large drop shadows on black;
- glowing corners with no source;
- nested rounded rectangles.

Corner radius is a composition choice, not a default token applied to every block.

## Typography

- Use a distinctive but readable display face and a neutral text face only after the spike.
- Use monospace sparingly for scientific metadata, coordinates, years, or system labels.
- Maintain comfortable reading widths.
- Avoid uppercase body copy.
- Avoid tiny low-contrast text used as decoration.
- Do not rely on enormous type alone to simulate art direction.
- Test Polish and English glyph coverage before accepting a typeface.

## Motion

- Motion has an entering state, purpose, duration, easing, and resting state.
- Prefer long, low-amplitude ambient movement and shorter precise feedback.
- Use inertia/damping for pointer-driven effects.
- Avoid elastic/bouncy easing unless physically justified.
- Avoid simultaneous independent motions competing for attention.
- Avoid unskippable preload theatre.
- Preserve interaction response under smooth scrolling.

## Responsive art direction

Required states:

- wide desktop: 1920 × 1080;
- standard desktop: 1440 × 900;
- tablet/narrow: 768 × 1024;
- mobile: 390 × 844;
- coarse pointer;
- reduced motion;
- static/no WebGL.

For each, define:

- dominant object and crop;
- text placement and maximum width;
- which planes remain;
- which interaction replaces hover;
- particle density and rendering tier;
- whether pinning/scrubbing remains;
- fallback poster crop.

## Anti-pattern checklist

Reject a design containing several of these:

- centered hero, gradient blob, two CTA pills, and three equal cards;
- generic atom/orbit iconography;
- starfield used merely because the background is black;
- global purple-blue bloom;
- random floating glass panels;
- all sections sharing the same card shell;
- excessive rounded corners;
- every object responding to the cursor;
- loud shader behind long-form text;
- stock 3D shapes unrelated to the science;
- “premium” represented only by blur and slow transitions;
- desktop scene squeezed into mobile.

## Acceptance method

A visual slice is accepted only through real-browser evidence:

1. approved reference audit/specification;
2. fixed-viewport screenshots;
3. recordings for motion-dependent states;
4. overlay or side-by-side review;
5. responsive, reduced-motion, and fallback captures;
6. performance evidence;
7. explicit accept/reject verdict.

Compilation and automated snapshots do not establish visual quality.
