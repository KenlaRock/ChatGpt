# AI Gate Control Report

Task ID: `HARMONIC_RECOVERY_EVIDENCE_001`  
Branch: `docs/harmonic-recovery-evidence-20260712`  
Base commit: `e967f68e3635887cb6f0a99081662e487064c7d3`

## Project purpose

NullForge keeps signal truth, derived measurements, interventions and presentation separate. Public records must state scope, evidence class, limitations and failed attempts.

## Current task

Publish a sanitized summary of the synthetic `EXP-HARMONIC-RECOVERY-001` RUN-0001 through RUN-0004 series and its additive-polarity addendum.

## Mandatory context

The ten mandatory files configured by `docs/governance/AI_GATE_CONFIG.json` were read at the declared base commit. Their SHA-256 values are recorded in `ai/session-proof.json`.

## Approved scope

The substantive paths are `docs/HARMONIC_RECOVERY_SYNTHETIC_EVIDENCE.md`, `research/harmonic_recovery_synthetic_evidence.json`, `CHANGELOG.md` and `docs/STATE.md`. Gate, CI, schemas, scenarios, reference outputs, Rust code, deployment and Preview Lab behavior remain unchanged.

## Evidence summary

RUN-0001 uses an exact finite reference bank. RUN-0002 uses declared mathematical waveform models without the exact source WAV bank. RUN-0003 tests unseen continuous frequencies and phase/time modulo period. RUN-0004 tests unknown event boundaries, overlaps, repeated bursts and deterministic white noise. Automated pass states remain bounded synthetic QA, not human promotion.

## Failure preservation

The public record retains RUN-0003 PF-001 and rejected RUN-0004 V1/V2 methods. The failures exposed runtime limits, gated spectral sidelobes and close-frequency beat fragmentation. Later success does not erase those records.

## Publication review

The proposed files contain only synthetic definitions, bounded metrics and public repository paths. They contain no internal workspace references or non-public audio.

## Scientific risks

The experiment uses declared waveform families, frequency ranges and deterministic conditions. Procedural computational blinding is not an independent human trial. White-noise success does not imply colored, impulsive or time-varying-noise robustness.

## Risk class and tests

Risk class is `R3_DSP_OR_SCIENCE`. Required tests are `unit_tests`, `reference_experiment` and `public_boundary`. A red or missing required status is a stop condition.

## Rollback plan

Close without merge if scope, boundary checks, measurement traceability or failure preservation fail. After merge, revert the evidence document, JSON summary, changelog and state section together while preserving the underlying experiment history.

## Agent assertion

This change records what passed, what failed and what remains unknown without broadening the verified DSP scope.
