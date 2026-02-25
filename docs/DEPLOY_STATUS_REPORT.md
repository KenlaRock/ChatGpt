# Deploy Status Report

Date: 2026-02-25 07:01 UTC  
Environment: Local verification + active Netlify production URL checks  
Target URL:  
- https://av-stb.netlify.app/

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
curl -sS -o /tmp/site_root.html -w '%{http_code}' https://av-stb.netlify.app/
curl -sS -o /tmp/site_route.html -w '%{http_code}' https://av-stb.netlify.app/boards
```
Results:
- Both checks returned `200`.
- `/boards` route served HTML successfully, confirming SPA rewrite/routing behavior.

### 5) Live JS bundle reachability
Commands:
```bash
ROOT_ASSET=$(rg -o 'assets/index-[^" ]+\.js' -m 1 /tmp/site_root.html)
curl -sS -o /tmp/site_asset.js -w '%{http_code}' "https://av-stb.netlify.app/${ROOT_ASSET}"
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
- Production smoke check (`https://av-stb.netlify.app`): passed (root + key route + bundle fetch).
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

