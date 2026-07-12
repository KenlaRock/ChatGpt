# AI Gate Control Report

Task ID: `SPARSE_HIT_DETECTOR_V0_1_20260712`  
Branch: `research/sparse-hit-detector-v0-1-20260712`  
Base commit: `0c100a6399a2fb1d07653cd6c4eff9e12e23957a`

## Project purpose

NullForge separates exploratory DSP hypotheses from canonical measured evidence. A useful detector must expose its feature contract, parameter set, failure classes and limitations rather than converting low-frequency transients into confident instrument labels.

## Current task

Publish sparse-hit detector candidate v0.1 using only deterministic synthetic fixtures. The candidate proposes broadband sparse transients, rejects sustained bass-like attacks, fails ambiguous edit boundaries closed, hashes its configuration and labels every output `HYPOTHESIS`.

## Mandatory files read

All ten files configured by `docs/governance/AI_GATE_CONFIG.json` were read or verified against `main@0c100a6399a2fb1d07653cd6c4eff9e12e23957a`. Current base hashes were recorded before editing. The scientific-integrity policy and repository architecture were treated as binding: the detector cannot alter canonical scenarios, reference outputs or previously verified DSP scope.

## What absolutely must not be changed

This task must not modify AI Gate, Reference CI, protected schemas, scenarios, reference runners, Rust core, deployment, Preview Lab behavior or external rules. It must not include private audio, FTC source material, copied commercial recordings or claims of real-instrument validation. It must not promote confidence as probability or `SPARSE_HIT` as instrument identity.

## Latest stable / green version

The branch starts from `main@0c100a6399a2fb1d07653cd6c4eff9e12e23957a`, the merge commit for PR #127 and the current green Preview Lab restoration baseline.

## Approved scope

The task is limited to:

- `research/sparse_hit_detector.py`;
- `tests/test_sparse_hit_detector.py`;
- `docs/SPARSE_HIT_DETECTOR_CANDIDATE.md`;
- substantive `CHANGELOG.md` and `docs/STATE.md` updates.

The required proof and control report are always-allowed task artifacts. No protected path may enter the diff.

## Candidate design

The proposal stage calculates positive spectral flux in four declared frequency regions and compares total flux against a rolling robust baseline. A refractory interval suppresses multiple proposals from one decay.

For each proposal, the detector records:

- integer sample index and seconds derived from the declared sample rate;
- low, low-mid, upper-mid and high attack-power shares;
- number of active bands;
- attack spectral flatness;
- 80–160 ms persistence relative to the first 30 ms;
- transparent heuristic confidence;
- class, detector version, parameter hash and evidence class.

The class boundary is explicit:

- `SPARSE_HIT` requires broadband attack evidence, sufficient flatness and limited persistence;
- `BASS_ATTACK` requires low/low-mid dominance, spectral concentration and persistence;
- `UNRESOLVED_TRANSIENT` preserves ambiguous proposals;
- `NO_EVENT` rejects insufficient attack energy.

## Synthetic fixture evidence

Seven deterministic local tests passed before publication:

1. sparse kick with broadband click → `SPARSE_HIT` near the inserted sample;
2. cinematic low hit with broadband crack → `SPARSE_HIT` with at least three active bands;
3. sustained bass pluck → `BASS_ATTACK`;
4. low synth stab → not `SPARSE_HIT`;
5. edit boundary → `UNRESOLVED_TRANSIENT`;
6. parameter mutation → different parameter hash;
7. identical stereo input → supported and classified consistently.

These fixtures demonstrate only the implemented contract on those synthetic signals. They do not establish population precision, recall or real-source validity.

## Publication-boundary review

The implementation, fixtures and documentation are entirely synthetic and public. They contain no Drive/Notion links, internal IDs, source audio, private project mappings, credentials or raw conversations. The candidate creates no network, filesystem-discovery or model dependency.

## Scientific risks and mitigations

- **Fixture overfitting:** thresholds may fit the initial examples. Mitigation: label as candidate, publish thresholds, preserve failures and require a broader matrix before promotion.
- **False instrument identity:** flatness and persistence are not percussion-specific. Mitigation: `SPARSE_HIT` is a signal hypothesis, not a drum label.
- **Mono reduction:** channel-specific evidence may be lost. Mitigation: document limitation and retain stereo support only as deterministic reduction, not spatial inference.
- **Confidence misuse:** heuristic confidence is not calibrated probability. Mitigation: state this explicitly and retain the feature vector.
- **Threshold drift:** later tuning could silently alter behavior. Mitigation: deterministic parameter hash and versioned candidate status.

## Risk class

`R3_DSP_OR_SCIENCE` is required because the task introduces signal-analysis logic and scientific classification language, even though it does not touch protected reference or scenario paths.

## Required tests

The fixed R3 profile requires:

- `unit_tests`;
- `reference_experiment`;
- `public_boundary`.

The reference experiment must remain unchanged and pass independently, proving that the candidate did not contaminate canonical outputs. Reference CI must be green on the exact PR head. AI Gate must validate branch/base binding, hashes, exact scope, state updates and report content.

## Promotion boundary

Real-source use remains blocked until all of the following are recorded:

- exact input and parameter digests;
- a broader synthetic and public-domain fixture matrix;
- false-positive and false-negative reporting;
- human listening adjudication of candidate windows;
- explicit treatment of unresolved identity;
- a reviewed decision about whether the candidate is useful as an exploratory prior.

A later pass cannot erase failures from v0.1.

## Rollback plan

Close without merge if fixture behavior, determinism, scope, labeling or required tests fail. After merge, revert the implementation, tests, candidate document and state/changelog entries together. Preserve canonical experiments, Reference CI, prior measurements and failure provenance.

## Agent assertion

This change turns a vague detector idea into a reproducible and falsifiable candidate. It deliberately stops short of claiming that any real production layer has been identified.
