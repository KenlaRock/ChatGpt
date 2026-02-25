# Deploy Status Report

Date: 2026-02-25 07:02 UTC  
Environment: Local build + Netlify production endpoint checks  
Target URLs:
- https://av-stb.netlify.app/
- https://699e5a8da7a48f000826d79c--av-stb.netlify.app/

## Executive status
Deployment readiness is **GREEN**. Build, production dependency audit, and Netlify endpoint availability checks all passed in this verification cycle.

## Verification scope completed
- Source and configuration review for deployment-critical files.
- Local clean install and production build validation.
- Production dependency vulnerability validation.
- Netlify production and deploy permalink availability checks.
- Main deployment hook trigger verification.

## Verification evidence

### 1) Dependency install (clean)
Command:
```bash
npm ci
```
Result:
- Passed.
- Lockfile-resolved install succeeded and audit baseline returned 0 vulnerabilities.

### 2) Production build integrity
Command:
```bash
npm run build
```
Result:
- Passed (`vite build` completed successfully).
- Dist assets generated successfully with expected JS/CSS bundles.

### 3) Production dependency audit
Command:
```bash
npm run audit:prod
```
Result:
- Passed (`found 0 vulnerabilities`).

### 4) Live deployment availability checks
Command:
```bash
curl -I -L --max-time 20 https://av-stb.netlify.app/
curl -I -L --max-time 20 https://699e5a8da7a48f000826d79c--av-stb.netlify.app/
```
Result:
- Passed (`HTTP/1.1 200 OK` from both endpoints).
- Confirms production and deploy permalink are currently reachable.

### 5) Main deploy hook trigger verification
Command:
```bash
curl -i -X POST -d '{}' https://api.netlify.com/build_hooks/68c5145c373799bfa07a2d69
```
Result:
- Passed (`HTTP/1.1 200 OK`).
- Netlify request id: `c2483a86-e6e7-4dba-80f2-34a73dbdc9b5`.

## Issues identified
1. Non-blocking environment warning observed during npm commands:
   - `npm warn Unknown env config "http-proxy"`
2. No functional regressions observed in build/deploy checks.

## Optimizations applied in this pass
- Pinned Netlify build runtime explicitly to Node 22 in `netlify.toml` to align with README deployment guidance and reduce environment drift risk.

## Risk assessment
- **Current deploy risk:** Low.
- **Configuration drift risk:** Reduced by explicit Node runtime pin.
- **Operational follow-up risk:** Moderate only if the `http-proxy` npm env warning is ignored across CI/user environments.

## Recommended next actions
1. Remove or correct the invalid `http-proxy` npm environment key in CI/user shell config.
2. Add a lightweight post-deploy smoke script (`curl` + critical route checks) to make this verification repeatable.
3. Keep dependency checks in release cadence using:
   - `npm ci`
   - `npm run build`
   - `npm run audit:prod`
