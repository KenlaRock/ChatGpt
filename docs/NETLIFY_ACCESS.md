# Netlify access details

## Site
- Canonical URL: https://northstarrising.netlify.app
- Optional debug URL (Netlify HUD): https://northstarrising.netlify.app/?netlify_hud=679b85e1-7631-44b3-a3af-72d258120832

## Build/preview hooks (after project rename)
The previously hard-coded hook IDs no longer resolve for this repository/site pairing.
Use environment variables instead of committing hook IDs in source:
- `NETLIFY_BUILD_HOOK_PRIMARY`
- `NETLIFY_BUILD_HOOK_SECONDARY`
- `NETLIFY_PREVIEW_SERVER_HOOK`

Project scripts now read those variables:

```bash
npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
```

If a variable is missing, the script fails fast with a clear message.

## Optional local Netlify tooling

For this project, local development is primarily:

```bash
npm run dev
```

Install/use Netlify CLI only when you specifically need Netlify emulation features.
Prefer `npx` over global installs to avoid version drift:

```bash
npx netlify dev
```
