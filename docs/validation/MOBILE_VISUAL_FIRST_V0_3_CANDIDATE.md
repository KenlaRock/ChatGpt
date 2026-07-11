# Mobile Visual First v0.3 candidate

**Status:** DEVICE_QA_CANDIDATE  
**Prepared:** 2026-07-11

This branch records the mobile-first Preview Lab iteration prompted by real Samsung Galaxy S23+ testing.

## Observed v0.2 problem

The Web Audio and WebGL surfaces worked, but parameter panels dominated the vertical viewport. The main visual scene and display-only exaggeration controls were too far down the page, and the existing conditional visual multiplier appeared unavailable whenever the Intervention condition was inactive.

## v0.3 interaction model

- visualization appears before large parameter surfaces,
- sticky audio, always-active Visual overdrive and 3D fullscreen controls,
- collapsible Source A and Source B panels,
- separately collapsible H1-H8 controls,
- collapsible noise/intervention, metrics, 2D analysis and data tools,
- touch rotation and pinch/wheel zoom,
- fullscreen WebGL scene,
- compact source summaries when panels are closed.

## Exaggeration separation

`Visual overdrive` is always active and presentation-only. It is intended to affect WebGL motion, source size, vectors, wavefronts, trails, oscilloscope display scale, Lissajous display scale and phase-vector display scale.

`Active relation x` remains a separate conditional visualization multiplier that applies only when the declared interaction condition is active.

`Audio x` remains the explicit Intervention State control that may alter the audible signal.

## Promotion gate

The candidate must not replace the public v0.2 source until:

1. JavaScript syntax and structural validation pass,
2. public-boundary validation passes,
3. Samsung Galaxy S23+ portrait and landscape checks pass,
4. collapsible controls preserve all state changes,
5. Visual overdrive is confirmed while Intervention is inactive,
6. Netlify production deployment is verified.

This document records a candidate UI architecture, not deterministic DSP evidence.
