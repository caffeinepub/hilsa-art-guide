# Specification

## Summary
**Goal:** Enhance the HILSA Art Guide app with a step-by-step drawing guide experience that shows clearly distinct progressive pencil sketch stages, instructional captions, and a dedicated walkthrough mode.

**Planned changes:**
- Update `pencilSketchUtils.ts` so each of the 5 stages produces a visually distinct, progressive canvas output: Stage 1 (construction lines), Stage 2 (contour outlines), Stage 3 (mid-tone shading), Stage 4 (refined details/darker values), Stage 5 (fully rendered portrait with paper grain)
- Update `GalleryView` to show a numbered step label, descriptive title, and a short instructional caption beneath each stage image
- Add a progress indicator (e.g. "2 of 5") visible when navigating stages in the lightbox
- Add a "Drawing Guide" mode on the Results page showing one stage at a time with Previous/Next navigation buttons, a thumbnail strip of all 5 stages at the bottom, and an exit option to return to gallery view
- Update the HowItWorks page timeline to include a small representative preview image alongside each of the five stage entries

**User-visible outcome:** Users can open a step-by-step Drawing Guide from the Results page, walk through each of the 5 progressive pencil sketch stages one at a time with instructional captions, jump to any stage via a thumbnail strip, and see illustrative preview images for each stage on the HowItWorks page.
