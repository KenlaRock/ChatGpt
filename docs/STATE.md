# NullForge Repository State

Status: **AI Gate v0.2.1 PATCH-1 — technically validated bootstrap candidate** on draft PR #114. It is not yet the active `main` baseline.

Latest stable/green public base: `main@865f78225106677724b60b336203d0de5d8b13ee`.

Scientific authority remains unchanged: canonical offline evidence and the Python/Rust comparison are owned by Reference CI. Netlify availability remains a deployment observation, not correctness or scientific evidence.

## Completed bootstrap evidence

- Local adversarial gate suite: **21/21 passed**.
- Real GitHub Actions exposed a zero-tolerance timestamp defect; the validator now permits at most five minutes of future clock skew and rejects larger displacement.
- Compliant live PR #115 at `724ee09b31827d1005e3e3833a37d37bf756afbe`: AI Gate Bootstrap **passed** and Reference CI **passed**; PR closed without merge.
- Hostile live PR #116 at `07257a91b682f7709d028368b2a42b54fc1afdcb`: AI Gate Bootstrap **failed in preflight** on undeclared scope while Reference CI **passed**; PR closed without merge.
- The temporary bootstrap child-PR workflow has been removed after testing.

## Remaining activation gates

- Configure a GitHub protected-branch/ruleset for `main` requiring `AI Gate / ai-gate`, `Reference CI / reference`, code-owner review, stale-review dismissal, no force-push, and no branch deletion.
- Obtain literal human code-owner approval for PR #114. Technical AI review cannot honestly substitute for this independent human control.
- Merge only after those external controls are confirmed.

## Rollback

Close draft PR #114 without merging, or revert its bootstrap commits if it is later merged. Preserve local QA results, PR #115, PR #116, workflow logs, and failed attempts as provenance.
