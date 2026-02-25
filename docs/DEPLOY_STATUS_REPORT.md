# Deploy status report

Date: 2026-02-25
Target deploy: https://699e5a8da7a48f000826d79c--av-stb.netlify.app/

## Scope
- Verified deploy availability and returned document.
- Ran local install/build/audit checks.
- Ran browser smoke test against deploy URL.
- Reviewed core project/deploy configuration files.

## Results summary
- **Deploy availability:** OK (`HTTP/1.1 200 OK`).
- **SPA bootstrap:** OK (`index.html` returned with `#root`, script, stylesheet).
- **Browser smoke test:** OK (page title renders, nav/export controls found, slide index updates to `Slide 2 / 6` after clicking `Nästa`).
- **Local build:** OK (`vite build` completes and emits production assets).
- **Production dependency audit:** OK (`npm audit --omit=dev` found 0 vulnerabilities).

## Notes and observations
- Current deploy references `/assets/index-DpFB3I7x.js`, which matches local build output from this check.
- CI workflow validates `npm ci` and `npm run build` on push/PR.
- `netlify.toml` is correctly configured for Vite static output and SPA redirect.
- Security docs note moderate issues in **dev tooling** (`npm audit` full scope), while production dependencies are currently clean.

## Risks / follow-up
- No release-blocking issue found in this verification pass.
- Keep planned dependency-upgrade follow-up for Vite/esbuild (dev-chain advisory tracking) in a dedicated PR.
