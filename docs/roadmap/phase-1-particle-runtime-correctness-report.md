# Phase 1 — Particle Runtime Correctness & Reduced Motion Hardening Report

**Branch:** `fix/particle-runtime-correctness`  
**Phase:** Phase 1 — Visual Technology Spike (Runtime Correctness & Lifecycle Hardening)  
**Status:** **ACCEPTED & READY FOR REVIEW**

---

## 1. Executive Summary

This engineering report documents the implementation and validation of **PR 6 (`fix/particle-runtime-correctness`)**, addressing the findings of the Phase 1 Visual Spike audit:

1. **Restoration of Strict Reduced Motion on Public Routes:**
   - Public homepage (`/`) completely ignores URL query parameters (`?tier=`, `?motion=`) and global preview overrides.
   - `prefers-reduced-motion: reduce` unconditionally forces `tier: "static"`, zero WebGL snow canvas, and zero DOM parallax transforms on `/`.
   - Laboratory preview overrides (`?motion=full-preview`, `?tier=medium`) are strictly route-scoped to `/lab/visual-system` and automatically reset upon route unmount.
2. **WebGL2 Capability Negotiation:**
   - Introduced typed capability negotiation on the existing WebGL2 context (`negotiateParticleCapabilities`) without creating second test canvases.
   - Dynamically selects floating-point or half-float render target textures (`FloatType` / `HalfFloatType`) with MRT and vertex texture fetch support.
3. **True Stateful Velocity Ping-Pong FBO Physics Engine:**
   - Double-buffers both Position and Velocity independently across 4 FBO render targets (`targetPosA`/`targetPosB` and `targetVelA`/`targetVelB`).
   - Implemented dedicated velocity acceleration computation (`velocity.frag.ts`) preserving authentic physical momentum, mass, inertia, and aerodynamic damping across frames (`vel_new = (vel_prev + forces * dt) * damping`).
   - Position pass (`simulation.frag.ts`) integrates stateful velocity with soft boundary containment.
4. **First-Frame Lifecycle & Hidden-Tab Pause:**
   - `AtmosphereScene` and `SnowScene` commit readiness (`recordFirstFrame()`) strictly after the first visible frame has rendered, preventing early poster removal before WebGL shaders compile.
   - Automatically pauses GPU simulation compute steps when `document.hidden` is active.
5. **Enhanced WebGL Path CI Evidence:**
   - Added automated Chromium E2E verification targeting `/lab/visual-system?tier=medium&motion=full-preview`.
   - Validates `canvasCount === 1`, `runtimeStatus === "ready"`, `firstFrameCommitted === true`, `points === 24,000`, `textures === 4`, and `drawCalls === 1` with 0 console errors.

---

## 2. Technical Architecture Details

### A. Dual-Pass Ping-Pong FBO Pipeline

```text
┌─────────────────────────────────────────────────────────────┐
│                       GpuParticleSimulator                  │
│                                                             │
│   [Pass 1: Velocity Pass (velocity.frag.ts)]                │
│   Inputs:  readTargetPos.texture + readTargetVel.texture    │
│   Forces:  3D Curl Noise + Harmonic Magnetic + Cursor Vortex│
│   Output:  writeTargetVel (vec4(vel_new.xyz, age))          │
│                                                             │
│   [Pass 2: Position Pass (simulation.frag.ts)]              │
│   Inputs:  readTargetPos.texture + writeTargetVel.texture   │
│   Physics: pos_new = pos_prev + vel_new * dt * 60.0         │
│   Output:  writeTargetPos (vec4(pos_new.xyz, energy))       │
│                                                             │
│   [Ping-Pong Swap]                                          │
│   readTargetVel <-> writeTargetVel                          │
│   readTargetPos <-> writeTargetPos                          │
└─────────────────────────────────────────────────────────────┘
```

### B. Quality Tier Budgets & Resource Disposal

| Quality Tier | Particle Count | Texture Dimensions | Targets Allocated | Target Precision | Memory Cleanup |
|---|---|---|---|---|---|
| **High** | 50,176 | 224 × 224 | 4 FBO targets | RGBA Float32 | Deterministic in `dispose()` |
| **Medium** | 24,000 | 160 × 150 | 4 FBO targets | RGBA Float32 / HalfFloat | Deterministic in `dispose()` |
| **Low** | 8,064 | 96 × 84 | 4 FBO targets | RGBA Float32 / HalfFloat | Deterministic in `dispose()` |
| **Static** | 0 | N/A | 0 FBO targets | N/A | Immediate fallback |

---

## 3. Verification & Acceptance Evidence

| Suite / Gate | Target | Result | Evidence |
|---|---|---|---|
| **Format Check** | Prettier | `PASS` | All matched files use Prettier style |
| **Linting** | ESLint Strict | `PASS` | 0 errors, 0 warnings |
| **Typecheck** | TypeScript 6 Strict | `PASS` | 0 type errors |
| **Unit Tests** | Vitest (6 suites) | `PASS` | 29/29 tests passed |
| **Production Build** | Next.js App Router | `PASS` | Static prerendering succeeded |
| **Chromium E2E** | Playwright (19 tests) | `PASS` | Enhanced WebGL path + Reduced motion |
| **Firefox E2E** | Playwright (19 tests) | `PASS` | All functional, a11y & smoke tests |
| **WebKit E2E** | Playwright (19 tests) | `PASS` | All functional, a11y & smoke tests |
