# Specification

## Summary
**Goal:** Update the pencil sketch processing pipeline and UI theme to match the HILSA-ART reference style, with progressive deep-shading stages and a dark gold-accented interface.

**Planned changes:**
- Update `pencilSketchUtils.ts` so Stage 1 produces clean, thin graphite-grey outlines on a pure white background with no shading or fill
- Make each subsequent stage (2–5) progressively add deeper, denser shading using directional hatching and cross-hatching strokes
- Stage 5 must produce rich near-black shadow regions while preserving bright white highlights, matching traditional pencil drawing appearance
- Update the app-wide color theme to a deep near-black background (`#1a1a1a` or similar) across all pages (Header, Footer, GalleryView, Home, Results, HowItWorks)
- Style the Header so "HILSA-" appears in white and "ART" appears in gold/amber, with active nav links in gold/amber
- Style sketch stage cards with a dark container background, stage number label in gold/amber, and stage title in white
- Update the Footer to match the reference: dark background, centered HILSA-ART branding with gold accent, grey nav links, and copyright line

**User-visible outcome:** Users see a fully themed dark-mode HILSA-ART app with gold accents, and uploaded portrait photos are processed into 5 progressively shaded pencil sketch stages — from clean outline to rich, high-contrast charcoal-style drawing.
