# Storyboard – Sprint A/B/C

Detta paket innehåller den fristående storyboard-editorn som HTML-fil samt tillhörande dokumentation.

## Innehåll
- `app.html` – Single-file SPA med offline-stöd (inkl. JSZip och jsPDF inbakade)
- `CHANGELOG.md` – Release-anteckningar
- `QA-rapport.md` – Sammanfattning av tester

## Användning
1. Öppna `app.html` i en modern webbläsare (Chrome, Edge, Firefox eller Safari).
2. Alla bibliotek är inbakade – ingen nätverksåtkomst krävs.
3. Projektdata lagras lokalt med IndexedDB. Använd exportfunktionerna (JSON, PDF, ZIP, WebM, CSV) för att säkerhetskopiera.

## Bygga zip-paket
Kör `npm run build` i repo-rotkatalogen för att uppdatera `dist/app.zip` med senaste filer.
