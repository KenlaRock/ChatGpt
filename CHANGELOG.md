# CHANGELOG — v2.2

## 2025-09-12 00:00:00 — Final (full-feature + mobilfix)
- Off‑canvas meny för mobil med ☰‑knapp. Uppdaterad Content‑Security‑Policy tillåter `blob:` för worker/script/connect så att appen fungerar på `file://` i Chrome på Android. Om Workern inte kan skapas används en fallback i main thread.
- Implementerad clipboard‑fallback: om urklipps‑API saknas används prompt för manuell inklistring.
- Virtuell rendering av Tabellvyn: hanterar upp till ~50 000 rader via scrollande viewport och återanvända DOM‑rader; inline‑edit fungerar.
- Integrerat undo/redo‑stack (≥200 steg) och IndexedDB‑baserade snapshots i slutversionen.
- Sammanfört alla förbättringar från M4: prestanda‑/minnesvakt, export‑spärr vid valideringsfel, mindmap med pan/zoom, förbättrad a11y och stabiliserad UI.
- Uppdaterat README, QA‑rapport och övrig dokumentation för slutleveransen.
- README kompletterad med Netlify‑statusbadge och detaljerad lista över build‑artefakter.

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
