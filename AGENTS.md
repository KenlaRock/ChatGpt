# AGENTS.md — NullForge AI Agent Operating Law v0.2.1

## Non-negotiable

An AI agent must not modify implementation files before completing the read, proof and control-report workflow. The proof is a compliance record, not proof of consciousness or judgment.

## Before editing

1. Obtain a task ID and work on a dedicated branch.
2. Read every file listed by `mandatory_read_files` in `docs/governance/AI_GATE_CONFIG.json`.
3. Read task-relevant skills, workflows and ADRs.
4. Record the base commit and hashes from that base commit.
5. Create `ai/session-proof.json` from the template.
6. Create `ai/control-report.md` with substantive, non-placeholder content.
7. Declare narrow exact paths or directory subtrees. Root-wide wildcards are forbidden.

## During editing

- Stay inside declared scope.
- Never alter secrets, credentials, private Drive/Notion references or unpublished source material.
- Never present policy or visualization as measured evidence.
- Never treat Netlify availability as functional or scientific correctness.
- Preserve failed experiments and provenance when they have learning value.
- Gate, workflow, schema, immutable context or deploy changes require `R4_GOVERNANCE_OR_DEPLOY`, `gate_change: true`, explicit `approved_context_changes` where applicable, trusted-base validation and human code-owner review.

## Before PR

- Run the fixed CI test profile selected by the repository gate configuration.
- Update `CHANGELOG.md` and `docs/STATE.md` with substantive changes.
- Include an exact rollback plan.
- Open a PR and wait for the required status checks and human code-owner approval.

## Authority

1. Human project arbiter / protected branch rules.
2. Trusted validator and test runner loaded from the PR base branch.
3. Repository governance/configuration.
4. Session proof and control report.
5. Task implementation.
