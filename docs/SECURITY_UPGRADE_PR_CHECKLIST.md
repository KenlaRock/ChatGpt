# Security upgrade PR checklist

Use this checklist for dependency security upgrade PRs that can affect runtime behavior.

## Scope
- [ ] Keep the PR focused on one upgrade track at a time (for example `jspdf` major only).
- [ ] Avoid unrelated refactors.

## Regression checks for PDF flow
- [ ] Export a multi-slide deck to PDF.
- [ ] Confirm uploaded key visual appears in the generated PDF.
- [ ] Open generated PDF in at least one common viewer and verify readability.

## Required commands
- [ ] `npm run build`
- [ ] `npm run audit:prod`

## PR hygiene
- [ ] Include a concise risk note and rollback plan in the PR description.
- [ ] Confirm `package-lock.json` was updated together with `package.json`.
