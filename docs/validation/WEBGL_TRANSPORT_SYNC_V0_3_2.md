# WebGL transport synchronization — v0.3.2

**Status:** candidate validated by static and syntax checks  
**Date:** 2026-07-11

## Defect

The 2D visualizers were driven by the audio animation loop and stopped with the AudioContext. The WebGL renderer used an unconditional `requestAnimationFrame` time source, so source motion, wavefronts, noise drift, relation pulses, trails and automatic camera rotation continued after audio stop and while a snapshot was frozen.

## Correction

The WebGL render loop remains alive so manual camera rotation, zoom, resizing and fullscreen remain responsive. A separate signal-simulation clock now advances only when:

```text
AudioContext exists AND visualization.frozen is false
```

The paused simulation clock drives:

- source orbital motion,
- wavefront propagation,
- controlled-noise drift,
- intervention relation pulse,
- trail sampling,
- automatic camera rotation.

When Surgical Freeze is active, WebGL renders from the captured snapshot state rather than current live controls.

## Expected behavior

- Start audio: 2D and 3D signal activity runs.
- Stop audio: 2D and 3D signal activity pauses.
- Camera input remains responsive while stopped.
- Restart audio: visual simulation resumes without a wall-clock jump.
- Lock snapshot: both 2D and 3D freeze.
- Change live controls while frozen: the WebGL snapshot remains unchanged.
- Release snapshot: current live state becomes visible again.

## Checks performed

- inline JavaScript syntax: PASS
- duplicate DOM IDs: 0
- unconditional wall-clock WebGL signal time removed: PASS
- trail sampling requires running transport: PASS
- auto-rotation requires running transport: PASS
- snapshot state used during freeze: PASS
- public information content: PASS

This remains Preview / Not Truth Engine. The change aligns visualization time authority with the browser audio transport; it does not promote browser rendering to deterministic evidence.
