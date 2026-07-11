# AI Gate v0.2.1 PATCH-1 Bootstrap Review

## Why this is a bootstrap

A workflow cannot independently trust itself in the same pull request that introduces it. This installation therefore used manual technical review plus two live pull requests targeting the bootstrap branch, where the branch version supplied the trusted validator, schema, configuration, and test runner.

## Reconciliation against the current repository

- Root project context is `README.md`, `ARCHITECTURE.md`, `SCIENTIFIC_INTEGRITY.md` and `PUBLICATION_BOUNDARY.md`.
- This bootstrap creates canonical `CHANGELOG.md` and `docs/STATE.md` records.
- The removed `tools/validate_package.py` command is not claimed as available.
- Existing `Reference CI / reference` remains responsible for Python tests, Rust tests, reference rendering and Python-versus-Rust metrics comparison.
- The AI gate adds proof, task authorization, exact scope, public-boundary and gate-selftest enforcement without duplicating the complete scientific CI chain.

## Local adversarial validation

The final validator passed **21/21** isolated adversarial tests. Covered cases include empty hash maps, placeholder reports, branch/base mismatch, regenerated hashes, root-wide scope, nested secret paths, protected renames, test-profile mismatch, missing/failed test evidence, non-substantive state changes, R4 gate changes, explicit immutable-context approval, and bounded CI clock skew.

## Live GitHub Actions validation

### Positive case — PR #115

- Base: `d0b86686a551d87b1edcb970f67465599d5bffec`
- Candidate: `724ee09b31827d1005e3e3833a37d37bf756afbe`
- Declared scope: `docs/AI_GATE_LIVE_GOOD.md`
- AI Gate Bootstrap: **success**
- Reference CI: **success**
- Disposition: closed without merge after preserving the result.

### Hostile case — PR #116

- Base: `d0b86686a551d87b1edcb970f67465599d5bffec`
- Candidate: `07257a91b682f7709d028368b2a42b54fc1afdcb`
- Declared scope: `docs/AI_GATE_LIVE_HOSTILE.md`
- Deliberate undeclared path: `docs/AI_GATE_OUT_OF_SCOPE.md`
- AI Gate Bootstrap: **failure in preflight**
- Fixed test runner and final gate: **skipped after preflight failure**
- Reference CI: **success**
- Exact local reproduction: `AI_GATE_FAIL: Changed outside declared scope: docs/AI_GATE_OUT_OF_SCOPE.md`
- Disposition: closed without merge after preserving the result.

This asymmetric result is required: scientific/build health must not override missing task authorization.

## Defect discovered during live testing

The first positive Actions run exposed a real distributed-CI defect: `created_at` rejected any future timestamp with zero tolerance, even when runner and proof clocks differed only slightly. PATCH-1 permits at most five minutes of future skew and still rejects larger displacement. Regression tests cover both outcomes.

## Bootstrap cleanup

The temporary `pull_request` workflow used only for child-PR testing has been removed. The permanent workflow remains `pull_request_target`-based so post-bootstrap PRs are judged by trusted base-branch code.

## Remaining external limitation

GitHub branch rules are platform configuration and cannot be proven by committed files alone. The repository is not fully protected until `main` requires `AI Gate / ai-gate`, `Reference CI / reference`, and literal human code-owner approval, with stale-review dismissal and force-push/deletion blocked.

## Technical disposition

The implementation is technically validated as a bootstrap candidate. It must remain unmerged until the external ruleset and independent human approval controls are confirmed.
