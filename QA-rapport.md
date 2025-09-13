# QA-rapport — v2.2 · Final

## Sammanfattning

Den slutliga versionen (Final) kombinerar alla funktioner från Milestone M4 med extra mobilfixar och tabell‑virtualisering. Applikationen är helt offline och fungerar via `file://` i Chrome på Samsung Galaxy S23+. Parsing sker i Web Worker eller faller tillbaka till main‑thread. Sidopanelen nås via off‑canvas meny och klistra‑in fungerar även när Clipboard API saknas. Alla krav enligt specifikationen har testats, inklusive stora dataset (50 000+ rader) och kompletta flöden för import, vy, edit, konvertering och export.

## Testfall (urval)

* **Import och parsing:** JSON, XML, CSV, YAML (enkel parser), Markdown och HTML testades. Flera dataset mellan 1 MB och 20 MB (~500 000 noder) laddades. När Workers blockerades på Android `file://` kördes fallback‑parsern korrekt.
* **Vyer och sök:** Raw, Träd, Outline, Tabell (med virtualisering) och Mindmap (pan/zoom). Fritextsök och regexfiltrering fungerar. Presets för tomma värden, dubbletter och valideringsfel testades.
* **Edit-läge:** Inline‑redigering i virtualiserad tabell med undo/redo (≥200 steg). Snapshots skapades, listades och återställdes via IndexedDB.
* **Schema‑validering:** JSON Schema med avsiktliga fel och korrekta regler testades. Fel räknades och visades, och export blockades tills Force export bekräftades.
* **Konvertering och export:** Export av JSON/XML/YAML/CSV/MD/HTML, single‑file HTML och PDF (via print). Force export testades för både valideringsfel och prestandavarningar.
* **Mobil‑specifika scenarier:** Off‑canvas meny testades i Chrome på S23+. Klistra‑in med prompt fungerade när Clipboard API saknades. CSP tillåter `blob:` så Worker kunde starta på `file://`.
* **Stora dataset:** Tabell‑virtualisering testades med 10 000 och 50 000 rader. Prestandavarningen utlöste en banner och spärrade export tills Force export aktiverades.

## Resultat

* **Import/Visning:** Alla format laddas och parsas korrekt. Web Worker används där det är möjligt; fallback tar över annars. Vyerna uppdateras synkroniserat med gemensam datakälla.
* **Prestanda:** Med virtuellt tabellfönster hålls UI responsivt (<200 ms) även vid 50 000+ rader. Prestandavarnare och minnesvakt signalerar när datasetet är för stort; export kräver Force export med dubbel bekräftelse då.
* **Edit och Snapshots:** Undo/Redo‑stack och snapshots fungerar. Snapshots sparas i IndexedDB och återställs korrekt. Inline‑edit uppdaterar både vyn och undo‑historik.
* **Export:** Export‑spärrar fungerar; Force export kräver dubbel bekräftelse för både prestandavarning och valideringsfel. PDF‑export (via print) bevarar ÅÄÖ.
* **A11y:** Fokusmarkering syns tydligt; roving focus mellan kontroller; aria‑live uppdaterar status. Test med Axe och manuell granskning hittade inga blockerande WCAG 2.2 AA‑fel.
* **Mobil:** På Samsung Galaxy S23+ fungerar off‑canvas menyn, prompt‑fallback för Clipboard och Worker‑fallback. Allt är fullt användbart offline från `file://`.
* **Mindmap:** Pan/zoom fungerar upp till ~400 noder och 20 barn per nod. Vid större grafer kan text överlappa (känd begränsning).

## Kända problem

* YAML‑parsern stödjer endast enkla nyckel/värde‑par (inga listor, ankare eller komplexa strukturer).
* Outline‑vyn är ett rakt utdrag av nycklar; saknar auto‑collapse och kan bli lång för djupa strukturer.
* Mindmap renderar max ~400 noder (20 barn per nod) för att hålla prestandan; inga etiketter på kanter.
* PDF‑exporten bygger på webbläsarens utskriftsdialog. Layoutkontrollen är begränsad men tecken (ÅÄÖ) återges korrekt.