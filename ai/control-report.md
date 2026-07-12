# AI Gate Control Report

Task ID: `AUDIO_DECONSTRUCTION_EXPERIMENT_TRIO_20260712`  
Branch: `research/audio-deconstruction-experiment-trio-20260712`  
Base commit: `e967f68e3635887cb6f0a99081662e487064c7d3`

## Project purpose

NullForge seeks reproducible evidence about what source information can be recovered from audio. This task must convert three research proposals into independently executable, falsifiable candidates without merging their evidence, fixtures or failure states.

## Current task

Publish three isolated experiment packages:

1. `EXP-HARMONIC-RECOVERY-001` — blind F0 and harmonic-body recovery;
2. `EXP-LOWBAND-COLLISION-001` — kick/bass collision discrimination;
3. `EXP-STEREO-TOMOGRAPHY-001` — spatial decomposition and delay recovery.

Each package owns its pipeline, synthetic fixture generator, recipe, output report and tests. A result from one experiment cannot promote or rescue another.

## Mandatory files read

All ten mandatory files configured by `docs/governance/AI_GATE_CONFIG.json` were read or verified against `main@e967f68e3635887cb6f0a99081662e487064c7d3`. The scientific-integrity rules were treated as binding: the analysis stage receives observed signal only, evaluator ground truth remains separate, reconstruction and parameter recovery are scored independently, and failures remain in provenance.

## What absolutely must not be changed

This task must not modify AI Gate, Reference CI, protected schemas, canonical scenarios, reference outputs, Rust core, Preview Lab runtime, deployment, external rules, private source audio or internal platform identifiers. It must not claim real-source accuracy, plugin identity or validated instrument separation.

## Latest stable / green version

The branch starts from `main@e967f68e3635887cb6f0a99081662e487064c7d3`, the merge commit for sparse-hit candidate PR #129.

## Approved scope

The task is limited to:

- `research/experiments/EXP-HARMONIC-RECOVERY-001/**`;
- `research/experiments/EXP-LOWBAND-COLLISION-001/**`;
- `research/experiments/EXP-STEREO-TOMOGRAPHY-001/**`;
- three dedicated `tests/test_exp_*.py` files;
- three generated synthetic baseline reports under `artifacts/`;
- `docs/AUDIO_DECONSTRUCTION_EXPERIMENT_TRIO.md`;
- substantive `CHANGELOG.md` and `docs/STATE.md` updates.

The proof and this report are always-allowed task artifacts.

## Pipeline isolation

- No experiment imports another experiment.
- No experiment writes shared mutable state.
- Each experiment has a unique ID, recipe, output path and result schema.
- Each experiment can pass, fail, be reverted or be superseded without changing another experiment's evidence class.

## Candidate results

### EXP-HARMONIC-RECOVERY-001

- Clean harmonic body: estimated F0 `109.9998739 Hz`, error `−0.00199 cent`, partial MAE `1.30e-6`, null depth `−63.30 dB`.
- Noisy harmonic body: null depth `−29.29 dB`, residual classified primarily inter-harmonic, reconstruction and parameter gates pass.
- Soft-clipped body: parameter gate passes but reconstruction remains `REVIEW` at `−21.58 dB`, correctly separating equivalent parameter estimation from incomplete signal reconstruction.

### EXP-LOWBAND-COLLISION-001

- Aggregate synthetic precision `1.0`, recall `0.667`, F1 `0.8`.
- Kick-only and ±20 ms offset cases pass.
- Bass-only creates zero false kick candidates.
- Exact kick/bass coincidence produces unresolved candidates and two false negatives rather than false instrument certainty.

### EXP-STEREO-TOMOGRAPHY-001

- Mid/Side roundtrip closure is below `−286 dB` in all baseline fixtures.
- Zero-delay center and side components correlate at approximately `1.0` with truth.
- A 17-sample right-channel delay is recovered exactly as a `−17` sample alignment.
- Decorrelated material is classified as `DECORRELATED_FIELD`, not assigned an instrument identity.

All results retain evidence class `HYPOTHESIS`.

## Preserved failed attempts

Two failures occurred during implementation and are retained because they changed the method:

1. The first harmonic fixture used 10 ms edge fades while the fitting model omitted the envelope. The residual was dominated by deterministic edge mismatch and the clean null stalled around `−23.15 dB`. Correction: the baseline fixture now measures an unwindowed stationary signal; future edge-window experiments must either model the envelope or score only the declared interior.
2. The first stereo delay estimator compared `L−Mid` against `−(R−Mid)`. These expressions are algebraically identical, so the estimator always preferred zero delay. Correction: isolate the declared side-frequency band directly from L and polarity-corrected R, then estimate lag by FFT correlation.

These are `FAILED_ATTEMPT` records inside this control report, not hidden prehistory.

## Tests run locally

`python -m unittest discover -s tests -v` against the three new test files passed 10/10 checks:

- three harmonic-recovery checks;
- three low-band collision checks;
- four stereo-tomography checks.

The exact PR head must still pass full repository unit tests, Reference CI reference experiment and public-boundary validation.

## Publication-boundary review

All new audio is generated in memory from deterministic mathematical fixtures. No commercial recording, FTC source, Drive/Notion URL, workspace ID, credential, private actor roster or raw conversation is included.

## Scientific risks

- Thresholds may overfit the small fixture matrices.
- Harmonic fitting assumes stationary monophonic content and does not yet recover drift.
- Low-band recall drops to zero for exact kick/bass coincidence; this is an explicit unresolved region.
- Stereo tomography relies on a declared diagnostic frequency split for delay estimation and does not prove general source separation.
- Generated reports are baseline observations, not promoted facts about real music.

## Risk class

`R3_DSP_OR_SCIENCE` is required because this task adds DSP logic, evaluation metrics and scientific classification language while leaving protected canonical evidence paths unchanged.

## Required tests

The fixed R3 profile requires:

- `unit_tests`;
- `reference_experiment`;
- `public_boundary`.

A later successful test cannot override a failed preflight, scope mismatch or publication-boundary failure.

## Promotion boundary

Promotion beyond synthetic candidate status requires separate experiment-specific evidence:

- a broader hidden fixture matrix;
- exact input and parameter hashes;
- real stems or public-domain sources where applicable;
- precision/recall or recovery-error reporting on held-out material;
- human listening adjudication;
- explicit documentation of unresolved regions and model-created artifacts.

## Rollback plan

If any pipeline, report or test is incorrect, revert that experiment folder, its dedicated test and report, then update the trio document, state and changelog additively. Do not rewrite another experiment's status. Preserve this report's failed-attempt record, canonical reference experiments, AI Gate and prior sparse-hit provenance.

## Agent assertion

This task turns three proposals into runnable and falsifiable candidates. It does not claim that the candidates have solved source separation; it establishes three clean places where the project can learn without contaminating one experiment with another.
