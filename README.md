# Storyboard Workspace Repository

This repository stores the Storyboard web application deliverables alongside supporting assets, archives, and documentation. The content has been regrouped to make the active Storyboard build the primary focus while still keeping historical material available for reference.

## Repository status
- **Active focus:** `apps/storyboard/dist` contains the shipping single-page application bundle that should be verified, iterated, and shipped.
- **Standalone prototype:** `index.html` in the repository root hosts the refreshed Musikvideo Pro storyboard experience used for rapid UI validation, export testing, and Android layout checks without running the build toolchain.
- **Supporting assets:** Datasets, configuration, and documentation have been moved into dedicated folders to simplify discovery.
- **Archived code:** Legacy Storyboard sources now live under `archive/` and require opt-in maintenance only when explicitly requested.

## Directory guide
| Path | Purpose |
| --- | --- |
| `index.html` | Standalone Musikvideo Pro storyboard build focused on mobile-ready UI flows, export routines, and photo handling. |
| `apps/storyboard/dist/` | Published Storyboard SPA bundle (HTML + docs). Target for functional validation and packaging tasks. |
| `archive/storyboard-legacy/` | Frozen legacy implementation retained for reference. No changes unless a specific migration task requires it. |
| `config/` | Deployment configuration such as `netlify.toml`. |
| `data/` | Sample datasets (`medium.csv`, `medium.xml`, `small.json`) used during validation and demos. |
| `docs/` | Repository level changelog, QA report, and other written references. |
| `tests/` | Automated regression tests (currently Jest). |

## Workflow expectations
1. **Storyboard first.** Treat improvements to `apps/storyboard/dist` as the default priority. Validate UI behaviour, export routines, and packaging scripts whenever updates are made.
2. **Respect folder ownership.** Use the directory guide above when creating new files so that documentation, data, and deployment artefacts remain separated.
3. **Document outcomes.** Update `docs/` with changelog entries or QA notes that result from functional changes.
4. **Preserve archives.** Do not move or edit files within `archive/` unless the work is explicitly scoped to legacy maintenance.

## Getting started
1. Install dependencies (Node 18+ is recommended):
   ```bash
   npm install
   ```
2. Run the automated checks:
   ```bash
   npm test
   ```
3. Package the Storyboard bundle when needed:
   ```bash
   npm run build
   ```

4. Trigger a Netlify deploy directly from the command line when necessary:
   ```bash
   npm run netlify:trigger:build    # Production build hook
   npm run netlify:trigger:preview  # Preview server refresh
   ```

   Use `npm run netlify:trigger` without arguments to see the supported targets.

## Notes for Codex agents
- You have full permission to create, modify, move, or delete files as required to keep the Storyboard application healthy.
- Capture observations, open questions, or follow-up work inside `docs/` so that future passes can pick them up quickly.
- See `AGENTS.md` for the detailed collaboration contract and instructions that apply across branches.

## Open opportunities
- Expand the automated test suite beyond the current sanity check.
- Replace placeholder datasets in `data/` with realistic scenarios that cover edge cases.
- Build developer tooling around the packaging workflow (linting, validation scripts, etc.).

