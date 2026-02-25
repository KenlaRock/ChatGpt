# Netlify access details

## Site
- Canonical URL: https://storyboard-app.netlify.app
- Optional debug URL (Netlify HUD): https://storyboard-app.netlify.app/?netlify_hud=66a4ee6c-ce0b-4d08-ae98-adf7c519c274

## Build hooks
- Main branch (primary): https://api.netlify.com/build_hooks/699f69191cda8ca13efd3832
- Secondary: not currently defined in this repository defaults (set `NETLIFY_BUILD_HOOK_SECONDARY` if needed)

## Preview server hooks
- Primary: https://api.netlify.com/preview_server_hooks/699f699f162a30a4836c4747
- Secondary: https://api.netlify.com/preview_server_hooks/699f69c15673bfa8b7826282

## Storyboard SSH key
Use this key where Netlify/Git provider deploy-key setup requires it:

```text
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCeSsolRA68KEGkixal5nf8NwKSjdDavkjc+xiHBUJ71IxfqcydkguG8qbLKm0Oo5b9+Yizimom0tO0VDiE9i/tfDb1E54dklTtpdrVE+Jy3+GG4Vay3QwP+kmCMa+0oscV0t05MOSm08/48S2KtxoTuA8lsPLPUKzlZReCe+jF5EbEukgQBw65FehGNBmQlDo8xGd4Msk/RUGqaNeaUcDOBOLNw8cL8Q5mkkJyzeeyH75uN7jNlrfBWvyNPfT2ysuBDlEg6i/JvM7gIr2W6HBWBNPfVqRZifE+DLkBG7wKo4OyXSYHNKwn0OIPhZxAh9TGn6YWppIcnJ2keCOADTuP2epWEsS0WjJFmvMSvSxEp4gngL5+podsrUDbev3E/f2ZMV1ouy3mprU0e7Nc6MNlhjnuEnuDB96SFqUaBVjer5MWpQe9d9EAS8/PA0P69MUZD2jcYzv5Mlb9Z01jvtiG8v3Hxec6mqNssU44zHwIpYgmSiF0ShtchUj8EHty7wJuN+Atf5QuFlCsFzTNTo/dPU7B1Q9WrmiZ8VbM/wE9/LR/pAtcuHXqxZveBtau/AZAsDEEGawTZIxg2WbiDORqcLPq2hK6WXtHtJItqrmG7bBro/GElVWwdPxbFaZ4k0iCQ0xNCWxTbq3dx14SlawwuEe9MVuwndCn/sR8Ptc7hw==
```

## Trigger commands
These npm commands include robust status parsing (final HTTP code) and clear failure output.
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

## Quick curl triggers

```bash
curl -X POST -d {} https://api.netlify.com/preview_server_hooks/699f69c15673bfa8b7826282
curl -X POST -d {} https://api.netlify.com/preview_server_hooks/699f699f162a30a4836c4747
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

## Hook relation mapping used by `scripts/netlify-hook-trigger.mjs`
- `primary` -> `NETLIFY_BUILD_HOOK_PRIMARY`
- `secondary` -> `NETLIFY_BUILD_HOOK_SECONDARY`
- `preview` -> `NETLIFY_PREVIEW_SERVER_HOOK`
- `preview:secondary` -> `NETLIFY_PREVIEW_SERVER_HOOK_SECONDARY`
