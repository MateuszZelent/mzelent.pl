# Agent workflow

- **Status:** Accepted
- **Decision date:** 2026-09-01

## Purpose

Prevent vibe-coded visual work from converging on a technically functional but visually generic result.

Agents must operate from explicit references, measurable acceptance criteria, bounded ownership, and browser evidence.

## Work classes

### Architecture work

Use `architecture-decision-record`.

Deliver:

- decision problem;
- alternatives;
- accepted ADR;
- canonical-document update;
- verification and rollback plan.

Do not mix architecture selection with broad feature implementation.

### Reference-driven visual work

Use, in order:

1. `visual-reference-audit`;
2. `cinematic-ui-implementation` and/or `webgl-scene-engineering`;
3. `asset-production-pipeline` when assets are involved;
4. `visual-quality-gate`.

Skipping the audit is allowed only for an already approved specification with measurable states.

### Routine corrective work

Read `AGENTS.md`, inspect the failure, make the smallest change, and run the relevant gate. Do not invoke every skill.

## Task packet

Every nontrivial visual task starts with:

```text
Goal:
Out of scope:
Approved references/specification:
Target routes/sections:
Target viewports/states:
Semantic requirements:
Visual acceptance criteria:
Motion acceptance criteria:
Performance budget:
Accessibility/fallback requirements:
Files/modules likely owned:
Evidence required:
```

If the packet is incomplete, the first output is the missing audit/specification—not improvised production code.

## Agent ownership

### Parent agent

- owns scope, sequencing, integration, and final evidence;
- selects minimal skills;
- assigns non-overlapping work;
- prevents architecture drift;
- merges findings into one decision.

### `visual_director`

- read-only;
- audits references and implementation;
- writes acceptance criteria/review findings;
- never changes code to make its own review pass.

### `frontend_engineer`

- owns bounded semantic DOM, CSS, responsive layout, and DOM parallax;
- does not own low-level shader simulation;
- coordinates through typed contracts.

### `graphics_engineer`

- owns bounded R3F/Three.js/GLSL/runtime work;
- does not redesign global content/layout;
- reports measured scene cost.

### `quality_reviewer`

- read-only and independent;
- runs the complete relevant matrix;
- gives a blocking verdict.

## Parallelism

Good parallel work:

- reference analysis versus codebase mapping;
- asset inventory versus performance baseline;
- independent browser-engine verification;
- read-only architecture alternatives.

Bad parallel work:

- two agents editing the same scene;
- one agent changing tokens while another tunes visual output;
- two agents owning the same GSAP timeline;
- simultaneous dependency upgrades and feature work;
- separate agents updating the same visual baseline.

One write owner per visual slice.

## Implementation loop

1. **Observe:** inspect references and current runtime.
2. **Specify:** write measurable target states.
3. **Build semantic shell:** content and controls work without enhancement.
4. **Add visual layer:** smallest viable CSS/2.5D/WebGL implementation.
5. **Calibrate:** iterate in a real browser.
6. **Measure:** payload, layout, frame, GPU, accessibility.
7. **Review:** independent quality verdict.
8. **Document:** update ADRs, manifests, and decisions.
9. **Integrate:** merge only when evidence is complete.

## Evidence handling

Store durable project evidence as:

- source-controlled small visual baselines after approval;
- machine-readable metrics;
- audit and acceptance reports;
- asset manifests;
- links to CI artifacts for large screenshots/videos.

Do not commit copyrighted reference captures unless permitted. Do not commit every exploratory screenshot.

## Commit discipline

Prefer coherent commits:

1. architecture/docs;
2. scaffold/contracts;
3. implementation;
4. tests/baselines;
5. asset outputs/manifests.

A commit should not hide an unrelated dependency upgrade.

## Completion report

Every completed task states:

- what changed;
- why the chosen technique fits the specification;
- files and ownership boundaries;
- tests and browser matrix;
- screenshots/recordings;
- metrics against budget;
- fallback/reduced-motion behavior;
- remaining risks;
- deliberately deferred work.

“Looks good” and “build passes” are not completion evidence.
