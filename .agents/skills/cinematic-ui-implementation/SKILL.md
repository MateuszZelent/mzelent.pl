---
name: cinematic-ui-implementation
description: Use to implement or refine one reference-driven portfolio section using Next.js, semantic DOM, authored CSS, parallax, and the established motion contracts. Do not use for low-level shader work or broad multi-page redesigns.
---

# Cinematic UI implementation

## Preconditions

- A reference audit or approved visual specification exists.
- Scope is one coherent vertical slice.
- Acceptance criteria and target viewports are explicit.
- Any new dependency has an accepted ADR.

Stop and produce the missing audit rather than improvising a generic interface.

## Procedure

1. Read `AGENTS.md`, the approved audit, and the relevant architecture/quality documents.
2. Map each visual element to DOM, CSS, transparent 2.5D media, or the shared scene contract.
3. Implement semantic content first so the slice remains usable without enhancement.
4. Add authored CSS:
   - logical properties;
   - fluid type/spacing with controlled clamps;
   - explicit stacking contexts;
   - CSS variables for local pointer coordinates;
   - no generic component-kit defaults.
5. Add parallax through one shared motion owner. Use depth-specific transforms and restrained ranges.
6. Add local lighting with masks/radial gradients tied to a plausible source.
7. Implement desktop, mobile/coarse-pointer, reduced-motion, loading, and no-enhancement states deliberately.
8. Verify in a real browser and iterate from screenshots, not memory.
9. Run the visual quality gate.

## Forbidden shortcuts

- “Temporary” random gradients that become production styling.
- One oversized component owning the full page.
- Copying coordinates from a reference without adapting the composition.
- Hiding structural problems with blur, bloom, or opacity.
- Using hover as the only way to reveal essential information.
- Updating visual snapshots before explaining the difference.
- Declaring completion after type-check/build only.

## Output contract

Report:

- the implemented slice and its boundaries;
- visual acceptance criteria satisfied;
- screenshots/recordings and viewports;
- keyboard and reduced-motion behavior;
- payload or layout-shift changes;
- deviations, assumptions, and deferred work.
