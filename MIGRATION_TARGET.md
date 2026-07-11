# NullForge public repository migration target

**Status:** MIRROR_READY_CANDIDATE  
**Prepared:** 2026-07-11

This branch is a public, sanitized migration source for NullForge Simulation Lab.

## Intended target

`followthecipherofficial-pixel/ChatGPT_Projecta`

The target repository must not be treated as canonical until:

1. the target account grants write access to the active automation connection,
2. the complete tree is mirrored without internal workspace links,
3. public-boundary validation passes,
4. JSON Schema, Python, Rust and browser checks pass in the target repository,
5. Netlify successfully deploys the target's `web/` directory.

## Public boundary

This branch may contain public code, schemas, synthetic experiments, validation results and sanitized design provenance. It must not contain internal Google Drive or Notion URLs, unpublished source material, credentials, raw team notes or private review context.

## Netlify target

- Site name: `nullforge-simlab`
- Publish directory: `web`
- Build command: none
- Backend, environment variables and secrets: none

## Current authority

Until the target passes the migration gates above, `sanitized-main-2026-07-10` remains the technical source for the verified v0.1 foundation and Preview Lab.
