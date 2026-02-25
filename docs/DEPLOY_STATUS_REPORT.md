# Deploy Status Report

Date: 2026-02-25 07:01 UTC  
Environment: Local verification + active Netlify production URL checks  
Target URL:  
- https://northstarrising.netlify.app/

## Executive status
Deployment readiness is **GREEN** based on passing local build/audit checks, validated SPA route behavior on the live Netlify URL, and explicit Netlify config hardening for Node runtime consistency.

## What was verified in this pass
- Production build integrity.
- Production and full dependency vulnerability posture.
- Live site availability + SPA route handling on production URL.
- Live JS bundle fetchability.
- Deployment-config alignment (`netlify.toml`) including explicit Node version pinning.

## Verification evidence

### 1) Build
Command:
```bash
npm run build
```
Result:
- Passed (`vite build` completed successfully).
- Dist artifacts generated as expected.

### 2) Production dependency audit
Command:
```bash
npm run audit:prod
```
Result:
- Passed (`found 0 vulnerabilities`).

### 3) Full dependency audit
Command:
```bash
npm audit
```
Result:
- Passed (`found 0 vulnerabilities`).
- No currently reported dependency advisories in either prod or dev trees.

### 4) Live site availability + route handling (production)
Commands:
```bash
curl -sS -o /tmp/site_root.html -w '%{http_code}' https://northstarrising.netlify.app/
curl -sS -o /tmp/site_route.html -w '%{http_code}' https://northstarrising.netlify.app/boards
```
Results:
- Both checks returned `200`.
- `/boards` route served HTML successfully, confirming SPA rewrite/routing behavior.

### 5) Live JS bundle reachability
Commands:
```bash
ROOT_ASSET=$(rg -o 'assets/index-[^" ]+\.js' -m 1 /tmp/site_root.html)
curl -sS -o /tmp/site_asset.js -w '%{http_code}' "https://northstarrising.netlify.app/${ROOT_ASSET}"
wc -c /tmp/site_asset.js
```
Results:
- Bundle fetch returned `200`.
- Bundle payload is non-empty (`286641` bytes), confirming frontend asset availability.

## Configuration improvements made
1. Added explicit Node runtime pinning in Netlify config:
   - `NODE_VERSION = "22"` under `[build.environment]` in `netlify.toml`.
2. This reduces environment drift risk between CI/local/Netlify and aligns with documented deployment guidance.

## Findings and implications
1. **Runtime/deploy risk is low** under current dependency and config state.
2. **Audit risk is currently cleared** for both production and development dependency trees.
3. Repeated npm warning remains visible during npm commands:
   - `npm warn Unknown env config "http-proxy"`
   - Not build-blocking, but shell/CI npm config cleanup is still recommended.

## Remaining tasks
- [ ] Remove or correct invalid npm config key `http-proxy` in execution environments.
- [ ] Add a lightweight automated smoke check for slide navigation and PDF-export guard flow.

## Suggested next actions
1. Clean npm config in CI/dev environments to remove `http-proxy` warning noise.
2. Keep `npm run build` + `npm run audit:prod` in CI as release gates.
3. Add optional post-deploy smoke script (`/` + key route + bundle fetch) for continuous deploy confidence.

---

## Update: 2026-02-25 (CI/dev npm config + automated smoke + UX verification)

### Changes implemented
1. Invalid npm env key mitigation landed:
   - Added `scripts/normalize-npm-env.sh` to remove `npm_config_http-proxy` and map standard proxy vars to npm-compatible keys.
   - Wired into GitHub CI and Netlify build command.
2. Automated production smoke checks added:
   - Added `scripts/post-deploy-smoke.mjs` to verify `/`, `/boards`, and active bundle fetch.
   - Added `.github/workflows/post-deploy-smoke.yml` with `workflow_dispatch` + 30-minute schedule.
3. Documentation updated:
   - README now documents smoke-check command and npm env normalization guard.

### Verification run summary
- Local build: passed.
- Production smoke check (`https://northstarrising.netlify.app`): passed (root + key route + bundle fetch).
- Manual browser pass (local app):
  - Layout/design renders correctly.
  - Open/import image flow works via upload input.
  - Export function triggers PDF generation flow without runtime errors.

### Mobile optimization and app install recommendation
A phased implementation plan is documented in `docs/MOBILE_PWA_NOTIFICATION_PLAN.md`, covering:
- Mobile-first responsive hardening.
- PWA installability (manifest + service worker + install prompt UX).
- Web push phased rollout.

To install the app from the website on phones (recommended approach):
1. Implement PWA manifest + service worker (Phase 2).
2. Expose an in-app install CTA via `beforeinstallprompt` where available.
3. Add iOS Safari instructions (`Share` → `Add to Home Screen`) as fallback guidance.

### Updated remaining tasks
- [ ] Implement full PWA assets/manifests/service worker and ship install UX.
- [ ] Add persistent telemetry/alerting for smoke-check failures (Slack/email/webhook).



## Update: 2026-02-25 (layout fixes + PWA installability + alerting)

