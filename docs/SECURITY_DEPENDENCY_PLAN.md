# Security dependency follow-up plan

## Current finding
- `npm audit --omit=dev` is currently clean (`found 0 vulnerabilities`).
- `npm audit` (including dev dependencies) reports moderate vulnerabilities in the Vite/esbuild development chain.

Advisory example:
- esbuild dev-server request vulnerability: GHSA-67mh-4wv8-2f99.

## Why this is not auto-fixed immediately
`npm audit fix --force` proposes upgrading Vite to a newer major version.
That can affect local development behavior and plugin compatibility, so it should be handled in a dedicated upgrade PR.

## Action plan
1. Create a dedicated upgrade PR for Vite/esbuild major update.
2. Validate local development and build behavior after upgrade:
   - `npm run dev` works locally,
   - `npm run build` output is valid,
   - SPA routing still works in target hosting environment.
3. Regression-check PDF export workflow before and after dependency update.
4. If successful, merge upgrade and re-run:
   - `npm audit`
   - `npm audit --omit=dev`

## Owner checklist
- [ ] Run `npm audit --omit=dev` on default branch weekly.
- [ ] Track `npm audit` for development tooling risks.
- [ ] Keep lockfile updated in dependency PRs.
- [ ] Treat critical findings as release-blocking unless explicitly risk-accepted.
