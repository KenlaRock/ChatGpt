# Security dependency follow-up plan

Date: 2026-02-25 06:05 UTC

## Current status after upgrade
- `npm run audit:prod` is clean (`found 0 vulnerabilities`).
- `npm audit` (including dev dependencies) is clean (`found 0 vulnerabilities`).
- Vite/esbuild dev-toolchain path is upgraded to a non-vulnerable route:
  - `vite@7.3.1`
  - `esbuild@0.27.3` (transitive via Vite)

## What changed in the security upgrade
1. Upgraded Vite and React plugin to current compatible majors for the security fix path.
2. Regenerated lockfile with `npm ci`.
3. Re-validated local behavior and production build output.
4. Re-ran security checks:
   - `npm run audit:prod`
   - `npm audit`

## Remaining advisories
- None reported at time of validation.

## Risk / rollback note
- Scope is intentionally limited to dev-toolchain dependency updates and lockfile refresh.
- If a regression appears in local development, rollback by reverting the dependency-upgrade commit and re-running:
  - `npm ci`
  - `npm run build`
  - `npm audit`

## Owner checklist
- [ ] Run `npm audit --omit=dev` on default branch weekly.
- [ ] Track `npm audit` for development tooling risks.
- [x] Keep lockfile updated in dependency PRs.
- [ ] Treat critical findings as release-blocking unless explicitly risk-accepted.
