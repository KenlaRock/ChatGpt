# NullForge Repository State

Status: **AI Gate v0.2.1 PATCH-2 ACTIVE** on `main` after merge of PR #114.

AI Gate activation commit: `main@2f49d16153d2baca8b36cec6286b27e43262d081`.

Scientific authority remains unchanged: canonical offline evidence and the Python/Rust comparison are owned by Reference CI. Netlify availability remains a deployment observation, not correctness or scientific evidence.

## Completed activation evidence

- Local adversarial gate suite: **23/23 passed** after Fable5 hardening.
- Real GitHub Actions exposed a zero-tolerance timestamp defect; the validator now permits at most five minutes of future clock skew and rejects larger displacement.
- Compliant live PR #115: AI Gate Bootstrap **passed** and Reference CI **passed**; the PR was closed without merge after preserving the result.
- Hostile live PR #116: AI Gate Bootstrap **failed in preflight** on undeclared scope while Reference CI **passed**; the PR was closed without merge.
- PR #114 merged as `2f49d16153d2baca8b36cec6286b27e43262d081`, placing the permanent `AI Gate / ai-gate` workflow on `main`.
- The permanent workflow reads validator code, configuration, schema, and test runner from the trusted pull-request base rather than from the untrusted candidate branch.
- Post-activation live PR #118 deliberately added root-level `dummy-file.md` outside declared scope. Trusted preflight produced `AI_GATE_FAIL: Changed outside declared scope: dummy-file.md`, Reference CI passed independently, and the PR was closed without merge.
- Fail-only `fnmatch` semantics are documented and prohibited from granting allow scope.
- Placeholder detection rejects standalone seven-zero dummy tokens without false-positive matching inside legitimate alphanumeric hashes.

## Active operating procedure

- Every pull request must carry a base-bound `ai/session-proof.json` and a substantive `ai/control-report.md`.
- Every pull request must update both `CHANGELOG.md` and `docs/STATE.md`; missing or non-substantive state updates fail the gate.
- Ordinary changed paths must be declared exactly in `allowed_paths`; protected or governance paths require the appropriate higher risk class.
- The fixed risk profile determines the required test set, and later tests cannot rescue a failed preflight authorization check.
- A red or missing `AI Gate / ai-gate` or `Reference CI / reference` result is treated as a manual stop condition before merge.

## Remaining external platform enforcement

- GitHub protected-branch/ruleset enforcement is not yet configured for `main`.
- The desired platform rule should require `AI Gate / ai-gate` and `Reference CI / reference`, block force-push and branch deletion, dismiss stale approvals when applicable, and define the intended review requirement.
- Current human-bypass exposure is operationally low because Ken is the only human maintainer with repository authority. The remaining gap is that GitHub still permits an authorized maintainer or credential to ignore the procedure mechanically.
- If another maintainer, automation token, or external integration receives write authority, configure the branch ruleset before relying on that new access path.

## Current documentation cleanup

Branch `gate/post-activation-state-cleanup-20260711` corrects the stale bootstrap wording in this file and `CHANGELOG.md` through a normal `R0_DOC_ONLY` gate-controlled pull request. No gate implementation, protected path, scientific baseline, or deployment behavior is changed.

## Rollback

Close the documentation cleanup PR without merge if any statement is inaccurate. After merge, revert the documentation commit if a factual error is discovered; do not alter the active gate implementation or activation commit as part of that rollback.
