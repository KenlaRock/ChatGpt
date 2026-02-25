# Netlify access details

## Site
- Canonical URL: https://northstarrising.netlify.app
- Optional debug URL (Netlify HUD): https://northstarrising.netlify.app/?netlify_hud=679b85e1-7631-44b3-a3af-72d258120832

## Build hooks
- Primary: https://api.netlify.com/build_hooks/699f04659adb693fea055cc0
- Secondary: https://api.netlify.com/build_hooks/699f04869662fb3d15b13d18

## Preview server hooks
- Primary: https://api.netlify.com/preview_server_hooks/699f04f7bcd708545509329f
- Secondary: https://api.netlify.com/preview_server_hooks/699f050e9adb693f160565c9

## Trigger commands
These npm commands now include robust status parsing (final HTTP code) and clear failure output.
They use the hook URLs above by default and allow env-var override when needed.

```bash
npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
npm run netlify:preview:start:secondary
```

Override variables (optional):
- `NETLIFY_BUILD_HOOK_PRIMARY`
- `NETLIFY_BUILD_HOOK_SECONDARY`
- `NETLIFY_PREVIEW_SERVER_HOOK`
- `NETLIFY_PREVIEW_SERVER_HOOK_SECONDARY`

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
