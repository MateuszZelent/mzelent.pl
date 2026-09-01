---
name: webgl-scene-engineering
description: Use for Three.js/R3F, WebGL2, GLSL, particles, render targets, post-processing, scene lifecycle, adaptive quality, or GPU performance work. Do not use for ordinary DOM layout or content changes.
---

# WebGL scene engineering

## Production constraints

- Stable R3F 9 and Three.js `WebGLRenderer`.
- WebGL2 and GLSL ES 3.00 production path.
- One persistent canvas.
- One coordinated clock.
- Essential information remains in semantic DOM.
- WebGPU/TSL experiments remain isolated behind a benchmark route and feature flag.

## Procedure

1. Define the visual effect in observable terms before choosing a shader technique.
2. Establish a static fallback and loading poster first.
3. Specify:
   - coordinate spaces;
   - simulation state;
   - render passes;
   - texture formats and precision;
   - blend mode;
   - color-space conversions;
   - quality-tier limits;
   - cleanup ownership.
4. Prototype the smallest GPU path.
5. Use GPU-resident simulation for large particle fields. Prefer ping-pong render targets; never update tens of thousands of particles from React or the CPU each frame.
6. Keep hot paths allocation-free. Reuse vectors, matrices, buffers, and render targets.
7. Precompile/prewarm shaders and avoid first-interaction stalls.
8. Instrument:
   - CPU and GPU frame time when available;
   - p50/p95 frame duration;
   - draw calls;
   - points/triangles;
   - render-target dimensions;
   - texture-memory estimate;
   - shader and asset load time.
9. Test quality-tier downgrade, context loss/restoration, tab visibility, resize, route changes, and unmount/remount.
10. Run browser and visual quality checks.

## Particle-field baseline

For the first visual spike:

- custom GPU ping-pong simulation for position/velocity;
- one `THREE.Points` draw call with custom vertex/fragment shaders;
- smooth radial point profile, depth attenuation, dither/noise, and restrained blending;
- pointer force with smooth spatial falloff and damped input;
- 8k / 24k / 50k points for low / medium / high tiers;
- optional half-resolution light accumulation only if measured and visually necessary.

Do not add full-screen post-processing by default. Every pass needs a visible benefit and a budget entry.

## Output contract

Include:

- scene graph and pass diagram;
- uniform/state contract;
- lifecycle and cleanup notes;
- metrics for each tested quality tier;
- screenshots/recordings;
- fallback behavior;
- known device/browser limitations.
