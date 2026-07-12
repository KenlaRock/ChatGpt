# Harmonic Recovery Synthetic Evidence Series

Status: **automated synthetic QA candidate; human promotion pending**  
Experiment: `EXP-HARMONIC-RECOVERY-001`  
Date: 2026-07-12

## Purpose

This series tests whether known periodic signal components can be recovered as controlled synthetic complexity increases. It separates immutable references, deterministic probes, derived fixtures, measured outputs and human promotion decisions.

## Public evidence boundary

- All signals are synthetic.
- No non-public source audio or internal workspace material is included.
- Automated `PASS` means the declared machine gate passed; it does not establish general component recovery or real-world validity.
- Procedural computational blinding means predictions were frozen before synthetic truth was revealed to the evaluator. It is not an independent human double-blind trial.
- Failures remain part of the record.

## Series

### RUN-0001 — exact reference-bank attribution

Seven mixed fixtures passed against a twelve-atom exact reference bank. The run included same-fundamental waveform separation and a fail-closed duplicate-source-count case. This demonstrates attribution only when the exact finite reference bank is available.

### F08 — additive-only polarity construction

One sine source was transformed to negative steady-state polarity without file inversion, negative gain or subtraction. The construction used one original layer and two positive copies delayed by half a period. The result is exact only in the declared steady-state interval because finite files contain boundaries.

### RUN-0002 — analytical attribution without exact source WAVs

Eight fixtures passed using mathematical Sine, custom eight-partial Truth, band-limited Saw and band-limited Square models. The run did not fit against the exact source WAV files. The result remains bounded by the declared family and frequency priors.

### RUN-0003 — unseen frequencies and source phase/time

Seven fixtures containing thirteen previously unseen fundamentals passed. Frequency, family, amplitude and phase/time modulo period were recovered. A stationary periodic signal cannot reveal an integer number of elapsed whole periods, so delay claims are modulo period.

### RUN-0004 — nonstationary events and deterministic noise

Six fixtures containing eleven carriers and thirteen events passed at target SNR values from 30 dB to 10 dB. The set included sequential events, overlaps, short repeated bursts and two simultaneous fundamentals 2.96 Hz apart. Event gating produced spectral sidebands; two blind method iterations were rejected before unblinding, and the final method used correlated event topology to reject those sidebands.

## Selected automated measurements

| Run | Scope | Maximum reported error / worst residual |
|---|---|---|
| RUN-0001 | exact reference-bank mixtures | coefficient error ≈ `4.68e-9`; null ≤ `-128.90 dB` |
| RUN-0002 | analytical, no exact source WAV fit | f0 error ≈ `4.27e-6 Hz`; coefficient error ≈ `2.52e-7` |
| RUN-0003 | unseen f0 and phase/time | f0 error ≈ `3.08e-9 Hz`; phase error ≈ `1.74e-6°` |
| RUN-0004 | events and deterministic white noise | f0 error ≈ `0.01934 Hz`; boundary error ≈ `72.67 ms`; SNR error ≈ `2.05 dB` |

## Preserved failures

- RUN-0003 first exhaustive nonlinear implementation exceeded its execution budget before any prediction freeze.
- RUN-0004 V1 confused gated spectral sidelobes with sources and fragmented a close pair through beat modulation.
- RUN-0004 V2 corrected beat fragmentation but retained event-envelope sidebands.
- RUN-0004 V3 grouped nearby candidates only when their event topology was correlated, preserving close sources with different event boundaries.

## Current claim

The series is controlled evidence that these analytical methods recover the declared synthetic signal families under the published priors and thresholds. It is not evidence of general recovery under arbitrary music, arbitrary waveform families, colored or impulsive noise, f0 drift, or unknown real recordings.

## Next gate

Add colored, impulsive and time-varying noise, plus within-event frequency drift. Preserve sealed truth, frozen predictions, ambiguity classes and failed attempts.
