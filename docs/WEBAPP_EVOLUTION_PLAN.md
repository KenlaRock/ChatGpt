# Förbättringsplan: redigerbar strategiapp med bilder, PDF-export och sparade ändringar

## 1) Nulägesanalys (från kodbasen)

### Teknik och arkitektur
- Appen är en klientrenderad React/Vite-SPA utan backend eller databas.
- Innehållet för alla slides ligger hårdkodat i `src/App.jsx` (titlar, underrubriker, listor, copy).
- Bilduppladdning finns, men är idag enkel och lokal per webbläsarsession (`useLocalImage` i React state).

### Vad som redan fungerar
- Navigering mellan slides (knappar + piltangenter).
- Uppladdning av en nyckelbild (`PNG/JPG/WebP`) och visning på flera slides.
- PDF-export av hela decket via `html2canvas` + `jsPDF`.

### Gap mot era krav
Ni vill kunna:
1. Ändra text löpande i appen.
2. Lägga till/ta bort fält på sidorna.
3. Ladda upp flera bilder och visa dem på sidor.
4. Exportera allt snyggt till PDF.
5. Spara ändringar online så teamet ser samma uppdaterade läge.

Detta stöds inte fullt ut i nuläget eftersom:
- Innehållet inte är datadrivet (det är koddrivet/hårdkodat).
- Det saknas beständig lagring för text/fält/bildreferenser.
- Bildhanteringen är kopplad till en enda lokal `dataUrl` i state.

---

## 2) Målbild

Bygg om från **hårdkodad presentationsapp** till **datadriven redigerbar strategiapp**:
- Ett innehållsschema (JSON-modell) för slides och fält.
- Ett redigeringsläge (inline eller sidopanel) för text + struktur.
- En lagringslösning (API + databas + filstorage) för att spara och återläsa ändringar online.
- PDF-export som renderar från samma datamodell för konsekvent resultat.

---

## 3) Rekommenderad lösning (faser)

## Fas 0 — Designbeslut och datamodell (kort workshop)
**Syfte:** låsa struktur innan implementation.

### Beslut att ta
- Ska redigering ske direkt i slide (inline) eller via editorpanel?
- Vilka fälttyper behövs initialt?
  - Text (rubrik, ingress, brödtext)
  - Lista/checklista
  - KPI/metadata
  - Bildfält (en eller flera)
- Behörighet:
  - Öppen intern app eller inloggning/roller?
- Versionering:
  - Behöver ni revisionshistorik/”återställ”?

### Leverans
- `schema v1` för dokument/slides/block.
- Wireframe för editorflöde.

---

## Fas 1 — Datadriven rendering (utan backend först)
**Syfte:** separera innehåll från kod så appen blir redigerbar.

### Implementation
- Introducera en innehållsmodell, exempelvis:
  - `Deck` -> `slides[]`
  - `Slide` -> `id, kicker, title, subtitle, blocks[]`
  - `Block` -> `type` + `props` (text/list/image/checklist/timeline)
- Flytta nuvarande statiska innehåll i `App.jsx` till en initial JSON-konfiguration.
- Gör rendering generisk via en `BlockRenderer`.

### Resultat
- Appens innehåll kan ändras utan att ändra JSX-kod per slide.
- Grund för “lägg till/ta bort fält”.

---

## Fas 2 — Redigeringsläge (MVP)
**Syfte:** möjliggöra löpande uppdatering av plan/strategi i UI.

### Funktioner
- Toggle: **Visningsläge / Redigeringsläge**.
- Inline-redigering för titel/underrubrik/text.
- Lägg till/ta bort/flytta block per slide.
- Val av blocktyp via “+ Lägg till fält”.
- Grundläggande validering (t.ex. maxlängd, obligatoriska fält).

### UX-förslag
- Sidopanel med blockinställningar för konsekvent layout.
- Autospara-indikator: “Sparar… / Sparat”.

---

## Fas 3 — Beständig lagring online
**Syfte:** alla ändringar sparas och synkas mellan användare/enheter.

