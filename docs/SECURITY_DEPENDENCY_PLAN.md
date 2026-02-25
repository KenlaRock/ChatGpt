# Security dependency follow-up plan

## Current finding
`npm audit --omit=dev` reports vulnerabilities in a transitive chain:
- `jspdf` (<=4.1.0) depends on vulnerable `dompurify` (<3.2.4).

Advisory example:
- DOMPurify XSS advisory: GHSA-vhxf-7vqr-mrjg.

## Why this is not auto-fixed in this PR
`npm audit fix --force` proposes upgrading `jspdf` to a newer major version, which is a breaking-change risk for PDF generation behavior.

This repository currently prioritizes release stability for deck rendering/export.

## Action plan
1. Create a dedicated upgrade PR for `jspdf` major update.
2. Add regression checks for PDF export before and after upgrade:
   - multi-slide export works,
   - uploaded image still appears in PDF,
   - generated PDF opens correctly in common viewers.
3. Validate bundle size/performance impact after dependency update.
4. If successful, merge upgrade and re-run `npm audit --omit=dev`.

## Owner checklist
- [ ] Run `npm audit --omit=dev` on default branch weekly.
- [ ] Keep lockfile updated in dependency PRs.
- [ ] Treat critical findings as release-blocking unless explicitly risk-accepted.


## Execution checklist
Use `docs/SECURITY_UPGRADE_PR_CHECKLIST.md` when creating the upgrade PR.
