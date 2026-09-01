# ADR-0002: Assign smooth scroll to Lenis and timelines to GSAP

- **Status:** Accepted
- **Date:** 2026-09-01

## Context

The target experience requires smooth native-feeling scroll, scroll-linked scene transitions, pinned moments used sparingly, pointer damping, and synchronization between DOM and WebGL. Multiple animation libraries commonly create competing RAF loops, duplicated state, cleanup failures, and inconsistent reduced-motion behavior.

## Decision

Use:

- Lenis as the sole smooth-scroll layer;
- GSAP + ScrollTrigger + `@gsap/react` as the sole high-level timeline and scroll-trigger system;
- CSS transitions for small local states;
- R3F/Three.js for frame-local scene evaluation;
- a coordinated ticker that advances scroll, timelines, shared scene values, and rendering in a defined order.

Do not add Framer Motion, Motion One, Locomotive Scroll, or another timeline/smooth-scroll owner without a superseding ADR.

## Consequences

Positive:

- deterministic ownership;
- precise scrub/pin/snap capability;
- one place for reduced-motion policy;
- easier cleanup and diagnostics;
- DOM and scene timelines share progress.

Negative:

- GSAP/Lenis integration must be maintained carefully;
- simple component animation cannot introduce a convenience library;
- explicit clock integration requires a technology spike.

## Alternatives considered

### Native scroll only

Retained as fallback but not selected for the enhanced desktop experience. It does not provide the same controlled interpolation for the target DOM/WebGL coordination.

### CSS scroll-driven animations only

Promising but not selected as sole system because browser behavior and complex cross-layer orchestration need a more mature imperative timeline owner. Use CSS where a local effect is clearly sufficient.

### Framer Motion

Rejected because it duplicates timeline ownership and encourages component-local animation disconnected from the shared scene.

### Locomotive Scroll

Rejected because Lenis owns smooth scrolling and is sufficient.

## Verification

The Phase 1 spike must show:

- no phase drift between DOM and particles/parallax;
- correct reverse scrolling;
- anchor and keyboard behavior;
- reduced-motion bypass;
- no duplicate callbacks after remount;
- acceptable input latency and frame budget.
