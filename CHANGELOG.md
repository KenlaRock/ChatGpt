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
- Merge PR #114 into `main` as commit `2f49d16153d2baca8b36cec6286b27e43262d081`, activating the permanent trusted-base AI Gate workflow.
- Verify post-activation negative test PR #118: trusted preflight rejected undeclared root-level `dummy-file.md`, Reference CI passed independently, and the PR was closed without merge.
- Reconcile `CHANGELOG.md` and `docs/STATE.md` with the active post-merge repository state through a normal gate-controlled documentation PR.

Remaining external enforcement work:

- configure a protected-branch/ruleset for `main` requiring `AI Gate / ai-gate` and `Reference CI / reference`, blocking force-push and branch deletion, and defining the intended review policy;
- until that platform rule exists, treat any red or missing required check as a manual stop condition before merge;
- current human-bypass exposure is operationally low because one human maintainer holds repository authority, but GitHub does not yet enforce that procedure mechanically.
