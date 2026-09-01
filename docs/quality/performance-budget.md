# Performance budget

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Applies to:** production builds; development mode is diagnostic only

## Principle

The site may be visually ambitious, but no effect is exempt from a budget. Measure the semantic page and the enhanced visual runtime separately so a heavy canvas cannot hide behind a fast document shell.

## Core Web Vitals targets

Production field target at p75:

| Metric | Budget |
|---|---:|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| TTFB for cached/static route | ≤ 800 ms |

A lab machine Lighthouse score is supporting evidence, not a substitute for field data after launch.

## Transfer and execution budgets

Measured compressed over the production path:

| Resource | Desktop budget | Mobile budget |
|---|---:|---:|
| Initial semantic route JS before visual engine | ≤ 190 KiB | ≤ 170 KiB |
| Lazy visual-engine JS | ≤ 340 KiB | ≤ 300 KiB or not loaded on static tier |
| Critical HTML + CSS | ≤ 100 KiB | ≤ 100 KiB |
| Initial poster/media | ≤ 800 KiB | ≤ 450 KiB |
| Initial self-hosted fonts | ≤ 180 KiB | ≤ 140 KiB |
| Assets needed for first enhanced scene | ≤ 1.5 MiB | ≤ 800 KiB |
| Total before first viewport is fully usable | ≤ 2.5 MiB | ≤ 1.2 MiB |

Budgets are not targets to fill. Later-scene assets must load on proximity/idle rather than at page start.

## Runtime frame budget

### High and medium tiers

- target refresh: 60 FPS on 60 Hz displays;
- p50 frame duration: ≤ 12 ms;
- p95 frame duration: ≤ 16.7 ms during steady interaction;
- no repeated frame over 33 ms;
- no steady-state main-thread long task over 50 ms.

### Low tier

- target refresh: 30–60 FPS depending on measured capability;
- p95 frame duration: ≤ 33.3 ms;
- visual response remains smooth and coherent;
- quality reduction is preferable to unstable oscillation.

### Static tier

- no continuous canvas animation;
- semantic page and poster remain fully usable.

Measure at least a 10-second idle sample, a 10-second pointer sample, and the full scroll transition relevant to the change. Report p50, p95, worst frame, and sampling method.

## Scene budgets

Starting limits per active scene:

| Metric | High | Medium | Low |
|---|---:|---:|---:|
| WebGL contexts | 1 | 1 | 1 |
| Particle points | 50k | 24k | 8k |
| Draw calls | ≤ 70 | ≤ 50 | ≤ 30 |
| Visible triangles, excluding points | ≤ 500k | ≤ 250k | ≤ 100k |
| Full-screen post-process passes | ≤ 3 | ≤ 2 | ≤ 1 |
| Estimated GPU texture/render-target memory | ≤ 256 MiB | ≤ 128 MiB | ≤ 64 MiB |
| DPR cap | 1.75 | 1.35 | 1.0 |

Any exception needs measured before/after evidence and an ADR if it changes the project-wide budget model.

## Interaction budgets

- pointer-to-visible-response target: ≤ 50 ms;
- scroll input must remain cancelable and responsive;
- no forced synchronous layout inside animation loops;
- no per-frame React render caused by pointer/scroll;
- no runtime shader compilation triggered by first hover;
- no layout shift from canvas, poster, image, or font initialization;
- route navigation must not wait for nonessential visual assets.

## Memory and lifecycle

- no monotonic growth across five route enter/leave cycles;
- no retained renderer, material, geometry, texture, render target, observer, or ticker after ownership ends;
- context loss must fall back safely and restoration must not duplicate resources;
- hidden tabs must stop or heavily throttle updates;
- development Strict Mode remount must not double-register animation callbacks.

Use renderer diagnostics plus browser memory tooling where available. Approximate GPU memory from dimensions, channels, bytes per channel, mip overhead, layers, and render-target duplication.

## Quality-tier selection

Initial conservative tier uses:

- WebGL2/extension support;
- viewport pixel count;
- DPR;
- pointer type;
- reduced-motion preference;
- optional coarse device-memory hint.

Runtime adaptation uses rolling frame measurements.

Recommended downgrade rule for the spike:

- sample after warm-up;
- downgrade if p95 exceeds 22 ms for two consecutive windows on a 60 FPS tier;
- downgrade immediately on repeated context instability;
- do not auto-upgrade again in the same page session;
- persist at most a coarse tier preference, not detailed hardware data.

## Browser matrix

Required before public release:

| Engine/state | Required |
|---|---|
| Current Chromium desktop | full enhanced path |
| Current Firefox desktop | full path or documented equivalent |
| Current WebKit desktop | full path or documented equivalent |
| iOS Safari representative device | medium/low/static as measured |
| Android Chromium representative device | medium/low/static as measured |
| `prefers-reduced-motion` | reduced/static |
| coarse pointer | art-directed non-hover behavior |
| WebGL2 unavailable/blocked | static poster |
| asset/shader failure | semantic DOM + poster |

The project supports evergreen browsers. Exact minimum versions are set after the Phase 1 compatibility spike using tested evidence, not guessed user-agent rules.

## CI gates

Phase 1 establishes:

- bundle-size report and threshold;
- Lighthouse CI on a production build;
- Playwright browser matrix;
- axe checks;
- fixed-viewport visual baselines;
- custom frame probe for deterministic lab scenes;
- scene metrics emitted as machine-readable JSON.

CI blocks:

- threshold regression;
- console/hydration/WebGL errors;
- missing fallback state;
- unexplained visual snapshot changes;
- inaccessible critical flow;
- unreviewed budget waiver.

## Measurement report

Every graphics or motion PR reports:

```text
Build/commit:
Browser and version:
OS/device:
Viewport and DPR:
Quality tier:
Scene/state:
Sample duration:
Frame p50 / p95 / worst:
Draw calls:
Points / triangles:
Render targets:
Estimated GPU memory:
Transferred bytes:
LCP / INP proxy / CLS:
Console errors:
Comparison baseline:
```

Claims such as “lightweight,” “optimized,” or “60 FPS” are invalid without the report.
