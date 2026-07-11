# NullForge AI Gate Ruleset v0.2.1

## Purpose

Prevent AI-assisted repository changes from silently violating project state, scientific integrity, provenance, scope, public-information boundaries or deployment controls.

## What the gate can and cannot prove

The gate can prove that declared files, commits, scopes and fixed tests satisfy machine-checkable rules. It cannot prove genuine understanding, good judgment or scientific truth. Those remain review questions.

## Workflow

1. Create a tracked task and dedicated branch.
2. Record the actual merge-base against the target branch.
3. Read all mandatory files and relevant task documents.
4. Create a session proof containing complete base hashes.
5. Write a substantive control report.
6. Modify only exact approved paths or narrow directory subtrees.
7. Run the fixed risk-class test profile.
8. Update changelog and state records.
9. Open a PR.
10. CI executes trusted gate code from the base branch, checks scope, hashes and tests.
11. Protected branch rules require human code-owner approval.

## Risk classes

- `R0_DOC_ONLY`: prose-only change; no executable or schema behavior.
- `R1_SAFE_UI`: isolated UI/copy/presentation change.
- `R2_LOGIC`: executable behavior, parser, state or application logic.
- `R3_DSP_OR_SCIENCE`: DSP, mathematics, measurements, evidence classes, oracle or golden/vector outputs.
- `R4_GOVERNANCE_OR_DEPLOY`: gate, CI, schema, rules, deploy, provenance or security boundary.

## Hash model

Every file in `mandatory_read_files` must have a hash from the actual merge-base. Immutable context files must remain byte-identical unless an R4 proof sets `gate_change: true` and names each changed immutable file in `approved_context_changes`. State files are hashed from the base but must receive a substantive update in the PR. This separates "read before work" from "record after work" without making normal tasks impossible.

## Scope model

Allowed scope supports only:

- an exact repository path; or
- a directory subtree ending in `/**`.

Root-wide patterns such as `**`, `*` or `**/*` are forbidden. The proof may add forbidden paths but cannot weaken repository-global forbidden/protected rules.

## Test model

The proof declares a risk class. The repository configuration maps that class to fixed test IDs and argument arrays. CI runs those commands without a shell and writes ephemeral JSON evidence. The final gate checks commit identity, profile identity, exact test set and zero return codes. Merely writing a command name into the proof is not test evidence.

## Self-modification rule

After bootstrap, validator, schema, config and test runner are loaded from the base branch. A PR may propose gate changes under R4, but it cannot choose the code that judges that same PR. Gate changes also require `gate_change: true` and code-owner approval.

## Public boundary

The public GitHub repository must not contain private Drive/Notion URLs, workspace IDs, unpublished source audio, credentials or raw internal conversation material. Session proofs contain public repository facts only.

## External status checks

The protected branch must require both `AI Gate / ai-gate` and `Reference CI / reference`. The latter owns the full Python/Rust cross-oracle chain; the AI gate must not duplicate it merely for ceremony.

## Human approval

CODEOWNERS alone does not block a merge. GitHub branch protection/rulesets must require code-owner approval, dismiss stale reviews, require the AI Gate status, block direct pushes and prevent force-push/deletion. See `GITHUB_RULESET_SETUP.md`.
