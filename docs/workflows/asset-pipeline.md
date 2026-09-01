# Asset production pipeline

- **Status:** Accepted
- **Decision date:** 2026-09-01

## Objectives

- preserve high visual quality;
- keep provenance and licensing explicit;
- produce reproducible optimized assets;
- avoid unnecessary real-time geometry;
- prevent color, alpha, and normal-map mistakes;
- support quality tiers and static fallbacks.

## Planned directories

```text
assets/
  source/                 Authoring sources; Git LFS or approved external storage
  intermediate/           Local/generated; ignored
  manifests/              Source-controlled asset metadata
public/
  assets/
    models/               Optimized .glb
    textures/             .ktx2 and small runtime lookup data
    images/               AVIF/WebP/SVG
    posters/              Static and reduced-motion fallbacks
scripts/
  assets/                 Deterministic conversion/validation scripts
```

Do not create those directories until Phase 1 needs them, but preserve this ownership model.

## Asset classification

Choose the cheapest representation that preserves the intended effect:

| Need | Preferred form |
|---|---|
| Pointer-reactive field or simulation | WebGL shader/GPU particles |
| Object requiring camera/light/parallax changes | GLB + KTX2 |
| Highly detailed fixed-angle render with alpha | AVIF + WebP fallback |
| Scientific line/diagram with true vector value | optimized SVG |
| Ambient loop impossible to reproduce cheaply | carefully compressed video with poster |
| Long-form plot/data | semantic SVG/canvas/HTML chosen for accessibility |

Do not make a static object real-time 3D merely to advertise Three.js.

## Provenance gate

Every asset manifest records:

- `id`;
- `purpose`;
- `kind`;
- `author`;
- `source`;
- `license`;
- `sourceFiles`;
- `outputs`;
- `colorSpace`;
- `dimensions`;
- geometry statistics where applicable;
- delivered byte sizes;
- optimization tool versions and commands;
- quality-tier use;
- fallback;
- review date.

Use `docs/templates/asset-manifest.schema.json`.

Reference-site assets are never source assets.

## Blender authoring standard

Canonical version: Blender 4.5 LTS.

Before export:

- use meaningful object/material names;
- remove hidden or unused objects;
- apply scale and rotation unless animation requires otherwise;
- place origin/pivot deliberately;
- use a consistent normalized composition scale;
- triangulate deterministically where needed;
- validate normals and tangents;
- minimize material slots;
- merge geometry only when it reduces draw calls without harming culling or reuse;
- remove accidental cameras/lights unless runtime needs them;
- pack or explicitly reference textures;
- document modifiers that must remain in source;
- use supported glTF material features;
- bake procedural networks not reproducible in runtime;
- test alpha mode intentionally;
- keep non-color maps marked as data.

Scientific geometry preserves original physical units in metadata even when a normalized presentation transform is used.

## glTF export

Deliver `.glb`.

Export checklist:

- selected objects only;
- animation clips named and trimmed;
- no unused custom properties;
- normals/tangents included only when needed;
- material alpha mode explicit;
- Y-up/runtime orientation verified;
- pivot and bounding box reviewed;
- no authoring-only high-resolution textures;
- no duplicate embedded images.

Inspect the unoptimized GLB before compression.

## Geometry optimization

Default: Meshopt.

Pipeline responsibilities:

1. deduplicate/accessor cleanup;
2. prune unused data;
3. weld only when visually safe;
4. reorder/optimize mesh;
5. simplify only with approved visual tolerance;
6. Meshopt compression;
7. final structural validation.

Use glTF Transform through a pinned script, not an undocumented sequence of GUI clicks. Store exact command and version in the manifest.

Draco is not the default. It requires an ADR or asset-specific evidence demonstrating a better result after decoder and runtime costs.

## Texture pipeline

### GPU textures

Use KTX2/Basis Universal with mipmaps.

- base color/emissive: sRGB intent;
- normal/roughness/metalness/masks/data: linear/non-color;
- UASTC: normal maps, data maps, high-frequency alpha, or quality-critical material maps;
- ETC1S: suitable perceptual color maps where smaller delivery dominates;
- choose dimensions from actual on-screen texel density;
- atlas only when it reduces draw calls without wasting memory;
- avoid 4K/8K defaults.

### Transparent 2.5D images

Provide:

- AVIF with alpha where supported;
- WebP fallback;
- explicit width/height/aspect ratio;
- art-directed mobile crop if needed;
- edge test on black and raised near-black backgrounds;
- poster/static state.

Check for straight-versus-premultiplied alpha mismatch and color fringes.

### HDR/environment data

Use only when required. Prefer a small purpose-built lighting setup or compressed environment over a large generic HDRI. Record decode and GPU-memory cost.

## Scientific source visuals

Whenever possible, derive motifs from owned simulation/measurement data:

- magnetization vectors;
- skyrmion topology;
- spin-wave amplitude/phase;
- FEM/FDM meshes;
- spectra and field maps.

Record:

- source dataset;
- processing script/commit;
- normalization and colormap;
- whether the output is scientifically literal or artistically transformed.

Never imply quantitative meaning after an artistic transformation unless labels make that clear.

## Fallbacks and tiers

Each expensive asset needs:

- static poster;
- mobile crop or lower-detail version;
- low-tier texture/model variant where necessary;
- failure state;
- reduced-motion behavior.

Do not make one oversized asset serve every viewport.

## Runtime review

An asset is not accepted from Blender/render-tool screenshots alone. Validate in the actual site with:

- target camera and lighting;
- production tone mapping;
- all target backgrounds;
- desktop and mobile crop;
- resize;
- loading transition;
- WebKit/Firefox/Chromium;
- memory and draw-call report.

## Source control

- optimized runtime outputs are ordinary Git files when reasonably sized;
- large `.blend`, EXR, high-resolution source sequences, and raw datasets use Git LFS or approved external storage;
- generated intermediates are ignored;
- no binary source is added without an asset manifest;
- do not rewrite large binary history casually.

## Definition of done

An asset is complete only when provenance, reproducible output, visual runtime review, budget compliance, fallback, and manifest validation all pass.
