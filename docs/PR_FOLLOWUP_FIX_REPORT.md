# PR follow-up fix report

Date: 2026-02-25
Branch checked: `work`

## Trigger addressed
"Check, fix and reply with fix report and/or inform me on what to do, and if i can close the pull requests that don't merge - if they are considered done or not relevant anymore."

## What was validated now
- Installed dependencies from lockfile with `npm ci`.
- Verified production build with `npm run build`.
- Verified production dependency health with `npm run audit:prod`.
- Collected full audit status with `npm audit` to evaluate pending dev-chain risks.
- Reviewed repository history and docs for already-merged work related to the review/security/deploy tracks.

## Current status
- Build is passing locally.
- Production dependency audit is clean (`0 vulnerabilities`).
- Full audit still reports 2 moderate vulnerabilities in the dev toolchain (`vite`/`esbuild`) and requires a **breaking** major upgrade path (`npm audit fix --force` proposes `vite@7`).

## Mapping for previously discussed PR tracks
The commit history indicates the key tracks have already been merged into this branch:

1. **Code-review recommendations refactor track**
   - Covered by merge `#63` and commit `acabb3e` (logic split into `theme`, primitives, hook, and PDF modules).
   - This track can be considered **done** for the original scope.

2. **Dependency security follow-up track**
   - Covered by merge `#64` and commit `59e564b` (security follow-up plan and CI-related cleanup docs).
   - Partially open by design: dev dependency major upgrade is still a separate future PR.

3. **Security upgrade execution track**
   - Covered by merge `#68` and commit `7b38db7` (`jspdf` major upgrade and `audit:prod` script).
   - This track is **done** for production-risk scope.

4. **Deploy verification track**
   - Covered by merges `#69` and `#71` plus `docs/DEPLOY_STATUS_REPORT.md`.
   - This track is **done** based on latest checks and documented smoke/build status.

## Can you close PRs that do not merge?
Use this rule:

- **Close as done (safe to close):** if the exact change is already present on `main`/active branch (squash/rebase duplicates included).
- **Close as not relevant:** if the problem statement is obsolete due to later merged work.
- **Keep open or recreate:** only if the PR still contains unique, not-yet-shipped changes.

Given the repository state, PRs corresponding to the four tracks above can be closed if they are still open and do not merge because their outcomes are already represented by merged commits.


## Immediate action plan (what you should do now)
1. **Close duplicate/stale PRs for the 4 completed tracks** if they do not merge cleanly and contain no unique commits.
   - In each PR, add a short closure note: "Closing as already delivered via merged commits on main/work branch.".
2. **Keep exactly one open technical follow-up PR** for the dev-toolchain upgrade (`vite`/`esbuild`).
3. **Create that upgrade PR in a small, controlled scope**:
   - Update Vite/esbuild path,
   - run `npm run dev`, `npm run build`, `npm audit`,
   - verify PDF export still works end-to-end.
4. **Merge only when all checks pass** and no regression is observed in slide navigation/upload/export.

### Fast triage template for each non-merging PR
- If all changes already exist in `main`/active branch: **Close as done**.
- If requirement is obsolete because newer merged work replaced it: **Close as not relevant**.
- If it has unique, unshipped value: **Rebase and keep/open a fresh PR**.

## What to do next (remaining actionable item)
1. Open a dedicated PR for Vite/esbuild major upgrade (dev chain security).
2. In that PR run and record:
   - `npm run dev` smoke check,
   - `npm run build`,
   - `npm audit`,
   - PDF export regression check.
3. Merge only if local/dev behavior is stable after the major update.
