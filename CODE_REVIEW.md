# Kodgranskning: North Star Rising (React/Vite)

Datum: 2026-02-25

## Översikt
Projektet är en single-page React-app för presentationsvisning med:
- lokal bilduppladdning,
- tangentbordsnavigering mellan slides,
- PDF-export via `html2canvas` + `jsPDF`.

Arkitekturen är enkel att köra och förstå, men en stor del av logiken och allt innehåll ligger i en enda fil (`src/App.jsx`), vilket gör vidareutveckling och testning svårare över tid.

## Styrkor
1. **Tydlig och körbar baseline**
   - Enkel start/build-process via Vite.
   - Dynamisk import av tunga PDF-beroenden minskar initial JS-last.
2. **Funktionell användarresa**
   - Bilduppladdning fungerar lokalt och används konsekvent i visning + export.
   - Navigation med både knappar och piltangenter.
3. **Konsekvent tema/visuell riktning**
   - Centraliserade färgkonstanter i `THEME`.

## Risker och förbättringsområden (prioriterade)

### P1 — Monolitisk komponent (`src/App.jsx`)
**Problem:** Filen är mycket stor (1000+ rader) och innehåller:
- UI-komponenter,
- affärslogik,
- all slidetext/data,
- PDF-exportflöde.

**Konsekvens:** Hög ändringsrisk och svårare code review/test.

**Åtgärd:** Dela upp i moduler:
- `src/components/` (t.ex. `Card`, `Pill`, `SectionTitle`, `TimelineRow`),
- `src/data/slides.js` (allt slideinnehåll),
- `src/hooks/useLocalImage.js`,
- `src/lib/exportPdf.js`.

### P1 — Begränsad testbarhet
**Problem:** Enda “testerna” är `console.assert` i runtime.

**Konsekvens:** Regressioner fångas sent, särskilt i export- och navigeringslogik.

**Åtgärd:** Lägg till Vitest + React Testing Library:
- enhetstester för `clamp`, navigering och filvalidering,
- komponenttest för slide-rendering,
- smoke-test för att `exportPdf` hanterar “ingen bild” respektive lyckad väg (mockad).

### P2 — Tillgänglighet och UX-detaljer
**Problem:**
- Filuppladdning via dold input i label fungerar, men saknar tydlig tillgänglighetsmetadata.
- Felmeddelanden använder `alert`, vilket ger begränsad UX.

**Åtgärd:**
- Lägg till explicita labels/`aria-*` där relevant.
- Byt `alert` mot inline notis/toast-komponent med tydliga felorsaker.

### P2 — PDF-export robusthet/prestanda
**Problem:** Export loopar över offscreen-renderade noder med `html2canvas` och väntar med `setTimeout` mellan sidor.

**Konsekvens:** Risk för långsam export och minnespåverkan på svagare klienter.

**Åtgärd:**
- Överväg export i lägre `scale` vid stora decks,
- lägg till enkel progressindikator (t.ex. `Exporterar 2/6`),
- hantera avbruten export mer explicit.

### P3 — Dependency hygiene
**Problem:** `npm install` rapporterar sårbarheter.

**Åtgärd:**
- Kör `npm audit` och prioritera uppdatering av kritiska/transitiva paket,
- dokumentera om några risker accepteras tillfälligt.

## Rekommenderad genomförandeplan (nästa steg)

### Steg 1 (kort, 0.5–1 dag)
- Bryt ut `slides`-data till separat fil.
- Bryt ut `exportPdf` till `src/lib/exportPdf.js`.
- Behåll funktionalitet oförändrad (ren refaktor).

### Steg 2 (1 dag)
- Lägg till testsetup (Vitest + RTL).
- Skriv 5–8 basala tester kring navigering, uppladdning och exportguard.

### Steg 3 (0.5 dag)
- Lägg in notifieringssystem i stället för `alert`.
- Små a11y-förbättringar i knappar/filuppladdning.

### Steg 4 (löpande)
- Dependency review + uppdateringar.
- Eventuell prestandaprofilering för PDF-export på low-end-enheter.

## Körda kontroller
- `npm install` ✅
- `npm run build` ✅

