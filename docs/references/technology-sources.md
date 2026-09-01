# Technology research sources

- **Research date:** 2026-09-01
- **Purpose:** trace the Phase 0 technology decisions to primary or official sources
- **Rule:** re-check versions at Phase 1, but do not change accepted major/minor lines without following `docs/architecture/version-policy.md`

## Codex project configuration

- AGENTS.md discovery and precedence: `https://learn.chatgpt.com/docs/agent-configuration/agents-md`
- Skills structure and repo location: `https://learn.chatgpt.com/docs/build-skills`
- Custom subagents: `https://learn.chatgpt.com/docs/agent-configuration/subagents`
- Browser-based frontend iteration guidance: `https://learn.chatgpt.com/use-cases/frontend-designs`

Decision impact:

- root guidance uses exact uppercase `AGENTS.md`;
- repo skills live under `.agents/skills/<name>/SKILL.md`;
- custom agents live under `.codex/agents/*.toml`;
- visual implementation requires real-browser iteration.

## Runtime and framework

- Node.js release schedule: `https://nodejs.org/en/about/previous-releases`
- Next.js 16.3 release: `https://nextjs.org/blog/next-16-3`
- Next.js releases: `https://github.com/vercel/next.js/releases`
- Next.js TypeScript CLI option: `https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli`
- React releases/package: `https://react.dev/versions` and `https://www.npmjs.com/package/react`
- TypeScript 6 release: `https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/`
- TypeScript releases: `https://github.com/microsoft/TypeScript/releases`

Decision impact:

- Node 24 LTS;
- stable Next.js 16.3 and React 19.2;
- TypeScript 6.0 for the initial production toolchain;
- TypeScript 7 remains deferred while the relevant Next integration is marked experimental.

## Package manager

- pnpm release blog: `https://pnpm.io/blog`
- pnpm 11.25: `https://pnpm.io/blog/releases/11.25`
- pnpm 12.0: `https://pnpm.io/blog/releases/12.0`
- pnpm 12.1: `https://pnpm.io/blog/releases/12.1`

Decision impact:

- pin pnpm 11.25 for the first scaffold;
- defer pnpm 12 because its Rust rewrite became stable only days before this decision;
- review after the visual spike rather than changing package-manager implementation during foundational graphics work.

## Graphics

- Three.js package: `https://www.npmjs.com/package/three`
- Three.js WebGLRenderer: `https://threejs.org/docs/#api/en/renderers/WebGLRenderer`
- Three.js WebGPURenderer: `https://threejs.org/docs/#api/en/renderers/webgpu/WebGPURenderer`
- React Three Fiber package: `https://www.npmjs.com/package/@react-three/fiber`
- React Three Fiber documentation: `https://r3f.docs.pmnd.rs/`
- React Three Fiber v10 milestone: `https://github.com/pmndrs/react-three-fiber/milestone/1`

Decision impact:

- stable R3F 9.7 + Three.js 0.185;
- WebGL2/GLSL production path;
- R3F 10/WebGPU only as an isolated later benchmark.

## Motion

- GSAP ScrollTrigger documentation: `https://gsap.com/docs/v3/Plugins/ScrollTrigger/`
- Lenis documentation/site: `https://lenis.dev/`
- Lenis repository: `https://github.com/darkroomengineering/lenis`

Decision impact:

- Lenis exclusively owns smooth scrolling;
- GSAP/ScrollTrigger exclusively owns high-level timelines and scroll linkage.

## Assets

- Blender LTS: `https://www.blender.org/download/lts/`
- Blender 4.5 release: `https://www.blender.org/download/releases/4-5/`
- glTF 2.0 specification: `https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html`
- glTF Transform CLI: `https://gltf-transform.dev/cli`
- Three.js GLTFLoader: `https://threejs.org/docs/#examples/en/loaders/GLTFLoader`
- Khronos KTX: `https://www.khronos.org/ktx/`

Decision impact:

- Blender 4.5 LTS authoring;
- GLB + Meshopt;
- KTX2/Basis Universal;
- deterministic glTF Transform pipeline.

## Reference sites

- Parallel Universe: `https://paralleluniverse.com.ua/en/`
- Torii Studio: `https://torii.studio/`

These are visual observation sources only. Do not treat their detected or presumed technology stacks as architectural requirements and do not reuse their assets or source.
