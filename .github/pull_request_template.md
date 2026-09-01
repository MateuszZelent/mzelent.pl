## Scope

- Goal:
- Out of scope:
- Approved specification/reference audit:
- ADRs affected:

## What changed

## Visual evidence

- [ ] Chromium 1440 × 900
- [ ] Chromium 1920 × 1080
- [ ] Firefox 1440 × 900
- [ ] WebKit 1440 × 900
- [ ] Mobile/coarse pointer 390 × 844
- [ ] Tablet/narrow 768 × 1024
- [ ] Reduced motion
- [ ] Low quality
- [ ] Static/no WebGL
- [ ] Motion recording when timing matters

Evidence links:

## Correctness and accessibility

- [ ] semantic DOM and heading order reviewed
- [ ] keyboard order and visible focus reviewed
- [ ] axe checks pass
- [ ] no essential information depends on WebGL/hover
- [ ] loading and failure states reviewed
- [ ] no console, hydration, network, or shader errors

## Performance evidence

| Metric | Baseline | This change | Budget | Result |
|---|---:|---:|---:|---|
| frame p50 | | | | |
| frame p95 | | | | |
| draw calls | | | | |
| points/triangles | | | | |
| estimated GPU memory | | | | |
| initial route JS | | | | |
| visual-engine JS | | | | |
| initial transfer | | | | |
| LCP | | | | |
| CLS | | | | |

- [ ] no per-frame React state or allocations
- [ ] resources/listeners/tickers are cleaned up
- [ ] hidden-tab and route-remount behavior tested
- [ ] asset manifests and provenance updated
- [ ] dependency/bundle changes explained

## Validation commands

```text
# Add exact commands and results.
```

## Risks and intentional deviations

## Deferred work

## Reviewer verdict

`ACCEPT | ACCEPT WITH NON-BLOCKING FOLLOW-UPS | REJECT`
