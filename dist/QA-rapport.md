# QA-rapport

## Miljö
- Node.js 20 (lokal utvecklingsmiljö)
- Testad i Chromium 124 (headless)

## Manuella tester
- [x] Skapa, öppna och ta bort projekt i IndexedDB
- [x] Rita, ångra och rensa rutor
- [x] Exportera JSON och PNG
- [x] Generera PDF, ZIP och CSV offline
- [x] Rendera WebM-animatic utan ljud och med beep-signal
- [x] Tidslinjeuppspelning med ljudfil och volymkontroll
- [x] Kör inbyggda självtester via "Tester"-knappen

## Automatiska tester
- `npm test` (Jest) – OK

## Kända begränsningar
- WebM-export kräver MediaRecorder-stöd (Safari desktop saknar VP9/Opus i vissa versioner).
- Ljudexporter sparas inte i IndexedDB utan måste återimporteras per session.
