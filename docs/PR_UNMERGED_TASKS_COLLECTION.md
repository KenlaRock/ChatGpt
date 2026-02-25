# PR triage: remaining/unmerged task collection

Date: 2026-02-25
Prepared for: resolving non-merging PRs and planning the next Codex task.

## 1) What was checked
Because this local clone currently only contains branch `work` (no local `main` or remote PR refs), the comparison was done from the available merge history on `work`.

Reviewed:
- merge commits and related feature commits in `git log`
- current project docs for security/deploy follow-up
- current build/audit status guidance

## 2) Task inventory from recent PR workstreams

### Already implemented in current history (safe to treat as done if PR duplicates this)
1. App refactor into modules (theme/primitives/hook/pdf split)
   - present in commit `acabb3e`
2. Dependency/security follow-up docs and CI hygiene
   - present in commit `59e564b`
3. AI response style and PR template docs
   - present in commits `1718fbd`, `90bd111`
4. `jspdf` major upgrade + production audit script
   - present in commit `7b38db7`
5. Netlify deploy configuration and release guidance
   - present in commit `42797de`
6. Deploy verification report
   - present in commit `57b734b`

If a non-merging PR contains only these already-present changes, it is generally safe to close that PR as “already merged via other commits”.

## 3) Remaining/unmerged tasks (recommended next Codex task backlog)

### High priority
1. **Dedicated Vite/esbuild major-upgrade PR (dev toolchain security follow-up)**
   - Why still open: full `npm audit` is blocked by dev-toolchain advisories until major upgrade is validated.
   - Done criteria:
     - upgrade Vite/esbuild chain,
     - `npm run build` passes,
     - `npm run audit:prod` passes,
     - `npm audit` is re-evaluated and documented,
     - smoke test confirms app navigation + PDF export still works.

### Medium priority
2. **Add lightweight automated tests around critical flows**
   - Focus: slide navigation logic, image upload guardrails, PDF-export guard path.
   - Why: reduces risk when dependency upgrades are merged.

### Optional quality follow-up
3. **Replace alert-based error UX with inline notifications/toast**
   - Why: better accessibility and clearer user feedback.

## 4) How to close problematic PRs (beginner-safe checklist)
For each currently open/non-merging PR in GitHub:
1. Open the PR "Files changed" tab.
2. Check whether those changes already exist on the active branch (or `main`) by searching for the same files/lines or commit message.
3. If changes already exist:
   - close PR with comment: "Closing as already merged via commit(s) <sha>."
4. If PR is obsolete (approach replaced by newer implementation):
   - close PR with comment: "Closing as superseded by newer implementation in <sha/PR>."
5. If PR has unique unfinished work:
   - keep it open only if still needed, otherwise copy the unfinished part into a new focused PR/task.

## 5) Suggested next Codex task text (copy/paste)
"Create a focused PR that upgrades Vite/esbuild (major if needed), runs `npm run build`, `npm run audit:prod`, and `npm audit`, then documents any remaining advisories and confirms slide navigation + PDF export still work. Keep scope limited to dependency/security upgrade and minimal compatibility fixes."

## 6) Practical note about main-branch comparison
In this local environment, `main` and remote PR refs were not available. To do a direct branch compare in GitHub, use:

```bash
git fetch origin
git log --oneline origin/main..origin/<pr-branch>
git log --oneline origin/<pr-branch>..origin/main
```

If both ranges are empty (or PR commits are already in main), the PR can be closed as already integrated.
