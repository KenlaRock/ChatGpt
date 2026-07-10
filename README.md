# NullForge Simulation Lab

**Status:** Open Source Foundation v0.1 — canonical Git baseline  
**Date:** 2026-07-10  
**Project owner / research arbiter:** Ken Kängström  
**Primary software license:** AGPL-3.0-or-later (candidate, pending final legal sanity check)

NullForge Simulation Lab (NF SimLab) is a local-first, open and reproducible signal laboratory for:

- controlled synthesis and noise environments,
- phase, polarity and harmonic-interaction experiments,
- abstract and physical signal geometry,
- recorded automation and shareable splines,
- interaction-conditioned manipulation,
- sample-addressed Surgical Freeze snapshots,
- visual exaggeration separated from audio truth,
- synthetic ground-truth validation of DSP methods,
- method-to-method comparison and render-back QA.

## Scientific core

The system separates four state domains:

1. **Truth State** — what the experiment actually contains.
2. **Interaction State** — derived collisions, crossings and signal relations.
3. **Intervention State** — actions that alter the experiment.
4. **Visualization State** — presentation and exaggeration only.

A visual exaggeration must never silently modify Truth State.

## What exists in this foundation package

- project charter and robust build plan,
- scientific-integrity and governance rules,
- Architecture Decision Records,
- JSON Schema Draft 2020-12 contracts,
- a deterministic Python reference oracle,
- the first synthetic phase/null experiment,
- metrics and event snapshot,
- validation and property tests,
- source-conversation transparency records.

Canonical repository: https://github.com/KenlaRock/ChatGpt

Drive foundation archive: https://drive.google.com/drive/folders/1MLx8DtvFAgW1pgJvBMkRCzaKGRsxylmr

The Python oracle is deliberately small. It is not the intended production engine. Its job is to provide an independent, readable reference that the future Rust native/WASM engine must match within declared tolerances.

## Run the reference experiment

```bash
python reference/run_experiment.py \
  scenarios/phase-and-null/EXP-VECTOR-NULL-001.json \
  artifacts/EXP-VECTOR-NULL-001
```

## Run validation

```bash
python -m unittest discover -s tests -v
python tools/validate_package.py
```

## Intended production architecture

- Rust native canonical runner
- Rust → WebAssembly real-time core
- TypeScript web application
- Web Audio + AudioWorklet
- Three.js visualization
- JSON Schema contracts
- local-first storage and file exchange

## License map

See `LICENSES/README.md`.

> This package is an early research foundation. It is designed to make assumptions inspectable, not to claim that all proposed physics or representations are already validated.
