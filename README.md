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

## Security note
Current `npm audit --omit=dev` reports transitive vulnerabilities via `jspdf` -> `dompurify`.
A forced auto-fix requires a **major** `jspdf` upgrade, so it is handled in a dedicated follow-up track to avoid silent PDF export regressions.

See: `docs/SECURITY_DEPENDENCY_PLAN.md`.

Security helper command:
- `npm run audit:prod`

Execution checklist for the planned major upgrade:
- `docs/SECURITY_UPGRADE_PR_CHECKLIST.md`

