# AI Gate Control Report

Task ID: `COLLAB_PROVENANCE_20260712`
Branch: `docs/collaboration-provenance-20260712`
Base commit: `54917cc263990420fd30a66d48a6a03531d0f453`

## Project purpose

NullForge maintains a reproducible and auditable public repository while keeping raw collaboration, private workspace identifiers, unpublished sources and unresolved internal material inside the protected internal zone. AI-assisted work must remain attributable without allowing contributor prestige or model output to substitute for scientific evidence.

## Current task

Add a public, sanitized collaboration-provenance document that separates stable project actor identity from model and runtime identity, defines source classes for collaborator reviews, model candidates and generative secondary commentary, and documents how useful ideas are promoted through explicit verification and decision trails.

## Mandatory files read

All ten files configured by `docs/governance/AI_GATE_CONFIG.json` were read or verified against the exact base commit. The immutable files were confirmed unchanged from the prior green baseline, and the current `CHANGELOG.md` and `docs/STATE.md` hashes were captured from `main@54917cc263990420fd30a66d48a6a03531d0f453`.

## What absolutely must not be changed

This documentation task must not alter AI Gate code, workflows, schemas, test profiles, Reference CI authority, DSP logic, scientific measurements, evidence classes, deployment behavior, private workspace separation or the one-way publication boundary. It must not publish private Drive or Notion URLs, workspace IDs, access details, raw conversations or unpublished project material.

## Latest stable / green version

The branch starts from `main@54917cc263990420fd30a66d48a6a03531d0f453`, the merge commit for PR #120 and the current durable post-activation documentation baseline.

## Approved scope

The approved prose-only scope is limited to the new `docs/COLLABORATION_PROVENANCE.md` file plus substantive updates to `CHANGELOG.md` and `docs/STATE.md`. The always-allowed `ai/session-proof.json` and `ai/control-report.md` artifacts are updated to bind this task to the base commit and declared scope.

## Publication-boundary review

The public document contains a generic contribution schema and public platform reference only. It does not include internal page links, Drive file or folder IDs, Notion workspace identifiers, private roster records, credentials, unpublished sources or copied chat transcripts. Internal actor rosters and collaboration ledgers remain outside GitHub.

## Risk class

`R0_DOC_ONLY` is appropriate because the change adds prose documentation and state records only. It does not change executable behavior, schemas, governance controls, scientific logic, evidence outputs, protected implementation paths or deployment configuration.

## Required tests

The fixed `R0_DOC_ONLY` profile requires `public_boundary`. AI Gate must additionally validate branch identity, base hashes, mandatory files, exact allowed paths, substantive state updates, the control report and final commit evidence before the pull request is eligible for merge.

## Rollback plan

Close the pull request without merge if the attribution model exposes internal information, creates authority confusion or conflicts with the existing publication boundary. If an error is discovered after merge, revert only the collaboration-provenance document and its corresponding changelog/state entries while preserving AI Gate, Reference CI and scientific-history commits.

## Agent assertion

This change intentionally creates a narrow public provenance contract rather than mirroring the internal Collaboration Lab. Attribution records where an idea came from; evidence classification and human approval determine whether it becomes part of NullForge's canonical public state.
