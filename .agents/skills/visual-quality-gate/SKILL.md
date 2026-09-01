---
name: visual-quality-gate
description: Use after visual, motion, WebGL, responsive, or asset changes to make an evidence-based accept/reject decision in real browsers. Do not use as a substitute for unit-level correctness tests.
---

# Visual quality gate

## Required test matrix

Capture and inspect at minimum:

- Chromium: 1440 × 900 and 1920 × 1080;
- WebKit: 1440 × 900;
- Firefox: 1440 × 900;
- mobile/coarse pointer: 390 × 844;
- tablet/narrow desktop: 768 × 1024;
- reduced motion;
- low quality;
- no WebGL or forced static fallback;
- loading and asset failure where relevant.

## Procedure

1. Read the task’s approved reference audit and acceptance criteria.
2. Run type, lint, unit, build, and browser checks that exist.
3. Open the actual built application.
4. Inspect:
   - hierarchy, spacing, type, crop, depth, light, and contrast;
   - scroll and pointer timing;
   - resize and route transitions;
   - keyboard order and visible focus;
   - reduced-motion/coarse-pointer behavior;
   - console, network, hydration, and WebGL errors;
   - layout shift;
   - frame-time distribution and long tasks;
   - payload, draw calls, point/triangle count, render targets, and texture memory.
5. Compare screenshots to the approved specification. A pixel diff is evidence, not the sole judge for animated material.
6. Fill `docs/templates/visual-acceptance-report.md`.
7. Return one verdict:
   - ACCEPT;
   - ACCEPT WITH NON-BLOCKING FOLLOW-UPS;
   - REJECT.

## Review discipline

- Lead with concrete failures, not praise.
- Include reproduction steps and affected viewport/state.
- Do not update baselines to hide unexplained changes.
- Do not accept “works on my machine.”
- Do not accept a 60 FPS average that hides severe p95 stutter.
- Do not accept desktop quality with an unart-directed mobile collapse.
- Do not accept accessibility as a later phase.

## Output contract

Provide the verdict, blocking findings, evidence locations, measurements versus budget, intentional deviations, and exact follow-up owners.
