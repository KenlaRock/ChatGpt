# CHANGELOG — v2.2

## 2025-11-04 — Netlify Database bootstrap
- Added a Netlify Database schema and seed files (`netlify/db/schema.sql`, `netlify/db/seed.sql`) so `npx netlify db init` provisions the posts table used by the `fetch-posts` function.
- Documented the CLI helper for initializing the Netlify Database in `package.json` for consistent local setup.

## 2025-11-04 — Netlify Neon data access
- Added a Netlify Function (`netlify/functions/fetch-posts.mjs`) that queries the Neon database via `@netlify/neon` and exposes the latest posts as JSON for the standalone index to consume during deployments.
- Configured Netlify to bundle the functions directory with esbuild and ship the Neon client dependency.

## 2025-11-04 — Offline-ready sandbox index
- Bundled jsPDF 2.5.1 locally so the sandbox PDF export works without network access.
- Removed external SDK script references from `index.html` to avoid 404s in offline usage.

## 2025-11-03 — Netlify workflow helpers
- Added CLI helpers (`npm run netlify:trigger:*`) for quickly firing the Storyboard Netlify build and preview hooks.
- Documented the new commands in the repository README for easy discovery.

## 2025-09-12 00:00:00 — Final (full-feature + mobilfix)
- Off‑canvas meny för mobil med ☰‑knapp. Uppdaterad Content‑Security‑Policy tillåter `blob:` för worker/script/connect så att appen fungerar på `file://` i Chrome på Android. Om Workern inte kan skapas används en fallback i main thread.
- Implementerad clipboard‑fallback: om urklipps‑API saknas används prompt för manuell inklistring.
- Virtuell rendering av Tabellvyn: hanterar upp till ~50 000 rader via scrollande viewport och återanvända DOM‑rader; inline‑edit fungerar.
- Integrerat undo/redo‑stack (≥200 steg) och IndexedDB‑baserade snapshots i slutversionen.
- Sammanfört alla förbättringar från M4: prestanda‑/minnesvakt, export‑spärr vid valideringsfel, mindmap med pan/zoom, förbättrad a11y och stabiliserad UI.
- Uppdaterat README, QA‑rapport och övrig dokumentation för slutleveransen.

## 2025-09-11 23:50:00 — M4 (QA & härdning)
- Lagt till prestanda‑ och minnesvakt som varnar vid mycket stora dataset och stoppar export tills Force export bekräftas.
- Export-spärr vid valideringsfel kräver numera dubbel bekräftelse när Force export är aktiverad.
- Mindmap har fått pan/zoom‑stöd via musdrag, mushjul och dubbelklick för centrering.
- Förbättrad tillgänglighet: starkare fokusmarkering, bättre roving focus, aria‑live uppdatering för status.
- Aggressivare windowing och debounced rendering för träd, outline och tabell.
- UI‑justeringar och tydligare status‑ och felmeddelanden.

## 2025-09-11 23:40:24 — M3 (Konvertering & Export)
- Lagt till konverterings- och exportfunktioner för JSON/XML/YAML/CSV/MD/HTML.
- Implementerat HTML single-file export och PDF export via print-dialog.
- Tillägg av Force export‑checkbox vid valideringsfel.
- Behållit alla M2‑funktioner.
## 2025-11-03 14:02:00 — Mobiloptimerad fristående storyboard
- Ny fristående `index.html` med lokalt datalager, förbättrad ritpanel och mallstöd för snabbtest av storyboardflöden.
- Åtgärdade exportfel (PDF/JSON/TXT) genom robusta nedladdare och jsPDF-säkerhetskontroller.
- Förbättrat fotoarbetsflöde: validering, sparning och borttagning uppdaterar scenen direkt via fallback-lagring.
- Responsiva justeringar för Android/mobil, flytande snabbknappar och tangentbordsgenvägar för förbättrad navigering.
