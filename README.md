# NullForge Simulation Lab

**Status:** Open Source Foundation v0.2 — Preview Lab vertical slice  
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

## What exists now

- scientific-integrity and governance rules,
- Architecture Decision Records,
- JSON Schema Draft 2020-12 contracts,
- a deterministic Python reference oracle,
- a Rust core cross-implementation-verified for `EXP-VECTOR-NULL-001 / v0.1`,
- metrics, snapshots, validation and property tests,
- a local-first browser Preview Lab,
- sanitized source-transparency records.

Canonical public repository: https://github.com/KenlaRock/ChatGpt

The Python oracle is deliberately small and independent. The Rust implementation is the production-engine candidate. Browser Web Audio is an exploratory preview surface and is not deterministic evidence.

## Public and internal information boundary

This repository is intentionally public. Private Google Drive and Notion workspaces are used internally by the project team and are not linked from this repository.

Before publication, material must be sanitized and pass:

```bash
python tools/check_public_boundary.py
```

See [`PUBLICATION_BOUNDARY.md`](PUBLICATION_BOUNDARY.md).

## Run the interactive Preview Lab

Requirements:

- Python 3,
- a modern Chromium-based browser for the first validation pass,
- headphones or low monitor volume when experimenting with cancellation and intervention gain.

From the repository root:

```bash
python -m http.server 8080 --directory web
```

Then open:

```text
http://localhost:8080
```

Press **Starta ljud** in the browser. Audio cannot start automatically because browsers require a user gesture.

Preview Lab v0.1 includes two additive H1–H8 sources, L/C/R routing, phase, a controlled noise wall, real-time L/R and vector views, M/S metrics, interaction-conditioned intervention, Surgical Freeze snapshots, automation recording/playback, and JSON import/export.

See [`web/README.md`](web/README.md). Exported browser snapshots are explicitly labeled:

```text
PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE
```

## Run the deterministic reference experiment

```bash
python reference/run_experiment.py \
  scenarios/phase-and-null/EXP-VECTOR-NULL-001.json \
  artifacts/EXP-VECTOR-NULL-001
```

## Run the Rust candidate

```bash
cargo run --release -p nf-sim-core -- \
  scenarios/phase-and-null/EXP-VECTOR-NULL-001.json \
  artifacts/EXP-VECTOR-NULL-001/rust-metrics.json
```

## Run validation

```bash
pip install -r requirements.txt
python tools/check_public_boundary.py
python tools/validate_package.py
python tools/validate_web_preview.py
node --check web/app.js
python -m unittest discover -s tests -v
cargo test --workspace --all-targets
```

## Intended production architecture

- Rust native canonical runner,
- Rust → WebAssembly real-time core,
- TypeScript application shell,
- Web Audio / AudioWorklet output,
- Three.js scientific visualization,
- JSON Schema contracts,
- local-first storage and file exchange.

The current browser Preview Lab is a dependency-free vertical slice. It proves the control model and exchange workflow before the interface is coupled to Rust/WASM.

## License map

See `LICENSES/README.md`.

> This package is an early research foundation. It is designed to make assumptions inspectable, not to claim that all proposed physics or representations are already validated.
