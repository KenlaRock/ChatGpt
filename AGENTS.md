# Agent Handbook

## Scope
These instructions apply to the entire repository unless a subdirectory defines a more specific `AGENTS.md` file.

## Mission priorities
1. **Storyboard delivery first.** Default to work that improves `apps/storyboard/dist` or its supporting build/test flows.
2. **Keep artifacts organized.** Follow the directory guide in the root `README.md` when introducing new assets so that documentation, configuration, data, and archives remain separated.
3. **Document key findings.** Record notable decisions, risks, and follow-up items in `docs/` so that subsequent contributors have immediate context.

## Operating principles
- You have explicit permission to create, move, modify, or delete files in this repository as needed to fulfil the mission.
- Prefer automated verification (`npm test`, `npm run build`) whenever you touch application assets. Capture command output in your work logs and PR descriptions.
- Treat anything inside `archive/` as read-only unless maintenance of legacy assets is specifically requested.
- Avoid adding external service dependencies; stay within the assets already tracked by the repository.

## Reporting expectations
- Summarize structural changes, test coverage, and any new risks in the PR description when opening or updating pull requests.
- Highlight functional testing performed on the Storyboard SPA (e.g., export, undo/redo, clipboard) whenever changes could affect those flows.
- Flag missing or outdated documentation by adding TODO sections to the relevant file in `docs/`.

