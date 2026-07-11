# NullForge Repository State

Status: **AI Gate v0.2.1 PATCH-2 ACTIVE** on `main` after merge of PR #114.

Latest active public base: `main@2f49d16153d2baca8b36cec6286b27e43262d081`.

Scientific authority remains unchanged: canonical offline evidence and the Python/Rust comparison are owned by Reference CI. Netlify availability remains a deployment observation, not correctness or scientific evidence.

## Completed activation evidence

- Local adversarial gate suite: **23/23 passed** after Fable5 hardening.
- Compliant live PR #115: AI Gate Bootstrap **passed** and Reference CI **passed**; PR closed without merge.
- Hostile live PR #116: AI Gate Bootstrap **failed in preflight** on undeclared scope while Reference CI **passed**; PR closed without merge.
- PR #114 merged as `2f49d16153d2baca8b36cec6286b27e43262d081`, placing the permanent `AI Gate / ai-gate` workflow on `main`.
- The permanent workflow loads validator, schema, configuration, and test runner from the trusted PR base branch.
- Fail-only `fnmatch` semantics are documented and prohibited from allow-scope use.
- Placeholder detection rejects standalone seven-zero dummy tokens without false-positive matching inside legitimate alphanumeric hashes.

## Remaining external enforcement gate

- Configure a GitHub protected-branch/ruleset for `main` requiring `AI Gate / ai-gate`, `Reference CI / reference`, code-owner review, stale-review dismissal, no force-push, and no branch deletion.
- Until that platform rule exists, maintainers must voluntarily refuse direct pushes and merges that bypass red or missing checks.

## Post-activation live scope test — 2026-07-11

- Test branch: `test/ai-gate-live-scope-violation-20260711`.
- Declared ordinary path: `docs/AI_GATE_LIVE_SCOPE_TEST.md`.
- Deliberate violation: root-level `dummy-file.md` is absent from `allowed_paths`.
- Acceptance criterion: active `AI Gate / ai-gate` fails in preflight on the undeclared path. `Reference CI / reference` may pass independently.
- Disposition: close without merge and preserve the failed Actions record as QA provenance.

## Rollback

For the live negative test, close its PR without merging and retain the failed workflow record. The active `main` baseline remains unchanged.
