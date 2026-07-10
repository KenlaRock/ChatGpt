# Publication Boundary

NullForge Simulation Lab intentionally uses two information zones.

## Public zone — GitHub

GitHub is the public, open-source and independently reviewable surface. It may contain:

- source code and build scripts,
- public schemas and interoperability contracts,
- synthetic experiments and generated fixtures,
- sanitized design provenance,
- public issues, pull requests and validation reports,
- documentation needed to build, run and challenge the software.

GitHub must not contain:

- private Google Drive or Notion URLs,
- workspace, document or folder IDs from internal platforms,
- unpublished source audio or client/project material,
- internal team identities, access details or operational notes,
- secrets, tokens, hooks, credentials or private contact information,
- raw conversational material that has not passed publication review.

## Internal zone — Google Drive and Notion

Drive and Notion are shared internal workspaces for Ken Kängström and collaborators. They may contain:

- raw research notes and long-form design discussions,
- internal source packages and source audio,
- human club-gate results and unresolved hypotheses,
- team planning, review packages and working provenance,
- mappings between private sources and sanitized public experiments.

Internal material is not automatically approved for publication.

## One-way publication rule

Material moves from internal to public only through an explicit sanitization step:

1. classify the source,
2. remove private links, identifiers and source material,
3. convert claims into policy, hypothesis or reproducible measurement,
4. add public replacements where needed,
5. run `python tools/check_public_boundary.py`,
6. review the resulting diff.

The public repository may be linked from internal documentation. The public repository must not link back into internal Drive or Notion workspaces.
