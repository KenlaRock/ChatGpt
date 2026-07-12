# Visualization Semantics Contract

Status: **PREIMPLEMENTATION CONTRACT v0.1**  
Target consumer: Three.js or another renderer  
Authority: visualization is a read-only presentation domain and never scientific authority.

## Purpose

This contract defines how simulation values may be converted into geometry, color, motion and camera presentation without implying unsupported physical meaning. It exists before renderer implementation so that attractive output cannot silently become fabricated evidence.

## Non-negotiable boundary

The renderer may read exported Truth State, Interaction State and explicitly declared Visualization State. It may not:

- write to Truth State;
- advance the DSP clock;
- trigger an intervention without a separately logged control event;
- infer missing numeric values from visual continuity;
- substitute animation time for integer sample index;
- present qualitative decoration as measured geometry.

Any user interaction that changes the experiment is an `EXPERIMENTAL_INTERVENTION`, not a camera or visualization operation.

## Mapping registry

Every displayed quantity requires a versioned mapping record containing:

- mapping ID and version;
- source state domain;
- source field path;
- source unit or explicit `UNITLESS` declaration;
- coordinate space: `physical_acoustic_space` or `abstract_signal_space`;
- transform formula;
- clamp and overflow behavior;
- display unit;
- color or geometry semantics;
- interpolation rule;
- stale-data behavior;
- missing/invalid-data behavior;
- exaggeration factor when display magnitude differs from truth;
- evidence label: measured, derived, qualitative or decorative.

A renderer must not display an unmapped field.

## Coordinate-space rules

### Physical acoustic space

- Position and distance require declared physical units.
- Delay, attenuation or directivity effects belong to the DSP/intervention layer, not to renderer-side geometry.
- Moving a visual object does not move a physical source unless a separate intervention event is emitted and accepted.

### Abstract signal space

- Geometry represents relationships, not meters.
- Axis labels and legends must make the abstraction visible.
- Camera perspective and apparent distance have no physical meaning unless an explicit mapping states otherwise.

The two spaces must not be silently mixed in one axis system.

## True, display and exaggerated values

When a visual transform changes magnitude, the system must retain and expose:

- `true_value`;
- `display_value`;
- `transform`;
- `exaggeration_factor` or an equivalent nonlinear-transform description.

Examples include logarithmic amplitude scaling, minimum trail width, phase-vector length normalization and slow-motion playback. Exaggeration is permitted for legibility but must be inspectable.

## Color semantics

- Color must map to one declared field or be marked decorative.
- A palette must not imply ordered magnitude unless the mapping is ordered.
- Clamped values require a visible overflow state.
- Missing values use a dedicated missing-data state, not a plausible default color.
- Alarm colors must correspond to a declared threshold and evidence class.
- Color alone must not be the only carrier of critical meaning.

## Motion and time

- Renderer interpolation is presentation only.
- The displayed sample index must come from the simulation state.
- Animation frames may interpolate between known states but cannot create intermediate measured events.
- Paused, stale or disconnected state must be visibly distinguishable from live state.
- Slow motion, trails and easing must be identified as display transforms.

## Geometry rules

- Geometry scale, origin and handedness must be declared.
- Zero, minimum and maximum values require explicit geometry behavior.
- Negative, NaN, infinite and out-of-range inputs must fail visibly.
- No invalid value may be replaced with a visually plausible random or previous value.
- Clipping planes, camera near/far values and bounding volumes must be tested against declared extremes.
- Resize and orientation changes may change layout, not semantic scale unless the mapping explicitly declares responsive normalization.

## Camera contract

The camera is a presentation tool. Camera position, field of view, zoom and orbit:

- do not alter source state;
- do not alter metric computation;
- do not alter event ordering;
- must not hide a failure state behind clipping or framing;
- must have a deterministic reset view for QA screenshots;
- must preserve access to legends, units and status labels on supported viewports.

## Invalid and missing data

Required visible states:

- `NO_DATA`
- `STALE_DATA`
- `INVALID_VALUE`
- `OUT_OF_RANGE`
- `UNSUPPORTED_MAPPING`
- `DISCONNECTED`

The renderer must not continue a convincing live animation after the source becomes stale unless the view is explicitly labeled playback or prediction.

## Accessibility and fallback

- Critical values and status must exist in text or tabular form outside the canvas.
- Keyboard-accessible reset and inspection controls are required where interaction exists.
- Reduced-motion preference must disable nonessential motion.
- A WebGL-unavailable fallback must expose the current numeric/state summary rather than a blank page.
- Contrast and non-color cues must support critical states.

## Required tests

### Mapping tests

- every rendered field resolves to one mapping record;
- source units and coordinate spaces are present;
- unmapped fields fail closed;
- exaggeration metadata matches the transform.

### Input tests

- zero, negative, minimum, maximum and above-maximum values;
- NaN, infinity, null, missing field and stale timestamp;
- contradictory coordinate-space declarations;
- rapidly changing and constant values.

### Viewport tests

- narrow mobile portrait;
- mobile landscape;
- desktop baseline;
- resize during animation;
- high device-pixel ratio;
- camera reset after orbit/zoom;
- clipping and overflow at representative extremes.

### Authority tests

- camera and renderer operations do not mutate Truth State;
- animation cadence does not change sample-addressed results;
- visualization controls classified as observation modifiers cannot invoke DSP changes;
- intervention controls emit separately logged events.

## Validation report

A visualization validation report must record:

- repository commit;
- renderer and library version;
- browser/runtime and device;
- mapping-registry digest;
- tested state fixtures;
- viewport matrix;
- screenshots for representative and failure states;
- structural test results;
- known unsupported mappings;
- reviewer classification of qualitative versus measured displays.

Screenshots are presentation evidence only; canonical numeric values remain the authority.

## Current implementation inventory

At the repository base used for this contract, Three.js is documented as a target architecture but no active Three.js implementation was identified on `main`. Therefore:

- geometry validation has not passed;
- mobile renderer validation has not passed;
- semantic mappings have not been implemented;
- the correct status is `PREIMPLEMENTATION_CONTRACT`.

This absence is not a defect in the contract. It is the reason the contract must precede implementation.

## Rollback

If this contract is materially wrong, revert it and its state/changelog entries. Do not replace it with undocumented renderer behavior or weaken the four-state separation during rollback.
