# North Star Rising — Release Deck (React/Vite)

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

## CI
This repository includes a GitHub Actions workflow that validates every push/PR by running:
- `npm ci`
- `npm run build`

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
   - Build command: `npm run build`
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

## Security note
Current `npm audit --omit=dev` is clean (`found 0 vulnerabilities`) for production dependencies.

`npm audit` (including dev dependencies) currently flags moderate issues in the Vite/esbuild development toolchain.
A forced auto-fix upgrades Vite to a newer major version, so this should be validated in a dedicated dependency PR before adoption.

See: `docs/SECURITY_DEPENDENCY_PLAN.md` and `docs/SECURITY_UPGRADE_PR_CHECKLIST.md`.
## Mobil/PWA roadmap
- Se `docs/MOBILE_PWA_NOTIFICATION_PLAN.md` för stegvis plan för mobilanpassning, app-installation (PWA) och aviseringar.

