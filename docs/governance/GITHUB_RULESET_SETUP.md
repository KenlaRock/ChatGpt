# GitHub Ruleset Setup — Required External Hard Fence

Repository files cannot configure their own branch protection. Configure a GitHub ruleset for `main`:

- Require a pull request before merging.
- Require at least 1 approval.
- Require review from Code Owners.
- Dismiss stale approvals when new commits are pushed.
- Require all review conversations to be resolved.
- Require status checks: `AI Gate / ai-gate` and `Reference CI / reference`.
- Require the repository's existing test/build checks.
- Block force pushes.
- Block branch deletion.
- Restrict direct pushes to designated human maintainers.
- Apply rules to administrators where the plan permits.
- Do not allow bypass for bots or AI service accounts.

## Bootstrap

The first PR that installs the gate cannot be independently judged by base-branch gate code because no base gate exists yet. Review every added line manually, run the included self-tests, configure this ruleset, then merge. All later PRs use trusted base-branch gate code.

## Acceptance test

Create a dry-run PR that:

1. uses an incorrect base commit;
2. changes `subdir/.env`;
3. changes a file outside declared scope;
4. leaves placeholders in the control report.

The PR must fail. A gate that only passes happy paths is decorative theatre.
