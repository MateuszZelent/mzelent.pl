---
name: visual-reference-audit
description: Use before implementing from website URLs, screenshots, recordings, or design references. Decompose composition, depth, lighting, typography, motion, interaction, and responsive behavior into measurable requirements; do not use for routine code-only fixes.
---

# Visual reference audit

## Required inputs

Obtain as many as exist:

- reference URLs;
- desktop and mobile screenshots;
- hover, pointer, scroll, loading, and transition recordings;
- target section and intended degree of inspiration;
- browser and viewport constraints.

Do not begin implementation from adjectives such as “premium,” “modern,” or “like this site.”

## Procedure

1. Read `docs/references/visual-direction.md` and `docs/quality/visual-quality-bar.md`.
2. Inspect each reference in a real browser.
3. Capture observations at:
   - 1440 × 900;
   - 1920 × 1080;
   - 390 × 844;
   - any state specific to the task.
4. Separate the reference into:
   - semantic DOM content;
   - fixed or sticky layers;
   - WebGL/canvas effects;
   - transparent 2.5D assets;
   - CSS light/mask layers;
   - input and scroll orchestration.
5. Measure or estimate:
   - layout grid and margins;
   - type scale and line length;
   - object scale and crop;
   - number and relative speed of depth planes;
   - background and highlight luminance;
   - glow radius and falloff;
   - motion duration, easing, delay, damping, and scroll range;
   - pointer influence radius and decay;
   - mobile substitutions.
6. Identify signature properties that must not be copied.
7. Translate observations into implementation-neutral acceptance criteria.
8. Fill `docs/templates/reference-audit.md` or create a task-specific copy.

## Output contract

Return:

- a reference-trait matrix;
- an annotated layer model;
- a motion timeline;
- responsive state differences;
- measurable acceptance criteria;
- ownership recommendation: DOM, CSS, 2.5D asset, or WebGL;
- performance and accessibility risks;
- a “do not copy” list.

## Quality bar

Reject the audit if it contains only mood words, generic color names, or technology guesses unsupported by inspection. The audit must be concrete enough that another agent can implement without inventing the visual system.
