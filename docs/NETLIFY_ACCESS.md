# Netlify access details

## Site
- Canonical URL: https://av-stb.netlify.app
- Optional debug URL (Netlify HUD): https://av-stb.netlify.app/?netlify_hud=679b85e1-7631-44b3-a3af-72d258120832

## Build hooks
- Primary: https://api.netlify.com/build_hooks/68c5145c373799bfa07a2d69
- Secondary: https://api.netlify.com/build_hooks/6908472cbe9f34c6bb2b1675

## Preview server hook
- https://api.netlify.com/preview_server_hooks/68c5147a6f867751dd5ab91c

Trigger command:

```bash
curl -X POST -H 'Content-Type: application/json' -d '{}' https://api.netlify.com/preview_server_hooks/68c5147a6f867751dd5ab91c
```

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
