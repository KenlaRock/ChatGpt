# Deploy Status Report

Date: 2026-02-25 05:36 UTC  
Environment: Netlify deploy preview  
Target URLs:  
- https://deploy-preview-85--av-stb.netlify.app/  
- https://deploy-preview-85--storyboard-app.netlify.app/

## Executive status
Deployment readiness remains **GREEN** based on local build checks, production dependency audit checks, and explicit deployed-site availability/routing/UI-asset smoke checks on the active Netlify previews.

## What was re-verified in this pass
- Production build integrity.
- Production dependency vulnerability posture.
- Deployed-site availability and route handling on active Netlify preview targets.
- Deployed UI bundle availability (entry HTML + JS asset fetch).
- Alignment between documented deployment assumptions and current repository configuration.

## Verification evidence

### 1) Build
Command:
```bash
npm run build
```
Result:
- Passed (`vite build` completed successfully).
- Dist artifacts were generated as expected.

### 2) Production dependency audit
Command:
```bash
npm run audit:prod
```
Result:
- Passed (`found 0 vulnerabilities`).

### 3) Full dependency audit (informational)
Command:
```bash
npm audit
```
Result:
- Fails with known dev-toolchain advisories (`esbuild` via `vite`), severity **moderate**.
- Remediation still requires a breaking major upgrade path (`npm audit fix --force` proposes `vite@7.x`).

### 4) Deployed-site availability and routing checks (Netlify previews)
Commands:
```bash
curl -sS -o /tmp/av_root.html -w '%{http_code}' https://deploy-preview-85--av-stb.netlify.app/
curl -sS -o /tmp/av_route.html -w '%{http_code}' https://deploy-preview-85--av-stb.netlify.app/boards
curl -sS -o /tmp/stb_root.html -w '%{http_code}' https://deploy-preview-85--storyboard-app.netlify.app/
curl -sS -o /tmp/stb_route.html -w '%{http_code}' https://deploy-preview-85--storyboard-app.netlify.app/boards
```
Results:
- All endpoint checks returned `200`.
- Route checks on `/boards` returned HTML successfully on both deploy previews, confirming runtime availability with SPA route handling.

### 5) Deployed UI asset smoke checks (JS bundle reachability)
Commands:
```bash
curl -sS -o /tmp/av_asset.js -w '%{http_code}' https://deploy-preview-85--av-stb.netlify.app/assets/index-DpFB3I7x.js
curl -sS -o /tmp/stb_asset.js -w '%{http_code}' https://deploy-preview-85--storyboard-app.netlify.app/assets/index-DpFB3I7x.js
```
Results:
- Both JS asset fetches returned `200`.
- Bundle payload was non-empty on both previews (~286 KB), supporting UI bootstrapping availability.

## Findings and implications
1. **Runtime/deploy risk is low** for current production dependencies and active preview deployments.
2. **Development toolchain risk remains tracked** and should be handled in a dedicated dependency PR.
3. Repeated npm warning detected during command execution:
   - `npm warn Unknown env config "http-proxy"`
   - Not currently blocking, but should be cleaned up in CI/local shell configuration to avoid future npm behavior changes.

## Remaining tasks
- [ ] Execute dedicated Vite/esbuild major-upgrade PR with compatibility validation.
- [ ] Re-run and document `npm audit` after upgrade.
- [ ] Add a lightweight automated smoke check for key runtime flows (navigation + PDF export guard path).

## Suggested next actions
1. Open a focused upgrade branch only for Vite/esbuild chain updates.
2. Validate: `npm run build`, `npm run audit:prod`, and manual app smoke.
3. If all checks pass, merge and refresh this deploy report with post-upgrade audit results.
