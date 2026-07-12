# AI Gate Control Report

Task ID: `RESTORE_PREVIEW_LAB_V0_1_20260712`  
Branch: `ui/restore-preview-lab-v0-1-20260712`  
Base commit: `713697d4eaa8f54896b62dd1eff3a10e01331b9f`

## Project purpose

NullForge separates canonical offline DSP evidence from interactive browser exploration. The Preview Lab is useful only when it remains visibly noncanonical, structurally inspectable and subordinate to the Python/Rust evidence path.

## Current task

Restore the Preview Lab v0.1 browser runtime that previously passed structural and exchange validation in closed mirror PR #113 but was absent from current `main`. Restore only the six unprotected `web/` runtime artifacts, add current Python structural tests, document provenance and keep protected schemas, validators and workflows outside this safe-UI scope.

## Mandatory files read

All ten files configured by `docs/governance/AI_GATE_CONFIG.json` were read or verified against `main@713697d4eaa8f54896b62dd1eff3a10e01331b9f`. Current base hashes were recorded before editing. The browser/WASM and visualization contracts merged in PR #126 were also used as task-specific constraints.

## Source provenance

The restored runtime uses exact existing Git blob objects from PR #113 head `74260dbdd3449c3f07b637a260b2cb991a0880bb`:

- `web/index.html` → `e8f4b9999eb3f4e456ee4d672537aa0b6696fbda`
- `web/app.js` → `9fdc7cb8c49bc7d944c6edb25061a0f09a9b0eb9`
- `web/styles.css` → `dcc0c6b6d434f853d97308a9a89e21ddd230ef74`
- `web/session-contract.js` → `febca46d7b14ee3b4581ac46aaaff6c42464be17`
- `web/README.md` → `ccda2bc244894c735717b9614b984162fe344980`, subsequently extended only with restoration provenance and current claim limits
- `web/examples/preview-session.example.json` → `65c385c2511714a792513aa1172a8cb77295b5cd`

PR #113 passed its then-current Reference CI and was deliberately closed without merge. Its historical result is evidence for the source blobs, not an automatic pass for this restoration branch.

## What absolutely must not be changed

This task must not alter AI Gate, workflows, schemas, protected validators, Reference CI authority, Rust/Python DSP code, scenarios, deployment configuration or external repository rules. It must not claim auditory correctness, mobile usability, deterministic Web Audio timing, Rust/WASM parity or Three.js validity.

## Latest stable / green version

The branch starts from `main@713697d4eaa8f54896b62dd1eff3a10e01331b9f`, the merge commit for PR #126 and the current browser/visual-contract baseline.

## Approved scope

The implementation scope is limited to the six restored `web/` runtime files, `tests/test_preview_lab_files.py`, and substantive updates to `CHANGELOG.md` and `docs/STATE.md`. The required proof and control report are always-allowed task artifacts.

No `schemas/**`, `.github/**`, `docs/governance/**`, `tools/ai_gate/**`, `reference/**`, `scenarios/**`, `crates/**` or deploy files may enter the diff.

## Safety and authority review

- The page visibly states `PREVIEW / NOT TRUTH ENGINE`.
- Runtime state declares `preview_not_truth_engine`.
- Snapshots remain labeled `PREVIEW_SNAPSHOT_NOT_DETERMINISTIC_EVIDENCE`.
- Browser Web Audio and canvas animation do not replace integer-sample offline authority.
- The restored app uses no external runtime dependency, private API, credential, Drive/Notion reference, `eval` or dynamic function constructor.
- The restoration does not include Three.js and makes no Three.js validation claim.
- The example session and runtime remain public synthetic material.

## Regression tests

`tests/test_preview_lab_files.py` checks:

- all expected runtime artifacts exist;
- HTML asset wiring and principal controls/canvases are present;
- preview-only mode and evidence labels remain intact;
- prohibited dynamic evaluation constructs are absent;
- the example session is parseable and noncanonical;
- the session contract retains sample-addressed automation structure.

## Risk class

`R1_SAFE_UI` is appropriate because the change restores an interactive static browser surface and adds non-protected tests. It does not alter protected schemas, DSP/scientific logic, governance, deployment or canonical evidence generation.

## Required tests

The fixed `R1_SAFE_UI` profile requires:

- `unit_tests`
- `public_boundary`

The independent Reference CI status remains a manual merge requirement. AI Gate must additionally validate exact branch/base binding, mandatory hashes, allowed paths, state updates, report content and final-commit evidence.

## Remaining limitations

- Runtime auditory behavior still requires human listening.
- Android/mobile interaction still requires device QA.
- The example exchange format is not restored as a protected public schema in this PR.
- Web Audio remains preview-only and not deterministic evidence.
- Rust/WASM and Three.js implementations remain absent.

## Rollback plan

Close without merge if blob provenance, preview labeling, scope or tests fail. After merge, revert only the restored `web/` runtime, the structural test and corresponding state/changelog entries. Preserve PR #113 history, PR #126 contracts, AI Gate, Reference CI and all canonical evidence.

## Agent assertion

This restoration makes an already reviewed preview surface runnable again without silently importing protected architecture or inflating its evidence status. It advances issue #123 from missing-runtime blockage toward human auditory and mobile QA, but does not complete that QA.