### Inline feedback addressed
1. **Layout/design cleanup (mobile + compact widths):**
   - Slide grid now collapses to a single column on compact viewports.
   - Pill blocks and header action regions now wrap correctly to prevent overlap/misalignment.
   - Action controls use touch-friendly heights and improved spacing.
2. **Phone installability completed:**
   - Added `public/manifest.webmanifest`, app icons, and `public/sw.js`.
   - Added service worker registration in `src/main.jsx` (production only).
   - Added in-app install CTA (`beforeinstallprompt`) and iOS fallback install guidance.
3. **Smoke-check alerting added:**
   - `post-deploy-smoke.yml` now posts to `SMOKE_ALERT_WEBHOOK_URL` on failure.
   - Includes fallback log guidance when webhook secret is not configured.

### Current status
- CI build gate remains active.
- Scheduled post-deploy smoke workflow remains active.
- Production smoke checks remain in place for `/`, `/boards`, and bundle fetch.


## Update: 2026-02-25 (Netlify project rename incident response)

### What failed
- New canonical site URL (`https://northstarrising.netlify.app`) returned `503` with body:
  - `{"error":"usage_exceeded","message":"Usage exceeded"}`
- Legacy site URL (`https://av-stb.netlify.app`) returned `404`.
- Previously committed build hook URL returned `Not Found`.

### Troubleshooting conclusion
The project rename/site migration changed operational Netlify identifiers (site/hook linkage), and the prior hard-coded hook IDs are no longer valid for this repo workflow.

### Fixes applied in repo
1. Updated documented canonical URL references to `https://northstarrising.netlify.app`.
2. Replaced hard-coded Netlify hook URLs in npm scripts with env-driven hook execution:
   - `scripts/netlify-hook-trigger.mjs`
   - `NETLIFY_BUILD_HOOK_PRIMARY`
   - `NETLIFY_BUILD_HOOK_SECONDARY`
   - `NETLIFY_PREVIEW_SERVER_HOOK`
3. Improved smoke diagnostics:
   - `scripts/post-deploy-smoke.mjs` now surfaces a specific message for Netlify `usage_exceeded` responses.
4. Updated scheduled smoke workflow base URL to `https://northstarrising.netlify.app`.

### Required Netlify-side follow-up
- Regenerate build hooks in Netlify for the renamed project and store them as CI/repo secrets/environment variables.
- Resolve Netlify usage quota overage before expecting `200` responses from the new site URL.

## Update: 2026-02-25 (hook validation with provided replacements)

### Validation executed
Using the newly provided Netlify hook endpoints, repository scripts were executed:
- `npm run netlify:build:primary`
- `npm run netlify:build:secondary`
- `npm run netlify:preview:start`
- `npm run netlify:preview:start:secondary`

### Outcome
- All four hook calls currently return final `HTTP 404 Not Found` from Netlify.
- Hook trigger parser now correctly reads the final HTTP status from curl output and fails if non-2xx.
- This fixes the prior false-positive behavior where proxy header lines could make an invalid hook appear successful.

### Required follow-up
- Recreate/verify hook URLs in Netlify Site settings (`Build & deploy`), then update scripts/env overrides accordingly.
- Re-run the four hook commands until each returns 2xx.

## Update: 2026-02-25 (deploy + preview + badge + naming/relation verification)

### Verification commands executed
```bash
npm run build
npm run smoke:postdeploy -- https://northstarrising.netlify.app
npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
npm run netlify:preview:start:secondary
curl -sS -o /tmp/netlify_badge.svg -w '%{http_code}' https://api.netlify.com/api/v1/badges/679b85e1-7631-44b3-a3af-72d258120832/deploy-status
curl -sS -o /tmp/netlify_deploys.html -w '%{http_code}' https://app.netlify.com/projects/northstarrising/deploys
```

### Results
- Local production build completed successfully.
- Production smoke check passed (`/`, `/boards`, active JS bundle all returned `200`).
- Netlify hook trigger verification passed for all configured relations:
  - `primary` build hook -> `200`
  - `secondary` build hook -> `200`
  - `preview` server hook -> `200`
  - `preview:secondary` server hook -> `200`
- Netlify deploy badge endpoint returned `200` and served SVG content.
- Netlify deploy status page URL returned `200`.

### Naming + relation integrity checks
- Canonical site remains `northstarrising` across:
  - Production URL: `https://northstarrising.netlify.app`
  - Netlify deploy page path: `/projects/northstarrising/deploys`
- Badge/site relation is consistent:
  - Badge UUID `679b85e1-7631-44b3-a3af-72d258120832` is used in README badge URL.
  - The same UUID is used in the HUD debug query (`?netlify_hud=...`) in `docs/NETLIFY_ACCESS.md`.
- Hook relation map remains consistent with script labels and env keys:
  - `NETLIFY_BUILD_HOOK_PRIMARY` -> primary build
  - `NETLIFY_BUILD_HOOK_SECONDARY` -> secondary build
  - `NETLIFY_PREVIEW_SERVER_HOOK` -> primary preview
  - `NETLIFY_PREVIEW_SERVER_HOOK_SECONDARY` -> secondary preview

### Current status
Deployment, preview triggering, badge availability, and Netlify naming/relations are **GREEN** as of `2026-02-25 16:08 UTC`.
