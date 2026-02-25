# Netlify setup notes (extracted from previous deploy log)

This document captures useful setup values from your previous Netlify deploy and maps them to this repo.

## Extracted values from prior deploy
- Team queue URL: `https://app.netlify.com/teams/followthecipherofficial/builds`
- Build image: `noble-new-builds`
- Node used by Netlify: `v22.22.0` (npm `10.9.4`)
- Build command executed: `npm run build`
- Detected framework: `vite@5.4.21`
- Deploy context in sample: `deploy-preview`
- Result: successful build + site live

## How this maps to current repo
- Keep Node major on `22` for parity with CI and prior successful deploy.
- Keep build command `npm run build`.
- Publish output should be `dist` (Vite static build output).
- SPA fallback redirect should route all paths to `/index.html`.

## Configuration source of truth in this repo
- `netlify.toml` defines:
  - `[build] command = "npm run build"`
  - `[build] publish = "dist"`
  - `[build.environment] NODE_VERSION = "22"`
  - SPA redirect `/* -> /index.html`

## Post-deploy validation checklist
1. Open deploy URL and verify `/` loads.
2. Navigate between slides with buttons and arrow keys.
3. Upload image and confirm preview appears.
4. Export PDF and confirm file downloads and opens.
5. Verify direct URL access to non-root paths still resolves (SPA redirect).
