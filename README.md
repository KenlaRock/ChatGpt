# North Star Rising — Release Deck (React/Vite)


[![Netlify Status](https://api.netlify.com/api/v1/badges/679b85e1-7631-44b3-a3af-72d258120832/deploy-status)](https://app.netlify.com/projects/northstarrising/deploys)

## What this is
A runnable, single-page presentation app with:
- Slide navigation (buttons + arrow keys)
- Key visual upload (your 3×3 grid image)
- PDF export (A4 landscape) of the full deck including the image
- No Tailwind, and no advanced CSS color functions (avoids `oklch()` issues)

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Production dependency audit
```bash
npm run audit:prod
```

## Notes
- PDF export uses html2canvas + jsPDF.
- Upload your 3×3 image, then hit **Exportera PDF**.

## Post-deploy smoke check
Run the production smoke test locally or in CI:
```bash
npm run smoke:postdeploy -- https://northstarrising.netlify.app
```
This validates:
- `/` responds with HTML
- key route `/boards` responds with HTML
- current JS bundle is discoverable and fetchable

## npm env compatibility hygiene
If your shell/runner exports invalid dashed npm env keys (for example `npm_config_http-proxy`), run npm through the compatibility wrapper:
```bash
./scripts/normalize-npm-env.sh npm ci
./scripts/normalize-npm-env.sh npm run build
```
CI workflows and the Netlify build command already use this guard.

## PWA installability (implemented)
The app now ships with:
- `manifest.webmanifest`
- a production service worker (`/sw.js`) registration
- install CTA support via `beforeinstallprompt` (when available)
- iOS fallback guidance (`Safari -> Share -> Add to Home Screen`)

## Smoke failure alerting
The scheduled smoke workflow supports webhook alerts on failure.
Configure repository secret:
- `SMOKE_ALERT_WEBHOOK_URL` (Slack/Teams/custom webhook)

## CI
This repository includes a GitHub Actions workflow that validates every push/PR by running:
- `./scripts/normalize-npm-env.sh npm ci`
- `./scripts/normalize-npm-env.sh npm run build`

Workflow file: `.github/workflows/ci.yml`.

## Deployment plan (static hosting)
This app is a static Vite SPA and can be deployed to Netlify, Vercel, Cloudflare Pages or S3+CloudFront.

### Required build settings
- Install: `npm ci`
- Build: `npm run build`
- Publish directory: `dist`

### Recommended environments
- **staging**: auto-deploy from your integration branch
- **production**: deploy from `main` after CI is green

### Release checklist
1. CI green on latest commit.
2. Smoke test in staging (`/` renders, slide navigation works, PDF export works).
3. Promote/deploy same artifact to production.
4. Verify production smoke test.

## Netlify deployment (recommended)
1. Sign in to Netlify and choose **Add new site** → **Import an existing project**.
2. Connect your Git provider and select this repo/branch.
3. Use these settings:
   - Build command: `./scripts/normalize-npm-env.sh npm run build`
   - Publish directory: `dist`
   - Node version: `22`
4. Trigger deploy and validate `/` plus PDF export.

`netlify.toml` is included in this repo with the same build settings + SPA redirect (`/* -> /index.html`).

Helpful Netlify links:
- Netlify app dashboard: https://app.netlify.com/
- Start a Git-connected deploy: https://docs.netlify.com/site-deploys/create-deploys/#deploy-with-git
- Build settings reference: https://docs.netlify.com/configure-builds/overview/
- SPA redirect rules: https://docs.netlify.com/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps
- Custom domains: https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/


## Project Netlify endpoints
- Site URL: https://northstarrising.netlify.app
- Build hook (primary): `https://api.netlify.com/build_hooks/699f04659adb693fea055cc0`
- Build hook (secondary): `https://api.netlify.com/build_hooks/699f04869662fb3d15b13d18`
- Preview server hook (primary): `https://api.netlify.com/preview_server_hooks/699f04f7bcd708545509329f`
- Preview server hook (secondary): `https://api.netlify.com/preview_server_hooks/699f050e9adb693f160565c9`

Quick triggers (uses committed defaults but can be overridden by env vars):
```bash
export NETLIFY_BUILD_HOOK_PRIMARY='https://api.netlify.com/build_hooks/699f04659adb693fea055cc0'
export NETLIFY_BUILD_HOOK_SECONDARY='https://api.netlify.com/build_hooks/699f04869662fb3d15b13d18'
export NETLIFY_PREVIEW_SERVER_HOOK='https://api.netlify.com/preview_server_hooks/699f04f7bcd708545509329f'
export NETLIFY_PREVIEW_SERVER_HOOK_SECONDARY='https://api.netlify.com/preview_server_hooks/699f050e9adb693f160565c9'

npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
npm run netlify:preview:start:secondary
```
Current operational note: if any of these return `404 Not Found`, regenerate the hook in Netlify before retrying.

Local development note:
- Prefer `npm run dev` for day-to-day work.
- Use `npx netlify dev` only when you specifically need Netlify local emulation.

If you prefer raw curl:
```bash
curl -X POST -H 'Content-Type: application/json' -d '{}' https://api.netlify.com/preview_server_hooks/699f04f7bcd708545509329f
```

## Security note
Current `npm audit --omit=dev` is clean (`found 0 vulnerabilities`) for production dependencies.

The Vite/esbuild development toolchain has been upgraded to the non-vulnerable path (`vite@7.3.1`, `esbuild@0.27.3` via Vite), and the latest `npm audit` now reports `found 0 vulnerabilities`.
If a rollback is needed, revert this dependency-upgrade commit and re-run `npm ci`, `npm run build`, and `npm audit` before redeploying.

See: `docs/SECURITY_DEPENDENCY_PLAN.md` and `docs/SECURITY_UPGRADE_PR_CHECKLIST.md`.

## Mobile/PWA roadmap
For the structured mobile adaptation, PWA install flow, and web-push notification plan, see:
- `docs/MOBILE_PWA_NOTIFICATION_PLAN.md`

## Web app evolution plan (editable content, images, online persistence)
For a concrete phased plan to support editable text/fields, image uploads, online saving, and robust PDF export, see:
- `docs/WEBAPP_EVOLUTION_PLAN.md`


Netlify Deploy Permalink:
- Use the latest successful deploy URL from the Netlify Deploys tab for `northstarrising` (permalink changes per deploy).

## Optional server sync (web ↔ mobile)
The app now supports optional remote sync if a backend endpoint is configured:
- Set `VITE_SYNC_ENDPOINT` to your API base URL.
- Client expects REST endpoints:
  - `GET /decks/:id`
  - `PUT /decks/:id`
- Conflict handling is client-side (last-updated merge fallback) and exposes sync status in UI.

Without `VITE_SYNC_ENDPOINT`, behavior remains local-only (localStorage/IndexedDB).

## Storage/sync telemetry
The app records local telemetry counters in browser storage (quota fallback frequency, sync success/conflicts/errors) to help regression analysis.

## E2E regression (media persistence)
To run the upload → autosave → reload regression script:
```bash
npm run test:e2e:media -- http://127.0.0.1:4173
```
(Requires `playwright` and an active app instance.)
