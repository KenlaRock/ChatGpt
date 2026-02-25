# Main branch deployment trigger report

Date: 2026-02-25 07:02:26 UTC

## Action taken
Triggered the Netlify **primary build hook** for this repository to deploy the site configured from the main branch:

```bash
curl -i -X POST -d '{}' https://api.netlify.com/build_hooks/68c5145c373799bfa07a2d69
```

## Result
- Hook request completed successfully with `HTTP/1.1 200 OK`.
- Netlify request id: `e0e19b40-c746-4717-838e-7cda6cef6713`.

## Notes
- A prior trigger entry for the same date exists in repository history; this file now reflects the most recent verified trigger in the latest maintenance pass.

## Update: Netlify rename aftermath
A subsequent trigger attempt against the historical primary hook now returns `Not Found`, indicating hook rotation/invalidity after the project rename.

Recommended replacement flow:
1. Create new hook(s) from Netlify site settings for `northstarrising`.
2. Store in environment variables used by repository scripts:
   - `NETLIFY_BUILD_HOOK_PRIMARY`
   - `NETLIFY_BUILD_HOOK_SECONDARY`
   - `NETLIFY_PREVIEW_SERVER_HOOK`
3. Trigger via:

```bash
npm run netlify:build:primary
```

## Update: replacement hooks re-tested
The replacement hook URLs were integrated and tested through npm scripts.
Current response from Netlify for each is `404 Not Found`.

Operational next step: regenerate hook URLs in Netlify and re-run:

```bash
npm run netlify:build:primary
npm run netlify:build:secondary
npm run netlify:preview:start
npm run netlify:preview:start:secondary
```

## Update: 2026-02-25 (default-main verification for `northstarrising` + `storyboard`)

### Commands executed
```bash
curl -sS https://api.netlify.com/build_hooks/699f04659adb693fea055cc0
curl -sS https://api.netlify.com/build_hooks/699f04869662fb3d15b13d18
npm run netlify:build:primary
npm run netlify:build:secondary
curl -sSI https://northstarrising.netlify.app
curl -sSI https://storyboard.netlify.app
curl -sS https://api.netlify.com/build_hooks/6908472cbe9f34c6bb2b1675
curl -sS https://api.netlify.com/build_hooks/68c5145c373799bfa07a2d69
```

### Findings
- `northstarrising` build hooks are explicitly pinned to branch `main`:
  - `699f04659adb693fea055cc0` -> `"branch":"main"`
  - `699f04869662fb3d15b13d18` -> `"branch":"main"`
- Triggering both current `northstarrising` build hooks returned HTTP `200`, so main deployments were successfully queued from this run.
- Both site endpoints are reachable:
  - `https://northstarrising.netlify.app` -> `200`
  - `https://storyboard.netlify.app` -> `200`
- The historical Storyboard/Northstar hook IDs tracked in repository history now return `404 Not Found`, which confirms hook rotation/deletion and explains why default-main deployment cannot be validated or triggered for Storyboard from this repository alone.

### Why main may "not deploy by default"
The practical blocker is **hook/source mismatch after hook rotation**:
- Main deployment behavior is controlled by the branch tied to each build hook.
- Current accessible `northstarrising` hooks target `main` correctly.
- No active Storyboard build hook URL is available in this repository context (only historical IDs that now 404), so Storyboard cannot be programmatically forced to deploy main until a valid current hook is supplied.

### Next step required for Storyboard
Create/retrieve a fresh Storyboard build hook configured to branch `main`, then trigger it with:
```bash
curl -X POST -H 'Content-Type: application/json' -d '{}' <STORYBOARD_MAIN_BUILD_HOOK_URL>
```
