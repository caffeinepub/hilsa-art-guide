# Specification

## Summary
**Goal:** Optimize the 5-stage pencil sketch pipeline for speed and visual fidelity, improve the gallery display of the 5 stages, and fix error messages on the Results page.

**Planned changes:**
- Optimize `pencilSketchUtils.ts` to share grayscale and Sobel edge detection computations across all 5 stages (run only once), reuse intermediate canvas buffers, use smaller Gaussian blur kernels for earlier stages, and skip cross-hatching/graphite shading for stages 1–2
- Stage 1 outputs very faint basic outlines (lightest strokes, nearly white); Stage 2 shows cleaner slightly darker outlines; Stage 3 adds defined facial features with medium line weight; Stage 4 introduces hair strokes and light hatching; Stage 5 is the fully detailed portrait with deep cross-hatching, graphite shading, and paper texture
- Run sketch stage computations without blocking the UI; show a progress indicator while stages are being generated
- Update `GalleryView` to display the 5 stage cards in a responsive grid (1-column on mobile with horizontal scroll, 5-column on desktop), with each card appearing as soon as its stage finishes computing (skeleton placeholder until ready), labeled "Stage 1" through "Stage 5" with a detail-level subtitle, and a per-card PNG download button
- Fix `Results.tsx` to suppress "NO JOB ID PROVIDED" and "EXPECTED V3 RESPONSE" error strings, replacing them with a friendly fallback message and a link back to the home page

**User-visible outcome:** Users see all 5 pencil sketch stages generated noticeably faster (target under 3 seconds), appearing progressively in a clean labeled grid with download buttons, and no raw error strings are ever shown on the Results page.
