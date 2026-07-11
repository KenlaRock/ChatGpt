# NullForge Repository State

Status: AI Gate v0.2.1 bootstrap candidate on a dedicated review branch.

Latest stable/green public base: `main@865f78225106677724b60b336203d0de5d8b13ee`.

Scientific authority remains unchanged: offline reference evidence and the Python/Rust comparison are owned by Reference CI; Netlify availability is not correctness evidence.

Open gates:

- complete manual bootstrap review;
- run the included adversarial self-tests;
- run one compliant live PR against the bootstrap branch;
- run one intentionally hostile live PR and confirm rejection;
- remove the temporary bootstrap branch trigger from the workflow;
- configure protected-branch rules for both required status checks.

Rollback:

Close the bootstrap PR or revert its integration commits. Preserve QA logs and failed dry-run records as provenance.
