# AI Gate Control Report

Task ID: `GATE-LIVE-HOSTILE`
Branch: `task/ai-gate-live-hostile`
Base commit: `d0b86686a551d87b1edcb970f67465599d5bffec`

## Project purpose

NullForge Simulation Lab is a reproducible signal laboratory whose canonical evidence path is separated from visualization and policy. The public repository is sanitized, and AI-assisted work must be bounded by exact base identity, scope, tests, provenance, and review.

## Current task

This controlled negative test declares one harmless documentation path but deliberately adds another documentation file that is not present in the approved scope. The correct result is a fail-closed preflight rejection from the patched gate.

## Mandatory files read

The agent read all ten configured mandatory files from the exact patched bootstrap base, including the operating law, project architecture, scientific integrity and publication policies, repository state, gate rules, config, and schema.

## What absolutely must not be changed

No DSP, oracle, Rust, Python, scientific baseline, evidence class, secret, private reference, schema, workflow, validator, deploy file, or protected path may be changed during this hostile scope test.

## Latest stable / green version

The test is based exactly on `gate/ai-gate-v0-2-1-bootstrap@d0b86686a551d87b1edcb970f67465599d5bffec`, which contains the patched trusted bootstrap validator and temporary child-PR execution workflow.

## Approved scope

The declared task scope contains only `docs/AI_GATE_LIVE_HOSTILE.md`. The intentionally added `docs/AI_GATE_OUT_OF_SCOPE.md` is not approved and therefore must cause the gate to fail.

## Risk class

`R0_DOC_ONLY` accurately describes the file content, but low risk does not weaken scope enforcement. The violation must be rejected regardless of whether the undeclared file is executable.

## Required tests

The nominal R0 profile contains `public_boundary`, but preflight scope validation must reject this PR before the test runner is reached. A later test pass must never override a failed scope boundary.

## Rollback plan

Close the negative-test PR, remove its branch or revert the single test commit, restore CHANGELOG.md and docs/STATE.md to the patched bootstrap base, and preserve the failed AI Gate log as proof that the hard fence rejected undeclared scope.

## Agent assertion

This intentionally non-compliant change exists only to verify fail-closed behavior. It is not eligible for merge even if unrelated CI checks pass.
