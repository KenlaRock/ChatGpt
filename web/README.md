# NullForge Preview Lab v0.1

This is the first interactive browser slice of NullForge Simulation Lab.

It is deliberately labeled **Preview / Not Truth Engine**. Browser Web Audio is used for rapid auditory and visual exploration; deterministic evidence remains the responsibility of the independent Rust/Python pipeline.

## Run locally

From the repository root:

```bash
python -m http.server 8080 --directory web
```

Open:

```text
http://localhost:8080
```

Chrome or Edge is recommended for the first validation pass. Audio starts only after pressing **Starta ljud**, because browsers require a user gesture.

## Included in v0.1

- two additive H1–H8 oscillators,
- frequency, gain, global partial phase and L/C/R route,
- deterministic-seeded browser noise wall with low-pass control,
- real-time L/R oscilloscope,
- Lissajous stereo/vector view,
- phase-vector model view,
- live RMS, M/S, correlation and local center/null estimate,
- interaction-conditioned intervention near 0° or 180°,
- visual exaggeration isolated from audio intervention,
- Surgical Freeze preview snapshot,
- automation recording and playback,
- JSON session import/export.

## Evidence warning

Exports use the evidence label:

```text
PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE
```

The browser preview is a hypothesis/playground surface. It must not be promoted as measured fact without render-back through the canonical engine and declared validation.

## Restoration provenance

The runtime files were restored on 2026-07-12 from the exact blobs validated in closed mirror PR #113 at commit `74260dbdd3449c3f07b637a260b2cb991a0880bb`.

That mirror passed structural and exchange validation, JavaScript syntax checks and the repository's then-current Reference CI. The restoration does **not** import the mirror PR's protected schema or workflow changes, and it does not expand the earlier claim.

Current claim boundary:

```text
STRUCTURE_AND_EXCHANGE_CI_VERIFIED — historical source scope
RUNTIME RESTORED — current branch scope
AUDITORY / MOBILE / DETERMINISTIC BROWSER QA — NOT YET PASSED
```

The current browser and visualization contracts are documented in:

- `docs/BROWSER_WASM_PARITY_PROTOCOL.md`
- `docs/VISUALIZATION_SEMANTICS_CONTRACT.md`
