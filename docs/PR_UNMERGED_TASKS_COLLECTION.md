# PR triage: remaining/unmerged task collection

Date: 2026-02-25 05:36 UTC
Prepared for: resolving non-merging PRs and planning the next Codex task.

## 1) Scope and method
Given this local clone currently has only branch `work` (no local `main` or remote PR refs), direct PR-to-main diffing was not possible locally.

This pass used:
- local merge/commit history inspection,
- codebase structure inspection,
- fresh command verification (`npm run build`, `npm run audit:prod`, `npm audit`).

## 2) Current status matrix

| Workstream | Status | Evidence | Notes |
|---|---|---|---|
| App modular refactor (theme/primitives/hook/pdf split) | ✅ done | files present in `src/components`, `src/hooks`, `src/lib` | `src/App.jsx` still large but reduced from earlier 1000+ baseline. |
| Netlify deployment setup/docs | ✅ done | `netlify.toml`, README deploy sections, deploy docs | No new blockers found in this pass. |
| Production dependency posture | ✅ done | `npm run audit:prod` -> 0 vulnerabilities | Suitable for current release posture. |
| Dev-toolchain security upgrade (Vite/esbuild major) | ⏳ pending | `npm audit` still reports moderate advisory | Needs dedicated breaking-change PR. |
| Automated tests for critical flows | ⏳ pending | no test framework/scripts in `package.json` | Recommended before or alongside major upgrades. |
| UX/a11y error handling improvements (`alert` replacement) | ⏳ pending | existing recommendation only | Optional but valuable quality follow-up. |

## 3) Findings
1. Prior completed workstreams are still present in code/docs and remain valid.
2. The previously identified open security follow-up is still the primary unresolved task.
3. There is now clearer evidence that production runtime risk is low while development-tooling risk remains moderate and isolated.

## 4) Remaining task backlog (prioritized)

### High priority
1. **Dedicated Vite/esbuild major-upgrade PR**
   - Required to resolve current `npm audit` findings.
   - Done criteria:
     - dependency upgrade committed,
     - `npm run build` passes,
     - `npm run audit:prod` passes,
     - `npm audit` re-checked and documented,
     - manual smoke for navigation + PDF export.

### Medium priority
2. **Add lightweight automated tests**
   - Suggested minimum scope:
     - navigation index boundaries,
     - local image file guardrails,
     - PDF export guard behavior.

### Optional quality follow-up
3. **Replace alert-based errors with inline notification/toast UX**
   - Improves accessibility and user clarity.

## 5) Suggested next Codex task text (copy/paste)
"Create a focused PR that upgrades Vite/esbuild (major if needed), runs `npm run build`, `npm run audit:prod`, and `npm audit`, then documents any remaining advisories and confirms slide navigation + PDF export still work. Keep scope limited to dependency/security upgrade and minimal compatibility fixes."

## 6) Practical note about main-branch comparison
When GitHub refs are available, run:

```bash
git fetch origin
git log --oneline origin/main..origin/<pr-branch>
git log --oneline origin/<pr-branch>..origin/main
```

Interpretation:
- If both ranges are empty (or PR commits already in main), close PR as already integrated.
- If unique commits remain in PR, retain/refresh that PR or migrate to a new focused branch.
