# Handlings- och förbättringsplan (UI, uppladdning, PDF)

## Nulägesanalys
- Applikationen är en React/Vite SPA med datadrivna slides, redigeringspanel och lokal autosave.
- Bilduppladdning sker via `FileReader` men saknade tidigare tydlig progress/feedback under inläsning.
- Layouten var funktionell men kunde bli visuellt tung i kontrollsektionen, särskilt på mindre ytor.
- PDF-exporten fungerade, men presentationen kunde förbättras (ram, marginaler, tydligare header/footer).
- Bildblock i icke-1:1-format riskerade upplevd deformation i vissa export-lägen.

## Genomförda förbättringar
1. **Progress-bar för bilduppladdning**
   - Tydliga statuslägen: läser in, klar, fel.
   - Procentindikator och progress-bar i editorpanelen.

2. **Förbättrad layout och översikt**
   - Kompaktare toolbar med bättre utnyttjande av horisontellt utrymme.
   - Meta-rad omgjord till tydligare grid för bättre läsbarhet.
   - Behåller samtliga befintliga UI-funktioner.

3. **PDF-export förbättrad design**
   - Mer konsekvent sida med mörk bakgrund, visuellt inramat innehåll.
   - Justerade säkra marginaler för bättre proportioner och läsbarhet.
   - Header/footer med decknamn samt datum/sidnummer.

4. **Fix för bildförvrängning vid export**
   - Bildblock renderas nu med kvadratisk container och absolut positionerad bild.
   - `object-fit: contain` + centrerad position för att undvika stretch av icke-1:1-bilder.

## Säkring av befintlig funktionalitet
- Navigering, redigering, blockhantering, autosave och exportflöde har behållits.
- Förbättringarna är additionsorienterade (ingen borttagen användarväg i UI).

## Rekommenderade nästa steg
1. Lägg till **drag-and-drop-upload** i mediaflödet.
2. Lägg till **separat print theme** för ännu mer kontrollerad PDF-typografi.
3. Lägg till **toggle för image fit** (`contain`/`cover`) per bildblock.
4. Lägg till **toast-notifieringar** för uppladdning/export istället för `alert`.
5. Inför **visuella regressionstester** för PDF-layouter med olika bildformat.
