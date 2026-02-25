# Bugfix report: save/upload/export progress + image layout optimization

## Scope
- Investigated save failures after image upload.
- Added progress indicators for save and PDF export.
- Improved image layout controls to better use available area in both UI and exported PDF.
- Evaluated persistence strategy relevant for web/PWA/mobile install mode.

## Root cause findings
1. The app stored the whole deck (including base64 images) only in `localStorage`.
2. `localStorage` has low quota and fails quickly when several/larger images are uploaded.
3. Save path had no `try/catch` and no fallback storage strategy, so save could silently fail from user perspective.

## Implemented fixes
### Storage reliability
- Introduced dual storage strategy:
  - Primary: `localStorage`.
  - Automatic fallback: `IndexedDB` when `localStorage` write throws (quota overflow).
- Added storage metadata key to know where the latest deck is stored.
- `loadDeckFromStorage` now supports both stores and prefers local when available.
- `clearDeckStorage` now clears both local and IndexedDB records.

### Save progress and status
- `saveDeckToStorage` now supports progress callback.
- UI now shows save progress bar and active storage backend label.
- Save error state is surfaced (`Sparfel`) instead of silent failure.

### Export progress
- PDF export now accepts progress callback and updates per slide.
- UI now shows export progress bar while export is active.

### Layout optimization for images
- Added per-image-block fit mode:
  - `contain` (show whole image)
  - `cover` (fill area)
- Adjusted image container aspect profile based on fit mode for better page-space usage and more aesthetic results in UI/PDF export.

## Validation summary
- Production build completes successfully.
- Visual validation screenshot captured for updated UI.

## Recommended next actions
1. Add cloud sync endpoint (user-authenticated) for true cross-device web/mobile synchronization.
2. Add conflict/version handling for simultaneous edits between devices.
3. Add import batching UX (drag/drop + queue progress + image compression).
4. Add telemetry for save failures (quota hit rates, export timings).
5. Add automated E2E regression covering: upload -> save -> reload -> export.

## Deployment
- Code is ready for normal CI/CD deployment pipeline.
- If using Netlify hooks, trigger production deployment only after branch review approval.
