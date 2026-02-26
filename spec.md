# Specification

## Summary
**Goal:** Replace the five pencil sketch drawing stages with portrait-specific drawing stages across the entire app (frontend and backend), updating all labels, captions, image processing filters, and stage illustrations.

**Planned changes:**
- Update all stage labels and captions throughout the UI (GalleryView, Drawing Guide walkthrough, HowItWorks timeline) to use the new five stage names: "Trace the outlines of the portrait", "Draw the basic elements", "Have a slight shading", "Render and detail", "Polish"
- Remove all old pencil sketch stage names (Construction Lines, Contour Outline, Basic Shading, Detail Pass, Final Render, etc.) from every visible part of the UI
- Update `pencilSketchUtils.ts` to apply per-stage visual treatments: faint outline trace (Stage 1), clean basic line work (Stage 2), light shading added (Stage 3), detailed rendering and texture (Stage 4), polished refined illustration (Stage 5)
- Update backend stage identifiers and labels in `main.mo` to match the five new stage names without breaking existing CRUD or rate limiting logic
- Replace stage illustration images with new portrait-specific artwork for all five stages

**User-visible outcome:** Users see portrait-drawing-specific stage names, descriptions, and progressively styled image previews throughout the app, with each stage visually reflecting the correct portrait drawing technique.
