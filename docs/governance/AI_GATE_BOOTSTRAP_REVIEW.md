# AI Gate v0.2.1 Bootstrap Review

## Why this is a bootstrap

A workflow cannot independently trust itself in the same pull request that introduces it. This installation therefore uses manual review plus two live pull requests targeting the bootstrap branch, where the branch version becomes the trusted base.

## Reconciliation against the current repository

- Root project context is `README.md`, `ARCHITECTURE.md`, `SCIENTIFIC_INTEGRITY.md` and `PUBLICATION_BOUNDARY.md`.
- The repository currently has no canonical `CHANGELOG.md` or `docs/STATE.md`; this bootstrap creates both.
- The removed `tools/validate_package.py` command is not claimed as available.
- Existing `Reference CI / reference` remains responsible for Python tests, Rust tests, reference rendering and Python-versus-Rust metrics comparison.
- The AI gate adds proof, scope, public-boundary and gate-selftest enforcement without duplicating the entire scientific CI chain.

## Known limitation

GitHub branch rules are platform configuration and cannot be proven by committed files alone. The repository is not fully protected until the required status checks and code-owner review are configured externally.

## Acceptance plan

1. Run all local adversarial tests.
2. Open a compliant dry-run PR to this bootstrap branch and require both checks to pass.
3. Open a hostile out-of-scope PR to this bootstrap branch and require `AI Gate / ai-gate` to fail.
4. Remove the temporary bootstrap branch trigger before merge to `main`.
