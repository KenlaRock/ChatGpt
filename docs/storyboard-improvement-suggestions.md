# Storyboard Improvement Suggestions — 2025-02-14

## 1. Restore offline parity for the sandbox index
- `index.html` currently depends on CDN-hosted jsPDF and two `/_sdk/...` scripts that are not tracked in the repository, which breaks the offline promise described in the README and causes 404s when the page is opened from `file://`.【F:index.html†L8-L35】
- Bundle the SDK helpers inside the repo (for example under `apps/storyboard/dist/vendor/`) and inline or locally host jsPDF so that the sandbox remains functional without network access.
- Mirror the packaging approach used by `apps/storyboard/dist/app.html` by documenting the offline assets in `docs/` and adding a regression check that fails when the sandbox references external URLs.

## 2. Expand automated coverage beyond the sanity test
- The Jest suite only asserts `true === true`, offering no protection for the storyboard UI, packaging scripts, or Netlify helper CLI.【F:tests/app.test.js†L1-L3】
- Add smoke tests that load `app.html` via JSDOM to validate critical UI flows (export buttons, IndexedDB fallbacks) and unit tests for the dataset converters. Complement them with CLI tests (mocking `fetch`) so failures in `tools/netlify/trigger.js` surface in CI.

## 3. Harden the packaging workflow
- `npm run build` shells out to `zip` without verifying that the binary exists, that all expected assets are present, or that the archive contents remain consistent over time.【F:package.json†L5-L13】
- Replace the shell command with a Node-based packager (e.g., `archiver`) that can perform file existence checks, emit deterministic archives, and surface actionable errors inside Jest.
- Add a checksum or manifest validation step that runs in CI to ensure `app.html`, documentation, and new assets stay synchronised.

## 4. Externalise Netlify hook configuration
- The Netlify trigger helper ships hard-coded hook URLs, which complicates testing and risks accidental commits of sensitive endpoints.【F:tools/netlify/trigger.js†L6-L98】
- Read hook URLs from environment variables (with friendly error messages) and provide a `.env.sample` so contributors can configure local values. Add unit tests that assert the CLI exits when configuration is missing, and document the setup in `docs/`.
