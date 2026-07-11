# AI Gate Control Report

Task ID: `GATE-LIVE-SCOPE-20260711-01`
Branch: `test/ai-gate-live-scope-violation-20260711`
Base commit: `2f49d16153d2baca8b36cec6286b27e43262d081`

## Project purpose

NullForge Simulation Lab is a reproducible signal laboratory whose canonical evidence path is separated from visualization and policy. Public work must remain sanitized, and AI-assisted changes must be bounded by exact base identity, scope, tests, provenance, and human review.

## Current task

This controlled negative acceptance test declares one harmless documentation path but deliberately adds a root-level `dummy-file.md` that is absent from the approved scope. The correct result is a fail-closed preflight rejection by the active main-branch AI Gate.

## Mandatory files read

All ten configured mandatory files were read from the exact active `main` base, including operating law, architecture, scientific-integrity and publication policies, repository state, gate rules, gate configuration, and the proof schema.

## What absolutely must not be changed

No DSP, oracle, Rust, Python, scientific baseline, evidence class, secret, private reference, schema, workflow, validator, deployment file, protected path, or branch-policy configuration may be modified during this negative scope test.

## Latest stable / green version

The test is based exactly on `main@2f49d16153d2baca8b36cec6286b27e43262d081`, which contains AI Gate v0.2.1 PATCH-2 as the trusted active validator and retains Reference CI as the separate scientific and build authority.

## Approved scope

The declared task scope contains only `docs/AI_GATE_LIVE_SCOPE_TEST.md`. The intentionally added root file `dummy-file.md` is not approved and must therefore cause the gate to fail before any fixed test profile can rescue the pull request.

## Risk class

`R0_DOC_ONLY` accurately describes the inert Markdown content, but low risk must never weaken exact scope enforcement. An undeclared file is unauthorized regardless of whether it contains executable behavior.

## Required tests

The nominal R0 profile contains `public_boundary`, but preflight scope validation must reject this pull request before the runner reaches that test. A later unrelated test result must never override a failed authorization boundary.

## Rollback plan

Close the pull request without merging, remove the test branch when practical, and retain the failed workflow run as provenance that the active gate rejected an undeclared path. No file from this branch should be copied to `main`.

## Agent assertion

This intentionally non-compliant change exists only to verify fail-closed behavior. It is not eligible for merge, and a successful merge would itself represent a failure of the intended procedure.
