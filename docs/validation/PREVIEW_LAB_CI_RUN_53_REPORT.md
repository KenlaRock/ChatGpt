# Preview Lab CI Run 53 Report

**Date:** 2026-07-10  
**Workflow:** Reference CI  
**Run:** #53 (`29108256231`)  
**Validation mirror commit:** `74260dbdd3449c3f07b637a260b2cb991a0880bb`  
**Canonical candidate branch:** `sanitized-main-2026-07-10`

## Result

**PASS**

The following stages completed successfully:

1. public information-boundary scan,
2. JSON Schema Draft 2020-12 validation,
3. Preview Session schema/example validation,
4. browser Preview Lab structural validation,
5. JavaScript syntax checks for `web/app.js` and `web/session-contract.js`,
6. Python reference/property tests,
7. Rust core tests,
8. Python reference render,
9. Rust candidate render,
10. Python/Rust golden metric comparison,
11. workflow artifact publication.

## Verified scope

The following may be described as **CI-validated for Preview Lab v0.1 structure and exchange contracts**:

- dependency-free static browser bundle,
- two-script loading order,
- local-first asset policy,
- required control/visualization DOM contract,
- Preview Session JSON Schema,
- sample-addressed automation-track export representation,
- example session validation,
- coexistence with the previously verified Rust/Python reference chain.

## Not verified by this run

This run does not prove:

- audible behavior on every browser or audio device,
- real-time timing equivalence between Web Audio and Rust,
- deterministic browser audio rendering,
- scientific validity of the current visual geometry,
- mobile interaction quality on Samsung Galaxy S23+,
- Three.js or Rust/WASM parity, which are not implemented yet.

Browser exports remain labeled `PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE` until render-back through a canonical deterministic path.

## Promotion status

Preview Lab v0.1 is promoted from `UNVERIFIED_CANDIDATE` to:

```text
STRUCTURE_AND_EXCHANGE_CI_VERIFIED
Scope: Preview Lab v0.1 / CI run 53
```

Runtime auditory and device QA remain open gates.
