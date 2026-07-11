# Changelog

## Unreleased — AI Gate v0.2.1 PATCH-2 active baseline

- Add trusted-base AI gate workflow, schema, proof and control-report contracts.
- Add adversarial self-tests and fixed risk-class test profiles.
- Bind proofs to branch, merge-base, complete base hashes and exact scope.
- Preserve the separate Reference CI as the Python/Rust scientific cross-oracle check.
- Add explicit approval for rare R4 immutable-context changes.
- Add bounded five-minute future clock-skew tolerance after a real GitHub Actions runner exposed zero-tolerance as a distributed-CI defect.
- Expand the local adversarial suite to 21 cases, including accepted small skew and rejected excessive future timestamps.
- Verify compliant live PR #115: AI Gate Bootstrap passed and Reference CI passed; close without merge after preserving the result.
- Verify hostile live PR #116: AI Gate failed in preflight on undeclared scope while Reference CI passed; close without merge after preserving the result.
- Remove the temporary bootstrap child-PR workflow after the positive and hostile live tests completed.
- Apply independent Fable5 review hardening: remove the bootstrap branch from the permanent workflow trigger, document fail-only `fnmatch` semantics, and narrow the seven-zero placeholder detector.
- Add two placeholder regression tests: standalone `0000000` fails, while an embedded alphanumeric hash fragment containing seven zeros passes.
- Expand the local adversarial suite to 23 cases.
- Merge PR #114 into `main` as commit `2f49d16153d2baca8b36cec6286b27e43262d081`, activating the permanent AI Gate workflow.

Remaining external enforcement work:

- configure protected-branch/ruleset requirements for `AI Gate / ai-gate`, `Reference CI / reference`, code-owner approval, stale-review dismissal, no force-push, and no branch deletion.

## Live negative acceptance test — 2026-07-11

- Open `gate/ai-gate-live-scope-violation-20260711` from `main@2f49d16153d2baca8b36cec6286b27e43262d081` with valid proof/control records but an intentionally undeclared root-level `dummy-file.md`.
- Expected result: `AI Gate / ai-gate` fails in preflight on exact scope enforcement; the pull request is closed without merge and the failed run is preserved as provenance.
