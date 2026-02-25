# Security dependency follow-up plan

## Current finding (post-upgrade)
- `npm audit --omit=dev` is clean (`found 0 vulnerabilities`).
- `npm audit` (including dev dependencies) is also clean (`found 0 vulnerabilities`).

Resolved advisory path:
- esbuild dev-server request vulnerability: GHSA-67mh-4wv8-2f99.

## What changed
- Upgraded `vite` from `^5.4.0` to `^7.3.1`.
- Upgraded `@vitejs/plugin-react` from `^4.3.1` to `^5.1.4` to stay on the supported plugin path for Vite 7.
- Regenerated `package-lock.json` to pin the non-vulnerable toolchain (`esbuild@0.27.3` via Vite).

## Remaining advisories
- None currently reported by `npm audit`.

## Risk and rollback
- Primary risk: Vite major-version compatibility in local/dev workflows.
- Rollback path: revert this PR commit to restore previous `package.json` + `package-lock.json` versions, then re-run `npm ci`.

## Owner checklist
- [ ] Run `npm audit --omit=dev` on default branch weekly.
- [ ] Track `npm audit` for development tooling risks.
- [ ] Keep lockfile updated in dependency PRs.
- [ ] Treat critical findings as release-blocking unless explicitly risk-accepted.
