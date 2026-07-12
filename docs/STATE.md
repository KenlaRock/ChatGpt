# NullForge Repository State

Status: **AI Gate v0.2.1 PATCH-2 ACTIVE** on `main` after merge of PR #114.

AI Gate activation commit: `main@2f49d16153d2baca8b36cec6286b27e43262d081`.

Repository-state reconciliation commit: `main@343aed65dee1fe81ebb4dbc627288eaa61f7156d` from PR #119.

Scientific authority remains unchanged: canonical offline evidence and the Python/Rust comparison are owned by Reference CI. Netlify availability remains a deployment observation, not correctness or scientific evidence.

## Completed activation evidence

- Local adversarial gate suite: **23/23 passed** after Fable5 hardening.
- Real GitHub Actions exposed a zero-tolerance timestamp defect; the validator now permits at most five minutes of future clock skew and rejects larger displacement.
- Compliant live PR #115: AI Gate Bootstrap **passed** and Reference CI **passed**; the PR was closed without merge after preserving the result.
- Hostile live PR #116: AI Gate Bootstrap **failed in preflight** on undeclared scope while Reference CI **passed**; the PR was closed without merge.
- PR #114 merged as `2f49d16153d2baca8b36cec6286b27e43262d081`, placing the permanent `AI Gate / ai-gate` workflow on `main`.
- The permanent workflow reads validator code, configuration, schema, and test runner from the trusted pull-request base rather than from the untrusted candidate branch.
- Post-activation live PR #118 deliberately added root-level `dummy-file.md` outside declared scope. Trusted preflight produced `AI_GATE_FAIL: Changed outside declared scope: dummy-file.md`, Reference CI passed independently, and the PR was closed without merge.
- PR #119 merged as `343aed65dee1fe81ebb4dbc627288eaa61f7156d`, reconciling the repository-state documentation with the active baseline.
- Fail-only `fnmatch` semantics are documented and prohibited from granting allow scope.
- Placeholder detection rejects standalone seven-zero dummy tokens without false-positive matching inside legitimate alphanumeric hashes.

## Active operating procedure

- Every pull request must carry a base-bound `ai/session-proof.json` and a substantive `ai/control-report.md`.
- Every pull request must update both `CHANGELOG.md` and `docs/STATE.md`; missing or non-substantive state updates fail the gate.
- Ordinary changed paths must be declared exactly in `allowed_paths`; protected or governance paths require the appropriate higher risk class.
- The fixed risk profile determines the required test set, and later tests cannot rescue a failed preflight authorization check.
- A red or missing `AI Gate / ai-gate` or `Reference CI / reference` result is treated as a manual stop condition before merge.

## Collaboration provenance documentation

- `docs/COLLABORATION_PROVENANCE.md` defines a public, sanitized attribution model for human contributors, AI collaborators, model candidates, automated tools and generative platform features.
- Stable project actor identity is separated from platform, model and runtime identity so runtime changes do not silently rewrite contribution history.
- Contribution roles are task labels rather than organizational rank: a collaborator may be an equal co-builder while also performing review, QA, documentation or research work.
- Like-for-like benchmark comparisons may support internal role-parity decisions only when model versions and reasoning tiers are explicitly matched; benchmark parity remains contextual and does not replace task-specific verification.
- Generative secondary commentary is treated as exploratory and non-authoritative; useful points may be adopted only through an explicit decision and verification trail.
- The public document contains no private Drive or Notion links, workspace identifiers, access details, internal actor roster or raw collaboration transcripts.
- Collaboration provenance does not change scientific authority, evidence classes, release state or the one-way publication boundary.

## Browser parity and visualization contracts

