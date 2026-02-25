# Security Upgrade PR Checklist (jsPDF/DOMPurify)

Syfte: hjälpa teamet göra en säker major-upgrade av `jspdf` utan att råka skapa regressioner (något som fungerade innan men går sönder efter ändring).

## 1) Förberedelser
- [ ] Skapa en ny branch, t.ex. `chore/security-jspdf-major-upgrade`.
- [ ] Kontrollera nuläge:
  - `npm ci`
  - `npm run build`
  - `npm run audit:prod`
- [ ] Dokumentera nuvarande audit-resultat i PR-beskrivningen.

## 2) Uppgradering
- [ ] Uppgradera `jspdf` till rekommenderad major-version.
- [ ] Uppdatera lockfile med `npm install` eller `npm update` enligt vald strategi.
- [ ] Kör `npm run build`.

## 3) Regressionstest för PDF-flödet
Verifiera manuellt i browsern:
- [ ] Ladda upp en testbild (PNG/JPG/WebP).
- [ ] Navigera mellan flera slides.
- [ ] Exportera PDF.
- [ ] Kontrollera att PDF innehåller:
  - [ ] rätt antal sidor,
  - [ ] den uppladdade bilden,
  - [ ] läsbar layout i varje slide.
- [ ] Öppna PDF i minst två läsare (t.ex. browser + systemets PDF-läsare).

## 4) Kvalitetsgate före merge
- [ ] `npm ci` passerar.
- [ ] `npm run build` passerar.
- [ ] `npm run audit:prod` är förbättrad eller dokumenterat riskaccepterad.
- [ ] PR-mallen är ifylld med alternativ, rekommendation och risksektion.

## 5) Rollback-plan
Om exporten blir instabil:
1. Revertera `jspdf`-uppgraderingen.
2. Återställ lockfile till tidigare fungerande state.
3. Skapa ny mini-PR med observationslogg (vad som gick fel, vid vilket steg).

## Förslag på PR-titel
`chore(security): upgrade jspdf major and verify PDF export regression checklist`
