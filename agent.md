# Agent – Data Viewer & Converter v2.2

**Mode:** En pipeline per svar · **Idempotens:** build-stämpel 2025-09-12T00:00:00Z · **Offline:** inga externa anrop/CDN · **Inga påminnelser/RRULE**.

## Uppdrag
Bygg och leverera `dist/app.html` (single-file SPA) + paket/README/CHANGELOG/QA. Kör post-build-check: CSP blob, Worker + fallback, Clipboard-prompt, ☰-meny, Snapshots/UndoRedo, Mindmap, Tabell (virtualiserad).

## Leverabler
- dist/app.html
- dist/app.zip
- dist/README.md
- dist/CHANGELOG.md
- dist/QA-rapport.md

## Checks
- Beräkna SHA-256 för alla ovan. Vid identisk kod ⇒ identiska checksummor.
- Blockera export i UI om valideringsfel/prestandavarning och "Force export" ej aktiv.

## Policy
- Skapa aldrig schemaläggningar/påminnelser om inte användaren explicit ber.
- Använd endast repo-filer; inga externa API:er.
