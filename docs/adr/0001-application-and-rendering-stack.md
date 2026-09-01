# ADR-0001: Use Next.js with stable R3F/Three.js WebGL2

- **Status:** Accepted
- **Date:** 2026-09-01

## Context

The site needs semantic academic content, strong SEO, many reading-oriented routes, and a high-craft persistent visual atmosphere. The visual target includes GPU particles, transparent layers, custom shaders, parallax, and local light. The graphics boundary must be stable enough to debug across Chromium, Firefox, WebKit, desktop, and mobile.

R3F 10 and its WebGPU path are still pre-release. WebGPU is not required to reproduce the approved visual effects.

## Decision

Use:

- Next.js 16.3 App Router;
- React 19.2;
- TypeScript 6.0;
- stable `@react-three/fiber` 9.7;
- Three.js 0.185 `WebGLRenderer`;
- WebGL2 and GLSL ES 3.00;
- one dynamically imported persistent canvas;
- server-rendered semantic DOM;
- transparent 2.5D assets where real-time 3D is not justified.

WebGPU/TSL remains an isolated experiment only.

## Consequences

Positive:

- stable graphics APIs and broad browser coverage;
- React integration without putting essential content in the canvas;
- route splitting and Server Components can contain client JavaScript;
- mature GLB/KTX2 tooling;
- clear progressive enhancement and fallback.

Negative:

- WebGL2 requires explicit shader/material work;
- one canvas requires disciplined scene lifecycle and orchestration;
- Next.js is heavier than a minimal static generator;
- WebGPU-specific capabilities are deferred.

## Alternatives considered

### Astro plus React islands

Rejected for the first version. It could reduce baseline JavaScript, but the persistent R3F/DOM/scroll experience would still create a substantial React island and more integration boundaries. Reconsider only if the semantic shell fails its budget.

### Vite React SPA

Rejected. It weakens the default server-rendered content/route model and requires more bespoke SEO, metadata, and deployment work.

### Vanilla Three.js

Rejected as the primary orchestration layer. It gives maximum control but increases custom lifecycle and React/DOM integration code. Raw Three.js modules remain allowed below R3F where beneficial.

### R3F 10 + WebGPU/TSL

Rejected from production because the renderer path is pre-release. It may be benchmarked without changing the production decision.

### Spline runtime

Rejected because runtime, asset, interaction, optimization, and fallback behavior would be less explicit and less controllable.

## Verification

Phase 1 must demonstrate:

- one stable canvas;
- required particle and parallax quality;
- browser parity or documented fallback;
- passing budgets;
- no lifecycle leaks;
- static fallback;
- maintainable scene contracts.

Failure triggers a new ADR rather than silent stack substitution.
