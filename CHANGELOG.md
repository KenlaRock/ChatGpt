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
- Preserve the intended human code-owner approval and stale-approval dismissal controls in the documented external ruleset checklist; note separately that independent approval is not currently available while a single human maintainer holds repository authority.
- Finalize the state wording so repository documentation contains durable post-merge facts rather than transient branch or open-PR instructions.
- Add a sanitized collaboration-provenance policy that separates stable actor identity from model/runtime identity, classifies generative secondary commentary, and preserves the internal-to-public publication boundary.
- Clarify that review and QA are task roles rather than lower contributor ranks, support equal co-builder attribution for multi-role collaborators, and require like-for-like model/runtime tiers when benchmark parity informs an internal role decision.
- Add a preimplementation browser-to-Rust/WASM parity protocol that keeps Reference CI authoritative, requires sample-addressed run identity, defines fail-closed result states and separates device/browser observations from deterministic evidence.
- Add a visualization-semantics contract that requires versioned source-to-display mappings, explicit coordinate spaces and exaggeration metadata, visible invalid-data states, accessibility fallbacks and a read-only renderer boundary.
- Record that no active Three.js implementation was identified on `main`; visualization status remains preimplementation rather than validated.
- Restore the exact Preview Lab v0.1 runtime blobs previously validated in closed mirror PR #113, add current structural regression tests and retain the explicit `PREVIEW / NOT TRUTH ENGINE` evidence boundary.
- Keep schema/workflow restoration outside this safe-UI scope; auditory, mobile and deterministic-browser validation remain open gates.
- Add sparse-hit detector candidate v0.1 with robust onset proposals, broadband/flatness/persistence features, fail-closed classifications, versioned parameters and machine-readable candidate reports.
- Add seven deterministic synthetic fixture tests covering sparse hits, bass rejection, low-synth rejection, edit-boundary handling, stereo input and parameter-hash mutation; all outputs remain `HYPOTHESIS` pending human/source validation.
- Add a sanitized `EXP-HARMONIC-RECOVERY-001` synthetic evidence series covering exact reference-bank attribution, analytical recovery without exact source WAVs, unseen-frequency phase/time recovery, and nonstationary event segmentation under deterministic noise.
- Preserve the RUN-0003 timeout and rejected RUN-0004 V1/V2 blind methods; automated run gates remain bounded synthetic evidence with human promotion pending.

Remaining external enforcement work:

- configure a protected-branch/ruleset for `main` requiring `AI Gate / ai-gate`, `Reference CI / reference`, human code-owner approval, and stale-approval dismissal, while blocking force-push and branch deletion;
- until that platform rule exists, treat any red or missing required check as a manual stop condition before merge;
- current human-bypass exposure is operationally low because one human maintainer holds repository authority, but GitHub does not yet enforce the procedure mechanically and a second independent human approver is not presently available.
