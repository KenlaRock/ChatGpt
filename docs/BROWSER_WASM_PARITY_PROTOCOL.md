# Browser-to-Rust/WASM Parity Protocol

Status: **PREIMPLEMENTATION PROTOCOL v0.1**  
Scope: browser preview, Rust/WASM candidate, Rust native candidate and Python reference comparison  
Authority: Reference CI remains canonical until an explicitly reviewed promotion changes that contract.

## Purpose

This protocol defines what the browser path may claim and how a future Rust/WASM implementation is compared against the existing offline reference path. It prevents an audible or visually convincing preview from being mislabeled as deterministic evidence.

## Authority classes

1. **Python reference oracle** — readable independent reference for declared scenarios.
2. **Rust native candidate** — deterministic production candidate, verified only inside scopes that passed cross-implementation comparison.
3. **Rust/WASM candidate** — browser-executable DSP candidate; no deterministic claim is permitted before this protocol passes.
4. **Web Audio presentation path** — audible interaction and monitoring surface. Browser scheduling, output-device behavior and user-agent processing are not canonical evidence.
5. **Three.js presentation path** — visualization consumer only; it has no signal or time authority.

## Claim boundary

The browser may use these labels:

- `PREVIEW_ONLY`
- `STRUCTURE_VERIFIED`
- `WASM_METRICS_COMPARED`
- `WASM_PARITY_VERIFIED`

It must not use `DETERMINISTIC`, `CANONICAL`, `MEASURED_FACT` or equivalent wording unless the tested scenario, runtime and tolerances satisfy the promotion criteria below.

## Required run identity

Every comparison record must contain:

- repository commit;
- scenario ID and scenario-version digest;
- runner identity and version;
- browser name and version;
- operating system and architecture;
- WASM build mode and compiler/toolchain version;
- sample rate and channel count;
- declared floating-point mode;
- render length in integer samples;
- parameter and automation digests;
- random seed or explicit declaration that no randomness is used;
- metric implementation version;
- start and completion timestamps.

Missing identity fields produce `INVALID_RUN`, not a partial pass.

## Canonical time and state

- Integer sample index is the canonical address.
- Browser wall-clock time, animation frames and UI event timestamps are secondary observations.
- `requestAnimationFrame`, DOM timing and audio-device callbacks must never drive canonical DSP state.
- Parameter changes used in evidence runs must be sample-addressed or converted into a frozen sample-addressed event list before rendering.
- A comparison run must begin from a declared state snapshot or a declared zero state.

## Comparison products

For each declared scenario, compare at minimum:

1. output sample count;
2. per-channel peak and RMS;
3. deepest-null sample index;
4. deepest-null value over the declared window;
5. global null-depth metric;
6. declared event and interaction sample indexes;
7. declared state snapshots;
8. output digest when bit identity is technically expected;
9. error statistics when bit identity is not expected.

A metric may be omitted only when the scenario contract explicitly marks it not applicable.

## Tolerance rules

- Tolerances belong to the versioned scenario or parity profile, not to the UI.
- No implementation may widen its own tolerance after seeing a failure.
- Absolute and relative tolerances must state their units and comparison formula.
- Sample-index events default to exact equality unless a reviewed scenario declares otherwise.
- When a platform cannot support a scientifically meaningful comparison, the result is `UNSUPPORTED`, not `PASS`.
- A visually small or inaudible difference is not automatically a numerical pass.

## Browser-specific exclusions

The following are observations unless separately measured and promoted:

- output-device latency;
- operating-system mixer behavior;
- resampling outside the controlled renderer;
- browser gain management or enhancement;
- animation-frame cadence;
- UI responsiveness;
- speaker/headphone frequency response;
- subjective loudness or quality.

These may be tested by human QA but remain separate from parity evidence.

## Test procedure

1. Freeze the scenario, event list, sample rate, render length and initial state.
2. Render the Python reference output.
3. Render the Rust native candidate from the same inputs.
4. Render the Rust/WASM candidate without routing the evidence buffer through an uncontrolled output device.
5. Compute all metrics using the declared metric implementation.
6. Compare every required product against the scenario tolerances.
7. Record platform metadata and all failures.
8. Run the same WASM build in at least two supported browser/runtime combinations.
9. Repeat the run to detect nondeterministic drift.
10. Preserve failed records and classify the result.

## Result states

- `INVALID_RUN` — identity, input or required-output data is missing.
- `UNSUPPORTED` — the platform cannot perform the declared comparison.
- `PARITY_FAIL` — one or more required comparisons exceed tolerance.
- `REPEATABILITY_PASS` — repeated runs in one runtime agree, but cross-oracle parity is not established.
- `WASM_METRICS_COMPARED` — metrics were produced and compared, with unresolved failures or unsupported fields documented.
- `WASM_PARITY_VERIFIED` — all required products pass across the declared runtime matrix.

Later successful runs do not erase earlier failures.

## Promotion criteria

`WASM_PARITY_VERIFIED` requires all of the following:

- versioned scenario and parity profile;
- reproducible build instructions;
- complete run identity;
- repeatability within each tested runtime;
- passing comparison against both the Python reference and the currently verified Rust native scope;
- machine-readable report retained by CI;
- public review of tolerances and exclusions;
- no use of UI, Three.js or audio-device output as evidence authority.

Promotion applies only to the exact declared scenario/profile/runtime scope. It is not a universal property of the browser application.

## Current status

At the repository state used to write this protocol, Rust/WASM parity has not been demonstrated. The correct public classification remains `PREVIEW_ONLY` or `STRUCTURE_VERIFIED` depending on the tested surface.

## Rollback

If this protocol proves materially incorrect, revert this document and its state/changelog entries. Do not weaken Reference CI authority or convert an unsupported browser result into evidence during rollback.
