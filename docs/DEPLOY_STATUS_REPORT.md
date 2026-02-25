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
