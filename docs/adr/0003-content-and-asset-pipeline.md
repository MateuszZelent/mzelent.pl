# ADR-0003: Use local typed content and a deterministic owned-asset pipeline

- **Status:** Accepted
- **Date:** 2026-09-01

## Context

The site will later include publications, grants, projects, software, talks, notes, and scientific visuals. It is owner-maintained and initially does not require a multi-editor backend. Visual quality depends on custom scientific models/renders and correct optimization.

## Decision

Content:

- local MDX for long-form narratives;
- typed TypeScript/JSON data for structured entities;
- Zod build-time validation;
- generated indexes/feeds;
- no CMS or database in the first version.

Assets:

- Blender 4.5 LTS sources;
- GLB delivery;
- Meshopt geometry compression;
- KTX2/Basis Universal textures;
- AVIF with alpha plus WebP fallback for 2.5D layers;
- glTF Transform-based deterministic optimization;
- provenance and license manifest for every production asset;
- Git LFS or approved external source for large authoring data.

## Consequences

Positive:

- content and schema changes are versioned together;
- no client CMS runtime;
- reproducible builds;
- strong control of visual fidelity, size, and licensing;
- scientific data can be traced to source.

Negative:

- content updates require Git workflow;
- asset scripting has an upfront cost;
- nontechnical editors are not supported initially;
- large source files need separate storage discipline.

## Alternatives considered

### Headless CMS

Deferred. It adds schemas, API availability, preview, authentication, and client/server integration before the editing need exists.

### Runtime GitHub/Scholar APIs

Rejected as primary content sources. External availability, rate limits, formatting, and reproducibility are unsuitable. Build-time importers may later generate reviewed local data.

### Draco as default compression

Rejected. Meshopt is the default due runtime integration and streaming characteristics. Asset-specific exceptions require evidence.

### Only real-time 3D

Rejected. Transparent raster layers can provide higher fixed-angle detail at lower runtime cost.

## Verification

Before content production:

- schemas must reject invalid entities;
- the asset manifest schema must validate;
- one GLB/KTX2 and one alpha AVIF/WebP asset must pass the pipeline;
- output must be reviewed in the actual runtime;
- source/output/provenance must be reproducible.
