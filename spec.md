# Specification

## Summary
**Goal:** Fix all TypeScript/React and Motoko compilation errors in Version 36 so the application builds and runs without errors.

**Planned changes:**
- Fix all TypeScript/React compilation errors, type mismatches, missing imports, and undefined references across all frontend pages and hooks
- Fix all Motoko compilation errors and logic errors in the backend actor (backend/main.mo)
- Resolve any API mismatches between backend endpoints and frontend query/mutation hooks in useQueries.ts
- Fix GalleryView component to correctly handle both client-side canvas-generated and backend-provided stage images without errors
- Ensure download functionality works correctly for all four sketch stages in GalleryView
- Fix the HowItWorks page 2x2 grid to correctly render all four pencil sketch stage images with Roman numeral overlays and descriptive labels
- Bump version to 36

**User-visible outcome:** The application builds and runs without compilation or runtime errors; all pages (Home, HowItWorks, Docs, Contact, Results) render correctly, the gallery displays all four sketch stages, and downloads work as expected.
