# CI Run 32 — Python / Rust Golden Comparison

**Date:** 2026-07-10  
**Workflow:** `Reference CI`  
**Run ID:** `29106296947`  
**Artifact ID:** `8232935288`  
**Artifact digest:** `sha256:ce80d45c1dd2e1a2155cc565f7490482be2ce11ba62cca19695d49f4aac98fbe`  
**Scenario:** `EXP-VECTOR-NULL-001`  
**Evidence status:** `MEASURED_FACT` scoped to this scenario and the tested implementations

## Result

All workflow stages passed:

- public information-boundary scan,
- JSON Schema Draft 2020-12 validation,
- Python reference/property tests,
- Rust core tests,
- Python reference render,
- Rust candidate metric render,
- cross-implementation golden comparison,
- artifact publication.

## Metric comparison

| Metric | Python oracle | Rust core | Rust − Python |
|---|---:|---:|---:|
| Left RMS | 0.21061520445210807 | 0.21061520445212015 | +1.20737e-14 |
| Right RMS | 0.21061520445210800 | 0.21061520445210807 | +8.32667e-17 |
| Center RMS | 0.14892743928907673 | 0.14892743928907579 | −9.43690e-16 |
| Side RMS | 0.14892743928907673 | 0.14892743928907518 | −1.55431e-15 |
| Global center null depth | −2.588466028650520 dB | −2.588466028650656 dB | −1.36335e-13 dB |
| Deepest-null sample | 479408 | 479408 | 0 samples |
| Deepest-null time | 9.987666666666666 s | 9.987666666666666 s | 0 s |
| Deepest null, 10 ms | −56.34579311765546 dB | −56.34579304153013 dB | +7.61253e-08 dB |

The source-state records also matched, including the final automated phase value of
`179.999625°` for `SRC-R`.

## Promotion decision

The Rust implementation is promoted from `UNVERIFIED_CANDIDATE` to:

`CROSS_IMPLEMENTATION_VERIFIED — EXP-VECTOR-NULL-001 / v0.1 scope`

This does **not** prove:

- correctness for all signals,
- correctness of future filters or spatial models,
- physical validity of abstract geometry,
- universal bit identity across platforms,
- parameter-identification validity.

It proves that the independent Python and Rust implementations agree within the
declared tolerances for the first controlled additive phase/null scenario.