### Rekommenderad backend (2 alternativ)
1. **Supabase** (snabbast time-to-value)
   - Postgres för dokumentdata.
   - Storage bucket för bilder.
   - RLS för teamåtkomst.
2. **Egen Node/Express + Postgres + S3-kompatibel storage**
   - Mer kontroll, mer driftansvar.

### Datamodell (förslag)
- `documents` (id, name, created_by, updated_at)
- `document_versions` (document_id, version, payload_json, created_at, created_by)
- `media_assets` (id, document_id, path/url, alt_text, width, height, created_at)

### Varför versioner?
- Ni kan spåra strategiändringar över tid.
- Lätt att återställa om någon råkar radera innehåll.

---

## Fas 4 — Bildhantering
**Syfte:** stöd för flera bilder per dokument/slide med stabil PDF-export.

### Funktioner
- Media-bibliotek i appen.
- Uppladdning med förhandsvisning och metadata (alt-text, beskärning, focal point).
- Knyt bild till valfritt block/fält.
- Rensa oanvända bilder.

### Tekniska detaljer
- Lagra originalfil i storage, rendera optimerade varianter (thumbnail + print).
- Spara endast URL/asset-id i dokumentets JSON.

---

## Fas 5 — PDF-export 2.0 (kvalitetssäkrad)
**Syfte:** export som matchar webbversionen även med dynamiskt innehåll.

### Förbättringar
- Exportera från en dedikerad “print layout” (inte enbart skärmrender).
- Sidbrytning/logik per blocktyp för att undvika avklippta listor.
- Bildskalning/komprimering för balans mellan kvalitet och filstorlek.
- Header/footer med datum, dokumentnamn, versionsnummer.

### Extra
- “Exportera aktuell slide” och “Exportera hela decket”.
- Förinställningar: “Skärm-PDF” vs “Tryck-PDF”.

---

## 4) Prioriterad backlog (konkret)

## Sprint A (1–2 veckor)
- Datamodell v1 + migrera statiskt innehåll till JSON.
- BlockRenderer + grundläggande editorläge för textfält.
- Lokal autosave i `localStorage` som fallback.

## Sprint B (1–2 veckor)
- Backendintegration (Supabase rekommenderas).
- Spara/ladda dokument online.
- Enkel versionshistorik (senaste 10 versioner).

## Sprint C (1–2 veckor)
- Fler blocktyper: checklista/timeline/bildgalleri.
- Bildbibliotek + uppladdning till storage.
- PDF-export 2.0 med testsidor.

## Sprint D (1 vecka)
- Behörighet/roller.
- Kvalitet: e2e-test för redigera -> spara -> ladda om -> exportera PDF.
- Prestandaoptimering för stora dokument.

---

## 5) Risker och hur de hanteras

- **Risk: layout bryts när användare lägger in långa texter.**
  - Motåtgärd: längdgränser, visuella varningar, adaptiv typografi i print-läge.

- **Risk: PDF skiljer sig från webben.**
  - Motåtgärd: separat print-render + snapshots/visuella regressionstester.

- **Risk: bildfiler blir tunga/långsamma.**
  - Motåtgärd: optimera uppladdning, flera formatstorlekar, lazy loading.

- **Risk: oavsiktliga ändringar i live-plan.**
  - Motåtgärd: versionering, “publicera”-flöde och återställning.

---

## 6) Mätbara acceptanskriterier

1. En användare kan redigera text på valfri slide och se ändringen direkt.
2. En användare kan lägga till och ta bort block/fält per slide.
3. En användare kan ladda upp flera bilder, välja dem i olika block och se dem i appen.
4. Vid omladdning och inloggning från annan enhet finns ändringarna kvar.
5. PDF-export innehåller samma innehåll (text/fält/bilder) och håller god läsbar kvalitet.

---

## 7) Rekommenderad start nu

1. Börja med **Fas 1 + Fas 2 (MVP)** så ni snabbt får redigerbarhet.
2. Koppla därefter på **Fas 3** för online-lagring.
3. Lås sedan **Fas 5** så PDF blir produktionssäker med dynamiskt innehåll.

Denna ordning ger snabb nytta utan att fastna i backend innan redigeringsupplevelsen är bevisad.
