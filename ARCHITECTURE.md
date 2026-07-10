# Architecture

## Authority model

```text
Simulation clock / sample index  → time authority
Reference/native DSP core        → signal authority
Interaction engine               → derived-event authority
UI                               → control and presentation
3D renderer                      → visual consumer
```

The UI renderer must never become the DSP clock.

## Target system

```text
Experiment JSON
      │
      ├── Native Rust canonical runner
      │       ├── canonical WAV
      │       ├── metrics
      │       └── snapshots
      │
      └── Browser
              ├── Rust/WASM DSP
              ├── AudioWorklet
              ├── TypeScript UI
              └── Three.js visualization
```

## Coordinate spaces

- `physical_acoustic_space`: positions have physical units and may affect delay, distance attenuation and directivity.
- `abstract_signal_space`: geometry represents signal relationships. A unit is not automatically a meter.

Every entity and automation track declares its coordinate space.

## Time representation

The canonical address is integer sample index. Secondary views are seconds and musical bar/beat/tick.

## Snapshots

A full state snapshot eventually includes source and oscillator phase, envelope state, filter memories, delay buffers, random state, automation cursors, interaction latches, route matrix and sample index.

## Real-time vs canonical

- Real-time mode is for interaction and observation.
- Canonical offline rendering is for evidence and regression.
- Browser and native results are compared within declared tolerances.
