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
- Merge PR #119 into `main` as commit `343aed65dee1fe81ebb4dbc627288eaa61f7156d`, reconciling `CHANGELOG.md` and `docs/STATE.md` with the active post-merge repository state.
- Preserve the intended human code-owner approval and stale-approval dismissal controls in the documented external ruleset checklist; note separately that independent approval is not currently available while Ken is the sole human maintainer.
- Finalize the state wording so repository documentation contains durable post-merge facts rather than transient branch or open-PR instructions.

Remaining external enforcement work:

- configure a protected-branch/ruleset for `main` requiring `AI Gate / ai-gate`, `Reference CI / reference`, human code-owner approval, and stale-approval dismissal, while blocking force-push and branch deletion;
- until that platform rule exists, treat any red or missing required check as a manual stop condition before merge;
- current human-bypass exposure is operationally low because one human maintainer holds repository authority, but GitHub does not yet enforce the procedure mechanically and a second independent human approver is not presently available.
