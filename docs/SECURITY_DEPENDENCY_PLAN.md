# Security dependency follow-up plan

Date: 2026-02-25 05:36 UTC

## Current verified state

### Production dependencies
- `npm run audit:prod` → **clean** (`found 0 vulnerabilities`).

### Full dependency graph (including dev dependencies)
- `npm audit` → **2 moderate vulnerabilities**.
- Root cause: `esbuild` advisory (`GHSA-67mh-4wv8-2f99`) through current `vite` range.
- Auto-remediation path is breaking: `npm audit fix --force` proposes `vite@7.x`.

## Risk interpretation
- **Release/runtime risk:** currently low based on production audit.
- **Engineering/tooling risk:** moderate until Vite/esbuild major-upgrade path is completed and validated.

## Action plan (updated)
1. Create a dedicated Vite/esbuild major-upgrade PR (no unrelated refactors).
2. Validate compatibility post-upgrade:
   - `npm run build`
   - `npm run audit:prod`
   - `npm audit`
   - manual smoke: slide navigation, image upload, PDF export.
3. Document any residual advisories and explicit risk acceptance (if any remain).
4. Merge once checks pass and update release/deploy docs to reflect new baseline.

## Owner checklist
- [x] Re-verify production audit baseline.
- [x] Re-verify full audit baseline and capture advisory path.
- [ ] Execute dependency major-upgrade PR.
- [ ] Add post-upgrade audit evidence to docs.
- [ ] Establish recurring monthly dependency review cadence.