- `docs/BROWSER_WASM_PARITY_PROTOCOL.md` defines the preimplementation comparison contract for Python reference, Rust native, Rust/WASM and browser presentation paths.
- Reference CI remains scientific authority; browser scheduling, Web Audio output-device behavior and human auditory QA remain separate observations unless independently measured and promoted.
- Parity runs require complete runtime identity, integer-sample addressing, frozen inputs, declared tolerances, repeatability checks and fail-closed result classification.
- `docs/VISUALIZATION_SEMANTICS_CONTRACT.md` defines a read-only renderer boundary, versioned source-to-display mappings, coordinate-space declarations, explicit exaggeration metadata and visible invalid-data states.
- No active Three.js implementation was identified on the repository baseline used for the contract. Geometry, viewport and renderer-semantic validation therefore remain unpassed and are correctly labeled `PREIMPLEMENTATION_CONTRACT`.
- These documents define gates for future implementation; they do not themselves establish Rust/WASM parity, browser determinism, auditory correctness or visualization validity.

## Preview Lab runtime restoration

- Preview Lab v0.1 runtime files are restored from the exact blobs previously validated in closed mirror PR #113 at commit `74260dbdd3449c3f07b637a260b2cb991a0880bb`.
- The restored surface includes the static HTML/CSS/JavaScript runtime, example session and local run instructions.
- Current regression tests verify file presence, asset wiring, preview-only evidence labels, JSON parseability and sample-addressed session-contract structure.
- The restoration deliberately excludes the mirror PR's protected schemas, validators and workflow edits so this change remains `R1_SAFE_UI`.
- Historical mirror status remains `STRUCTURE_AND_EXCHANGE_CI_VERIFIED`; the current restoration passed its own Reference CI before merge through PR #127.
- Auditory QA, Android/mobile interaction QA, browser timing determinism, Rust/WASM parity and Three.js validation remain open. Restoring the runtime does not promote any of those claims.

## Sparse-hit detector candidate

- `research/sparse_hit_detector.py` defines candidate v0.1 for synthetic-only sparse transient research.
- The candidate uses robust spectral-flux onset proposals, four-band attack power, attack spectral flatness, an 80–160 ms persistence ratio and a refractory interval.
- Classes are `SPARSE_HIT`, `BASS_ATTACK`, `UNRESOLVED_TRANSIENT` and `NO_EVENT`; ambiguity fails closed rather than becoming a plausible instrument label.
- Every result retains integer sample index, derived seconds, feature values, confidence, detector version, parameter hash and evidence class `HYPOTHESIS`.
- `tests/test_sparse_hit_detector.py` contains seven deterministic synthetic checks for two hit fixtures, bass rejection, synth rejection, edit-boundary rejection, stereo input and parameter-hash changes.
- Local development execution passed all seven candidate tests before publication. Repository unit tests, reference experiment and public-boundary checks remain required on the exact PR head.
- No FTC audio, private source material, precision/recall claim or real-instrument authority is included. Human listening and broader fixture validation remain mandatory before promotion.

## Remaining external platform enforcement

- GitHub protected-branch/ruleset enforcement is not yet configured for `main`.
- The desired platform rule should require `AI Gate / ai-gate`, `Reference CI / reference`, human code-owner approval, and stale-approval dismissal, while also blocking force-push and branch deletion.
- Current human-bypass exposure is operationally low because a single human maintainer holds repository authority. Independent code-owner approval cannot presently be supplied by a second human, so that requirement remains an explicitly documented external control gap rather than being silently removed.
- If another maintainer, code owner, automation token, or external integration receives write authority, configure the branch ruleset and independent review requirement before relying on that new access path.

## Documentation state

The activation history, live-test evidence, operating procedure, collaboration-provenance policy, browser/WASM parity protocol, visualization-semantics contract, restored Preview Lab runtime, sparse-hit candidate and remaining external-control gaps are recorded using durable wording. The detector remains a hypothesis and does not alter canonical scenarios, reference outputs or verified DSP scope.

## Rollback

If a factual or implementation error is discovered, revert the sparse-hit candidate, its tests and documentation together. Preserve the active gate implementation, activation commit, live-test provenance, Reference CI scientific authority, Preview Lab history and publication boundary. A failed candidate must not be rewritten as validated evidence.
