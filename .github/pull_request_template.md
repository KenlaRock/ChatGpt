# Pull Request

## Task and base

- Task ID:
- Branch:
- Base commit:

## Summary

Explain what changed and why.

## Risk class

- [ ] R0_DOC_ONLY
- [ ] R1_SAFE_UI
- [ ] R2_LOGIC
- [ ] R3_DSP_OR_SCIENCE
- [ ] R4_GOVERNANCE_OR_DEPLOY

## Gate artifacts

- [ ] `ai/session-proof.json` is complete and hash-bound to the real merge-base.
- [ ] `ai/control-report.md` contains no placeholders.
- [ ] Scope contains no root-wide wildcard.
- [ ] Mandatory context files were not changed, or each R4 exception is explicit in `approved_context_changes`.
- [ ] `CHANGELOG.md` and `docs/STATE.md` contain substantive updates.

## Tests

List the fixed test IDs. CI owns the executable commands and test evidence.

## Scientific/public-boundary review

- [ ] No policy or visualization is presented as measured evidence.
- [ ] No private Drive/Notion URL, workspace ID, unpublished source or credential is introduced.
- [ ] DSP/scientific changes include reproducibility or golden/vector evidence.

## Rollback plan

Give exact revert and state-restoration steps.

## Human review

- [ ] Code owner reviewed.
- [ ] Sensitive scientific/governance/deploy changes were manually inspected.
