# Scientific Integrity Policy

## 1. Four-state separation

### Truth State
The canonical experiment state: sources, phases, frequencies, partials, routing, DSP state, sample position, random state and automation.

### Interaction State
Derived relationships such as vector crossing, phase opposition, spectral overlap, null thresholds and closest approach.

### Intervention State
Operations that alter Truth State: gain, phase, delay, filters, position, partial amplitude and routing.

### Visualization State
Camera, colors, trails, visual scaling, display slow motion and monitor-only gain. Visualization may explain or exaggerate, but may not alter Truth State.

## 2. Mandatory labeling

Every response to an interaction is classified as either:

- `OBSERVATION_MODIFIER`
- `EXPERIMENTAL_INTERVENTION`

The UI and exported JSON must expose this distinction.

## 3. Ground-truth isolation

A method under test receives `observed_signal`, not `ground_truth`. Ground truth is revealed only to the evaluator.

## 4. Signal reconstruction is not parameter recovery

A model can reproduce a signal while recovering different parameters. Reports must score these separately.

## 5. Visual exaggeration

When display values differ from true values, all three are reportable: true value, display value and exaggeration factor.

## 6. Evidence classes

- `MEASURED_FACT`
- `HUMAN_VERIFIED_AXIOM`
- `HYPOTHESIS`
- `REFUTED`
- `FAILED_ATTEMPT`
- `REFERENCE_NOTE`
- `POLICY`

Policy must never be presented as measured evidence.

## 7. Failure preservation

Failed gates and disproven hypotheses are retained when they have learning value. Deletion is not an acceptable substitute for provenance.
