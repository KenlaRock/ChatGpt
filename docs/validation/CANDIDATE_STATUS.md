# Sanitized Candidate Validation Status

**Branch:** `sanitized-main-2026-07-10`  
**Status at commit:** `CI_REQUESTED`  
**Date:** 2026-07-10

This commit intentionally triggers the public validation workflow after the
sanitized-history candidate received its schemas, Rust core and publication
boundary.

A green workflow must include:

- public-boundary scan,
- JSON Schema validation,
- Python reference tests,
- Rust core tests,
- Python reference rendering,
- Rust metric rendering,
- cross-implementation golden comparison.

This branch is intended to replace the repository's default history after the
manual branch-policy gate. Pull request #110 must be closed without merging.
