# Sparse-Hit Detector Candidate v0.1

Status: **SYNTHETIC FIXTURE CANDIDATE / HYPOTHESIS**  
Implementation: `research/sparse_hit_detector.py`  
Tracking issue: #128

## Purpose

The candidate proposes sparse cinematic drum-hit events while rejecting sustained bass and low-synth attacks. It is intentionally fail closed: an event that lacks sufficient signal evidence is reported as `UNRESOLVED_TRANSIENT`, not assigned a plausible kick label.

## Non-claims

This is not:

- a trained instrument classifier;
- validated on private FTC source audio;
- evidence that a detected event is a kick, drum or specific production layer;
- a replacement for human listening adjudication;
- a canonical downstream prior.

`SPARSE_HIT` means only that the declared candidate features passed on the tested signal and parameter set.

## Candidate pipeline

1. Convert declared mono or channel data to mono for the candidate analysis.
2. Frame the signal and calculate positive spectral flux.
3. Produce onset proposals against a rolling robust baseline.
4. Apply a refractory interval to avoid repeated proposals from one decay.
5. Measure attack spectral power in four declared bands:
   - low: 20–180 Hz;
   - low-mid: 180–700 Hz;
   - upper-mid: 700–5000 Hz;
   - high: 5000–20000 Hz.
6. Measure attack spectral flatness and the 80–160 ms persistence ratio relative to the first 30 ms.
7. Classify using declared thresholds.

## Fail-closed classes

- `SPARSE_HIT` — broadband, sufficiently flat transient attack with limited persistence.
- `BASS_ATTACK` — low/low-mid-dominant, harmonically concentrated and persistent event.
- `UNRESOLVED_TRANSIENT` — onset evidence exists but neither declared class is adequately supported.
- `NO_EVENT` — attack energy does not meet the minimum event threshold.

## Output contract

Each candidate includes:

- integer sample index;
- seconds derived from the declared sample rate;
- robust onset score;
- four band-power shares;
- number of active bands;
- spectral flatness;
- persistence ratio;
- confidence;
- classification;
- detector version;
- parameter hash;
- evidence class `HYPOTHESIS`.

## Initial synthetic fixtures

The unit suite contains deterministic fixtures for:

- sparse kick with a broadband click;
- cinematic low hit with a broadband crack;
- sustained bass pluck;
- low synth stab;
- edit boundary;
- stereo input;
- parameter-hash mutation.

Acceptance boundaries:

- bass and synth fixtures must not become `SPARSE_HIT`;
- edit boundaries must fail closed;
- true synthetic hit candidates must be located near the inserted sample;
- every configuration change must alter the parameter hash.

## Known limitations

- Thresholds are fixture-informed and have not been calibrated on a representative public corpus.
- Mono reduction can discard channel-specific transient evidence.
- Spectral flatness and persistence are not unique to percussion.
- Confidence is a transparent heuristic, not a probability estimate.
- Sample-rate generality is declared but only the 48 kHz synthetic fixture set is currently tested.
- No precision, recall or confusion matrix is claimed beyond the included fixtures.

## Promotion requirements

Before any real-source promotion:

1. preserve the exact input digest and detector parameter hash;
2. run a broader synthetic and public-domain fixture matrix;
3. report all false positives and false negatives;
4. conduct human listening adjudication on candidate windows;
5. keep `UNRESOLVED_TRANSIENT` where instrument identity remains ambiguous;
6. review whether the candidate is useful as an exploratory prior without turning it into authority.

Successful future tests do not erase failures from this candidate version.

## Rollback

Revert the candidate implementation, tests and this document if the feature contract is misleading or the fixture behavior is not reproducible. Do not rewrite a failed candidate as validated evidence.
