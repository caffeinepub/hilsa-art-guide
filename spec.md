# Specification

## Summary
**Goal:** Fix the upload flow so that the job ID is correctly passed to the Results page after a successful image upload, and add a defensive error state to the Results page when no job ID is present.

**Planned changes:**
- Fix the `UploadInterface` component to correctly extract the job ID from the backend response and navigate to `/results/<jobId>` with a valid, non-empty job ID.
- Show an error toast in the upload flow if job creation fails or returns no ID, and prevent navigation in that case.
- Add a defensive check in the Results page component so that if the job ID route parameter is missing or empty, a clear error message is displayed with a link back to the Home page.

**User-visible outcome:** After uploading an image, the user is correctly taken to the Results page for their job. If no job ID is available, the Results page shows a friendly error message with a link home instead of crashing or silently failing.
